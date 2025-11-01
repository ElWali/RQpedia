// C14/assets/js/data.js

/**
 * @namespace Data
 * @description Handles fetching and parsing of the canonical dataset.
 */
const Data = (function() {

    const DATA_URL = 'data/output_standardized.geojson';

    /**
     * Fetches and parses the GeoJSON dataset.
     * @returns {Promise<Array>} A promise that resolves with an array of GeoJSON features.
     * @throws {Error} If the network request fails or the data cannot be parsed.
     */
    async function getFeatures() {
        try {
            const response = await fetch(DATA_URL);
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            const data = await response.json();
            if (!data || !data.features || !Array.isArray(data.features)) {
                throw new Error('Invalid GeoJSON format: "features" array not found.');
            }
            return data.features;
        } catch (error) {
            console.error('Failed to load dataset:', error);
            // Re-throw the error to be handled by the caller
            throw error;
        }
    }

    return {
        getFeatures
    };

})();
