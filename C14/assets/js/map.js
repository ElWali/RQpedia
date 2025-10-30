// C14/assets/js/map.js

/**
 * @namespace Map
 * @description Manages the Leaflet map, including initialization and marker creation.
 */
const Map = (function() {

    let map;
    const markers = L.markerClusterGroup();
    let heatLayer;
    let currentLayerView = 'markers'; // 'markers' or 'heatmap'

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

        addToggleControl();
    }

    /**
     * Adds a toggle control to the map to switch between markers and heatmap.
     */
    function addToggleControl() {
        const toggleControl = L.Control.extend({
            options: {
                position: 'topright'
            },
            onAdd: function(map) {
                const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
                container.style.backgroundColor = 'white';
                container.style.padding = '5px';
                container.innerHTML = '<a href="#" id="toggle-layer" title="Toggle Heatmap/Markers"><i class="material-icons">layers</i></a>';

                L.DomEvent.on(container, 'click', function(e) {
                    L.DomEvent.stop(e);
                    toggleLayerView();
                });
                return container;
            }
        });
        map.addControl(new toggleControl());
    }

    /**
     * Toggles the map view between markers and heatmap.
     */
    function toggleLayerView() {
        if (currentLayerView === 'markers') {
            map.removeLayer(markers);
            if (heatLayer) {
                map.addLayer(heatLayer);
            }
            currentLayerView = 'heatmap';
        } else {
            if (heatLayer) {
                map.removeLayer(heatLayer);
            }
            map.addLayer(markers);
            currentLayerView = 'markers';
        }
    }

    /**
     * Adds markers and heatmap to the map for each feature in the dataset.
     * @param {Array} features - An array of GeoJSON features.
     * @param {Function} onMarkerClick - A callback function to execute when a marker is clicked.
     */
    function addDataLayers(features, onMarkerClick) {
        if (!map) {
            console.error('Map is not initialized. Call Map.init() before adding data layers.');
            return;
        }

        markers.clearLayers();
        const heatPoints = [];

        features.forEach(feature => {
            const { geometry, properties } = feature;
            if (geometry && geometry.coordinates) {
                const [lng, lat] = geometry.coordinates;

                // For markers
                const marker = L.marker([lat, lng]);
                marker.on('click', () => onMarkerClick(properties));
                markers.addLayer(marker);

                // For heatmap
                heatPoints.push([lat, lng]);
            }
        });

        // Initialize heat layer
        heatLayer = L.heatLayer(heatPoints, { radius: 25 });

        // Add the default layer view
        if (currentLayerView === 'markers') {
            map.addLayer(markers);
        } else {
            map.addLayer(heatLayer);
        }
    }

    return {
        init,
        addDataLayers
    };

})();
