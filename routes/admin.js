const express = require('express');
const { checkAdminToken, checkTokenForLogin } = require('@middleware/auth');
const {
    loginValidationRules,
    userValidationRules,
    validate,
} = require('@middleware/validator');
const authController = require('@controllers/auth');
const userController = require('@controllers/user');
const User = require('@models/user');
const { DEFAULT_RESPONSE } = require('@services/httpResponse/constants');
const { pushNotification } = require('@services/helper');
const router = express.Router();

// Routes public
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

            return res.redirect('/admin');
        }
    },
);

router.get('/auth/login', checkTokenForLogin, (req, res) => {
    res.render('admin/signin', { ...DEFAULT_RESPONSE });
});

// Verify token
router.use(checkAdminToken);

// Routes privated
router.get('/', (req, res) => {
    res.render('admin', {}, (error, html) => {
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

router.get('/auth/logout', authController.logout, (req, res) => {
    const controllerResponse = res.locals.response;

    if (controllerResponse.error) {
        // Push notification
        pushNotification(res, 'error', controllerResponse);

        return res.redirect('/admin');
    } else {
        // Push notification
        pushNotification(res, 'success', controllerResponse);

        return res.redirect('/admin/auth/login');
    }
});

module.exports = router;
