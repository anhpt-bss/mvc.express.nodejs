const path = require('path');
const winston = require('winston');

// Define the log directory path
const logDirectory = path.join(__dirname, '..', 'logs'); // Move up one directory to place logs inside my-mvc-project/logs

// Ensure the log directory exists
require('fs').mkdirSync(logDirectory, { recursive: true });

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        // Log errors to error.log file inside the logs directory
        new winston.transports.File({ filename: path.join(logDirectory, 'error.log'), level: 'error' }),
        // Log all messages to combined.log file inside the logs directory
        new winston.transports.File({ filename: path.join(logDirectory, 'combined.log') }),
    ],
});

// Add Console transport for non-production environments
if (process.env.NODE_ENV !== 'production') {
    logger.add(
        new winston.transports.Console({
            format: winston.format.simple(),
        }),
    );
}

module.exports = logger;
