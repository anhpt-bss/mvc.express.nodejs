const HttpResponse = require('@services/httpResponse');
const { helper } = require('@services/helper');
const Cart = require('@models/cart');
const Order = require('@models/order');
const User = require('@models/user');

exports.placeOrder = async (req, res, next) => {
    try {
        const carts = await Cart.find({ user: req.user._id }).populate('product');

        if (!carts) {
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return HttpResponse.badRequest(res, [], req.t('cart.cart_not_found'));
            } else {
                res.locals.response = HttpResponse.badRequestResponse([], req.t('cart.cart_not_found'));
                return next();
            }
        }

        const { name, email, phone_number, address, note, payment_method } = req.body;

        console.log(req.body);

        // Save user info
        const user = await User.findById(req.user._id);

        user.phone_number = phone_number ? phone_number : user.phone_number;
        user.address = address ? address : user.address;

        await user.save();

        // Save order
        const totalPrice = carts.reduce(
            (sum, item) =>
                sum + helper.calcPrice(item.product.product_price, item.product.product_discount) * item.quantity,
            0,
        );

        const order = await Order.create({
            items: carts.map((item) => ({
                product: item.product._id,
                quantity: item.quantity,
                price: item.product.product_price,
                discount: item.product.product_discount,
            })),
            owner: {
                user: req.user._id,
                name: name || req.user.name,
                email: email || req.user.email,
                phone_number,
                address,
            },
            payment_method,
            total_price: totalPrice,
            note,
        });

        await Cart.deleteMany({ user: req.user._id });

        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.success(res, order);
        } else {
            res.locals.response = HttpResponse.successResponse(order);
            return next();
        }
    } catch (error) {
        console.log('[---Log---][---removeFromCart---]: ', error);
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.internalServerError(res);
        } else {
            res.locals.response = HttpResponse.internalServerErrorResponse();
            return next();
        }
    }
};
