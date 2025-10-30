// C14/assets/js/app.js

/**
 * @namespace App
 * @description Main application entry point.
 */
const App = (function(Data, Map, UI) {

    /**
     * Initializes the application.
     */
    async function init() {
        try {
            // Show loading indicator
            UI.showLoading();

            // Initialize the map
            Map.init('map-container');

            // Fetch the dataset
            const features = await Data.getFeatures();

            // Add data layers to the map
            Map.addDataLayers(features, handleMarkerClick);

            // Hide loading indicator
            UI.hideLoading();

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

})(Data, Map, UI);

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', App.init);
