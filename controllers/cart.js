const Cart = require('@models/cart');
const Product = require('@models/product');
const HttpResponse = require('@services/httpResponse');

exports.addToCart = async (req, res, next) => {
    try {
        const { product_id, quantity = 1 } = req.body;

        const cart = await Cart.findOne({
            product: product_id,
            user: req.user._id,
        });

        if (cart) {
            cart.quantity += quantity;
            await cart.save();
        } else {
            await Cart.create({
                product: product_id,
                quantity,
                user: req.user._id,
            });
        }

        // Calculate the total quantity of all items in the cart
        const totalQuantity = await Cart.aggregate([
            { $match: { user: req.user._id } },
            { $group: { _id: null, total: { $sum: '$quantity' } } },
        ]);

        const totalItemsInCart = totalQuantity.length > 0 ? totalQuantity[0].total : 0;

        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.success(res, { total: totalItemsInCart });
        } else {
            res.locals.response = HttpResponse.successResponse({
                total: totalItemsInCart,
            });
            return next();
        }
    } catch (error) {
        console.log('[---Log---][---addToCart---]: ', error);
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.internalServerError(res);
        } else {
            res.locals.response = HttpResponse.internalServerErrorResponse();
            return next();
        }
    }
};

exports.addQuantity = async (req, res, next) => {
    try {
        const cart = await Cart.findById(req.params.id);

        if (!cart) {
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return HttpResponse.badRequest(res, [], req.t('cart.cart_not_found'));
            } else {
                res.locals.response = HttpResponse.badRequestResponse([], req.t('cart.cart_not_found'));
                return next();
            }
        }

        cart.quantity += 1;
        await cart.save();

        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.success(res, { id: req.params.id });
        } else {
            res.locals.response = HttpResponse.successResponse({
                id: req.params.id,
            });
            return next();
        }
    } catch (error) {
        console.log('[---Log---][---addQuantity---]: ', error);
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.internalServerError(res);
        } else {
            res.locals.response = HttpResponse.internalServerErrorResponse();
            return next();
        }
    }
};

exports.minusQuantity = async (req, res, next) => {
    try {
        const cart = await Cart.findById(req.params.id);

        if (!cart) {
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return HttpResponse.badRequest(res, [], req.t('cart.cart_not_found'));
            } else {
                res.locals.response = HttpResponse.badRequestResponse([], req.t('cart.cart_not_found'));
                return next();
            }
        }

        if (cart.quantity <= 1) {
            await Cart.deleteOne({ _id: req.params.id });
        } else {
            cart.quantity -= 1;
            await cart.save();
        }

        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.success(res, { id: req.params.id });
        } else {
            res.locals.response = HttpResponse.successResponse({
                id: req.params.id,
            });
            return next();
        }
    } catch (error) {
        console.log('[---Log---][---minusQuantity---]: ', error);
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.internalServerError(res);
        } else {
            res.locals.response = HttpResponse.internalServerErrorResponse();
            return next();
        }
    }
};

exports.removeFromCart = async (req, res, next) => {
    try {
        const cart = await Cart.findById(req.params.id);

        if (!cart) {
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return HttpResponse.badRequest(res, [], req.t('cart.cart_not_found'));
            } else {
                res.locals.response = HttpResponse.badRequestResponse([], req.t('cart.cart_not_found'));
                return next();
            }
        }

        await Cart.deleteOne({ _id: req.params.id });

        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.success(res, { id: req.params.id });
        } else {
            res.locals.response = HttpResponse.successResponse({
                id: req.params.id,
            });
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
