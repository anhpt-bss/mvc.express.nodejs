const mongoose = require('mongoose');
const { paymentMethod, paymentStatus, orderStatus } = require('@models/enum');

const orderSchema = new mongoose.Schema({
    items: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            quantity: Number,
            price: Number,
            discount: Number,
        },
    ],
    owner: {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: String,
        email: String,
        phone_number: String,
        address: String,
    },
    total_price: {
        type: Number,
        default: 0,
    },
    payment_method: {
        type: String,
        enum: paymentMethod.map((item) => item.value),
        default: 'cash',
    },
    payment_status: {
        type: String,
        enum: paymentStatus.map((item) => item.value),
        default: 'unpaid',
    },
    order_status: {
        type: String,
        enum: orderStatus.map((item) => item.value),
        default: 'awaiting_confirmation',
    },
    created_time: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);
