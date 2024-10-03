const cookieParser = require('cookie-parser');

module.exports = (req, res, next) => {
    const notification = req.cookies.notification;

    if (notification) {
        res.locals.notification = notification;

        res.clearCookie('notification');
    } else {
        res.locals.notification = null;
    }

    next();
};
