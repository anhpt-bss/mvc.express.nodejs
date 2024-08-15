const Cart = require('@models/cart');
const Order = require('@models/order');

exports.getCheckout = async (req, res) => {
    const carts = await Cart.find({ user: req.user._id }).populate('product');
    const total = carts.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    res.render('checkout', { carts, total });
};

exports.placeOrder = async (req, res) => {
    const carts = await Cart.find({ user: req.user._id }).populate('product');
    const total = carts.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    const order = await Order.create({
        items: carts.map(item => ({
            product: item.product._id,
            quantity: item.quantity
        })),
        user: req.user._id,
        total
    });

    await Cart.deleteMany({ user: req.user._id });

    res.redirect('/orders');
};
