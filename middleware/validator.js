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

exports.blogValidationRules = () => {
    return [
        body('title').notEmpty().withMessage('blog.title_required'),
        body('summary').notEmpty().withMessage('blog.summary_required'),
        body('content').notEmpty().withMessage('blog.content_required'),
        body('banner')
            .optional()
            .isMongoId()
            .withMessage('blog.banner_required'),
    ];
};

exports.categoryValidationRules = () => {
    return [
        body('position')
            .notEmpty()
            .withMessage('category.position_required')
            .isNumeric()
            .withMessage('category.position_must_be_numeric'),
        body('name').notEmpty().withMessage('category.name_required'),
        body('description')
            .optional()
            .isString()
            .withMessage('category.description_must_be_string'),
        body('parent_cate').optional(),
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
