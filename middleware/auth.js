const HttpResponse = require('@services/httpResponse');
const { verifyToken } = require('@config/jwt');
const { pushNotification } = require('@services/helper');
const User = require('@models/user');
const Cart = require('@models/cart');

// For api
exports.verifyAPIToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    let accessToken = authHeader && authHeader.split(' ')[1];

    if (!accessToken) {
        if(req.headers['source'] === 'client') {
            accessToken = req.cookies['client_access_token'];
        } else {
            accessToken = req.cookies['admin_access_token'];
        }
    }

    if (!accessToken) {
        return HttpResponse.unauthorized(
            res,
            [],
            'Unauthorized: No token provided',
        );
    }

    try {
        const decoded = verifyToken(accessToken);
        const user = await User.findById(decoded.id);

        req.user = user;
        
        return next();
    } catch (error) {
        console.log('[---Log---][---verifyAPIToken---]: ', error);
        return HttpResponse.unauthorized(
            res,
            [],
            'Unauthorized: Invalid token',
        );
    }
};

// For admin
exports.checkAdminToken = async (req, res, next) => {
    const accessToken = req.cookies.admin_access_token;

    if (!accessToken) {
        return res.redirect('/admin/auth/login');
    }

    try {
        const decoded = verifyToken(accessToken);
        const user = await User.findById(decoded.id);

        if (!user || !user.is_admin) {
            // Push notification
            pushNotification(res, 'info', {
                title: 'Phiên đăng nhập hết hạn',
                content: 'Vui lòng đăng nhập lại!',
            });
            return res.redirect('/admin/auth/login');
        }

        req.user = user;
        return next();
    } catch (error) {
        console.log('[---Log---][---checkAdminToken---]: ', error);
        // Push notification
        pushNotification(res, 'info', {
            title: 'Phiên đăng nhập hết hạn',
            content: 'Vui lòng đăng nhập lại!',
        });
        res.redirect('/admin/auth/login');
    }
};

exports.checkAdminTokenForLogin = async (req, res, next) => {
    const accessToken = req.cookies.admin_access_token;

    if (!accessToken) {
        return next();
    }

    try {
        const decoded = verifyToken(accessToken);
        const user = await User.findById(decoded.id);

        if (user && user.is_admin) {
            return res.redirect('/admin');
        } else {
            return next();
        }
    } catch (error) {
        console.log('[---Log---][---checkAdminTokenForLogin---]: ', error);
        return next();
    }
};

// For client
exports.checkClientToken = async (req, res, next) => {
    const accessToken = req.cookies.client_access_token;

    if (!accessToken) {
        return next();
    }

    try {
        const decoded = verifyToken(accessToken);
        const user = await User.findById(decoded.id);

        if (!user || user.is_admin) {
            return next();
        }

        req.user = user;
        
        // Calculate the total quantity of all items in the cart
        const totalQuantity = await Cart.aggregate([
            { $match: { user: req.user._id } },
            { $group: { _id: null, total: { $sum: '$quantity' } } }
        ]);
        const totalItemsInCart = totalQuantity.length > 0 ? totalQuantity[0].total : 0;
        
        res.locals.total_items_in_cart = totalItemsInCart;

        return next();
    } catch (error) {
        console.log('[---Log---][---checkClientToken---]: ', error);
        
        res.locals.total_items_in_cart = 0;

        return next();
    }
};

exports.checkClientTokenForLogin = async (req, res, next) => {
    const accessToken = req.cookies.client_access_token;

    if (!accessToken) {
        return next();
    }

    try {
        const decoded = verifyToken(accessToken);
        const user = await User.findById(decoded.id);

        if (user && !user.is_admin) {
            return res.redirect('/');
        }

        return next();
    } catch (error) {
        console.log('[---Log---][---checkClientTokenForLogin---]: ', error);
        return next();
    }
};

exports.checkClientTokenForAccess = async (req, res, next) => {
    const accessToken = req.cookies.client_access_token;

    if (!accessToken) {
        // Push notification
        pushNotification(res, 'info', {
            title: 'Chưa đăng nhập ứng dụng',
            content: 'Vui lòng đăng nhập để sử dụng tính năng này!',
        });
        res.redirect('/signin');
    }

    try {
        const decoded = verifyToken(accessToken);
        const user = await User.findById(decoded.id);

        if (!user || user.is_admin) {
            // Push notification
            pushNotification(res, 'info', {
                title: 'Người dùng không hợp lệ',
                content: 'Vui lòng đăng nhập lại!',
            });
            res.redirect('/signin');
        }

        return next();
    } catch (error) {
        console.log('[---Log---][---checkClientTokenForAccess---]: ', error);
        // Push notification
        pushNotification(res, 'info', {
            title: 'Phiên đăng nhập hết hạn',
            content: 'Vui lòng đăng nhập lại!',
        });
        res.redirect('/signin');
    }
};