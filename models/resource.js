const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true,
    },
    size: {
        type: Number,
        required: true,
    },
    mimetype: {
        type: String,
        required: true,
    },
    path: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: false,
        default: 'Hệ Thống'
    }
});

module.exports = mongoose.model('Resource', resourceSchema);
