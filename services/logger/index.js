const fs = require('fs');
const path = require('path');

// Define the log directory path
const logDirectory = path.join(__dirname, '../..', 'logs'); // Move up one directory to place logs inside my-mvc-project/logs

// Define the log file path
const logFilePath = path.join(logDirectory, 'system.log');

// Function to read the log file
const readLogFile = (callback) => {
    fs.readFile(logFilePath, 'utf8', (err, data) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, data);
        }
    });
};

// Function to delete the log file
const deleteLogFile = (callback) => {
    fs.unlink(logFilePath, (err) => {
        if (err) {
            callback(err);
        } else {
            callback(null);
        }
    });
};

module.exports = { readLogFile, deleteLogFile };
