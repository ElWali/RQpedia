// profile.js
// ES module (use type="module" in script tag)
const OUTPUT_JSON = 'output.json';
const LINKED_CACHE_KEY = 'rqpedia_linked_cache_v1';

// -----------------------------
// Utilities
// -----------------------------
function q(sel, root = document) { return root.querySelector(sel); }
function qq(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }


function normalizeString(s) {
    if (s == null) return '';
    return String(s).trim();
}

function parseNumber(s) {
    const n = Number(String(s).trim());
    return Number.isFinite(n) ? n : null;
}

function formatDMS(deg, latOrLng = 'lat') {
    if (deg == null || Number.isNaN(deg)) return '—';
    const sign = deg >= 0 ? 1 : -1;
    const abs = Math.abs(deg);
    const d = Math.floor(abs);
    const mFloat = (abs - d) * 60;
    const m = Math.floor(mFloat);
    const s = ((mFloat - m) * 60).toFixed(1);
    if (latOrLng === 'lat') {
        return `${d}°${m}'${s}" ${deg >= 0 ? 'N' : 'S'}`;
    }
    return `${d}°${m}'${s}" ${deg >= 0 ? 'E' : 'W'}`;
}

function downloadTextFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
}

// -----------------------------
// Linked Open Data (Wikidata / Wikipedia / DBpedia / Commons)
// with caching in localStorage
// -----------------------------
async function fetchWikidataByName(name) {
    try {
        const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(name)}&language=en&limit=1&format=json&origin=*`;
        const res = await fetch(searchUrl);
        if (!res.ok) return null;
        const js = await res.json();
        const id = js.search?.[0]?.id;
        if (!id) return null;
        const entUrl = `https://www.wikidata.org/wiki/Special:EntityData/${id}.json`;
        const res2 = await fetch(entUrl);
        const entJs = await res2.json();
        const entity = entJs.entities?.[id];
        if (!entity) return null;
        const label = entity.labels?.en?.value || name;
        const desc = entity.descriptions?.en?.value || '';
        let imageUrl = '';
        if (entity.claims?.P18?.[0]?.mainsnak?.datavalue?.value) {
            const filename = entity.claims.P18[0].mainsnak.datavalue.value;
            imageUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=600`;
        }
        return { entityId: id, title: label, description: desc, url: `https://www.wikidata.org/wiki/${id}`, imageUrl };
    } catch (e) {
        console.warn('fetchWikidataByName failed', e);
        return null;
    }
}

async function fetchWikipediaSummary(name) {
    try {
        const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`;
        const res = await fetch(url, { headers: { Accept: 'application/json' }});
        if (!res.ok) return null;
        const js = await res.json();
        return { title: js.title, description: js.extract, url: js.content_urls?.desktop?.page };
    } catch (e) {
        console.warn('fetchWikipediaSummary failed', e);
        return null;
    }
}

async function fetchDBpedia(name) {
    try {
        const clean = name.replace(/\s+/g, '_');
        const res = await fetch(`https://dbpedia.org/data/${encodeURIComponent(clean)}.json`);
        if (!res.ok) return null;
        const js = await res.json();
        const uri = `http://dbpedia.org/resource/${clean}`;
        const graph = js[uri];
        if (!graph) return null;
        const abstracts = graph['http://dbpedia.org/ontology/abstract'] || [];
        const abstract = abstracts.find(a => a.lang === 'en')?.value || '';
        const thumb = graph['http://dbpedia.org/ontology/thumbnail']?.[0]?.value || '';
        return { title: name, description: abstract, imageUrl: thumb, url: `https://dbpedia.org/page/${clean}` };
    } catch (e) {
        console.warn('fetchDBpedia failed', e);
        return null;
    }
}

async function fetchCommonsMediaFromWikidata(qid) {
    try {
        if (!qid) return [];
        const query = `SELECT ?file ?fileUrl WHERE { wd:${qid} (wdt:P18|wdt:P180) ?file . BIND(REPLACE(STR(?file), "http://commons.wikimedia.org/wiki/File:", "") AS ?fileName) BIND(CONCAT("https://commons.wikimedia.org/wiki/Special:FilePath/", REPLACE(?fileName, " ", "_")) AS ?fileUrl) } LIMIT 6`;
        const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}&format=json`;
        const res = await fetch(url, { headers: { Accept: 'application/sparql-results+json' }});
        if (!res.ok) return [];
        const js = await res.json();
        return js.results.bindings.map(b => {
            return { title: b.file.value, imageUrl: b.fileUrl.value + '?width=500', url: b.file.value };
        });
    } catch (e) {
        console.warn('fetchCommonsMediaFromWikidata failed', e);
        return [];
    }
}

function getLinkedCache() {
    try { return JSON.parse(localStorage.getItem(LINKED_CACHE_KEY) || '{}'); } catch(e){ return {}; }
}
function setLinkedCache(obj) {
    try { localStorage.setItem(LINKED_CACHE_KEY, JSON.stringify(obj)); } catch(e){ /* ignore */ }
}
function clearLinkedCache() { localStorage.removeItem(LINKED_CACHE_KEY); }

// fetch & render, with caching
async function fetchAndRenderLinkedData(siteName, wikidataHint = null) {
    const container = q('#linked-data-content');
    const mediaContainer = q('#media-content');
    container.innerHTML = '<p style="color:var(--muted)">Loading linked open data…</p>';
    mediaContainer.innerHTML = '<p style="color:var(--muted)">Loading media…</p>';

    const cache = getLinkedCache();
    const cacheKey = siteName.toLowerCase();

    if (cache[cacheKey] && (Date.now() - cache[cacheKey].ts) < (1000 * 60 * 60 * 24 * 7)) {
        // use cached result (1 week)
        renderLinkedDataUI(cache[cacheKey].data);
        return cache[cacheKey].data;
    }

    try {
        const [wd, wiki, db] = await Promise.all([
            wikidataHint ? Promise.resolve({ entityId: wikidataHint }) : fetchWikidataByName(siteName),
            fetchWikipediaSummary(siteName),
            fetchDBpedia(siteName)
        ]);

        let commons = [];
        if (wd?.entityId) {
            commons = await fetchCommonsMediaFromWikidata(wd.entityId);
        }

        const data = { wikidata: wd, wikipedia: wiki, dbpedia: db, commons };
        cache[cacheKey] = { ts: Date.now(), data };
        setLinkedCache(cache);
        renderLinkedDataUI(data);
        return data;
    } catch (e) {
        console.error('fetchAndRenderLinkedData error', e);
        container.innerHTML = `<p style="color:#dc2626">Failed to fetch linked data.</p>`;
        mediaContainer.innerHTML = `<p style="color:var(--muted)">Media unavailable.</p>`;
        return null;
    }

    function renderLinkedDataUI(data) {
        // JSON-LD injection
        try {
            const jsonLd = {
                "@context": "https://schema.org",
                "@type": "ArchaeologicalSite",
                "name": siteName,
                "description": data.wikipedia?.description || data.wikidata?.description || data.dbpedia?.description || "",
                "sameAs": []
            };
            if (data.wikipedia?.url) jsonLd.sameAs.push(data.wikipedia.url);
            if (data.wikidata?.url) jsonLd.sameAs.push(data.wikidata.url);
            if (data.dbpedia?.url) jsonLd.sameAs.push(data.dbpedia.url);

            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.text = JSON.stringify(jsonLd, null, 2);
            document.head.appendChild(script);
        } catch(e){}

        // linked data list
        const entries = [];
        if (data.wikidata) {
            entries.push(`<div class="linked-data-item"><i class="bi bi-archive" style="font-size:1.2rem"></i>
                <div style="flex:1"><div style="font-size:0.85rem;color:var(--muted)">Wikidata</div>
                <a href="${escapeHtml(data.wikidata.url)}" target="_blank" rel="noopener">${escapeHtml(data.wikidata.title || data.wikidata.entityId)}</a></div></div>`);
        }
        if (data.dbpedia) {
            entries.push(`<div class="linked-data-item"><i class="bi bi-database" style="font-size:1.2rem"></i>
                <div style="flex:1"><div style="font-size:0.85rem;color:var(--muted)">DBpedia</div>
                <a href="${escapeHtml(data.dbpedia.url)}" target="_blank" rel="noopener">${escapeHtml(data.dbpedia.title)}</a></div></div>`);
        }
        if (data.wikipedia) {
            entries.push(`<div class="linked-data-item"><i class="bi bi-book" style="font-size:1.2rem"></i>
                <div style="flex:1"><div style="font-size:0.85rem;color:var(--muted)">Wikipedia</div>
                <a href="${escapeHtml(data.wikipedia.url)}" target="_blank" rel="noopener">${escapeHtml(data.wikipedia.title)}</a>
                <p style="margin:6px 0 0 0;color:var(--muted);font-size:0.85rem">${escapeHtml(data.wikipedia.description || '').slice(0,200)}${(data.wikipedia.description||'').length>200?'…':''}</p>
                </div></div>`);
        }

        container.innerHTML = entries.length ? entries.join('') : `<p style="color:var(--muted)">No linked open data found.</p>`;
        // media
        if (data.commons && data.commons.length) {
            mediaContainer.innerHTML = data.commons.map(m => `<div style="margin-bottom:8px"><a href="${escapeHtml(m.url)}" target="_blank" rel="noopener"><img src="${escapeHtml(m.imageUrl)}" alt="${escapeHtml(m.title)}" style="max-width:100%;border-radius:6px"></a></div>`).join('');
        } else if (data.wikidata?.imageUrl) {
            mediaContainer.innerHTML = `<img src="${escapeHtml(data.wikidata.imageUrl)}" alt="${escapeHtml(data.wikidata.title)}" style="max-width:100%;border-radius:6px">`;
        } else {
            mediaContainer.innerHTML = `<p style="color:var(--muted)">No media found.</p>`;
        }
    }

    function escapeHtml(s) {
        if (!s) return '';
        return String(s).replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'})[m]);
    }
}

// -----------------------------
// Data loader and UI wiring
// -----------------------------
let ALL_DATA = [];
let SITE_INDEX = [];
let currentSiteIdx = -1;
let mapInstance = null;
let mapMarker = null;
let timelineChart = null;
let histogramChart = null;

async function loadData() {
    const resp = await fetch(OUTPUT_JSON);
    if (!resp.ok) throw new Error('Could not load output.json');
    const js = await resp.json();
    // normalise objects: ensure types, parse fields
    const normalized = js.map(row => {
        const newRow = { ...row };
        newRow.site = normalizeString(row.site || row.site_name || row.Site || '');
        newRow.labnr = normalizeString(row.labnr || row.lab || '');
        newRow.bp = parseNumber(row.bp);
        newRow.std = parseNumber(row.std);
        newRow.delta_c13 = parseNumber(row.delta_c13);
        newRow.lat = parseNumber(row.lat);
        newRow.lng = parseNumber(row.lng);
        newRow.material = normalizeString(row.material);
        newRow.feature_type = normalizeString(row.feature_type || row.feature || '');
        newRow.reference = normalizeString(row.reference);
        // parse periods & typo arrays defensively
        newRow.periods_parsed = parseMalformedJson(row.periods) || parseMalformedJson(row.periods || row.periods_parsed) || [];
        newRow.typo_parsed = parseMalformedJson(row.typochronological_units) || [];
        newRow.eco_parsed = parseMalformedJson(row.ecochronological_units) || [];
        // any wikidata id if present
        newRow.wikidata_id = normalizeString(row.wikidata_id || row.wikidata || row.wd);
        return newRow;
    });

    ALL_DATA = normalized;

    // build unique site index (preserve order)
    const siteMap = new Map();
    normalized.forEach(r => {
        const name = r.site || '(unknown)';
        if (!siteMap.has(name)) {
            siteMap.set(name, { site: name, country: r.country || '', lat: r.lat, lng: r.lng, count: 0 });
        }
        siteMap.get(name).count += 1;
    });
    SITE_INDEX = Array.from(siteMap.values()).sort((a,b) => (b.count - a.count) || a.site.localeCompare(b.site));
    buildSiteSelector();
    // once loaded, try to find id param
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id) {
        // find best matching site name (case-insensitive)
        const idx = SITE_INDEX.findIndex(s => s.site.toLowerCase() === id.toLowerCase());
        if (idx >= 0) {
            currentSiteIdx = idx;
            q('#site-selector').selectedIndex = idx;
            await renderProfileByIndex(idx);
            return;
        }
    }
    // otherwise show first site
    if (SITE_INDEX.length) {
        currentSiteIdx = 0;
        q('#site-selector').selectedIndex = 0;
        await renderProfileByIndex(0);
    } else {
        q('#site-name').textContent = 'No data available';
    }
}

function buildSiteSelector() {
    const sel = q('#site-selector');
    sel.innerHTML = '';
    SITE_INDEX.forEach((s, i) => {
        const opt = document.createElement('option');
        opt.value = s.site;
        opt.textContent = `${s.site} — ${s.country || '—'} (${s.count})`;
        sel.appendChild(opt);
    });
    q('#selected-count').textContent = `${SITE_INDEX.length} sites`;
}

// -----------------------------
// Render a site (main function)
// -----------------------------
async function renderProfileByIndex(idx) {
    if (idx < 0 || idx >= SITE_INDEX.length) return;
    currentSiteIdx = idx;
    const siteName = SITE_INDEX[idx].site;
    const records = ALL_DATA.filter(d => (d.site || '').toLowerCase() === siteName.toLowerCase());
    if (!records.length) {
        q('#site-name').textContent = 'Site not found';
        return;
    }
    // choose first record as representative metadata (prefer one with coords)
    let rep = records.find(r => r.lat && r.lng) || records[0];

    // Header
    q('#site-name').textContent = siteName;
    q('#site-country-subheader').textContent = rep.country || '—';
    q('#country').textContent = rep.country || '—';
    q('#site-type').textContent = rep.site_type || rep.feature_type || '—';
    q('#created-date').textContent = new Date().toISOString().split('T')[0];
    q('#updated-date').textContent = new Date().toISOString().split('T')[0];

    // Coordinates
    const lat = rep.lat; const lng = rep.lng;
    q('#coords-deg').textContent = (lat!=null && lng!=null) ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : '—';
    q('#coords-dms').textContent = (lat!=null && lng!=null) ? `${formatDMS(lat,'lat')}, ${formatDMS(lng,'lng')}` : '—';

    // Map
    renderMap(lat, lng, siteName);

    // Radiocarbon table
    const tbody = q('#c14-table tbody');
    tbody.innerHTML = '';
    records.forEach(r => {
        const tr = document.createElement('tr');
        const refText = (r.reference || '').replace(/^[\["']+|[\]"']+$/g, '').replace(/\\n/g, ' ');
        tr.innerHTML = `
            <td>${escapeHtml(r.labnr || '—')}</td>
            <td>${escapeHtml(r.feature_type || '—')}</td>
            <td>${escapeHtml(r.material || '—')}</td>
            <td>${escapeHtml(r.species || '—')}</td>
            <td>${r.bp != null ? `${r.bp} ± ${r.std != null ? r.std : '—'}` : '—'}</td>
            <td>${escapeHtml(r.cal_bp || '—')}</td>
            <td>${escapeHtml(refText || '—')}</td>
        `;
        tbody.appendChild(tr);
    });
    q('#c14-count').textContent = `(${records.length})`;

    // Typological table
    const ttbody = q('#typo-table tbody'); ttbody.innerHTML = '';
    const addedTypo = new Set();
    records.forEach(r => {
        const tarr = r.typo_parsed || [];
        tarr.forEach(item => {
            const label = item.typochronological_unit || item.typochronological_unit || item.typ || JSON.stringify(item);
            if (!label) return;
            if (addedTypo.has(label)) return;
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${escapeHtml(label)}</td><td>${Array.isArray(r.eco_parsed) && r.eco_parsed.length ? escapeHtml((r.eco_parsed[0].ecochronological_unit||'—')) : '—'}</td><td>${escapeHtml(r.reference || '—')}</td>`;
            ttbody.appendChild(tr);
            addedTypo.add(label);
        });
    });
    if (!ttbody.children.length) ttbody.innerHTML = '<tr><td colspan="3" style="color:var(--muted)">No typological data.</td></tr>';

    // Bibliography
    const refs = Array.from(new Set(records.map(r => (r.reference || '').replace(/^[\["']+|[\]"']+$/g,'').trim()).filter(Boolean)));
    q('#references-container').innerHTML = refs.length ? refs.map(r => `<p>${escapeHtml(r)}</p>`).join('') : '<p style="color:var(--muted)">No bibliographic references available.</p>';

    // Charts
    buildCharts(records);

    // Linked data + media (with caching)
    await fetchAndRenderLinkedData(siteName, rep.wikidata_id || null);

    // update URL (push)
    try {
        const u = new URL(window.location);
        u.searchParams.set('id', siteName);
        history.replaceState({}, '', u.toString());
    } catch(e){}

    // wire up download CSV for this site
    q('#download-csv').onclick = () => downloadSiteC14CSV(siteName, records);
    // toggle chart
    q('#toggle-chart').onclick = () => {
        const el = q('#charts');
        el.style.display = el.style.display === 'none' ? 'flex' : 'none';
    };
}

function escapeHtml(s='') {
    return String(s).replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'})[m]);
}

// -----------------------------
// Map helpers
// -----------------------------
function renderMap(lat, lng, siteName) {
    const mapEl = q('#map');
    // lazy init
    if (!mapInstance) {
        mapInstance = L.map(mapEl, { zoomControl: true, attributionControl: true });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapInstance);
    }
    if (mapMarker) {
        try { mapMarker.remove(); } catch(e){}
        mapMarker = null;
    }
    if (lat != null && lng != null) {
        mapInstance.setView([lat, lng], 9);
        mapMarker = L.marker([lat, lng]).addTo(mapInstance).bindPopup(`<strong>${escapeHtml(siteName)}</strong><br>${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    } else {
        // try to show all markers from dataset for site
        const siteRecords = ALL_DATA.filter(d => (d.site||'').toLowerCase() === (siteName || '').toLowerCase() && d.lat != null && d.lng != null);
        if (siteRecords.length) {
            const bounds = L.latLngBounds(siteRecords.map(r => [r.lat, r.lng]));
            mapInstance.fitBounds(bounds.pad(0.25));
            siteRecords.forEach(r => {
                L.marker([r.lat, r.lng]).addTo(mapInstance);
            });
        } else {
            // fallback: world view
            mapInstance.setView([30, 0], 3);
            mapEl.innerHTML = ''; // keep map blank but visible
        }
    }

    // center button
    q('#center-map').onclick = () => {
        if (lat != null && lng != null) mapInstance.panTo([lat, lng]);
        else mapInstance.setView([30,0],3);
    };
}

// -----------------------------
// Charts (timeline scatter + histogram of bp)
// -----------------------------
function buildCharts(records) {
    // prepare bp points
    const points = records
        .filter(r => r.bp != null)
        .map(r => ({ x: r.bp, y: 0, labnr: r.labnr, std: r.std || 0, material: r.material }));

    // sort ascending bp to show timeline left->right (older = larger BP)
    points.sort((a,b) => a.x - b.x);

    // timeline scatter chart
    const tlCtx = q('#timeline-chart').getContext('2d');
    if (timelineChart) timelineChart.destroy();
    timelineChart = new Chart(tlCtx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Uncalibrated age (BP)',
                data: points.map(p => ({ x: p.x, y: Math.random()*0.6 - 0.3, meta: p })), // jitter y for visibility
                pointRadius: 6,
                showLine: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: (items) => `BP: ${items[0].parsed.x}`,
                        label: (item) => {
                            const p = item.raw.meta;
                            return `${p.labnr || ''} — ${p.material || ''} — σ=${p.std || 0}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: { display: true, text: 'BP (Before Present)' },
                    type: 'linear',
                    reverse: true // older (higher BP) left-to-right? set reverse true to have older to left
                },
                y: { display: false }
            }
        }
    });

    // histogram
    const histCtx = q('#histogram-chart').getContext('2d');
    if (histogramChart) histogramChart.destroy();
    const values = points.map(p => p.x);
    // simple binning
    const bins = 12;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const width = max - min || 1;
    const binSize = width / bins;
    const histCounts = new Array(bins).fill(0);
    values.forEach(v => {
        const idx = Math.min(Math.floor((v - min) / binSize), bins - 1);
        histCounts[idx]++;
    });
    const labels = new Array(bins).fill(0).map((_,i) => `${Math.round(min + i*binSize)}-${Math.round(min + (i+1)*binSize)}`);

    histogramChart = new Chart(histCtx, {
        type: 'bar',
        data: {
            labels,
            datasets:[{ label: 'Samples', data: histCounts }]
        },
        options:{
            responsive:true,
            maintainAspectRatio:false,
            plugins:{legend:{display:false}},
            scales:{
                x:{title:{display:true,text:'BP range'}},
                y:{title:{display:true,text:'Count'}}
            }
        }
    });

    // show charts area
    q('#charts').style.display = 'flex';
}

// -----------------------------
// Download CSV generator
// -----------------------------
function downloadSiteC14CSV(siteName, records) {
    const cols = ['labnr','feature_type','material','species','bp','std','cal_bp','reference','lat','lng'];
    const header = cols.join(',');
    const lines = records.map(r => cols.map(c => `"${String(r[c] ?? '').replace(/"/g,'""')}"`).join(','));
    const csv = [header].concat(lines).join('\n');
    downloadTextFile(`${siteName.replace(/\s+/g,'_')}_radiocarbon.csv`, csv);
}

// -----------------------------
// UI wiring
// -----------------------------
function wireUI() {
    q('#site-selector').addEventListener('change', async (e) => {
        const idx = e.target.selectedIndex;
        await renderProfileByIndex(idx);
    });

    q('#search-filter').addEventListener('input', (e) => {
        const qv = e.target.value.trim().toLowerCase();
        const sel = q('#site-selector');
        // filter site options by matching text
        for (let i=0;i<sel.options.length;i++){
            const opt = sel.options[i];
            const show = !qv || opt.textContent.toLowerCase().includes(qv);
            opt.hidden = !show;
        }
        // set selected to first visible
        const firstVisible = Array.from(sel.options).findIndex(o => !o.hidden);
        if (firstVisible >= 0) {
            sel.selectedIndex = firstVisible;
            sel.dispatchEvent(new Event('change'));
        }
    });

    q('#next-site').addEventListener('click', () => {
        if (currentSiteIdx < SITE_INDEX.length - 1) {
            currentSiteIdx++;
            q('#site-selector').selectedIndex = currentSiteIdx;
            q('#site-selector').dispatchEvent(new Event('change'));
        }
    });
    q('#prev-site').addEventListener('click', () => {
        if (currentSiteIdx > 0) {
            currentSiteIdx--;
            q('#site-selector').selectedIndex = currentSiteIdx;
            q('#site-selector').dispatchEvent(new Event('change'));
        }
    });

    q('#clear-linked-cache').addEventListener('click', () => {
        clearLinkedCache();
        alert('Linked-data cache cleared.');
    });

    q('#download-all').addEventListener('click', async () => {
        const resp = await fetch(OUTPUT_JSON);
        const text = await resp.text();
        downloadTextFile('output.json', text);
    });
}

// -----------------------------
// Init
// -----------------------------
window.addEventListener('DOMContentLoaded', async () => {
    try {
        wireUI();
        await loadData();
    } catch (e) {
        console.error('Initialization failed', e);
        q('#site-name').textContent = 'Failed to load data';
        q('#linked-data-content').textContent = 'Failed to load linked data.';
    }
});
