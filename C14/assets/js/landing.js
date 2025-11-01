document.addEventListener('DOMContentLoaded', () => {
    console.log('Landing page JavaScript loaded.');
    displayStatistics();
    initializeSearch();
    initializeMenu();
});

function initializeMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    menuToggle.addEventListener('click', () => {
        mainNav.classList.toggle('active');
    });
}

async function displayStatistics() {
    try {
        const features = await Data.getFeatures();

        // Calculate and display total sites
        const uniqueSites = new Set(features.map(feature => feature.properties.site));
        const totalSites = uniqueSites.size;
        document.getElementById('total-sites').textContent = totalSites;

        // Calculate and display total radiocarbon dates
        const radiocarbonDates = features.filter(feature => feature.properties.bp !== null);
        const totalDates = radiocarbonDates.length;
        document.getElementById('total-dates').textContent = totalDates;

        // Calculate and display total typological dates
        const typologicalDates = features.filter(feature => feature.properties.type === 'Typological');
        const totalTypologicalDates = typologicalDates.length;
        document.getElementById('typological-dates').textContent = totalTypologicalDates;


        // Process data for the period chart
        const periodCounts = features.reduce((acc, feature) => {
            const period = feature.properties.period || 'Unknown';
            acc[period] = (acc[period] || 0) + 1;
            return acc;
        }, {});

        const sortedPeriods = Object.entries(periodCounts).sort(([, a], [, b]) => b - a);
        const chartLabels = sortedPeriods.map(entry => entry[0]);
        const chartData = sortedPeriods.map(entry => entry[1]);

        // Render the period chart
        const ctx = document.getElementById('period-chart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartLabels,
                datasets: [{
                    label: 'Number of Sites',
                    data: chartData,
                    backgroundColor: 'rgba(25, 118, 210, 0.8)',
                    borderColor: 'rgba(25, 118, 210, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                responsive: true,
                maintainAspectRatio: false
            }
        });
    } catch (error) {
        console.error('Error displaying statistics:', error);
        document.getElementById('total-sites').textContent = 'Error';
        document.getElementById('total-dates').textContent = 'Error';
    }
}

async function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    let features = [];

    try {
        features = await Data.getFeatures();
    } catch (error) {
        console.error('Error fetching data for search:', error);
    }

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        searchResults.innerHTML = '';

        if (query.length === 0) {
            return;
        }

        const filteredSites = features.filter(feature => {
            const siteName = feature.properties.site.toLowerCase();
            return siteName.includes(query);
        });

        // Get unique sites
        const uniqueSites = [...new Map(filteredSites.map(item => [item.properties.site, item])).values()];

        uniqueSites.forEach(site => {
            const siteName = site.properties.site;
            const labnr = site.properties.labnr;
            const link = document.createElement('a');
            link.href = `profile.html?labnr=${labnr}`;
            link.textContent = siteName;
            searchResults.appendChild(link);
        });
    });
}
