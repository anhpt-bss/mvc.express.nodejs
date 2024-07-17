const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');

mongoose.plugin(slug);

const productSchema = new mongoose.Schema({
    product_code: {
        type: String,
        required: true,
    },
    product_name: {
        type: String,
        required: true,
    },
    product_summary: {
        type: String,
        required: true,
    },
    product_price: {
        type: Number,
        required: false,
    },
    product_discount: {
        type: Number,
        required: false,
    },
    product_quantity: {
        type: Number,
        required: false,
    },
    shipping_fee: {
        type: Number,
        required: false,
    },
    product_gallery: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resource',
        required: true,
    }],
    product_specifications: {
        type: String,
        required: false,
    },
    product_description: {
        type: String,
        required: false,
    },
    manufacturer: {
        type: String,
        required: false,
    },
    slug: {
        type: String,
        unique: true,
        slug: 'product_name',
    },
    banner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resource',
        required: false,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
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

module.exports = mongoose.model('Product', productSchema);
