// C14/assets/js/profile.js

/**
 * @namespace Profile
 * @description Handles the logic for the site profile page.
 */
const Profile = (function(Data) {

    // Main profile elements
    const siteTitleElement = document.getElementById('profile-site-title');
    const dataTableSectionElement = document.getElementById('data-table-section');
    const referencesListElement = document.getElementById('references-list');
    const phasingListElement = document.getElementById('phasing-list');
    // New table container elements
    const radiocarbonDatesTableContainer = document.getElementById('radiocarbon-dates-table-container');
    const typologicalDatesTableContainer = document.getElementById('typological-dates-table-container');

    // Defines the structure for collapsible metadata sections.
    const DATA_GROUPS = {
        "Basic Info": { open: true, keys: ['site', 'country', 'labnr', 'medafricadateid', 'otherlabid'] },
        "Dating Parameters": { open: true, keys: ['uncalibrateddate', 'error', 'bp', 'std', 'cal_bp', 'cal_std', 'delta_c13', 'dc13', 'dc13error', 'datemethod', 'calibrationcurve'] },
        "Material & Context": { open: false, keys: ['material', 'species', 'feature', 'feature_type', 'site_type', 'sitecontext', 'sampleid', 'notes'] },
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
            if (!labnr) throw new Error('No site identifier (labnr) provided in the URL.');

            const features = await Data.getFeatures();
            const siteFeature = features.find(f => f.properties.labnr === labnr);
            if (!siteFeature) throw new Error(`Site with labnr "${labnr}" not found.`);

            const siteName = siteFeature.properties.site;
            const relatedSiteFeatures = features.filter(f => f.properties.site === siteName);

            renderProfile(siteFeature.properties, relatedSiteFeatures);
            addEventListeners();

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

        renderRadiocarbonDatesTable(relatedFeatures);
        renderTypologicalDatesTable(relatedFeatures);

        Charts.renderMaterialDistributionChart(relatedFeatures);
        Charts.renderDateDistributionChart(relatedFeatures);
        Charts.renderStdDistributionChart(relatedFeatures);

        if (properties.bp && properties.std) {
            renderCalibrationGraph(properties.bp, properties.std);
        }
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
            let tableRows = '';

            group.keys.forEach(key => {
                if (properties.hasOwnProperty(key)) {
                    const label = PROPERTY_LABELS[key.toLowerCase()] || key;
                    const rawValue = properties[key];
                    const value = (rawValue === null || rawValue === '' || rawValue === undefined) ? '<span class="na-value">n/a</span>' : rawValue;
                    const copyBtn = ['labnr', 'bp', 'material'].includes(key.toLowerCase()) ?
                                  `<button class="copy-btn ripple" data-copy-text="${rawValue}" title="Copy to clipboard"><i class="material-icons">content_copy</i></button>` : '';
                    tableRows += `<tr><td>${label}</td><td>${value}${copyBtn}</td></tr>`;
                }
            });

            if (tableRows) {
                sectionsHtml += `<details class="collapsible-section" ${isOpen}><summary>${groupName}</summary><table>${tableRows}</table></details>`;
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
        if (typeof ref === 'object' && ref !== null) {
            const author = ref.author || '';
            // Check for null, undefined, or the literal string "undefined"
            const year = (ref.year && ref.year !== "undefined") ? `(${ref.year})` : '';
            return `${author} ${year}`.trim();
        }
        return ref || '';
    }

    /**
     * Renders the Radiocarbon Dates table for the site.
     * @param {Array<Object>} features - The array of features for the site.
     */
    function renderRadiocarbonDatesTable(features) {
        const radiocarbonFeatures = features.filter(f => f.properties.bp !== null && f.properties.bp !== undefined);

        // Deduplicate features using a composite key to ensure each unique date is shown only once.
        const uniqueFeaturesMap = new Map();
        radiocarbonFeatures.forEach(feature => {
            const props = feature.properties;
            const key = `${props.labnr}|${props.bp}|${props.std}`; // Composite key
            uniqueFeaturesMap.set(key, feature);
        });
        const uniqueFeatures = Array.from(uniqueFeaturesMap.values());

        if (uniqueFeatures.length === 0) {
            radiocarbonDatesTableContainer.innerHTML = '<p>No radiocarbon dates found for this site.</p>';
            return;
        }

        const tableRows = uniqueFeatures.map(feature => {
            const props = feature.properties;
            const uncalibratedAge = props.bp && props.std ? `${props.bp} ± ${props.std}` : '—';
            const references = (props.references && props.references.length > 0) ?
                props.references.map(formatReference).join(', ') : '—';

            return `
                <tr>
                    <td><a href="profile.html?labnr=${props.labnr}">${props.labnr || '—'}</a></td>
                    <td>—</td>
                    <td>${props.material || '—'}</td>
                    <td>—</td>
                    <td>${props.datemethod || 'Radiocarbon'}</td>
                    <td>${uncalibratedAge}</td>
                    <td>—</td>
                    <td>${references}</td>
                </tr>
            `;
        }).join('');

        radiocarbonDatesTableContainer.innerHTML = `
            <table>
                <thead><tr><th>Lab ID</th><th>Context</th><th>Material</th><th>Taxon</th><th>Method</th><th>Uncalibrated age</th><th>Calibrated age</th><th>References</th></tr></thead>
                <tbody>${tableRows}</tbody>
            </table>`;
    }

    /**
     * Renders the Typological Dates table for the site.
     * @param {Array<Object>} features - The array of features for the site.
     */
    function renderTypologicalDatesTable(features) {
        const uniquePeriods = [];
        const seen = new Set();

        features.forEach(feature => {
            const props = feature.properties;
            if (props.typochronological_units && props.typochronological_units.length > 0) {
                const classification = props.typochronological_units.join(', ');
                const refString = JSON.stringify(props.references);
                const key = `${classification}|${refString}`;
                if (!seen.has(key)) {
                    uniquePeriods.push({ classification, references: props.references });
                    seen.add(key);
                }
            }
        });

        if (uniquePeriods.length === 0) {
            typologicalDatesTableContainer.innerHTML = '<p>No typological dates found for this site.</p>';
            return;
        }

        const tableRows = uniquePeriods.map(period => {
            const references = (period.references && period.references.length > 0) ?
                period.references.map(formatReference).join(', ') : '—';
            return `<tr><td>${period.classification}</td><td>—</td><td>${references}</td></tr>`;
        }).join('');

        typologicalDatesTableContainer.innerHTML = `
            <table>
                <thead><tr><th>Classification</th><th>Estimated age</th><th>References</th></tr></thead>
                <tbody>${tableRows}</tbody>
            </table>`;
    }

    /**
     * Renders a list of items (e.g., references or phasing).
     * @param {HTMLElement} element - The container element.
     * @param {Array<string|Object>} items - The items to render.
     * @param {string} emptyMessage - Message to display if items is empty.
     */
    /**
     * Renders a list of items, specifically for direct references.
     * @param {HTMLElement} element - The container element.
     * @param {Array<string|Object>} items - The reference items to render.
     * @param {string} emptyMessage - Message to display if items is empty.
     */
    function renderDirectReferences(element, items, emptyMessage) {
        if (!items || items.length === 0) {
            element.innerHTML = `<p>${emptyMessage}</p>`;
            return;
        }

        const listHtml = items.map(item => {
            // All references are formatted into paragraphs, not list items
            return `<p>${formatReference(item)}</p>`;
        }).join('');

        element.innerHTML = listHtml;
    }

    /**
     * Renders a list of items (e.g., references or phasing).
     * @param {HTMLElement} element - The container element.
     * @param {Array<string|Object>} items - The items to render.
     * @param {string} emptyMessage - Message to display if items is empty.
     */
    function renderList(element, items, emptyMessage) {
        if (!items || items.length === 0) {
            element.innerHTML = `<p>${emptyMessage}</p>`;
            return;
        }

        const isRefObjectList = items.some(item => typeof item === 'object' && item !== null);

        if (isRefObjectList) {
             // For references, which are objects, just output them in <p> tags.
            const listHtml = items.map(item => `<p>${formatReference(item)}</p>`).join('');
            element.innerHTML = listHtml;
        } else {
            // For other lists (like cultural phasing), use a standard <ul>.
            const listHtml = items.map(item => `<li>${item}</li>`).join('');
            element.innerHTML = `<ul>${listHtml}</ul>`;
        }
    }

    function addEventListeners() {
        dataTableSectionElement.addEventListener('click', e => {
            const copyBtn = e.target.closest('.copy-btn');
            if (copyBtn) handleCopyClick(copyBtn);
        });
    }

    function handleCopyClick(button) {
        navigator.clipboard.writeText(button.dataset.copyText).then(() => {
            const originalIcon = button.innerHTML;
            button.innerHTML = 'Copied!';
            setTimeout(() => { button.innerHTML = originalIcon; }, 1500);
        }).catch(err => console.error('Failed to copy text:', err));
    }

    function renderError(message) {
        siteTitleElement.textContent = 'Error';
        const profileGrid = document.querySelector('.profile-grid');
        if (profileGrid) profileGrid.innerHTML = `<p style="color: red; grid-column: 1 / -1;">${message}</p>`;
    }

    return { init };
})(Data);

document.addEventListener('DOMContentLoaded', Profile.init);
