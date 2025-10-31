// C14/assets/js/ui.js

/**
 * @namespace UI
 * @description Manages UI updates and interactions.
 */
const UI = (function() {

    const siteTitleElement = document.getElementById('site-title');
    const siteDetailsElement = document.getElementById('site-details');

    /**
     * Shows a loading indicator in the sidebar.
     */
    function showLoading() {
        siteTitleElement.textContent = 'Loading...';
        siteDetailsElement.innerHTML = '<p>Fetching data, please wait.</p>';
    }

    /**
     * Hides the loading indicator and resets the sidebar to its default state.
     */
    function hideLoading() {
        siteTitleElement.textContent = 'Select a site';
        siteDetailsElement.innerHTML = '';
    }

    /**
     * Renders the details of a selected site into the sidebar using a Material Design card.
     * @param {Object} properties - The properties object from a GeoJSON feature.
     */
    function renderSiteDetails(properties) {
        if (!properties) {
            renderError('No properties to display.');
            return;
        }

        siteTitleElement.textContent = properties.site || 'Unnamed Site';

        const { labnr, bp, std, material, country, periods, references } = properties;

        const card = document.createElement('div');
        card.className = 'card';

        let cardContent = `<div class="card-content"><ul class="site-info-list">`;

        const fields = {
            'Lab Number': labnr,
            'BP': bp,
            'Std': std,
            'Material': material,
            'Country': country,
            'Periods': periods ? periods.join(', ') : null
        };

        for (const [label, value] of Object.entries(fields)) {
            if (value) {
                cardContent += `<li><span class="label">${label}</span><span class="value">${value}</span></li>`;
            }
        }

        if (references && references.length) {
            const referenceStrings = references.map(ref => {
                if (typeof ref === 'object' && ref !== null && ref.author) {
                    return `${ref.author}${ref.year ? ` (${ref.year})` : ''}`;
                }
                return typeof ref === 'string' ? ref : null;
            }).filter(Boolean).join('; ');
            cardContent += `<li><span class="label">References</span><span class="value">${referenceStrings}</span></li>`;
        }

        cardContent += `</ul></div>`;

        if (labnr) {
            cardContent += `
                <div class="card-actions">
                    <a href="profile.html?labnr=${labnr}" class="button-flat ripple">
                        View Full Profile
                    </a>
                </div>
            `;
        }

        card.innerHTML = cardContent;

        siteDetailsElement.innerHTML = ''; // Clear previous content
        siteDetailsElement.appendChild(card);
    }

    /**
     * Renders an error message in the sidebar.
     * @param {string} message - The error message to display.
     */
    function renderError(message) {
        hideLoading();
        siteTitleElement.textContent = 'Error';
        siteDetailsElement.innerHTML = `<p>${message}</p>`;
    }

    return {
        showLoading,
        hideLoading,
        renderSiteDetails,
        renderError
    };

})();
