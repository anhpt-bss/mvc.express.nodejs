const { verifyToken } = require('@config/jwt');

exports.verifyToken = (req, res, next) => {
    const token = req.headers['x-access-token'].replace('Bearer ', '') || req.headers.authorization.replace('Bearer ', ''); // Check for token in header

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    try {
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};

exports.checkAdmin = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');

        if (!token) {
            return res.redirect('/admin/signin');
        }

        const decoded = verifyToken(token);
        const user = await User.findById(decoded.id);

        if (!user || !user.is_admin) {
            return res.redirect('/admin/signin');
        }

        req.user = user;
        next();
    } catch (err) {
        res.redirect('/admin/signin');
    }
};