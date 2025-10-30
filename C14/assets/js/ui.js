// C14/assets/js/ui.js

/**
 * @namespace UI
 * @description Manages UI updates and interactions.
 */
const UI = (function() {

    const siteTitleElement = document.getElementById('site-title');
    const siteDetailsElement = document.getElementById('site-details');

    /**
     * Renders the details of a selected site into the sidebar.
     * @param {Object} properties - The properties object from a GeoJSON feature.
     */
    function renderSiteDetails(properties) {
        if (!properties) {
            siteTitleElement.textContent = 'Error';
            siteDetailsElement.innerHTML = '<p>No properties to display.</p>';
            return;
        }

        siteTitleElement.textContent = properties.site || 'Unnamed Site';

        let html = `
            <p><strong>Lab Number:</strong> ${properties.labnr || 'N/A'}</p>
            <p><strong>BP:</strong> ${properties.bp || 'N/A'}</p>
            <p><strong>Std:</strong> ${properties.std || 'N/A'}</p>
            <p><strong>Material:</strong> ${properties.material || 'N/A'}</p>
            <p><strong>Country:</strong> ${properties.country || 'N/A'}</p>
        `;

        if (properties.periods && properties.periods.length) {
            html += `<p><strong>Periods:</strong> ${properties.periods.join(', ')}</p>`;
        }

        if (properties.references && properties.references.length) {
            const referenceStrings = properties.references.map(ref => {
                if (typeof ref === 'object' && ref !== null && ref.author) {
                    return `${ref.author}${ref.year ? ` (${ref.year})` : ''}`;
                }
                if (typeof ref === 'string') {
                    return ref;
                }
                return null;
            }).filter(Boolean);

            if (referenceStrings.length) {
                html += `<p><strong>References:</strong> ${referenceStrings.join(', ')}</p>`;
            }
        }

        // Add link to the full profile page
        if (properties.labnr) {
            html += `<a href="profile.html?labnr=${properties.labnr}" class="profile-link">View Full Profile</a>`;
        }

        siteDetailsElement.innerHTML = html;
    }

    /**
     * Renders an error message in the sidebar.
     * @param {string} message - The error message to display.
     */
    function renderError(message) {
        siteTitleElement.textContent = 'Error';
        siteDetailsElement.innerHTML = `<p>${message}</p>`;
    }


    return {
        renderSiteDetails,
        renderError
    };

})();
