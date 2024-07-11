require('module-alias/register');
require('express-async-errors');
const path = require('path');
const constants = require('@config/constants');
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const connectDB = require('./config/database');
const apiRouter = require('./routes/api');
const adminRouter = require('./routes/admin');
const clientRouter = require('./routes/client');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('@config/logger');
const compression = require('compression');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const swaggerSetup = require('@config/swagger');
const configureI18n = require('./config/i18n');
const notificationMiddleware = require('@middleware/notification');

// MongoDB
connectDB();

// Configure i18n with the app instance
configureI18n(app);

// EJS
app.set('view engine', 'ejs');

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(cookieParser());

// Static files
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Resource static files
app.use(
    `/${constants.UPLOADS_BASE_PATH}`,
    express.static(path.join(__dirname, constants.UPLOADS_BASE_PATH)),
);

// Rate limiter
const rateLimiter = new RateLimiterMemory({
    points: 10, // 10 requests
    duration: 1, // per 1 second by IP
});

app.use((req, res, next) => {
    rateLimiter
        .consume(req.ip)
        .then(() => {
            next();
        })
        .catch(() => {
            res.status(429).send('Too Many Requests');
        });
});

// Notification middleware
app.use(notificationMiddleware);

// Routes
app.use('/api', apiRouter);
app.use('/admin', adminRouter);
app.use('/', clientRouter);

// Swagger
swaggerSetup(app);

// Middleware
app.use((error, req, res, next) => {
    
    logger.error(`[${new Date()}][---App---]: ${error.message || 'Something Broke...'}`);

    if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return HttpResponse.internalServerError(res);
    } else {
        res.locals.response = HttpResponse.internalServerErrorResponse();
        return next();
    }
});

app.listen(constants.PORT, () => {
    console.log(
        '[---Log---][---App---]: ',
        `Server is running on port ${constants.PORT}`,
    );
});
