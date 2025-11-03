// C14/assets/js/profile.js

/**
 * @namespace Profile
 * @description Handles the logic for the site profile page.
 */
const Profile = (function(Data, Graph) {

    // Main profile elements
    const siteTitleElement = document.getElementById('profile-site-title');
    const dataTableSectionElement = document.getElementById('data-table-section');
    const referencesListElement = document.getElementById('references-list');
    const phasingListElement = document.getElementById('phasing-list');
    const datingEvidenceTableContainer = document.getElementById('dating-evidence-table-container');

    // Defines the structure for collapsible metadata sections.
    const DATA_GROUPS = {
        "Basic Info": { open: true, keys: ['site', 'country', 'labnr', 'medafricadateid', 'otherlabid'] },
        "Cultural Association": { open: false, keys: ['typochronological_units', 'ecochronological_units'] }
    };

    // A mapping of property keys to their display-friendly labels.
    const PROPERTY_LABELS = {
        'site': 'Site Name', 'country': 'Country', 'labnr': 'Lab Number', 'medafricadateid': 'MedAfrica Date ID',
        'otherlabid': 'Other Lab ID', 'uncalibrateddate': 'Uncalibrated Date', 'error': 'Error', 'bp': 'BP', 'std': 'std',
        'cal_bp': 'cal_bp', 'cal_std': 'cal_std', 'delta_c13': 'delta_c13', 'dc13': 'δ13C', 'dc13error': 'δ13C Error',
        'datemethod': 'Date Method', 'calibrationcurve': 'Calibration Curve', 'material': 'Material', 'species': 'Species',
        'feature': 'feature', 'feature_type': 'feature_type', 'site_type': 'site_type', 'sitecontext': 'Site Context',
        'sampleid': 'Sample ID', 'notes': 'Notes', 'typochronological_units': 'Typochronological Units', 'ecochronological_units': 'Ecochronological Units'
    };

    /**
     * Initializes the profile page.
     */
    async function init() {
        try {
            const params = new URLSearchParams(window.location.search);
            const labnr = params.get('labnr');
            const siteNameFromUrl = params.get('site');

            const isValidLabnr = labnr && labnr !== 'undefined' && labnr !== null;

            if (!isValidLabnr && !siteNameFromUrl) {
                throw new Error('No site identifier (labnr or site) provided in the URL.');
            }

            const features = await Data.getFeatures();
            let siteFeature;

            if (isValidLabnr) {
                siteFeature = features.find(f => f.properties.labnr === labnr);
            }

            if (!siteFeature && siteNameFromUrl) {
                siteFeature = features.find(f => f.properties.site === siteNameFromUrl);
            }

            if (!siteFeature) {
                throw new Error(`Site not found with identifier: ${labnr || siteNameFromUrl}`);
            }

            const siteName = siteFeature.properties.site;
            const relatedSiteFeatures = features.filter(f => f.properties.site === siteName);

            renderProfile(siteFeature.properties, relatedSiteFeatures);

        } catch (error) {
            renderError(error.message);
            console.error('Failed to initialize profile page:', error);
        }
    }

    /**
     * Renders the entire profile page.
     * @param {Object} properties - The properties of the main site feature.
     * @param {Array<Object>} relatedFeatures - All features for the same site.
     */
    function renderProfile(properties, relatedFeatures) {
        siteTitleElement.textContent = properties.site || 'Unnamed Site';

        renderMainDataTable(properties);
        renderDirectReferences(referencesListElement, properties.references, 'No direct references available.');
        renderList(phasingListElement, properties.periods, 'No cultural phasing data available.');

        renderDatingEvidenceTable(relatedFeatures);

        Charts.renderMaterialDistributionChart(relatedFeatures);
        Charts.renderDateDistributionChart(relatedFeatures);
        Charts.renderStdDistributionChart(relatedFeatures);

        const firstC14Date = relatedFeatures
            .flatMap(f => f.properties.dates || [])
            .find(d => d.dating_method === 'C14' && d.age && d.error);

        if (firstC14Date) {
            Graph.renderCalibrationGraph(firstC14Date.age, firstC14Date.error);
        }

        if (relatedFeatures.length > 0 && relatedFeatures[0].geometry && relatedFeatures[0].geometry.coordinates) {
            renderMap(relatedFeatures[0].geometry.coordinates);
        }
    }

    /**
     * Renders a Leaflet map for the site's location.
     * @param {Array<number>} coordinates - The longitude and latitude of the site.
     */
    function renderMap(coordinates) {
        const [lng, lat] = coordinates;
        const map = L.map('profile-map').setView([lat, lng], 13);

        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        }).addTo(map);

        L.marker([lat, lng]).addTo(map);
    }

    /**
     * Sanitizes a value for display. Replaces null, undefined, empty strings,
     * or the literal 'n/a' with a hyphen. Also performs basic XSS sanitization.
     * @param {*} rawValue - The value to sanitize.
     * @returns {string} The sanitized value.
     */
    function sanitizeValue(rawValue) {
        if (rawValue === null || rawValue === undefined || rawValue === '' || rawValue === 'n/a') {
            return '-';
        }
        const temp = document.createElement('div');
        temp.textContent = String(rawValue);
        return temp.innerHTML;
    }

    /**
     * Renders the main collapsible data table for the specific lab ID.
     * @param {Object} properties - The properties object of the site feature.
     */
    function renderMainDataTable(properties) {
        let sectionsHtml = '';
        for (const groupName in DATA_GROUPS) {
            const group = DATA_GROUPS[groupName];
            const isOpen = group.open ? 'open' : '';
            let contentHtml = '';

            if (groupName === "Cultural Association") {
                let listItems = '';
                group.keys.forEach(key => {
                    const value = properties[key];
                    if (value && Array.isArray(value) && value.length > 0) {
                        value.forEach(item => {
                            if (item) listItems += `<li>${sanitizeValue(item)}</li>`;
                        });
                    }
                });

                if (listItems) {
                    contentHtml = `<ul>${listItems}</ul>`;
                }
            } else {
                let tableRows = '';
                group.keys.forEach(key => {
                    if (properties.hasOwnProperty(key)) {
                        const label = PROPERTY_LABELS[key.toLowerCase()] || key;
                        const value = sanitizeValue(properties[key]);
                        tableRows += `<tr><td>${label}</td><td>${value}</td></tr>`;
                    }
                });

                if (tableRows) {
                    contentHtml = `<table>${tableRows}</table>`;
                }
            }

            if (contentHtml) {
                sectionsHtml += `<details class="collapsible-section" ${isOpen}><summary>${groupName}</summary>${contentHtml}</details>`;
            }
        }
        dataTableSectionElement.innerHTML = sectionsHtml;
    }

    /**
     * Formats a single reference item into a string.
     * Handles both object {author, year} and simple string formats.
     * @param {string|Object} ref - The reference item.
     * @returns {string} The formatted reference string.
     */
    function formatReference(ref) {
        const sanitize = (str) => {
            const temp = document.createElement('div');
            temp.textContent = str;
            return temp.innerHTML;
        };

        if (typeof ref === 'object' && ref !== null) {
            const author = ref.author || '';
            const year = (ref.year && ref.year !== "undefined") ? `(${ref.year})` : '';
            return `${sanitize(author)} ${sanitize(year)}`.trim();
        }
        return sanitize(ref || '');
    }

    /**
     * Renders the consolidated Dating Evidence table for the site.
     * @param {Array<Object>} features - The array of features for the site.
     */
    function renderDatingEvidenceTable(features) {
        const allDates = features.flatMap(f =>
            (f.properties.dates || []).map(date => ({
                ...date,
                labnr: f.properties.labnr,
                references: f.properties.references,
                material: date.material || f.properties.material,
                species: f.properties.species
            }))
        );

        const uniqueDates = Array.from(new Map(allDates.map(d => [`${d.dating_method}-${d.age}-${d.error}-${d.labnr}`, d])).values());

        if (uniqueDates.length === 0) {
            datingEvidenceTableContainer.innerHTML = '<p>No dating evidence found for this site.</p>';
            return;
        }

        const tableRows = uniqueDates.map(date => {
            const age = date.age ? `${date.age}${date.error ? ` ± ${date.error}` : ''} ${date.unit || ''}`.trim() : '—';

            let calibratedAge = '';
            if (date.dating_method === 'C14' && date.cal_bp && date.cal_std) {
                const rangeStart = Math.round(date.cal_bp + (2 * date.cal_std));
                const rangeEnd = Math.round(date.cal_bp - (2 * date.cal_std));
                calibratedAge = ` (${rangeStart} - ${rangeEnd} cal BP)`;
            }

            const ageString = `${age}${calibratedAge}`;
            const references = (date.references && date.references.length > 0) ? date.references.map(formatReference).join(', ') : (date.reference || '—');
            const labnrDisplay = date.labnr ? `<a href="profile.html?labnr=${date.labnr}">${date.labnr}</a>` : 'N/A';

            return `
                <tr>
                    <td>${date.dating_method || '—'}</td>
                    <td>${labnrDisplay}</td>
                    <td>${date.material || '—'}</td>
                    <td>${date.species || '—'}</td>
                    <td>${ageString}</td>
                    <td>${references}</td>
                </tr>
            `;
        }).join('');

        datingEvidenceTableContainer.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Method</th>
                        <th>Lab ID</th>
                        <th>Material</th>
                        <th>Taxon</th>
                        <th>Age</th>
                        <th>References</th>
                    </tr>
                </thead>
                <tbody>${tableRows}</tbody>
            </table>`;
    }

    function renderDirectReferences(element, items, emptyMessage) {
        if (!items || items.length === 0) {
            element.innerHTML = `<p>${emptyMessage}</p>`;
            return;
        }
        const listHtml = items.map(item => `<p>${formatReference(item)}</p>`).join('');
        element.innerHTML = listHtml;
    }

    function renderList(element, items, emptyMessage) {
        if (!items || items.length === 0) {
            element.innerHTML = `<p>${emptyMessage}</p>`;
            return;
        }
        const isRefObjectList = items.some(item => typeof item === 'object' && item !== null);
        if (isRefObjectList) {
            const listHtml = items.map(item => `<p>${formatReference(item)}</p>`).join('');
            element.innerHTML = listHtml;
        } else {
            const listHtml = items.map(item => `<li>${item}</li>`).join('');
            element.innerHTML = `<ul>${listHtml}</ul>`;
        }
    }

    function renderError(message) {
        siteTitleElement.textContent = 'Error';
        const profileGrid = document.querySelector('.profile-grid');
        if (profileGrid) profileGrid.innerHTML = `<p style="color: red; grid-column: 1 / -1;">${message}</p>`;
    }

    return { init };
})(Data, Graph);

document.addEventListener('DOMContentLoaded', () => {
    Profile.init();

    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });
    }
});
