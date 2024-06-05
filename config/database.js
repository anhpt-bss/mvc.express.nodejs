const mongoose = require('mongoose');
const constants = require('@config/constants');

const connectDB = async () => {
    try {
        await mongoose.connect(constants.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully!');
    } catch (err) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;
