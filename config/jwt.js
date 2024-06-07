const jwt = require('jsonwebtoken');
const constants = require('@config/constants');

const generateToken = (user) => {
    return jwt.sign({ id: user._id, email: user.email, name: user.name }, constants.JWT_SECRET_KEY, { expiresIn: '1h' });
};

const verifyToken = (token) => {
    return jwt.verify(token, constants.JWT_SECRET_KEY);
};

module.exports = { generateToken, verifyToken };
