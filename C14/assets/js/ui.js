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
     * Renders the details of a selected site into the sidebar using a definition list.
     * @param {Object} properties - The properties object from a GeoJSON feature.
     */
    function renderSiteDetails(properties) {
        if (!properties) {
            renderError('No properties to display.');
            return;
        }

        siteTitleElement.textContent = properties.site || 'Unnamed Site';

        const dl = document.createElement('dl');

        const fields = {
            'Lab Number': properties.labnr,
            'BP': properties.bp,
            'Std': properties.std,
            'Material': properties.material,
            'Country': properties.country,
            'Periods': properties.periods ? properties.periods.join(', ') : null
        };

        for (const [key, value] of Object.entries(fields)) {
            if (value) {
                const dt = document.createElement('dt');
                dt.textContent = key;
                const dd = document.createElement('dd');
                dd.textContent = value;
                dl.appendChild(dt);
                dl.appendChild(dd);
            }
        }

        if (properties.references && properties.references.length) {
            const dt = document.createElement('dt');
            dt.textContent = 'References';
            const dd = document.createElement('dd');
            const referenceStrings = properties.references.map(ref => {
                if (typeof ref === 'object' && ref !== null && ref.author) {
                    return `${ref.author}${ref.year ? ` (${ref.year})` : ''}`;
                }
                return typeof ref === 'string' ? ref : null;
            }).filter(Boolean);
            dd.textContent = referenceStrings.join('; ');
            dl.appendChild(dt);
            dl.appendChild(dd);
        }

        siteDetailsElement.innerHTML = '';
        siteDetailsElement.appendChild(dl);

        if (properties.labnr) {
            const link = document.createElement('a');
            link.href = `profile.html?labnr=${properties.labnr}`;
            link.className = 'profile-link';
            link.textContent = 'View Full Profile';
            siteDetailsElement.appendChild(link);
        }
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
