const HttpResponse = require('@services/httpResponse');
const { helper } = require('@services/helper');
const { validationResult } = require('express-validator');
const Cart = require('@models/cart');
const Order = require('@models/order');
const User = require('@models/user');
const Product = require('@models/product');

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: API endpoints for managing orders
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       required:
 *         - items
 *         - payment_method
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               product:
 *                 type: string
 *                 description: The product ID
 *               quantity:
 *                 type: number
 *                 description: Quantity of the product
 *               price:
 *                 type: number
 *                 description: Price of the product
 *               discount:
 *                 type: number
 *                 description: Discount applied to the product
 *         owner:
 *           type: object
 *           properties:
 *             user:
 *               type: string
 *               description: The user ID
 *             name:
 *               type: string
 *               description: The name of the owner
 *             email:
 *               type: string
 *               description: The email of the owner
 *             phone_number:
 *               type: string
 *               description: The phone number of the owner
 *             address:
 *               type: string
 *               description: The address of the owner
 *         total_price:
 *           type: number
 *           description: Total price of the order
 *         payment_method:
 *           type: string
 *           enum: [cash, cards, bank_transfer]
 *           description: Payment method for the order
 *         payment_status:
 *           type: string
 *           enum: [unpaid, paid]
 *           description: Payment status of the order
 *         order_status:
 *           type: string
 *           enum: [awaiting_confirmation, processing, processed, waiting_for_pickup, picked_up, in_transit, delivered, returning, returned, cancelled]
 *           description: Order status
 *         created_time:
 *           type: string
 *           format: date-time
 *           description: The creation time of the order
 */

/**
 * @swagger
 * /api/order/get-list:
 *   get:
 *     summary: Get all orders
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: List of orders
 *       500:
 *         description: Internal server error.
 */
exports.getAllOrders = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, sort = 'created_time', order = 'desc' } = req.query;

        const orders = await Order.find()
            .sort({ [sort]: order === 'asc' ? 1 : -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate('items.product owner.user');

        const total = await Order.countDocuments();

        const response = {
            data_list: orders,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            sort,
            order,
        };

        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.success(res, response);
        } else {
            res.locals.response = HttpResponse.successResponse(response);
            return next();
        }
    } catch (error) {
        console.log('[---Log---][---getList---]: ', error);
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.internalServerError(res);
        } else {
            res.locals.response = HttpResponse.internalServerErrorResponse();
            return next();
        }
    }
};

/**
 * @swagger
 * /api/order/create:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       200:
 *         description: New order created successfully
 *       500:
 *         description: Internal server error.
 */
exports.createOrder = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return HttpResponse.badRequest(res, errors.array());
        }

        const order = new Order(req.body);
        await order.save();

        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.success(res, order);
        } else {
            res.locals.response = HttpResponse.successResponse(order);
            return next();
        }
    } catch (error) {
        console.log('[---Log---][---create---]: ', error);
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.internalServerError(res);
        } else {
            res.locals.response = HttpResponse.internalServerErrorResponse();
            return next();
        }
    }
};

/**
 * @swagger
 * /api/order/{id}:
 *   get:
 *     summary: Get an order by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The order ID
 *     responses:
 *       200:
 *         description: Order found
 *       500:
 *         description: Internal server error.
 */
exports.getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return HttpResponse.badRequest(res, [], 'Order not found');
        }

        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.success(res, order);
        } else {
            res.locals.response = HttpResponse.successResponse(order);
            return next();
        }
    } catch (error) {
        console.log('[---Log---][---getById---]: ', error);
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.internalServerError(res);
        } else {
            res.locals.response = HttpResponse.internalServerErrorResponse();
            return next();
        }
    }
};

/**
 * @swagger
 * /api/order/{id}:
 *   put:
 *     summary: Update an order by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       200:
 *         description: Order updated successfully
 *       500:
 *         description: Internal server error.
 */
exports.updateOrder = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const translatedErrors = errors.array().map((error) => ({
                ...error,
                msg: req.t(error.msg),
            }));

            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return HttpResponse.badRequest(res, translatedErrors, req.t('validation.errors'));
            } else {
                res.locals.response = HttpResponse.badRequestResponse(translatedErrors, req.t('validation.errors'));
                return next();
            }
        }

        // Fetch the existing order to determine current status and items
        const existingOrder = await Order.findById(req.params.id).populate('items.product');

        if (!existingOrder) {
            return HttpResponse.badRequest(res, [], req.t('validation.errors'));
        }

        // Adjust product quantities based on status change logic
        const adjustProductQuantities = async () => {
            const { order_status: newStatus } = req.body;
            const { order_status: currentStatus } = existingOrder;

            // Check if we are moving from a status that did not affect quantity to one that does
            const statusesThatDecreaseQuantity = [
                'processed',
                'waiting_for_pickup',
                'picked_up',
                'in_transit',
                'delivered',
                'returning',
            ];

            // If moving to a status that reduces inventory
            if (
                statusesThatDecreaseQuantity.includes(newStatus) &&
                !statusesThatDecreaseQuantity.includes(currentStatus)
            ) {
                for (const item of existingOrder.items) {
                    await Product.findByIdAndUpdate(item.product._id, {
                        $inc: { product_quantity: -item.quantity },
                    });
                }
            }

            // If changing to a status that restores inventory
            const statusesThatRestoreQuantity = ['returned', 'cancelled'];
            if (
                statusesThatRestoreQuantity.includes(newStatus) &&
                statusesThatDecreaseQuantity.includes(currentStatus)
            ) {
                for (const item of existingOrder.items) {
                    await Product.findByIdAndUpdate(item.product._id, {
                        $inc: { product_quantity: item.quantity },
                    });
                }
            }
        };

        // Execute quantity adjustments
        await adjustProductQuantities();

        // Prepare fields for updating the order
        const updateFields = {
            total_price: req.body.total_price,
            payment_method: req.body.payment_method,
            payment_status: req.body.payment_status,
            order_status: req.body.order_status,
        };

        // Update the order
        const order = await Order.findByIdAndUpdate(req.params.id, updateFields, { new: true });

        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.success(res, order);
        } else {
            res.locals.response = HttpResponse.successResponse(order);
            return next();
        }
    } catch (error) {
        console.log('[---Log---][---updateById---]: ', error);
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.internalServerError(res);
        } else {
            res.locals.response = HttpResponse.internalServerErrorResponse();
            return next();
        }
    }
};

/**
 * @swagger
 * /api/order/{id}:
 *   delete:
 *     summary: Delete an order by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The order ID
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *       500:
 *         description: Internal server error.
 */
exports.deleteOrder = async (req, res, next) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) {
            return HttpResponse.badRequest(res, [], 'Order not found');
        }

        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.success(res, { id: req.params.id });
        } else {
            res.locals.response = HttpResponse.successResponse({ id: req.params.id });
            return next();
        }
    } catch (error) {
        console.log('[---Log---][---deleteById---]: ', error);
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.internalServerError(res);
        } else {
            res.locals.response = HttpResponse.internalServerErrorResponse();
            return next();
        }
    }
};

// Api for client
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

/**
 * Get the count of orders grouped by each order status
 * @returns {Promise<Object>} An object with order_status values as keys and their counts as values
 */
exports.getOrderStatusCounts = async () => {
    try {
        const counts = await Order.aggregate([
            {
                $group: {
                    _id: '$order_status', // Group by order_status field
                    count: { $sum: 1 }, // Count the occurrences
                },
            },
            {
                $project: {
                    _id: 0, // Do not include the _id field in the result
                    order_status: '$_id', // Rename _id to order_status for readability
                    count: 1, // Include the count
                },
            },
        ]);

        // Convert the array into an object with each status as a key
        const result = {};
        counts.forEach((item) => {
            result[item.order_status] = item.count;
        });

        return result;
    } catch (error) {
        console.log('[---Log---][---getOrderStatusCounts---]: ', error);
        return null;
    }
};
