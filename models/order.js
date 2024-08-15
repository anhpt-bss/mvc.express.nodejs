const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    items: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            quantity: Number
        }
    ],
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    total: Number,
    status: { type: String, default: 'Pending' },
    created_time: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
