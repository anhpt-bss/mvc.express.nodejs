const { body, validationResult } = require('express-validator');
const HttpResponse = require('@services/httpResponse');

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

exports.loginValidationRules = () => {
    return [
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

    return HttpResponse.badRequest(res, errors.array(), 'Validation errors');
};