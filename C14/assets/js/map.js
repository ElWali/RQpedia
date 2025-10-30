// C14/assets/js/map.js

/**
 * @namespace Map
 * @description Manages the Leaflet map, including initialization and marker creation.
 */
const Map = (function() {

    let map;
    const markers = L.markerClusterGroup();

    /**
     * Initializes the Leaflet map.
     * @param {string} mapId - The ID of the map container element.
     */
    function init(mapId) {
        if (map) {
            map.remove();
        }
        map = L.map(mapId).setView([28.0, -9.0], 5); // Centered on Morocco

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
    }

    /**
     * Adds markers to the map for each feature in the dataset.
     * @param {Array} features - An array of GeoJSON features.
     * @param {Function} onMarkerClick - A callback function to execute when a marker is clicked.
     */
    function addMarkers(features, onMarkerClick) {
        if (!map) {
            console.error('Map is not initialized. Call Map.init() before adding markers.');
            return;
        }

        markers.clearLayers(); // Clear existing markers

        features.forEach(feature => {
            const { geometry, properties } = feature;
            if (geometry && geometry.coordinates) {
                const [lng, lat] = geometry.coordinates;
                const marker = L.marker([lat, lng]);
                marker.on('click', () => onMarkerClick(properties));
                markers.addLayer(marker);
            }
        });

        map.addLayer(markers);
    }

    return {
        init,
        addMarkers
    };

})();
