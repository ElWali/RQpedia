document.addEventListener('DOMContentLoaded', async () => {
    const surpriseMeButton = document.getElementById('surprise-me');
    if (surpriseMeButton) {
        surpriseMeButton.addEventListener('click', async () => {
            const response = await fetch('/RQpedia/data/morocco_sites_filtered.json');
            const data = await response.json();
            const uniqueSites = getUniqueSites(data);
            const randomSite = uniqueSites[Math.floor(Math.random() * uniqueSites.length)];
            window.location.href = `results.html?q=${encodeURIComponent(randomSite.site_name)}`;
        });
    }

    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');

    if (query && document.getElementById('results-container')) {
        const response = await fetch('/RQpedia/data/morocco_sites_filtered.json');
        const data = await response.json();
        const uniqueSites = getUniqueSites(data);
        const results = uniqueSites.filter(site => site.site_name.toLowerCase().includes(query.toLowerCase()));
        await displayResults(results, query);
    }
});

function getUniqueSites(data) {
    const uniqueSites = [];
    const siteNames = new Set();
    for (const site of data) {
        if (!siteNames.has(site.site_name)) {
            uniqueSites.push(site);
            siteNames.add(site.site_name);
        }
    }
    return uniqueSites;
}

function initializeMap(site) {
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
        const map = L.map('map').setView([site.latitude, site.longitude], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        }).addTo(map);
        L.marker([site.latitude, site.longitude]).addTo(map)
            .bindPopup(site.site_name)
            .openPopup();
    }
}

async function displayResults(results, query) {
    const resultsContainer = document.getElementById('results-container');
    const resultsInfo = document.getElementById('results-info');
    const searchBar = document.querySelector('.search-bar input');

    if (searchBar) {
        searchBar.value = query;
    }

    resultsInfo.textContent = `About ${results.length} results`;
    resultsContainer.innerHTML = ''; // Clear previous results

    if (results.length > 0) {
        const mainResult = results[0];
        const mainResultCard = document.createElement('div');
        mainResultCard.className = 'main-result-card';
        mainResultCard.innerHTML = `
            <img src="https://via.placeholder.com/800x600.png?text=${encodeURIComponent(mainResult.site_name)}" alt="${mainResult.site_name}">
            <div class="main-result-content">
                <h1>${mainResult.site_name}</h1>
                <p class="location">${mainResult.country}</p>
                <p class="description">Details about ${mainResult.site_name} will be available soon.</p>
                <button class="btn-details">View Details</button>
                <div id="map" style="height: 400px; width: 100%;"></div>
            </div>
        `;

        const relatedResultsSection = document.createElement('aside');
        relatedResultsSection.className = 'related-results-section';
        relatedResultsSection.innerHTML = '<h2>Related Results</h2>';

        resultsContainer.appendChild(mainResultCard);
        resultsContainer.appendChild(relatedResultsSection);

        initializeMap(mainResult);

        const relatedResults = results.slice(1, 4);
        relatedResults.forEach(result => {
            const relatedItem = document.createElement('a');
            relatedItem.href = `results.html?q=${encodeURIComponent(result.site_name)}`;
            relatedItem.className = 'related-item';
            relatedItem.innerHTML = `
                <img src="https://via.placeholder.com/160x120.png?text=${encodeURIComponent(result.site_name)}" alt="${result.site_name}">
                <div class="related-item-info">
                    <h3>${result.site_name}</h3>
                    <p>${result.country}</p>
                </div>
                <span class="arrow">&gt;</span>
            `;
            relatedResultsSection.appendChild(relatedItem);
        });

    } else {
        resultsInfo.textContent = `No results found for "${query}"`;
    }
}