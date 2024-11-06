const paymentMethod = [
    {
        label: 'Tiền mặt',
        value: 'cash',
        color: '#FFA500', // Orange
    },
    {
        label: 'Thẻ ngân hàng/Thẻ tín dụng',
        value: 'cards',
        color: '#1E90FF', // Dodger Blue
    },
    {
        label: 'Chuyển Khoản ngân hàng',
        value: 'bank_transfer',
        color: '#008000', // Green
    },
];

const paymentStatus = [
    {
        label: 'Đã thanh toán',
        value: 'paid',
        color: '#4CAF50', // Green
    },
    {
        label: 'Chưa thanh toán',
        value: 'unpaid',
        color: '#FF4500', // Orange Red
    },
];

const orderStatus = [
    {
        label: 'Chờ xác nhận',
        value: 'awaiting_confirmation',
        color: '#FFA500', // Orange
    },
    {
        label: 'Đang xử lý',
        value: 'processing',
        color: '#FFD700', // Gold
    },
    {
        label: 'Đã xử lý',
        value: 'processed',
        color: '#008000', // Green
    },
    {
        label: 'Chờ lấy hàng',
        value: 'waiting_for_pickup',
        color: '#87CEEB', // Light Blue
    },
    {
        label: 'Đã lấy hàng',
        value: 'picked_up',
        color: '#1E90FF', // Dodger Blue
    },
    {
        label: 'Đang giao hàng',
        value: 'in_transit',
        color: '#0000FF', // Blue
    },
    {
        label: 'Đã giao hàng',
        value: 'delivered',
        color: '#4CAF50', // Green
    },
    {
        label: 'Đang hoàn trả',
        value: 'returning',
        color: '#FF4500', // Orange Red
    },
    {
        label: 'Đã hoàn trả',
        value: 'returned',
        color: '#8B0000', // Dark Red
    },
    {
        label: 'Đã hủy',
        value: 'cancelled',
        color: '#808080', // Gray
    },
];

const gender = [
    { label: 'Nam', value: 'male' },
    { label: 'Nữ', value: 'female' },
    { label: 'Khác', value: 'other' },
];

module.exports = { paymentMethod, paymentStatus, orderStatus, gender };
