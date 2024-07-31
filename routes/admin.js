const express = require('express');
const logger = require('@config/logger');
const router = express.Router();

const { DEFAULT_RESPONSE } = require('@services/httpResponse/constants');
const { pushNotification } = require('@services/helper');
const { readLogFile, deleteLogFile } = require('@services/logger');

const { checkAdminToken, checkTokenForLogin } = require('@middleware/auth');
const {
    loginValidationRules,
    userValidationRules,
    blogValidationRules,
    categoryValidationRules,
    productValidationRules,
    resourceValidationRules,
} = require('@middleware/validator');

const authController = require('@controllers/auth');
const userController = require('@controllers/user');
const blogController = require('@controllers/blog');
const categoryController = require('@controllers/category');
const productController = require('@controllers/product');
const resourceController = require('@controllers/resource');

const User = require('@models/user');
const Blog = require('@models/blog');
const Category = require('@models/category');
const Product = require('@models/product');
const Resource = require('@models/resource');

// Routes public
router.get('/auth/login', checkTokenForLogin, (req, res) => {
    res.render('admin/signin', { ...DEFAULT_RESPONSE });
});

router.post(
    '/auth/login',
    loginValidationRules(),
    authController.login,
    (req, res) => {
        const controllerResponse = res.locals.response;

        if (controllerResponse.error) {
            // Push notification
            pushNotification(res, 'error', controllerResponse);

            return res.redirect('/admin/auth/login');
        } else {
            // Push notification
            pushNotification(res, 'success', controllerResponse);

            logger.info(`[${new Date()}][---Login---]: ${req.body.email}`);

            return res.redirect('/admin');
        }
    },
);

// Verify token
router.use(checkAdminToken);

// Routes privated
router.get('/', async (req, res) => {
    const totalBlog = await Blog.countDocuments();
    const totalCategory = await Category.countDocuments();
    const totalProduct = await Product.countDocuments();
    const totalResource = await Resource.countDocuments();
    const totalUser = await User.countDocuments();

    const response = {
        current_user: req.user,
        dashboard_summary: [
            {
                name: 'Người Dùng',
                total: totalUser,
                href: 'admin/users',
            },
            {
                name: 'Danh Mục',
                total: totalCategory,
                href: 'admin/categories',
            },
            {
                name: 'Sản Phẩm',
                total: totalProduct,
                href: 'admin/products',
            },
            {
                name: 'Blog',
                total: totalBlog,
                href: 'admin/blogs',
            },
            {
                name: 'Tệp Tải Lên',
                total: totalResource,
                href: 'admin/resources',
            },
        ],
    };

    res.render('admin', { response }, (error, html) => {
        if (error) {
            console.log('[---Log---][---admin/---]: ', error);
            return res.status(500).send(error.message);
        }

        // Pass the rendered content to the layout
        res.render('admin/layout', {
            body: html,
            title: 'Bảng Điều Khiển',
            currentUser: req.user,
        });
    });
});

// Users admin route
const userFields = [
    {
        field_name: 'name',
        field_label: 'Tên người dùng',
        field_type: 'text',
        is_required: true,
        is_show: true,
    },
    {
        field_name: 'email',
        field_label: 'Địa chỉ Email',
        field_type: 'email',
        is_required: true,
        is_show: true,
    },
    {
        field_name: 'password',
        field_label: 'Mật khẩu',
        field_type: 'password',
        is_required: true,
        is_show: false,
    },
    {
        field_name: 'is_admin',
        field_label: 'Admin hệ thống',
        field_type: 'checkbox',
        is_required: false,
        is_show: true,
    },
];

router.get('/users', userController.getAllUsers, (req, res) => {
    const controllerResponse = res.locals.response;

    const response = {
        ...controllerResponse,
        table_headers: userFields,
        route: '/admin/users',
    };

    res.render('admin/users', { response }, (error, html) => {
        if (error) {
            console.log('[---Log---][---admin/users---]: ', error);
            return res.status(500).send(error.message);
        }

        // Pass the rendered content to the layout
        res.render('admin/layout', {
            body: html,
            title: 'Người Dùng',
            currentUser: req.user,
        });
    });
});

router.get('/users/create', (req, res) => {
    const response = {
        ...DEFAULT_RESPONSE,
        fields_config: userFields,
        back_route: '/admin/users',
        next_route: '/admin/users/create',
    };

    res.render('admin/addAndEdit', { response }, (error, html) => {
        if (error) {
            console.log('[---Log---][---admin/users---]: ', error);
            return res.status(500).send(error.message);
        }

        // Pass the rendered content to the layout
        res.render('admin/layout', {
            body: html,
            title: 'Người Dùng',
            currentUser: req.user,
        });
    });
});

router.post(
    '/users/create',
    userValidationRules(),
    userController.createUser,
    (req, res) => {
        const controllerResponse = res.locals.response;

        if (controllerResponse.error) {
            // Push notification
            pushNotification(res, 'error', controllerResponse);

            return res.redirect('/admin/users/create');
        } else {
            // Push notification
            pushNotification(res, 'success', controllerResponse);

            return res.redirect('/admin/users');
        }
    },
);

router.get('/users/edit/:id', async (req, res) => {
    const userItem = await User.findById(req.params.id)
        .select('-password')
        .lean();

    const response = {
        ...DEFAULT_RESPONSE,
        fields_config: userFields,
        back_route: '/admin/users',
        next_route: `/admin/users/edit/${req.params.id}`,
        default_values: userItem,
    };

    res.render('admin/addAndEdit', { response }, (error, html) => {
        if (error) {
            console.log('[---Log---][---admin/users---]: ', error);
            return res.status(500).send(error.message);
        }

        // Pass the rendered content to the layout
        res.render('admin/layout', {
            body: html,
            title: 'Người Dùng',
            currentUser: req.user,
        });
    });
});

router.post(
    '/users/edit/:id',
    userValidationRules(),
    userController.updateUser,
    async (req, res) => {
        const controllerResponse = res.locals.response;

        if (controllerResponse.error) {
            // Push notification
            pushNotification(res, 'error', controllerResponse);

            return res.redirect(`/admin/users/edit/${req.params.id}`);
        } else {
            // Push notification
            pushNotification(res, 'success', controllerResponse);

            return res.redirect('/admin/users');
        }
    },
);

router.get('/users/delete/:id', userController.deleteUser, (req, res) => {
    const controllerResponse = res.locals.response;

    // Push notification
    pushNotification(
        res,
        controllerResponse.error ? 'error' : 'success',
        controllerResponse,
    );

    return res.redirect('/admin/users');
});

// Resource admin routes
const resourceFields = [
    {
        field_name: 'filename',
        field_label: 'Tên tệp',
        field_type: 'text',
        is_required: true,
        is_show: true,
        width: '20%',
    },
    {
        field_name: 'size',
        field_label: 'Kích thước',
        field_type: 'number',
        is_required: true,
        is_show: true,
        width: '10%',
    },
    {
        field_name: 'mimetype',
        field_label: 'Loại MIME',
        field_type: 'text',
        is_required: true,
        is_show: true,
        width: '10%',
    },
    {
        field_name: 'category',
        field_label: 'Danh mục',
        field_type: 'text',
        is_required: false,
        is_show: true,
        width: '10%',
    },
    {
        field_name: 'path',
        field_label: 'Đường dẫn',
        field_type: 'text',
        is_required: true,
        is_show: true,
        width: '40%',
    },
];

router.get('/resources', resourceController.getAllResources, (req, res) => {
    const controllerResponse = res.locals.response;

    const response = {
        ...controllerResponse,
        table_headers: resourceFields,
        route: '/admin/resources',
    };

    res.render('admin/resources', { response }, (error, html) => {
        if (error) {
            console.log('[---Log---][---admin/resources---]: ', error);
            return res.status(500).send(error.message);
        }

        // Pass the rendered content to the layout
        res.render('admin/layout', {
            body: html,
            title: 'Tệp Tải Lên',
            currentUser: req.user,
        });
    });
});

router.get('/resources/create', (req, res) => {
    const response = {
        ...DEFAULT_RESPONSE,
        fields_config: resourceFields,
        back_route: '/admin/resources',
        next_route: '/admin/resources/create',
    };

    res.render('admin/addAndEdit', { response }, (error, html) => {
        if (error) {
            console.log('[---Log---][---admin/resources---]: ', error);
            return res.status(500).send(error.message);
        }

        // Pass the rendered content to the layout
        res.render('admin/layout', {
            body: html,
            title: 'Thêm Tài nguyên',
            currentUser: req.user,
        });
    });
});

router.post(
    '/resources/create',
    resourceValidationRules(),
    resourceController.createResource,
    (req, res) => {
        const controllerResponse = res.locals.response;

        if (controllerResponse.error) {
            // Push notification
            pushNotification(res, 'error', controllerResponse);

            return res.redirect('/admin/resources/create');
        } else {
            // Push notification
            pushNotification(res, 'success', controllerResponse);

            return res.redirect('/admin/resources');
        }
    },
);

router.get('/resources/edit/:id', async (req, res) => {
    const resourceItem = await Resource.findById(req.params.id).lean();

    const response = {
        ...DEFAULT_RESPONSE,
        fields_config: resourceFields,
        back_route: '/admin/resources',
        next_route: `/admin/resources/edit/${req.params.id}`,
        default_values: resourceItem,
    };

    res.render('admin/addAndEdit', { response }, (error, html) => {
        if (error) {
            console.log('[---Log---][---admin/resources---]: ', error);
            return res.status(500).send(error.message);
        }

        // Pass the rendered content to the layout
        res.render('admin/layout', {
            body: html,
            title: 'Chỉnh sửa Tài nguyên',
            currentUser: req.user,
        });
    });
});

router.post(
    '/resources/edit/:id',
    resourceValidationRules(),
    resourceController.updateResource,
    async (req, res) => {
        const controllerResponse = res.locals.response;

        if (controllerResponse.error) {
            // Push notification
            pushNotification(res, 'error', controllerResponse);

            return res.redirect(`/admin/resources/edit/${req.params.id}`);
        } else {
            // Push notification
            pushNotification(res, 'success', controllerResponse);

            return res.redirect('/admin/resources');
        }
    },
);

router.get(
    '/resources/delete/:id',
    resourceController.deleteResource,
    (req, res) => {
        const controllerResponse = res.locals.response;

        // Push notification
        pushNotification(
            res,
            controllerResponse.error ? 'error' : 'success',
            controllerResponse,
        );

        return res.redirect('/admin/resources');
    },
);

// Logout admin route
router.get('/auth/logout', authController.logout, (req, res) => {
    const controllerResponse = res.locals.response;

    if (controllerResponse.error) {
        // Push notification
        pushNotification(res, 'error', controllerResponse);

        return res.redirect('/admin');
    } else {
        // Push notification
        pushNotification(res, 'success', controllerResponse);

        logger.info(`[${new Date()}][---Logout---]: ${req.user.email}`);

        return res.redirect('/admin/auth/login');
    }
});

// Endpoint to get log file contents
router.get('/logs', (req, res) => {
    readLogFile((error, data) => {
        if (error) {
            console.log('[---Log---][---/logs---]: ', error);
            return res.redirect('/admin');
        } else {
            res.render('admin/logs', { data }, (error, html) => {
                if (error) {
                    console.log('[---Log---][---/logs---]: ', error);
                    return res.status(500).send(error.message);
                }

                // Pass the rendered content to the layout
                res.render('admin/layout', {
                    body: html,
                    title: 'Nhật Ký Hệ Thống',
                    currentUser: req.user,
                });
            });
        }
    });
});

// Endpoint to delete log file
router.get('/logs/delete', (req, res) => {
    deleteLogFile((err) => {
        if (err) {
            return res.redirect('/admin');
        } else {
            return res.redirect('/admin');
        }
    });
});

// Blogs admin route
const blogFields = [
    {
        field_name: 'title',
        field_label: 'Tiêu đề',
        field_type: 'text',
        is_required: true,
        is_show: true,
    },
    {
        field_name: 'summary',
        field_label: 'Tóm tắt',
        field_type: 'text',
        is_required: true,
        is_show: true,
        width: '40%',
    },
    {
        field_name: 'banner',
        field_label: 'Ảnh tiêu đề',
        field_type: 'file',
        is_required: false,
        is_show: true,
        width: '20%',
    },
    {
        field_name: 'content',
        field_label: 'Nội dung',
        field_type: 'editor',
        is_required: true,
        is_show: false,
    },
    {
        field_name: 'category',
        field_label: 'Danh mục',
        field_type: 'select',
        is_required: false,
        is_show: true,
        options: [],
    },
];

router.get('/blogs', blogController.getAllBlogs, (req, res) => {
    const controllerResponse = res.locals.response;

    const response = {
        ...controllerResponse,
        table_headers: blogFields,
        route: '/admin/blogs',
    };

    res.render('admin/blogs', { response }, (error, html) => {
        if (error) {
            console.log('[---Log---][---admin/blogs---]: ', error);
            return res.status(500).send(error.message);
        }

        // Pass the rendered content to the layout
        res.render('admin/layout', {
            body: html,
            title: 'Blogs',
            currentUser: req.user,
        });
    });
});

router.get('/blogs/create', async (req, res) => {
    const categoryList = await Category.find().lean();

    const response = {
        ...DEFAULT_RESPONSE,
        fields_config: blogFields,
        back_route: '/admin/blogs',
        next_route: '/admin/blogs/create',
        options_list: {
            default_option: '-- Danh Mục Gốc --',
            category: categoryList.map((item) => ({
                label: item.name,
                value: item._id,
            })),
        },
    };

    res.render('admin/addAndEdit', { response }, (error, html) => {
        if (error) {
            console.log('[---Log---][---admin/blogs---]: ', error);
            return res.status(500).send(error.message);
        }

        // Pass the rendered content to the layout
        res.render('admin/layout', {
            body: html,
            title: 'Blogs',
            currentUser: req.user,
        });
    });
});

router.post(
    '/blogs/create',
    blogValidationRules(),
    blogController.createBlog,
    (req, res) => {
        const controllerResponse = res.locals.response;

        if (controllerResponse.error) {
            // Push notification
            pushNotification(res, 'error', controllerResponse);

            return res.redirect('/admin/blogs/create');
        } else {
            // Push notification
            pushNotification(res, 'success', controllerResponse);

            return res.redirect('/admin/blogs');
        }
    },
);

router.get('/blogs/edit/:id', async (req, res) => {
    const blogItem = await Blog.findById(req.params.id)
        .populate('banner')
        .lean();
    const categoryList = await Category.find().lean();

    const response = {
        ...DEFAULT_RESPONSE,
        fields_config: blogFields,
        back_route: '/admin/blogs',
        next_route: `/admin/blogs/edit/${req.params.id}`,
        default_values: blogItem,
        options_list: {
            default_option: '-- Danh Mục Gốc --',
            category: categoryList.map((item) => ({
                label: item.name,
                value: item._id,
            })),
        },
    };

    res.render('admin/addAndEdit', { response }, (error, html) => {
        if (error) {
            console.log('[---Log---][---admin/blogs---]: ', error);
            return res.status(500).send(error.message);
        }

        // Pass the rendered content to the layout
        res.render('admin/layout', {
            body: html,
            title: 'Blogs',
            currentUser: req.user,
        });
    });
});

router.post(
    '/blogs/edit/:id',
    blogValidationRules(),
    blogController.updateBlog,
    async (req, res) => {
        const controllerResponse = res.locals.response;

        if (controllerResponse.error) {
            // Push notification
            pushNotification(res, 'error', controllerResponse);

            return res.redirect(`/admin/blogs/edit/${req.params.id}`);
        } else {
            // Push notification
            pushNotification(res, 'success', controllerResponse);

            return res.redirect('/admin/blogs');
        }
    },
);

router.get('/blogs/delete/:id', blogController.deleteBlog, (req, res) => {
    const controllerResponse = res.locals.response;

    // Push notification
    pushNotification(
        res,
        controllerResponse.error ? 'error' : 'success',
        controllerResponse,
    );

    return res.redirect('/admin/blogs');
});

// Category admin routes
const categoryFields = [
    {
        field_name: 'position',
        field_label: 'Vị trí',
        field_type: 'number',
        is_required: true,
        is_show: true,
        width: '10%',
    },
    {
        field_name: 'name',
        field_label: 'Tên',
        field_type: 'text',
        is_required: true,
        is_show: true,
    },
    {
        field_name: 'description',
        field_label: 'Mô tả',
        field_type: 'editor',
        is_required: false,
        is_show: false,
    },
    {
        field_name: 'parent_cate',
        field_label: 'Danh mục cha',
        field_type: 'select',
        is_required: false,
        is_show: true,
        options: [],
    },
];

router.get('/categories', categoryController.getAllCategories, (req, res) => {
    const controllerResponse = res.locals.response;

    const response = {
        ...controllerResponse,
        table_headers: categoryFields,
        route: '/admin/categories',
    };

    res.render('admin/categories', { response }, (error, html) => {
        if (error) {
            console.log('[---Log---][---admin/categories---]: ', error);
            return res.status(500).send(error.message);
        }

        res.render('admin/layout', {
            body: html,
            title: 'Danh Mục',
            currentUser: req.user,
        });
    });
});

router.get('/categories/create', async (req, res) => {
    const categoryList = await Category.find().lean();

    const response = {
        ...DEFAULT_RESPONSE,
        fields_config: categoryFields,
        back_route: '/admin/categories',
        next_route: '/admin/categories/create',
        options_list: {
            default_option: '-- Danh Mục Gốc --',
            parent_cate: categoryList.map((item) => ({
                label: item.name,
                value: item._id,
            })),
        },
    };

    res.render('admin/addAndEdit', { response }, (error, html) => {
        if (error) {
            console.log('[---Log---][---admin/categories---]: ', error);
            return res.status(500).send(error.message);
        }

        res.render('admin/layout', {
            body: html,
            title: 'Danh Mục',
            currentUser: req.user,
        });
    });
});

router.post(
    '/categories/create',
    categoryValidationRules(),
    categoryController.createCategory,
    (req, res) => {
        const controllerResponse = res.locals.response;

        if (controllerResponse.error) {
            pushNotification(res, 'error', controllerResponse);
            return res.redirect('/admin/categories/create');
        } else {
            pushNotification(res, 'success', controllerResponse);
            return res.redirect('/admin/categories');
        }
    },
);

router.get('/categories/edit/:id', async (req, res) => {
    const categoryItem = await Category.findById(req.params.id).lean();
    const categoryList = await Category.find().lean();

    const response = {
        ...DEFAULT_RESPONSE,
        fields_config: categoryFields,
        back_route: '/admin/categories',
        next_route: `/admin/categories/edit/${req.params.id}`,
        default_values: categoryItem,
        options_list: {
            default_option: '-- Danh Mục Gốc --',
            parent_cate: categoryList.map((item) => ({
                label: item.name,
                value: item._id,
            })),
        },
    };

    res.render('admin/addAndEdit', { response }, (error, html) => {
        if (error) {
            console.log('[---Log---][---admin/categories---]: ', error);
            return res.status(500).send(error.message);
        }

        res.render('admin/layout', {
            body: html,
            title: 'Danh Mục',
            currentUser: req.user,
        });
    });
});

router.post(
    '/categories/edit/:id',
    categoryValidationRules(),
    categoryController.updateCategory,
    async (req, res) => {
        const controllerResponse = res.locals.response;

        if (controllerResponse.error) {
            pushNotification(res, 'error', controllerResponse);
            return res.redirect(`/admin/categories/edit/${req.params.id}`);
        } else {
            pushNotification(res, 'success', controllerResponse);
            return res.redirect('/admin/categories');
        }
    },
);

router.get(
    '/categories/delete/:id',
    categoryController.deleteCategory,
    (req, res) => {
        const controllerResponse = res.locals.response;

        pushNotification(
            res,
            controllerResponse.error ? 'error' : 'success',
            controllerResponse,
        );

        return res.redirect('/admin/categories');
    },
);

// Product fields configuration
const productFields = [
    {
        field_name: 'product_code',
        field_label: 'Mã sản phẩm',
        field_type: 'text',
        is_required: true,
        is_show: true,
        width: '10%',
    },
    {
        field_name: 'product_name',
        field_label: 'Tên sản phẩm',
        field_type: 'text',
        is_required: true,
        is_show: true,
        width: '30%',
    },
    {
        field_name: 'product_summary',
        field_label: 'Mô tả ngắn',
        field_type: 'text',
        is_required: true,
        is_show: true,
        width: '40%',
    },
    {
        field_name: 'category',
        field_label: 'Danh mục',
        field_type: 'select',
        is_required: true,
        is_show: true,
        options: [],
        width: '10%',
    },
    {
        field_name: 'product_price',
        field_label: 'Giá sản phẩm',
        field_type: 'number',
        is_required: false,
        is_show: false,
    },
    {
        field_name: 'product_discount',
        field_label: 'Giảm giá',
        field_type: 'number',
        is_required: false,
        is_show: false,
    },
    {
        field_name: 'product_quantity',
        field_label: 'Số lượng',
        field_type: 'number',
        is_required: false,
        is_show: false,
    },
    {
        field_name: 'shipping_fee',
        field_label: 'Phí vận chuyển',
        field_type: 'number',
        is_required: false,
        is_show: false,
    },
    {
        field_name: 'manufacturer',
        field_label: 'Nhà sản xuất',
        field_type: 'text',
        is_required: false,
        is_show: false,
    },
    {
        field_name: 'product_gallery',
        field_label: 'Bộ sưu tập',
        field_type: 'files',
        is_required: false,
        is_show: false,
    },
    {
        field_name: 'product_specifications',
        field_label: 'Thông số kỹ thuật',
        field_type: 'editor',
        is_required: false,
        is_show: false,
    },
    {
        field_name: 'product_description',
        field_label: 'Mô tả chi tiết',
        field_type: 'editor',
        is_required: false,
        is_show: false,
    },
];

// GET all products
router.get('/products', productController.getAllProducts, (req, res) => {
    const controllerResponse = res.locals.response;

    const response = {
        ...controllerResponse,
        table_headers: productFields,
        route: '/admin/products',
    };

    res.render('admin/products', { response }, (error, html) => {
        if (error) {
            console.log('[---Log---][---admin/products---]: ', error);
            return res.status(500).send(error.message);
        }

        // Pass the rendered content to the layout
        res.render('admin/layout', {
            body: html,
            title: 'Sản phẩm',
            currentUser: req.user,
        });
    });
});

// GET create product page
router.get('/products/create', async (req, res) => {
    const categoryList = await Category.find().lean();
    const response = {
        ...DEFAULT_RESPONSE,
        fields_config: productFields,
        back_route: '/admin/products',
        next_route: '/admin/products/create',
        options_list: {
            category: categoryList.map((item) => ({
                label: item.name,
                value: item._id,
            })),
        },
    };

    res.render('admin/addAndEdit', { response }, (error, html) => {
        if (error) {
            console.log('[---Log---][---admin/products---]: ', error);
            return res.status(500).send(error.message);
        }

        // Pass the rendered content to the layout
        res.render('admin/layout', {
            body: html,
            title: 'Thêm sản phẩm',
            currentUser: req.user,
        });
    });
});

// POST create product
router.post(
    '/products/create',
    productValidationRules(),
    productController.createProduct,
    (req, res) => {
        const controllerResponse = res.locals.response;

        if (controllerResponse.error) {
            // Push notification
            pushNotification(res, 'error', controllerResponse);

            return res.redirect('/admin/products/create');
        } else {
            // Push notification
            pushNotification(res, 'success', controllerResponse);

            return res.redirect('/admin/products');
        }
    },
);

// GET edit product page
router.get('/products/edit/:id', async (req, res) => {
    const productItem = await Product.findById(req.params.id)
        .populate('product_gallery')
        .lean();
    const categoryList = await Category.find().lean();

    const response = {
        ...DEFAULT_RESPONSE,
        fields_config: productFields,
        back_route: '/admin/products',
        next_route: `/admin/products/edit/${req.params.id}`,
        default_values: productItem,
        options_list: {
            category: categoryList.map((item) => ({
                label: item.name,
                value: item._id,
            })),
        },
    };

    res.render('admin/addAndEdit', { response }, (error, html) => {
        if (error) {
            console.log('[---Log---][---admin/products---]: ', error);
            return res.status(500).send(error.message);
        }

        // Pass the rendered content to the layout
        res.render('admin/layout', {
            body: html,
            title: 'Chỉnh sửa sản phẩm',
            currentUser: req.user,
        });
    });
});

// POST edit product
router.post(
    '/products/edit/:id',
    productValidationRules(),
    productController.updateProduct,
    async (req, res) => {
        const controllerResponse = res.locals.response;

        if (controllerResponse.error) {
            // Push notification
            pushNotification(res, 'error', controllerResponse);

            return res.redirect(`/admin/products/edit/${req.params.id}`);
        } else {
            // Push notification
            pushNotification(res, 'success', controllerResponse);

            return res.redirect('/admin/products');
        }
    },
);

// GET delete product
router.get(
    '/products/delete/:id',
    productController.deleteProduct,
    (req, res) => {
        const controllerResponse = res.locals.response;

        // Push notification
        pushNotification(
            res,
            controllerResponse.error ? 'error' : 'success',
            controllerResponse,
        );

        return res.redirect('/admin/products');
    },
);

module.exports = router;
