const express = require('express');

const router = express.Router();

const { pushNotification, helper } = require('@services/helper');

const { checkClientToken, checkClientTokenForLogin, checkClientTokenForAccess } = require('@middleware/auth');
const { loginValidationRules, createUserValidationRules, updateUserValidationRules } = require('@middleware/validator');

const authController = require('@controllers/auth');
const userController = require('@controllers/user');
const cartController = require('@controllers/cart');
const orderController = require('@controllers/order');

const Category = require('@models/category');
const Blog = require('@models/blog');
const Product = require('@models/product');
const Cart = require('@models/cart');
const Order = require('@models/order');
const User = require('@models/user');

// Signin
router.get('/signin', checkClientTokenForLogin, async (req, res) => {
    const response = {};

    res.render('client/signin', { response }, (error, html) => {
        if (error) {
            console.log('[---Log---][---client/signin---]: ', error);
            return res.status(500).send(error.message);
        }

        // Pass the rendered content to the layout
        res.render('client/layout', {
            body: html,
            title: 'Đăng Nhập',
            currentUser: req.user,
        });
    });
});

router.post('/signin', loginValidationRules(), authController.login, (req, res) => {
    const controllerResponse = res.locals.response;

    if (controllerResponse.error) {
        // Push notification
        pushNotification(res, 'error', controllerResponse);

        return res.redirect('/signin');
    } else {
        // Push notification
        pushNotification(res, 'success', controllerResponse);

        return res.redirect('/');
    }
});

// Signup
router.get('/signup', checkClientTokenForLogin, async (req, res) => {
    const response = {};

    res.render('client/signup', { response }, (error, html) => {
        if (error) {
            console.log('[---Log---][---client/signup---]: ', error);
            return res.status(500).send(error.message);
        }

        // Pass the rendered content to the layout
        res.render('client/layout', {
            body: html,
            title: 'Đăng Ký',
            currentUser: req.user,
        });
    });
});

router.post('/signup', createUserValidationRules(), userController.createUser, (req, res) => {
    const controllerResponse = res.locals.response;

    if (controllerResponse.error) {
        // Push notification
        pushNotification(res, 'error', controllerResponse);

        return res.redirect('/signup');
    } else {
        // Push notification
        pushNotification(res, 'success', controllerResponse);

        return res.redirect('/signin');
    }
});

// Verify token
router.use(checkClientToken);

// Cart & Checkout
router.get('/cart', checkClientTokenForAccess, async (req, res) => {
    const cart = await Cart.aggregate([
        { $match: { user: req.user._id } },
        { $sort: { created_time: -1 } },
        {
            // populate product
            $lookup: {
                from: 'products',
                localField: 'product',
                foreignField: '_id',
                as: 'product',
            },
        },
        { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
        {
            // populate created by
            $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'user',
            },
        },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        {
            // populate product_gallery
            $lookup: {
                from: 'resources',
                localField: 'product.product_gallery',
                foreignField: '_id',
                as: 'product.product_gallery',
            },
        },
    ]);

    const totalProduct = cart.length;
    const totalQuantity = res.locals.total_items_in_cart;
    const totalPrice = cart.reduce(
        (sum, item) =>
            sum + helper.calcPrice(item.product.product_price, item.product.product_discount) * item.quantity,
        0,
    );

    const response = {
        helper,
        cart,
        currentUser: req.user,
        totalProduct,
        totalQuantity,
        totalPrice,
    };

    res.render('client/cart', { response }, (error, html) => {
        if (error) {
            console.log('[---Log---][---client/cart---]: ', error);
            return res.status(500).send(error.message);
        }

        // Pass the rendered content to the layout
        res.render('client/layout', {
            body: html,
            title: 'Giỏ Hàng',
            currentUser: req.user,
        });
    });
});

router.get('/cart/add/:id', cartController.addQuantity, (req, res) => {
    const controllerResponse = res.locals.response;

    if (controllerResponse.error) {
        // Push notification
        pushNotification(res, 'error', controllerResponse);

        return res.redirect('/cart');
    } else {
        // Push notification
        pushNotification(res, 'success', controllerResponse);

        return res.redirect('/cart');
    }
});

router.get('/cart/minus/:id', cartController.minusQuantity, (req, res) => {
    const controllerResponse = res.locals.response;

    if (controllerResponse.error) {
        // Push notification
        pushNotification(res, 'error', controllerResponse);

        return res.redirect('/cart');
    } else {
        // Push notification
        pushNotification(res, 'success', controllerResponse);

        return res.redirect('/cart');
    }
});

router.get('/cart/delete/:id', cartController.removeFromCart, (req, res) => {
    const controllerResponse = res.locals.response;

    if (controllerResponse.error) {
        // Push notification
        pushNotification(res, 'error', controllerResponse);

        return res.redirect('/cart');
    } else {
        // Push notification
        pushNotification(res, 'success', controllerResponse);

        return res.redirect('/cart');
    }
});

router.post('/checkout', orderController.placeOrder, (req, res) => {
    const controllerResponse = res.locals.response;

    if (controllerResponse.error) {
        // Push notification
        pushNotification(res, 'error', controllerResponse);

        return res.redirect('/cart');
    } else {
        // Push notification
        pushNotification(res, 'success', controllerResponse);

        return res.redirect('/account/purchase');
    }
});

router.get('/account/:page', checkClientTokenForAccess, async (req, res) => {
    const { page } = req.params;

    let response = {
        title: '',
        currentUser: req.user,
    };

    switch (page) {
        case 'profile':
            const user = await User.findById(req.user._id).populate('avatar');

            response.currentUser = user;
            response.title = 'Hồ Sơ';
            break;

        case 'purchase':
            const orders = await Order.aggregate([
                {
                    $match: { 'owner.user': req.user._id },
                },
                {
                    $unwind: '$items',
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'items.product',
                        foreignField: '_id',
                        as: 'items.product',
                    },
                },
                {
                    $unwind: '$items.product',
                },
                {
                    $lookup: {
                        from: 'resources',
                        localField: 'items.product.product_gallery',
                        foreignField: '_id',
                        as: 'items.product.product_gallery',
                    },
                },
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'items.product.category',
                        foreignField: '_id',
                        as: 'items.product.category',
                    },
                },
                {
                    $unwind: '$items.product.category',
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'owner.user',
                        foreignField: '_id',
                        as: 'owner.user',
                    },
                },
                {
                    $unwind: '$owner.user',
                },
                {
                    $group: {
                        _id: '$_id',
                        items: { $push: '$items' },
                        owner: { $first: '$owner' },
                        total_price: { $first: '$total_price' },
                        payment_method: { $first: '$payment_method' },
                        payment_status: { $first: '$payment_status' },
                        order_status: { $first: '$order_status' },
                        created_time: { $first: '$created_time' },
                    },
                },
                {
                    $sort: { created_time: -1 },
                },
            ]);

            response.orders = orders;
            response.helper = helper;
            response.title = 'Đơn Mua';
            break;

        default:
            break;
    }

    res.render('client/account', { page, response }, (error, html) => {
        if (error) {
            console.log('[---Log---][---client/account---]: ', error);
            return res.status(500).send(error.message);
        }

        // Pass the rendered content to the layout
        res.render('client/layout', {
            body: html,
            title: response.title,
            currentUser: req.user,
        });
    });
});

// User and Authentication
router.get('/logout', authController.logout, (req, res) => {
    const controllerResponse = res.locals.response;

    if (controllerResponse.error) {
        // Push notification
        pushNotification(res, 'error', controllerResponse);

        return res.redirect('/');
    } else {
        // Push notification
        pushNotification(res, 'success', controllerResponse);

        return res.redirect('/signin');
    }
});

router.post('/account/profile', updateUserValidationRules(), userController.updateUser, (req, res) => {
    const controllerResponse = res.locals.response;

    if (controllerResponse.error) {
        // Push notification
        pushNotification(res, 'error', controllerResponse);

        return res.redirect('/account/profile');
    } else {
        // Push notification
        pushNotification(res, 'success', controllerResponse);

        return res.redirect('/account/profile');
    }
});

// Home
router.get('/', async (req, res) => {
    const products = await Product.find()
        .sort({ created_time: -1 })
        .skip(0)
        .limit(8)
        .populate('product_gallery')
        .populate('category');

    const blogs = await Blog.find().sort({ created_time: -1 }).skip(0).limit(6).populate('category').populate('banner');

    const response = { helper, products, blogs };

    res.render('client', { response }, (error, html) => {
        if (error) {
            console.log('[---Log---][---client/---]: ', error);
            return res.status(500).send(error.message);
        }

        // Pass the rendered content to the layout
        res.render('client/layout', {
            body: html,
            title: 'Trang Chủ',
            currentUser: req.user,
        });
    });
});

// About
router.get('/about', async (req, res) => {
    const response = {};

    res.render('client/about', { response }, (error, html) => {
        if (error) {
            console.log('[---Log---][---client/about---]: ', error);
            return res.status(500).send(error.message);
        }

        // Pass the rendered content to the layout
        res.render('client/layout', {
            body: html,
            title: 'Giới Thiệu',
            currentUser: req.user,
        });
    });
});

// Contact
router.get('/contact', async (req, res) => {
    const response = {};

    res.render('client/contact', { title: 'Liên Hệ', response }, (error, html) => {
        if (error) {
            console.log('[---Log---][---client/contact---]: ', error);
            return res.status(500).send(error.message);
        }

        // Pass the rendered content to the layout
        res.render('client/layout', {
            body: html,
            title: 'Liên Hệ',
            currentUser: req.user,
        });
    });
});

// Category
router.get('/:slug', async (req, res) => {
    const { slug } = req.params;
    const rootCategories = res.locals.app_categories;

    const category = await Category.findOne({ slug });

    if (!category) {
        return res.status(404).send('Category not found');
    }

    const findCategoryInRoot = async (categoryRootItem) => {
        if (categoryRootItem._id.toString() === category._id.toString()) {
            return categoryRootItem;
        }

        if (Array.isArray(categoryRootItem.sub_category)) {
            for (const subCategory of categoryRootItem.sub_category) {
                const foundCategory = await findCategoryInRoot(subCategory);
                if (foundCategory) {
                    return foundCategory;
                }
            }
        }

        return null;
    };

    let parentCategory = null;
    for (const rootCategory of rootCategories) {
        parentCategory = await findCategoryInRoot(rootCategory);
        if (parentCategory) {
            break;
        }
    }

    let blogs = [];
    let products = [];

    const findBlogsBySubCategories = async (categoryItem) => {
        const blogFound = await Blog.find({ category: categoryItem._id }).populate('category').populate('banner');

        blogs = [...blogs, ...blogFound];

        if (Array.isArray(categoryItem.sub_category)) {
            for (const subCategory of categoryItem.sub_category) {
                await findBlogsBySubCategories(subCategory);
            }
        }
    };

    const findProductsBySubCategories = async (categoryItem) => {
        const productFound = await Product.find({ category: categoryItem._id })
            .populate('product_gallery')
            .populate('category');

        products = [...products, ...productFound];

        if (Array.isArray(categoryItem.sub_category)) {
            for (const subCategory of categoryItem.sub_category) {
                await findProductsBySubCategories(subCategory);
            }
        }
    };

    if (parentCategory) {
        await findProductsBySubCategories(parentCategory);
        await findBlogsBySubCategories(parentCategory);
    }

    const response = { helper, category, blogs, products };

    res.render('client/category', { response }, (error, html) => {
        if (error) {
            console.error('[---Log---][---client/category---]: ', error);
            return res.status(500).send(error.message);
        }

        res.render('client/layout', {
            body: html,
            title: 'Liên Hệ',
            currentUser: req.user,
        });
    });
});

// Product detail
router.get('/product/:slug', async (req, res) => {
    const { slug } = req.params;

    const product = await Product.findOne({ slug }).populate('product_gallery').populate('category');

    if (!product) {
        return res.status(404).send('Product not found');
    }

    const response = { helper, product };

    res.render('client/product', { response }, (error, html) => {
        if (error) {
            console.log('[---Log---][---client/product---]: ', error);
            return res.status(500).send(error.message);
        }

        // Pass the rendered content to the layout
        res.render('client/layout', {
            body: html,
            title: product.product_name,
            currentUser: req.user,
        });
    });
});

// Blog detail
router.get('/blog/:slug', async (req, res) => {
    const { slug } = req.params;

    const blog = await Blog.findOne({ slug }).populate('category').populate('banner');

    if (!blog) {
        return res.status(404).send('Blog not found');
    }

    const response = { blog };

    res.render('client/blog', { response }, (error, html) => {
        if (error) {
            console.log('[---Log---][---client/blog---]: ', error);
            return res.status(500).send(error.message);
        }

        // Pass the rendered content to the layout
        res.render('client/layout', {
            body: html,
            title: 'Chi Tiết Blog',
            currentUser: req.user,
        });
    });
});

module.exports = router;
