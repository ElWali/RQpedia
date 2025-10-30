// C14/assets/js/charts.js

/**
 * @namespace Charts
 * @description Handles the creation of additional charts for the profile page.
 */
const Charts = (function() {

    /**
     * Renders a pie chart showing the distribution of materials for a site.
     * @param {Array<Object>} relatedFeatures - All features for the same site.
     */
    function renderMaterialDistributionChart(relatedFeatures) {
        const materialCounts = relatedFeatures.reduce((acc, feature) => {
            const material = feature.properties.material || 'Unknown';
            acc[material] = (acc[material] || 0) + 1;
            return acc;
        }, {});

        const labels = Object.keys(materialCounts);
        const data = Object.values(materialCounts);

        if (labels.length === 0) {
            document.getElementById('material-chart-placeholder').innerHTML = '<p>No material data available for this site.</p>';
            return;
        }

        const ctx = document.getElementById('materialChart').getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Material Distribution',
                    data: data,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(255, 206, 86, 0.8)',
                        'rgba(75, 192, 192, 0.8)',
                        'rgba(153, 102, 255, 0.8)',
                        'rgba(255, 159, 64, 0.8)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Distribution of Dated Materials'
                    }
                }
            }
        });
    }

    /**
     * Renders a histogram showing the distribution of radiocarbon dates over time.
     * @param {Array<Object>} relatedFeatures - All features for the same site.
     */
    function renderDateDistributionChart(relatedFeatures) {
        const dates = relatedFeatures
            .map(feature => feature.properties.bp)
            .filter(bp => bp !== null && bp !== undefined)
            .sort((a, b) => a - b);

        if (dates.length === 0) {
            document.getElementById('date-chart-placeholder').innerHTML = '<p>No radiocarbon dates available for this site.</p>';
            return;
        }

        // Basic histogram binning
        const minDate = Math.min(...dates);
        const maxDate = Math.max(...dates);
        const binSize = 500; // Bin size in years
        const numBins = Math.ceil((maxDate - minDate) / binSize);
        const bins = new Array(numBins).fill(0);
        const labels = new Array(numBins);

        for (let i = 0; i < numBins; i++) {
            labels[i] = `${minDate + i * binSize} - ${minDate + (i + 1) * binSize} BP`;
        }

        dates.forEach(date => {
            let binIndex = Math.floor((date - minDate) / binSize);
            // Ensure the max date is included in the last bin
            if (binIndex === numBins) {
                binIndex--;
            }
            if(binIndex < bins.length){
                bins[binIndex]++;
            }
        });

        const ctx = document.getElementById('dateChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Number of Dates',
                    data: bins,
                    backgroundColor: 'rgba(153, 102, 255, 0.8)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Distribution of Radiocarbon Dates'
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Date Range (BP)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Number of Dates'
                        },
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    /**
     * Renders a box plot showing the distribution of standard deviation (std) values.
     * @param {Array<Object>} relatedFeatures - All features for the same site.
     */
    function renderStdDistributionChart(relatedFeatures) {
        const stdValues = relatedFeatures
            .map(feature => feature.properties.std)
            .filter(std => std !== null && std !== undefined)
            .sort((a, b) => a - b);

        if (stdValues.length === 0) {
            document.getElementById('std-chart-placeholder').innerHTML = '<p>No standard deviation data available for this site.</p>';
            return;
        }

        const ctx = document.getElementById('stdChart').getContext('2d');
        new Chart(ctx, {
            type: 'boxplot',
            data: {
                labels: ['Standard Deviation'],
                datasets: [{
                    label: 'Standard Deviation (std)',
                    data: [stdValues],
                    backgroundColor: 'rgba(255, 99, 132, 0.8)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Distribution of Date Precision (STD)'
                    }
                },
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'Standard Deviation (Years)'
                        }
                    }
                }
            }
        });
    }

    return { renderMaterialDistributionChart, renderDateDistributionChart, renderStdDistributionChart };
})();
