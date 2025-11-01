// C14/assets/js/app.js

/**
 * @namespace App
 * @description Main application entry point.
 */
const App = (function(Data, LeafletMap, UI) {

    /**
     * Initializes the application.
     */
    async function init() {
        try {
            // Show loading indicator
            // UI.showLoading();

            // Initialize the map
            LeafletMap.init('map-container');

            // Fetch the dataset
            const features = await Data.getFeatures();

            // Add data layers to the map
            LeafletMap.addDataLayers(features, handleMarkerClick);

            // Hide loading indicator
            // UI.hideLoading();

        } catch (error) {
            // Display an error message to the user
            UI.renderError('Failed to initialize the application. Please check the console for details.');
            console.error('Application initialization failed:', error);
        }
    }

    /**
     * Handles the click event for a map marker.
     * @param {Object} properties - The properties of the clicked feature.
     */
    function handleMarkerClick(properties) {
        UI.renderSiteDetails(properties);
    }

    return {
        init
    };

})(Data, LeafletMap, UI);

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    App.init();

    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });
    }
});
