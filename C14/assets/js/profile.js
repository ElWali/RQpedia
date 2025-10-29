// C14/assets/js/profile.js

/**
 * @namespace Profile
 * @description Handles the logic for the site profile page.
 */
const Profile = (function(Data) {

    const siteTitleElement = document.getElementById('profile-site-title');
    const dataTableElement = document.getElementById('site-data-table');
    const referencesListElement = document.getElementById('references-list');
    const phasingListElement = document.getElementById('phasing-list');

    // A mapping of property keys to their display-friendly labels.
    const PROPERTY_LABELS = {
        'site': 'Site Name',
        'medafricadateid': 'MedAfrica Date ID',
        'labid': 'Lab ID',
        'otherlabid': 'Other Lab ID',
        'problems': 'Problems',
        'uncalibrateddate': 'Uncalibrated Date',
        'error': 'Error',
        'dc13': 'DC13',
        'dcerror': 'DC Error',
        'datemethod': 'Date Method',
        'calibrationcurve': 'Calibration Curve',
        'localreservoir14cyrformarinedates': 'Local Reservoir 14C yr (for Marine Dates)',
        'localreservoir14cyrerrorformarinedates': 'Local Reservoir 14C yr Error (for Marine Dates)',
        'material': 'Material',
        'species': 'Species',
        'sitecontext': 'Site Context',
        'sampleid': 'Sample ID',
        'notes': 'Notes',
        'domesticcattle': 'Domestic Cattle',
        'wildcattle': 'Wild Cattle',
        'undeterminedbovids': 'Undetermined Bovids',
        'domesticsheep/goats': 'Domestic Sheep / Goats',
        'wildbarbarysheep': 'Wild Barbary Sheep',
        'domesticdonkeys': 'Domestic Donkeys',
        'wilddonkeys/zebras': 'Wild Donkeys / Zebras',
        'domestichorses': 'Domestic Horses',
        'undeterminedequids': 'Undetermined Equids',
        'domesticpigs': 'Domestic Pigs',
        'ostricheggshells': 'Ostrich Eggshells',
        'ostrichbones': 'Ostrich Bones',
        'otherwildterrestrialmacrofauna': 'Other Wild Terrestrial Macrofauna',
        'otherwildterrestrialmicrofauna/avifauna': 'Other Wild Terrestrial Microfauna / Avifauna',
        'terrestrial/freshwatermolluscs': 'Terrestrial / Freshwater Molluscs',
        'marinemolluscs': 'Marine Molluscs',
        'ichthyofauna/turtles': 'Ichthyofauna / Turtles',
        'domesticcereals': 'Domestic Cereals',
        'domesticpulses': 'Domestic Pulses',
        'fruitcrops': 'Fruit Crops',
        'wildplants': 'Wild Plants',
        'pottery': 'Pottery',
        'lithicbackedtools/geometrics': 'Lithic Backed Tools / Geometrics',
        'lithicnotches/denticulates': 'Lithic Notches / Denticulates',
        'lithicarrowheads': 'Lithic Arrowheads',
        'lithicbifacialtools': 'Lithic Bifacial Tools',
        'lithicpolishedaxes/adzes': 'Lithic Polished Axes / Adzes'
    };


    /**
     * Initializes the profile page.
     */
    async function init() {
        try {
            const params = new URLSearchParams(window.location.search);
            const labnr = params.get('labnr');

            if (!labnr) {
                throw new Error('No site identifier (labnr) provided in the URL.');
            }

            const features = await Data.getFeatures();
            const siteFeature = features.find(f => f.properties.labnr === labnr);

            if (!siteFeature) {
                throw new Error(`Site with labnr "${labnr}" not found.`);
            }

            renderProfile(siteFeature.properties);

        } catch (error) {
            renderError(error.message);
            console.error('Failed to initialize profile page:', error);
        }
    }

    /**
     * Renders the profile data onto the page.
     * @param {Object} properties - The properties object of the site feature.
     */
    function renderProfile(properties) {
        siteTitleElement.textContent = properties.site || 'Unnamed Site';

        // Render data table
        let tableHtml = '';
        for (const key in properties) {
            const label = PROPERTY_LABELS[key.toLowerCase().replace(/\s/g, '')] || key;
            const value = properties[key] || 'n/a';
            // We will not display periods and references in the main table
            if (key.toLowerCase() !== 'periods' && key.toLowerCase() !== 'references') {
                tableHtml += `<tr><td>${label}</td><td>${value}</td></tr>`;
            }
        }
        dataTableElement.innerHTML = tableHtml;

        // Render references
        let referencesHtml = '';
        if (properties.references && properties.references.length) {
            properties.references.forEach(ref => {
                 if (typeof ref === 'object' && ref.author && ref.year) {
                    referencesHtml += `<p>${ref.author} ${ref.year}</p>`;
                } else {
                    referencesHtml += `<p>${ref}</p>`;
                }
            });
        } else {
            referencesHtml = '<p>No references available.</p>';
        }
        referencesListElement.innerHTML = referencesHtml;

        // Render cultural phasing
        let phasingHtml = '';
        if (properties.periods && properties.periods.length) {
            phasingHtml = `<ul>${properties.periods.map(p => `<li>${p}</li>`).join('')}</ul>`;
        } else {
            phasingHtml = '<p>No cultural phasing data available.</p>';
        }
        phasingListElement.innerHTML = phasingHtml;
    }

    /**
     * Renders an error message on the page.
     * @param {string} message - The error message.
     */
    function renderError(message) {
        siteTitleElement.textContent = 'Error';
        dataTableElement.innerHTML = `<tr><td>${message}</td></tr>`;
    }

    return {
        init
    };

})(Data);

document.addEventListener('DOMContentLoaded', Profile.init);
