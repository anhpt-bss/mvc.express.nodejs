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
        // Log inside the logs directory
        new winston.transports.File({
            filename: path.join(logDirectory, 'system.log'),
            level: 'error',
        }),
        new winston.transports.File({
            filename: path.join(logDirectory, 'system.log'),
            level: 'info',
        }),
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

// Example
// Logging an informational message
// logger.info('This is an informational message');
// Logging an error message
// logger.error('This is an error message');
// Logging a warning message
// logger.warn('This is a warning message');
// Logging a debug message
// logger.debug('This is a debug message');
