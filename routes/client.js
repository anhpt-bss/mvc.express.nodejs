const express = require('express');

const router = express.Router();

const HttpResponse = require('@services/httpResponse');
const { pushNotification } = require('@services/helper');

const {
    checkClientToken,
    checkClientTokenForLogin,
    checkClientTokenForAccess
} = require('@middleware/auth');
const {
    loginValidationRules,
    userValidationRules,
} = require('@middleware/validator');

const authController = require('@controllers/auth');
const userController = require('@controllers/user');
const cartController = require('@controllers/cart');

const Category = require('@models/category');
const Blog = require('@models/blog');
const Product = require('@models/product');
const Cart = require('@models/cart');

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

router.post(
    '/signin',
    loginValidationRules(),
    authController.login,
    (req, res) => {
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
    },
);

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

router.post(
    '/signup',
    userValidationRules(),
    userController.createUser,
    (req, res) => {
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
    },
);

// Verify token
router.use(checkClientToken);

// Cart & Checkout
router.get('/cart', checkClientTokenForAccess, async (req, res) => {
    const cart = await Cart.aggregate([
        { $match: { user: req.user._id } },
        { $sort: { 'created_time': -1 } },
        {
            // populate product
            $lookup:
            {
                from: 'products',
                localField: 'product',
                foreignField: '_id',
                as: 'product'
            }
        },
        { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
        {
            // populate created by
            $lookup:
            {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'user'
            }
        },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        {
            // populate product_gallery
            $lookup:
            {
                from: 'resources',
                localField: 'product.product_gallery',
                foreignField: '_id',
                as: 'product.product_gallery'
            }
        },
    ]);
    
    const response = { cart };
    
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

// Logout client
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

// Home
router.get('/', async (req, res) => {
    const products = await Product.find()
        .sort({ created_time: 1 })
        .skip(0)
        .limit(6)
        .populate('product_gallery')
        .populate('category');

    const blogs = await Blog.find()
        .sort({ created_time: 1 })
        .skip(0)
        .limit(6)
        .populate('category')
        .populate('banner');

    const response = { products, blogs };

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

    res.render(
        'client/contact',
        { title: 'Liên Hệ', response },
        (error, html) => {
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
        },
    );
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
        const blogFound = await Blog.find({ category: categoryItem._id })
            .populate('category')
            .populate('banner');

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

    const response = { category, blogs, products };

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

    const product = await Product.findOne({ slug })
        .populate('product_gallery')
        .populate('category');

    if (!product) {
        return res.status(404).send('Product not found');
    }

    const response = { product };

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

    const blog = await Blog.findOne({ slug })
        .populate('category')
        .populate('banner');

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
