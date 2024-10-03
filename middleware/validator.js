const { body, validationResult } = require('express-validator');
const HttpResponse = require('@services/httpResponse');

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
        return HttpResponse.badRequest(res, translatedErrors, req.t('validation.errors'));
    } else {
        res.locals.response = HttpResponse.badRequestResponse(translatedErrors, req.t('validation.errors'));
        return next();
    }
};

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

exports.profileValidationRules = () => {
    return [
        body('name').notEmpty().withMessage('validation.name_required'),
        body('email').isEmail().withMessage('validation.valid_email'),
    ];
};

exports.resourceValidationRules = () => {
    return [
        body('filename').notEmpty().withMessage('resource.filename_required'),
        body('size').isNumeric().withMessage('resource.size_required'),
        body('mimetype').notEmpty().withMessage('resource.mimetype_required'),
        body('path').notEmpty().withMessage('resource.path_required'),
        body('category').optional().isString().withMessage('resource.category_required'),
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
        body('banner').optional().isMongoId().withMessage('blog.banner_required'),
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
        body('description').optional().isString().withMessage('category.description_must_be_string'),
        body('parent_cate').optional(),
    ];
};

exports.productValidationRules = () => {
    return [
        body('product_code').notEmpty().withMessage('product.product_code_required'),
        body('product_name').notEmpty().withMessage('product.product_name_required'),
        body('product_summary').notEmpty().withMessage('product.product_summary_required'),
        body('product_price').optional(),
        body('product_discount').optional(),
        body('product_quantity').optional(),
        body('shipping_fee').optional(),
        body('product_gallery')
            .optional()
            .isArray()
            .withMessage('product.product_gallery_valid')
            .custom((value) => value.every((id) => mongoose.Types.ObjectId.isValid(id)))
            .withMessage('product.product_gallery_ids_valid'),
        body('product_specifications').optional(),
        body('product_description').optional(),
        body('manufacturer').optional(),
        body('category').isMongoId().withMessage('product.category_valid'),
    ];
};
