const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    items: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            quantity: Number,
            price: Number,
            discount: Number,
        }
    ],
    owner: {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: String,
        email: String,
        phone_number: String,
        address: String,
    },
    total_price: Number,
    payment_method: {
        type: String,
        enum: [
            'cash',
            'cards',
            'bank_transfer'
        ],
        required: true,
        default: 'cash'
    },
    payment_status: {
        type: String,
        enum: [
            'unpaid',
            'paid',
        ],
        default: 'unpaid'
    },
    order_status: {
        type: String,
        enum: [
            'awaiting_confirmation',
            'processing',
            'processed',
            'waiting_for_pickup',
            'picked_up',
            'in_transit',
            'delivered',
            'returning',
            'returned',
            'cancelled'
        ],
        default: 'awaiting_confirmation'
    },
    created_time: { type: Date, default: Date.now }
});

const status = [
    {
        label: 'Chờ xác nhận',
        value: 'awaiting_confirmation'
    },
    {
        label: 'Đang xử lý',
        value: 'processing'
    },
    {
        label: 'Đã xử lý',
        value: 'processed'
    },
    {
        label: 'Chờ lấy hàng',
        value: 'waiting_for_pickup'
    },
    {
        label: 'Đã lấy hàng',
        value: 'picked_up'
    },
    {
        label: 'Đang giao hàng',
        value: 'in_transit'
    },
    {
        label: 'Đã giao hàng',
        value: 'delivered'
    },
    {
        label: 'Đang trả hàng',
        value: 'returning'
    },
    {
        label: 'Đã trả hàng',
        value: 'returned'
    },
    {
        label: 'Đã hủy',
        value: 'cancelled'
    },
];

module.exports = mongoose.model('Order', orderSchema);
