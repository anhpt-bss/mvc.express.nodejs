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
        default: 'Hệ Thống',
    },
    created_by: {
        type: String,
        default: 'Admin',
    },
    created_time: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Resource', resourceSchema);
