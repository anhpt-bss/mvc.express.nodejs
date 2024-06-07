const { check, body, validationResult } = require('express-validator');

exports.userValidationRules = () => {
    return [
        body('name')
            .notEmpty()
            .withMessage('Name is required'),
        body('email')
            .isEmail()
            .withMessage('Please include a valid email'),
        body('password')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long')
            .matches(/\d/)
            .withMessage('Password must contain a number')
            .matches(/[a-zA-Z]/)
            .withMessage('Password must contain a letter')
            .matches(/[!@#$%^&*(),.?":{}|<>]/)
            .withMessage('Password must contain a special character')
    ];
};

exports.validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }));

    return res.status(422).json({
        errors: extractedErrors,
    });
};

exports.validateLogin = [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];
