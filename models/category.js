const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');

mongoose.plugin(slug);

const categorySchema = new mongoose.Schema({
    position: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        unique: true,
        slug: 'name',
    },
    description: {
        type: String,
        required: false,
    },
    parent_cate: {
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
categorySchema.index({
    name: 'text',
    description: 'text'
});

module.exports = mongoose.model('Category', categorySchema);
