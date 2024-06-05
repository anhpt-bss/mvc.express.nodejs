require('dotenv').config();

const constants = {
    PORT: process.env.PORT || 3000,
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/mydatabase',
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY || 'token_secret_key',
    UPLOADS_BASE_PATH: process.env.UPLOADS_BASE_PATH || 'uploads'
};

module.exports = constants;
