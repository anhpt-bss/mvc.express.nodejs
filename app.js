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
const logger = require('./config/logger');
const compression = require('compression');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const swaggerSetup = require('@config/swagger');

// MongoDB
connectDB();

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

// Static files
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Resource static files
app.use(`/${constants.UPLOADS_BASE_PATH}`, express.static(path.join(__dirname, constants.UPLOADS_BASE_PATH)));

// Routes
app.use('/api', apiRouter);
app.use('/admin', adminRouter);
app.use('/', clientRouter);

// Swagger
swaggerSetup(app);

// Middleware
app.use((err, req, res, next) => {
    logger.error(err.message);
    res.status(500).send('Something broke!');
});

app.listen(constants.PORT, () => {
    console.log(`Server is running on port ${constants.PORT}`);
});
