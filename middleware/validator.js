const { body, validationResult } = require('express-validator');
const HttpResponse = require('@services/httpResponse');

exports.userValidationRules = () => {
    return [
        body('name').notEmpty().withMessage('validation.name_required'),
        body('email').isEmail().withMessage('validation.valid_email'),
        body('password')
            .isLength({ min: 8 })
            .withMessage('validation.password_length')
            .matches(/\d/)
            .withMessage('validation.password_number')
            .matches(/[a-zA-Z]/)
            .withMessage('validation.password_letter')
            .matches(/[!@#$%^&*(),.?":{}|<>]/)
            .withMessage('validation.password_special_character'),
    ];
};

exports.loginValidationRules = () => {
    return [
        body('email').isEmail().withMessage('validation.valid_email'),
        body('password')
            .isLength({ min: 8 })
            .withMessage('validation.password_length')
            .matches(/\d/)
            .withMessage('validation.password_number')
            .matches(/[a-zA-Z]/)
            .withMessage('validation.password_letter')
            .matches(/[!@#$%^&*(),.?":{}|<>]/)
            .withMessage('validation.password_special_character'),
    ];
};

exports.validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }

    const translatedErrors = errors.array().map((error) => ({
        ...error,
        msg: req.t(error.msg),
    }));

    if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return HttpResponse.badRequest(
            res,
            translatedErrors,
            req.t('validation.errors'),
        );
    } else {
        res.locals.response = HttpResponse.badRequestResponse(
            translatedErrors,
            req.t('validation.errors'),
        );
        return next();
    }
};
