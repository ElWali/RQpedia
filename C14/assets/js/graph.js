// C14/assets/js/graph.js

/**
 * Parses the IntCal20 calibration curve data from a .14c file string.
 * @param {string} data The raw file data as a string.
 * @returns {Array<Object>} An array of objects representing the curve.
 */
function parseIntCalData(data) {
    const lines = data.split('\n');
    const curve = [];
    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith('#')) continue;
        const parts = trimmedLine.split(',');
        if (parts.length >= 3) {
            const calBP = parseInt(parts[0], 10);
            const c14Age = parseInt(parts[1], 10);
            const sigma = parseInt(parts[2], 10);
            if (!isNaN(calBP)) {
                curve.push({ calBP, c14Age, sigma });
            }
        }
    }
    return curve;
}

/**
 * Converts a cal BP year to a BC/AD string representation.
 * @param {number} calBP The calibrated year Before Present (1950).
 * @returns {string} The year in BC/AD format.
 */
function formatCalBP(calBP) {
    const calAD = 1950 - calBP;
    return calAD > 0 ? `${calAD} AD` : `${Math.abs(calAD)} BC`;
}

/**
 * Calculates the probability distribution of the calibrated age.
 * @param {number} sampleC14Age The C14 age of the sample.
 * @param {number} sampleSigma The standard deviation of the sample's C14 age.
 * @param {Array<Object>} curve The calibration curve data.
 * @returns {Object} An object with labels (cal BP) and data (probabilities).
 */
function calculateProbabilityDistribution(sampleC14Age, sampleSigma, curve) {
    const probabilities = [];
    let totalProbability = 0;

    const normalPDF = (x, mean, stdDev) => {
        if (stdDev === 0) return x === mean ? 1 : 0;
        return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));
    };

    // To improve performance, only consider a relevant slice of the curve.
    // A 5-sigma range should be more than enough to capture the relevant probabilities.
    const minRange = sampleC14Age - 5 * sampleSigma;
    const maxRange = sampleC14Age + 5 * sampleSigma;
    const relevantCurve = curve.filter(p => p.c14Age >= minRange && p.c14Age <= maxRange);

    if (relevantCurve.length === 0) {
        console.warn('No relevant calibration curve points found for this sample.');
        return { labels: [], data: [] };
    }

    for (const point of relevantCurve) {
        const combinedSigma = Math.sqrt(Math.pow(sampleSigma, 2) + Math.pow(point.sigma, 2));
        const prob = normalPDF(sampleC14Age, point.c14Age, combinedSigma);
        probabilities.push({ calBP: point.calBP, prob });
        totalProbability += prob;
    }

    if (totalProbability === 0) {
        return { labels: [], data: [] };
    }

    const labels = probabilities.map(p => p.calBP);
    const normalizedData = probabilities.map(p => p.prob / totalProbability);

    return { labels, data: normalizedData };
}


/**
 * Fetches, parses, and renders the calibration graph.
 * @param {number} c14Age The C14 age of the sample.
 * @param {number} sigma The standard deviation of the C14 age.
 */
async function renderCalibrationGraph(c14Age, sigma) {
    try {
        const response = await fetch('data/intcal20.14c');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.text();
        const calibrationCurve = parseIntCalData(data);

        if (calibrationCurve.length === 0) {
            throw new Error('Calibration curve data is empty or could not be parsed.');
        }

        const { labels, data: probabilityData } = calculateProbabilityDistribution(c14Age, sigma, calibrationCurve);

        if (labels.length === 0) {
            throw new Error('Could not generate probability distribution for the given sample.');
        }

        const graphPlaceholder = document.getElementById('graph-placeholder');
        graphPlaceholder.innerHTML = '<canvas id="calibrationChart"></canvas>';
        const ctx = document.getElementById('calibrationChart').getContext('2d');

        new Chart(ctx, {
            type: 'bar', // Using 'bar' to create the probability distribution histogram
            data: {
                labels: labels,
                datasets: [{
                    label: 'Calibrated Age Probability',
                    data: probabilityData,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    barPercentage: 1.0,
                    categoryPercentage: 1.0,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Calibrated Radiocarbon Age Probability Distribution'
                    },
                    tooltip: {
                        callbacks: {
                            title: function(context) {
                                const calBP = context[0].label;
                                return `${formatCalBP(calBP)} (${calBP} cal BP)`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        reverse: true, // BP dates go from high to low (past to present)
                        title: {
                            display: true,
                            text: 'Calibrated Years BP (Before Present, 1950)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Probability'
                        },
                        beginAtZero: true
                    }
                }
            }
        });

    } catch (error) {
        console.error('Error loading or rendering calibration graph:', error);
        const graphPlaceholder = document.getElementById('graph-placeholder');
        graphPlaceholder.innerHTML = '<p class="error-message">Could not render calibration graph. The data may be outside the range of the IntCal20 curve.</p>';
    }
}
