const mongoose = require('mongoose');
const constants = require('@config/constants');

const connectDB = async () => {
    try {
        await mongoose.connect(constants.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('[---Log---][---App---]: ', 'MongoDB connected successfully');
    } catch (error) {
        console.log('[---Log---][---connectDB---]: ', error);
        process.exit(1);
    }
};

module.exports = connectDB;
