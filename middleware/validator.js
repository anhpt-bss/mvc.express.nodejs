const { body, validationResult } = require('express-validator');

exports.userValidationRules = () => {
    return [
        body('name').isString().isLength({ min: 3 }),
        body('email').isEmail(),
        body('password').isLength({ min: 5 }),
    ];
};

exports.validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    return res.status(400).json({ errors: errors.array() });
};
