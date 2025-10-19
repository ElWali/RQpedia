function renderProfilePage(siteName, data) {
    // Function to convert decimal degrees to DMS
    function toDMS(deg, isLat) {
        let d = Math.floor(Math.abs(deg));
        let minfloat = (Math.abs(deg) - d) * 60;
        let m = Math.floor(minfloat);
        let secfloat = (minfloat - m) * 60;
        let s = Math.round(secfloat);
        if (s === 60) { m++; s = 0; }
        if (m === 60) { d++; m = 0; }
        const dir = isLat ? (deg >= 0 ? 'N' : 'S') : (deg >= 0 ? 'E' : 'W');
        // Pad with leading zeros
        const dStr = String(d).padStart(3, '0');
        const mStr = String(m).padStart(2, '0');
        const sStr = String(s).padStart(2, '0');
        return `${dStr}° ${mStr}' ${sStr}" ${dir}`;
    }

    function getReferences(record) {
        if (!record.reference) return [];
        const refs = parseMalformedJson(record.reference);
        return Array.isArray(refs) ? refs.map(r => r.reference).filter(Boolean) : [];
    }

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

    const siteRecords = data.filter(r => r.site === siteName);

    if (siteRecords.length > 0) {
        const firstRecord = siteRecords[0];
        const site = {
            name: firstRecord.site,
            country: firstRecord.country,
            lat: parseFloat(firstRecord.lat),
            lng: parseFloat(firstRecord.lng)
        };

        // --- Populate Header ---
        document.title = site.name + " | Site Profile";
        document.getElementById('site-name').textContent = site.name;
        document.getElementById('site-country-subheader').textContent = site.country;
        // Mock dates as they are not in the JSON
        document.getElementById('created-date').textContent = "2022-12-02 00:50:45 UTC";
        document.getElementById('updated-date').textContent = "2022-12-02 00:50:45 UTC";

        // --- Populate Location Info ---
        const latStr = `${site.lat.toFixed(3)}° ${site.lat >= 0 ? 'N' : 'S'}`;
        const lngStr = `${site.lng.toFixed(3)}° ${site.lng >= 0 ? 'E' : 'W'}`;
        document.getElementById('coords-deg').textContent = `${latStr}, ${lngStr}`;
        document.getElementById('coords-dms').textContent = `${toDMS(site.lat, true)}, ${toDMS(site.lng, false)}`;
        document.getElementById('country').textContent = site.country;

        // --- Initialize Map ---
        if (typeof L !== 'undefined') {
            const map = L.map('map').setView([site.lat, site.lng], 10);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
            L.marker([site.lat, site.lng]).addTo(map).bindPopup(site.name).openPopup();
        }


        const allReferences = new Set();
        const c14_dates = [];
        const typo_dates = new Set();

        siteRecords.forEach(record => {
            const refs = getReferences(record);
            refs.forEach(ref => allReferences.add(ref));

            // Collect C14 Dates
            if (record.bp && record.std) {
                c14_dates.push({
                    lab_id: record.labnr || 'N/A',
                    context: `${record.feature || ''} ${record.feature_type || ''}`.trim() || 'N/A',
                    material: record.material || 'N/A',
                    bp: record.bp,
                    std: record.std,
                    cal_bp_start: record.cal_bp_start || 'N/A',
                    cal_bp_end: record.cal_bp_end || 'N/A',
                    references: refs.join(', ') || 'N/A'
                });
            }

            // Collect Typological Dates
            if (record.periods) {
                const parsedPeriods = parseMalformedJson(record.periods);
                if (Array.isArray(parsedPeriods)) {
                    parsedPeriods.forEach(p => {
                        if (p.periode) typo_dates.add(JSON.stringify({
                            name: p.periode,
                            references: refs.join(', ') || 'N/A'
                        }));
                    });
                }
            }
        });

        // --- Render Radiocarbon Dates ---
        const c14TableBody = document.getElementById('c14-table').querySelector('tbody');
        if (c14_dates.length > 0) {
            c14_dates.forEach(date => {
                const row = c14TableBody.insertRow();
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
            const row = c14TableBody.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 8;
            cell.textContent = 'No radiocarbon dates available for this site.';
        }

        // --- Render Typological Dates ---
        const typoTableBody = document.getElementById('typo-table').querySelector('tbody');
        const unique_typo_dates = Array.from(typo_dates).map(p => JSON.parse(p));
        if (unique_typo_dates.length > 0) {
            unique_typo_dates.forEach(period => {
                const row = typoTableBody.insertRow();
                row.innerHTML = `
                    <td data-label="Classification">${period.name}</td>
                    <td data-label="Estimated age">N/A</td>
                    <td data-label="References">${period.references}</td>
                `;
            });
        } else {
            const row = typoTableBody.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 3;
            cell.textContent = 'No typological dates available for this site.';
        }

        // --- Render Bibliographic References ---
        const referencesContainer = document.getElementById('references-container');
        renderReferences(referencesContainer, allReferences);

        // --- Render Changelog ---
        const changelogContainer = document.getElementById('changelog-container');
        changelogContainer.innerHTML = `<p>Imported from source database. (Placeholder)</p>`;

    } else {
        document.getElementById('site-name').textContent = "Site not found";
    }
}
