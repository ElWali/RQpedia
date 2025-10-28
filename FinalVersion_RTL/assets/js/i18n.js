// A simple i18n module for RQpedia
// Version: 1.0
// License: MIT

"use strict";

class RQPediai18n {
    constructor({
        locale = 'en',
        translationUrl = '/locales/ui.json',
        fallbackLocale = 'en'
    } = {}) {
        this.locale = locale;
        this.translationUrl = translationUrl;
        this.fallbackLocale = fallbackLocale;
        this.translations = {};
        this.languageChangeCallback = null;

        this.init();
    }

    // --- Public API ---

    /**
     * Set the current language and update the UI.
     * @param {string} lang - The language code (e.g., 'en', 'fr').
     */
    async setLanguage(lang) {
        if (!['en', 'fr', 'ar', 'he'].includes(lang)) {
            lang = this.fallbackLocale;
        }

        this.locale = lang;
        document.documentElement.lang = lang;
        document.documentElement.dir = ['ar', 'he'].includes(lang) ? 'rtl' : 'ltr';

        try {
            localStorage.setItem('rqpedia_lang', lang);
        } catch (e) {
            console.warn('Could not save language preference to localStorage.', e);
        }

        this.translatePage();

        if (this.languageChangeCallback && typeof this.languageChangeCallback === 'function') {
            this.languageChangeCallback(lang);
        }
    }

    /**
     * Get a translated string for a given key.
     * @param {string} key - The translation key.
     * @param {object} [vars={}] - Variables to replace in the string.
     * @returns {string} The translated string.
     */
    t(key, vars = {}) {
        let text = this.translations[this.locale]?.[key] || this.translations[this.fallbackLocale]?.[key] || key;

        if (vars && typeof vars === 'object') {
            for (const [varName, varValue] of Object.entries(vars)) {
                text = text.replace(`%${varName}%`, varValue);
            }
        }
        return text;
    }

    /**
     * Register a callback to be called when the language changes.
     * @param {function} callback - The function to call.
     */
    onLanguageChange(callback) {
        this.languageChangeCallback = callback;
    }


    // --- Private Methods ---

    /**
     * Initialize the module, detect language, and fetch translations.
     * @private
     */
    async init() {
        this.detectLanguage();
        await this.loadTranslations();
        this.translatePage();
        this.attachLanguageSwitcherEvents();

        // Expose the instance globally
        window.i18n = this;

        // Dispatch a custom event when ready
        document.dispatchEvent(new CustomEvent('i18n:ready', { detail: this }));
    }

    /**
     * Detect language from URL, localStorage, or browser settings.
     * @private
     */
    detectLanguage() {
        const urlParams = new URLSearchParams(window.location.search);
        const langParam = urlParams.get('lang');

        let savedLang = null;
        try {
            savedLang = localStorage.getItem('rqpedia_lang');
        } catch(e) {
            console.warn('Could not access localStorage.', e);
        }

        const browserLang = navigator.language.split('-')[0];

        let detectedLang = langParam || savedLang || browserLang || this.fallbackLocale;

        if (!['en', 'fr', 'ar', 'he'].includes(detectedLang)) {
            detectedLang = this.fallbackLocale;
        }

        this.locale = detectedLang;
    }

    /**
     * Fetch the translation file.
     * @private
     */
    async loadTranslations() {
        try {
            const response = await fetch(this.translationUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.translations = await response.json();
        } catch (error) {
            console.error("Could not load translation file:", error);
            // Fallback to a minimal set of translations
            this.translations = {
                en: { error: "Translations could not be loaded." },
                fr: { error: "Les traductions n'ont pas pu être chargées." },
                ar: { error: "لم نتمكن من تحميل الترجمات." }
            };
        }
    }

    /**
     * Translate all elements on the page with data-i18n attribute.
     * @private
     */
    translatePage() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.t(key);

            // Check for placeholder and update it if exists
            if (el.placeholder !== undefined) {
                 el.placeholder = translation;
            }
            // Otherwise, update innerHTML
            else {
                el.innerHTML = translation;
            }
        });

        this.updateActiveButton();
    }

    /**
     * Attach event listeners to language switcher buttons.
     * @private
     */
    attachLanguageSwitcherEvents() {
        document.querySelectorAll('[data-lang-switcher]').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = button.getAttribute('data-lang-switcher');
                this.setLanguage(lang);
                this.updateUrlLang(lang);
            });
        });
    }

    /**
     * Update the active state of language switcher buttons.
     * @private
     */
    updateActiveButton() {
        document.querySelectorAll('[data-lang-switcher]').forEach(button => {
            if (button.getAttribute('data-lang-switcher') === this.locale) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }

    /**
     * Update the 'lang' parameter in the URL.
     * @private
     */
    updateUrlLang(lang) {
        const url = new URL(window.location);
        url.searchParams.set('lang', lang);
        window.history.replaceState({}, '', url);
    }
}

// Initialize the i18n module automatically
document.addEventListener('DOMContentLoaded', () => {
    new RQPediai18n({
        translationUrl: 'locales/ui.json'
    });
});
