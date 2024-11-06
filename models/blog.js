const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');

mongoose.plugin(slug);

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    summary: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        unique: true,
        slug: 'title',
    },
    banner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resource',
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: false,
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

// Index for global search
blogSchema.index({
    title: 'text',
    summary: 'text',
});

module.exports = mongoose.model('Blog', blogSchema);
