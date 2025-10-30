// C14/assets/js/profile.js

/**
 * @namespace Profile
 * @description Handles the logic for the site profile page.
 */
const Profile = (function(Data) {

    const siteTitleElement = document.getElementById('profile-site-title');
    const dataTableSectionElement = document.getElementById('data-table-section');
    const referencesListElement = document.getElementById('references-list');
    const phasingListElement = document.getElementById('phasing-list');

    // Defines the structure for collapsible metadata sections.
    const DATA_GROUPS = {
        "Basic Info": {
            open: true, // This section will be open by default
            keys: ['site', 'country', 'labnr', 'medafricadateid', 'otherlabid']
        },
        "Dating Parameters": {
            open: true,
            keys: ['uncalibrateddate', 'error', 'bp', 'std', 'cal_bp', 'cal_std', 'delta_c13', 'dc13', 'dc13error', 'datemethod', 'calibrationcurve']
        },
        "Material & Context": {
            open: false,
            keys: ['material', 'species', 'feature', 'feature_type', 'site_type', 'sitecontext', 'sampleid', 'notes']
        },
        "Cultural Association": {
            open: false,
            keys: ['typochronological_units', 'ecochronological_units']
        }
    };

    // A mapping of property keys to their display-friendly labels.
    const PROPERTY_LABELS = {
        'site': 'Site Name',
        'country': 'Country',
        'labnr': 'Lab Number',
        'medafricadateid': 'MedAfrica Date ID',
        'otherlabid': 'Other Lab ID',
        'uncalibrateddate': 'Uncalibrated Date',
        'error': 'Error',
        'bp': 'BP',
        'std': 'std',
        'cal_bp': 'cal_bp',
        'cal_std': 'cal_std',
        'delta_c13': 'delta_c13',
        'dc13': 'δ13C',
        'dc13error': 'δ13C Error',
        'datemethod': 'Date Method',
        'calibrationcurve': 'Calibration Curve',
        'material': 'Material',
        'species': 'Species',
        'feature': 'feature',
        'feature_type': 'feature_type',
        'site_type': 'site_type',
        'sitecontext': 'Site Context',
        'sampleid': 'Sample ID',
        'notes': 'Notes',
        'typochronological_units': 'typochronological_units',
        'ecochronological_units': 'ecochronological_units'
    };

    /**
     * Initializes the profile page.
     */
    async function init() {
        try {
            const params = new URLSearchParams(window.location.search);
            const labnr = params.get('labnr');

            if (!labnr) {
                throw new Error('No site identifier (labnr) provided in the URL.');
            }

            const features = await Data.getFeatures();
            const siteFeature = features.find(f => f.properties.labnr === labnr);

            if (!siteFeature) {
                throw new Error(`Site with labnr "${labnr}" not found.`);
            }

            renderProfile(siteFeature.properties);
            addEventListeners();

        } catch (error) {
            renderError(error.message);
            console.error('Failed to initialize profile page:', error);
        }
    }

    /**
     * Renders the profile data onto the page.
     * @param {Object} properties - The properties object of the site feature.
     */
    function renderProfile(properties) {
        siteTitleElement.textContent = properties.site || 'Unnamed Site';

        // Render data sections
        let sectionsHtml = '';
        for (const groupName in DATA_GROUPS) {
            const group = DATA_GROUPS[groupName];
            const isOpen = group.open ? 'open' : '';
            let tableRows = '';

            group.keys.forEach(key => {
                if (properties.hasOwnProperty(key)) {
                    const label = PROPERTY_LABELS[key.toLowerCase()] || key;
                    const rawValue = properties[key];
                    const value = (rawValue === null || rawValue === undefined || rawValue === '') ?
                                  '<span class="na-value">n/a</span>' :
                                  rawValue;

                    const copyBtn = ['labnr', 'bp', 'material'].includes(key.toLowerCase()) ?
                                  `<button class="copy-btn" data-copy-text="${rawValue}" title="Copy to clipboard">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                          <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                                          <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zM9 2H7v.5a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5V2z"/>
                                      </svg>
                                   </button>` : '';

                    tableRows += `<tr><td>${label}</td><td>${value}${copyBtn}</td></tr>`;
                }
            });

            if (tableRows) {
                sectionsHtml += `
                    <details class="collapsible-section" ${isOpen}>
                        <summary>${groupName}</summary>
                        <table>${tableRows}</table>
                    </details>`;
            }
        }
        dataTableSectionElement.innerHTML = sectionsHtml;

        // Render references
        renderList(referencesListElement, properties.references, 'No references available.');

        // Render cultural phasing
        renderList(phasingListElement, properties.periods, 'No cultural phasing data available.');

        // Render the calibration graph
        if (properties.bp && properties.std) {
            renderCalibrationGraph(properties.bp, properties.std);
        }
    }

    /**
     * Renders a list of items (references or phases).
     * @param {HTMLElement} element - The container element.
     * @param {Array<string|Object>} items - The items to render.
     * @param {string} emptyMessage - Message to display if items is empty.
     */
    function renderList(element, items, emptyMessage) {
        let listHtml = '';
        if (items && items.length) {
            listHtml = items.map(item => {
                if (typeof item === 'object' && item !== null && item.author) {
                    return `<p>${item.author}${item.year ? ` (${item.year})` : ''}</p>`;
                }
                if (typeof item === 'string') {
                    return `<li>${item}</li>`;
                }
                return '';
            }).join('');
            if (typeof items[0] !== 'object') {
                listHtml = `<ul>${listHtml}</ul>`;
            }
        }
        element.innerHTML = listHtml || `<p>${emptyMessage}</p>`;
    }

    /**
     * Adds event listeners for interactive elements.
     */
    function addEventListeners() {
        dataTableSectionElement.addEventListener('click', function(event) {
            const copyBtn = event.target.closest('.copy-btn');
            if (copyBtn) {
                handleCopyClick(copyBtn);
            }
        });
    }

    /**
     * Handles the click event for the copy button.
     * @param {HTMLElement} button - The button that was clicked.
     */
    function handleCopyClick(button) {
        const textToCopy = button.dataset.copyText;
        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalIcon = button.innerHTML;
            button.innerHTML = 'Copied!';
            setTimeout(() => {
                button.innerHTML = originalIcon;
            }, 1500);
        }).catch(err => {
            console.error('Failed to copy text:', err);
        });
    }

    /**
     * Renders an error message on the page.
     * @param {string} message - The error message.
     */
    function renderError(message) {
        siteTitleElement.textContent = 'Error';
        const profileGrid = document.querySelector('.profile-grid');
        if (profileGrid) {
            profileGrid.innerHTML = `<p style="color: red; grid-column: 1 / -1;">${message}</p>`;
        }
    }

    return {
        init
    };

})(Data);

document.addEventListener('DOMContentLoaded', Profile.init);
