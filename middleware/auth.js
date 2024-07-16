const HttpResponse = require('@services/httpResponse');
const { verifyToken } = require('@config/jwt');
const User = require('@models/user');
const { pushNotification } = require('@services/helper');

exports.verifyAPIToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    let accessToken = authHeader && authHeader.split(' ')[1];

    if (!accessToken) {
        accessToken = req.cookies['access_token'];
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
        return HttpResponse.unauthorized(
            res,
            [],
            'Unauthorized: Invalid token',
        );
    }
};

exports.checkAdminToken = async (req, res, next) => {
    const accessToken = req.cookies.access_token;

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
    } catch (err) {
        // Push notification
        pushNotification(res, 'info', {
            title: 'Phiên đăng nhập hết hạn',
            content: 'Vui lòng đăng nhập lại!',
        });
        res.redirect('/admin/auth/login');
    }
};

exports.checkTokenForLogin = async (req, res, next) => {
    const accessToken = req.cookies.access_token;

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
    } catch (err) {
        return next();
    }
};
