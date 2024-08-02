const HttpResponse = require('@services/httpResponse');
const { verifyToken } = require('@config/jwt');
const User = require('@models/user');
const { pushNotification } = require('@services/helper');

// For api
exports.verifyAPIToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    let accessToken = authHeader && authHeader.split(' ')[1];

    if (!accessToken) {
        accessToken = req.cookies['admin_access_token'];
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
        req.user = decoded;
        next();
    } catch (error) {
        console.log(error);
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
        next();
    } catch (error) {
        console.log(error);
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
        console.log(error);
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
            // Push notification
            pushNotification(res, 'info', {
                title: 'Phiên đăng nhập hết hạn',
                content: 'Vui lòng đăng nhập lại!',
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.log(error);
        // Push notification
        pushNotification(res, 'info', {
            title: 'Phiên đăng nhập hết hạn',
            content: 'Vui lòng đăng nhập lại!',
        });
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
        } else {
            return next();
        }
    } catch (error) {
        console.log(error);
        return next();
    }
};
