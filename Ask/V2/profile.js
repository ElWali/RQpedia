function renderProfilePage(siteName, data) {
    // Helper: Convert decimal degrees to DMS
    function toDMS(deg, isLat) {
        const absDeg = Math.abs(deg);
        const d = Math.floor(absDeg);
        const minFloat = (absDeg - d) * 60;
        const m = Math.floor(minFloat);
        const secFloat = (minFloat - m) * 60;
        let s = Math.round(secFloat);
        if (s === 60) { s = 0; m++; }
        if (m === 60) { m = 0; d++; }
        const dir = isLat ? (deg >= 0 ? 'N' : 'S') : (deg >= 0 ? 'E' : 'W');
        const dStr = String(d).padStart(3, '0');
        const mStr = String(m).padStart(2, '0');
        const sStr = String(s).padStart(2, '0');
        return `${dStr}° ${mStr}' ${sStr}" ${dir}`;
    }

    // Helper: Parse malformed JSON (as used in XRONOS exports)
    function getReferences(record) {
        if (!record.reference) return [];
        const refs = parseMalformedJson(record.reference);
        return Array.isArray(refs) ? refs.map(r => r.reference).filter(Boolean) : [];
    }

    // Helper: Render references list
    function renderReferences(container, references) {
        if (references.size === 0) {
            const p = document.createElement('p');
            p.textContent = 'No bibliographic references available for this site.';
            container.appendChild(p);
            return;
        }
        const ul = document.createElement('ul');
        references.forEach(ref => {
            const li = document.createElement('li');
            li.textContent = ref;
            ul.appendChild(li);
        });
        container.appendChild(ul);
    }

    // Filter records for this site
    const siteRecords = Array.isArray(data) ? data.filter(r => r.site === siteName) : [];
    if (siteRecords.length === 0) {
        document.getElementById('site-name').textContent = 'Site not found';
        return { siteName, wikidata_id: null };
    }

    const firstRecord = siteRecords[0];
    const site = {
        name: firstRecord.site,
        country: firstRecord.country,
        lat: parseFloat(firstRecord.lat),
        lng: parseFloat(firstRecord.lng),
        wikidata_id: firstRecord.wikidata_id || null
    };

    // --- Update document title and header ---
    document.title = `${site.name} | Site Profile`;
    document.getElementById('site-name').textContent = site.name;
    document.getElementById('site-country-subheader').textContent = site.country;
    document.getElementById('created-date').textContent = '2022-12-02 00:50:45 UTC';
    document.getElementById('updated-date').textContent = '2022-12-02 00:50:45 UTC';

    // --- Location ---
    const latDir = site.lat >= 0 ? 'N' : 'S';
    const lngDir = site.lng >= 0 ? 'E' : 'W';
    document.getElementById('coords-deg').textContent = `${site.lat.toFixed(3)}° ${latDir}, ${site.lng.toFixed(3)}° ${lngDir}`;
    document.getElementById('coords-dms').textContent = `${toDMS(site.lat, true)}, ${toDMS(site.lng, false)}`;
    document.getElementById('country').textContent = site.country;

    // --- Map ---
    if (typeof L !== 'undefined') {
        const map = L.map('map').setView([site.lat, site.lng], 10);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        L.marker([site.lat, site.lng]).addTo(map).bindPopup(site.name).openPopup();
    }

    // --- Aggregate data ---
    const allReferences = new Set();
    const c14_dates = [];
    const typo_dates = new Set();

    siteRecords.forEach(record => {
        const refs = getReferences(record);
        refs.forEach(ref => allReferences.add(ref));

        if (record.bp && record.std) {
            c14_dates.push({
                lab_id: record.labnr || 'N/A',
                context: [record.feature, record.feature_type].filter(Boolean).join(' ') || 'N/A',
                material: record.material || 'N/A',
                bp: record.bp,
                std: record.std,
                cal_bp_start: record.cal_bp_start || 'N/A',
                cal_bp_end: record.cal_bp_end || 'N/A',
                references: refs.join(', ') || 'N/A'
            });
        }

        if (record.periods) {
            const parsedPeriods = parseMalformedJson(record.periods);
            if (Array.isArray(parsedPeriods)) {
                parsedPeriods.forEach(p => {
                    if (p.periode) {
                        typo_dates.add(JSON.stringify({
                            name: p.periode,
                            references: refs.join(', ') || 'N/A'
                        }));
                    }
                });
            }
        }
    });

    // --- Radiocarbon table ---
    const c14Body = document.getElementById('c14-table').querySelector('tbody');
    c14Body.innerHTML = '';
    if (c14_dates.length > 0) {
        c14_dates.forEach(date => {
            const row = c14Body.insertRow();
            row.innerHTML = `
                <td data-label="Lab ID">${date.lab_id}</td>
                <td data-label="Context">${date.context}</td>
                <td data-label="Material">${date.material}</td>
                <td data-label="Taxon">N/A</td>
                <td data-label="Method">N/A</td>
                <td data-label="Uncalibrated age">${date.bp}±${date.std}</td>
                <td data-label="Calibrated age">${date.cal_bp_start}–${date.cal_bp_end} cal BP</td>
                <td data-label="References">${date.references}</td>
            `;
        });
    } else {
        const row = c14Body.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 8;
        cell.textContent = 'No radiocarbon dates available for this site.';
        cell.setAttribute('data-label', '');
    }

    // --- Typological table ---
    const typoBody = document.getElementById('typo-table').querySelector('tbody');
    typoBody.innerHTML = '';
    const uniqueTypo = Array.from(typo_dates).map(p => JSON.parse(p));
    if (uniqueTypo.length > 0) {
        uniqueTypo.forEach(period => {
            const row = typoBody.insertRow();
            row.innerHTML = `
                <td data-label="Classification">${period.name}</td>
                <td data-label="Estimated age">N/A</td>
                <td data-label="References">${period.references}</td>
            `;
        });
    } else {
        const row = typoBody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 3;
        cell.textContent = 'No typological dates available for this site.';
        cell.setAttribute('data-label', '');
    }

    // --- References ---
    const refContainer = document.getElementById('references-container');
    refContainer.innerHTML = '';
    renderReferences(refContainer, allReferences);

    // --- Changelog placeholder ---
    document.getElementById('changelog-container').innerHTML = '<p>Imported from source database.</p>';

    // Return metadata for linked data
    return {
        siteName: site.name,
        wikidata_id: site.wikidata_id
    };
}
