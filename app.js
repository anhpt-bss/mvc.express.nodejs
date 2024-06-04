const express = require('express');
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
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('./config/dotenv');
require('express-async-errors');

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
app.use(express.static('public'));

// Routes
app.use('/api', apiRouter);
app.use('/admin', adminRouter);
app.use('/', clientRouter);

// Swagger
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'API Documentation',
            version: '1.0.0',
        },
    },
    apis: ['controllers/*.js'], // Đường dẫn tới các file route
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Middleware
app.use((err, req, res, next) => {
    logger.error(err.message);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
