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
            // Initialize the map
            Map.init('map-container');

            // Fetch the dataset
            const features = await Data.getFeatures();

            // Add markers to the map
            Map.addMarkers(features, handleMarkerClick);

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
