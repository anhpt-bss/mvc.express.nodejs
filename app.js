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
const { upload } = require('@config/multer');
const HttpResponse = require('@services/httpResponse');
const Category = require('@models/category');

// MongoDB
connectDB();

// Configure i18n with the app instance
configureI18n(app);

// EJS
app.set('view engine', 'ejs');

// Middleware
const cspDirectives = {
    frameSrc: ['\'self\'', 'https://www.google.com'], // Allow framing of Google
    imgSrc: ['\'self\'', 'data:', '*'],
};
app.use(
    helmet.contentSecurityPolicy({
        directives: cspDirectives,
    }),
);
app.use(morgan('dev'));
app.use(cors());
app.use(compression());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

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

// Middleware set app locals value
async function getCategoryTree() {
    try {
        const categories = await Category.aggregate([
            {
                $graphLookup: {
                    from: 'categories',
                    startWith: '$_id',
                    connectFromField: '_id',
                    connectToField: 'parent_cate',
                    as: 'sub_category',
                },
            },
            {
                $match: { parent_cate: null },
            },
            {
                $sort: { position: 1 },
            },
        ]);

        // Hàm đệ quy để sắp xếp các subcategories
        const sortSubCategories = (category) => {
            if (category.sub_category && Array.isArray(category.sub_category)) {
                category.sub_category.sort((a, b) => a.position - b.position);
                category.sub_category.forEach(sortSubCategories);
            }
        };

        categories.forEach(sortSubCategories);

        return categories;
    } catch (error) {
        console.error('Error building category tree:', error);
        throw error;
    }
}

app.use(async (req, res, next) => {
    try {
        const allCategories = await Category.find().sort({ position: 1 });

        const categoryMap = new Map();
        allCategories.forEach((category) => {
            categoryMap.set(category._id.toString(), {
                ...category.toObject(),
                sub_category: [],
            });
        });

        const rootCategories = [];
        allCategories.forEach((category) => {
            if (category.parent_cate) {
                const parent = categoryMap.get(category.parent_cate.toString());
                if (parent) {
                    parent.sub_category.push(
                        categoryMap.get(category._id.toString()),
                    );
                }
            } else {
                rootCategories.push(categoryMap.get(category._id.toString()));
            }
        });

        res.locals.app_categories = rootCategories;
        res.locals.server_url = constants.SERVER_URL;
        next();
    } catch (err) {
        console.error(err);
        next(err);
    }
});

// Use multer middleware for handling file uploads
app.use(upload());

// Routes
app.use('/api', apiRouter);
app.use('/admin', adminRouter);
app.use('/', clientRouter);

// Swagger
swaggerSetup(app);

// Error handling middleware
app.use((error, req, res, next) => {
    console.log('[---Log---][---App---]: ', error);
    logger.error(
        `[${new Date()}][---App---]: ${error.message || 'Something Broke...'}`,
    );

    if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return HttpResponse.internalServerError(res, [], error.message);
    } else {
        res.locals.response = HttpResponse.internalServerErrorResponse(
            [],
            error.message,
        );
        return next();
    }
});

app.listen(constants.PORT, () => {
    console.log(
        '[---Log---][---App---]: ',
        `Server is running on port ${constants.PORT}`,
    );
});
