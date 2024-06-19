const i18next = require('i18next');
const i18nextMiddleware = require('i18next-http-middleware');
const Backend = require('i18next-node-fs-backend');
const path = require('path');

const configureI18n = (app) => {
    i18next
        .use(Backend)
        // .use(i18nextMiddleware.LanguageDetector)
        .init(
            {
                // debug: true,
                backend: {
                    loadPath: path.join(__dirname, '../locales/{{lng}}.json'), // Path to translation files
                },
                lng: 'vi', // Set default language
                fallbackLng: 'vi', // Define a fallback language
                preload: ['vi', 'en'], // Preload both English and Vietnamese translations
            },
            (err, t) => {
                if (err) {
                    console.error('i18next initialization error:', err);
                } else {
                    console.log('i18next initialized successfully!');
                    app.use(i18nextMiddleware.handle(i18next)); // Register i18next middleware
                }
            },
        );

    app.use(i18nextMiddleware.handle(i18next)); // Register i18next middleware

    // Middleware to set language based on request headers
    app.use((req, res, next) => {
        const lang = req.headers['lang'];
        if (lang && i18next.options.preload.includes(lang)) {
            console.log(`Changing language to ${lang}`);
            req.i18n.changeLanguage(lang, (err) => {
                if (err) {
                    console.error('Error changing language:', err);
                }
                next();
            });
        } else {
            next();
        }
    });

    // Using route handlers (optional)
    app.get('/en', (req, res) => {
        i18next.changeLanguage('en'); // Set language for '/en' route
        res.send('Hello (English)');
    });

    app.get('/vi', (req, res) => {
        i18next.changeLanguage('vi'); // Set language for '/vi' route
        res.send('Xin chào (Vietnamese)');
    });
};

module.exports = configureI18n;
