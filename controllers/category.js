const Category = require('@models/category');
const { validationResult } = require('express-validator');
const HttpResponse = require('@services/httpResponse');

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: API endpoints for managing categories
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - position
 *         - name
 *       properties:
 *         position:
 *           type: number
 *           description: The position of the category
 *         name:
 *           type: string
 *           description: The name of the category
 *         slug:
 *           type: string
 *           description: The slug of the category
 *         description:
 *           type: string
 *           description: The description of the category
 *         parent_cate:
 *           type: string
 *           description: The parent category ID
 *         created_by:
 *           type: string
 *           description: The creator of the category
 *         created_time:
 *           type: string
 *           format: date-time
 *           description: The creation time of the category
 *       example:
 *         position: 1
 *         name: Electronics
 *         slug: electronics
 *         description: All electronic items
 *         parent_cate: null
 *         created_by: Admin
 *         created_time: 2024-07-15T00:00:00.000Z
 */

/**
 * @swagger
 * /api/category/get-list:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized access.
 *       403:
 *         description: Access forbidden.
 *       404:
 *         description: Resource not found.
 *       500:
 *         description: Internal server error.
 */
exports.getAllCategories = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            sort = 'position',
            order = 'asc',
        } = req.query;

        const categories = await Category.find()
            .sort({ [sort]: order === 'asc' ? 1 : -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Category.countDocuments();

        const response = {
            data_list: categories,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            sort,
            order,
        };

        if (
            req.headers.accept &&
            req.headers.accept.includes('application/json')
        ) {
            return HttpResponse.success(res, response);
        } else {
            res.locals.response = HttpResponse.successResponse(response);
            return next();
        }
    } catch (error) {
        console.log('[---Log---][---getAllCategories---]: ', error);
        if (
            req.headers.accept &&
            req.headers.accept.includes('application/json')
        ) {
            return HttpResponse.internalServerError(res);
        } else {
            res.locals.response = HttpResponse.internalServerErrorResponse();
            return next();
        }
    }
};

/**
 * @swagger
 * /api/category/create:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       200:
 *         description: New category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized access.
 *       403:
 *         description: Access forbidden.
 *       404:
 *         description: Resource not found.
 *       500:
 *         description: Internal server error.
 */
exports.createCategory = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const translatedErrors = errors.array().map((error) => ({
                ...error,
                msg: req.t(error.msg),
            }));

            if (
                req.headers.accept &&
                req.headers.accept.includes('application/json')
            ) {
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
        }

        const { position, name, description, parent_cate } = req.body;

        const existingCategory = await Category.findOne({ name });

        if (existingCategory) {
            if (
                req.headers.accept &&
                req.headers.accept.includes('application/json')
            ) {
                return HttpResponse.badRequest(
                    res,
                    [],
                    req.t('category.name_already_exists'),
                );
            } else {
                res.locals.response = HttpResponse.badRequestResponse(
                    [],
                    req.t('category.name_already_exists'),
                );
                return next();
            }
        }

        const category = new Category({
            position,
            name,
            description,
            parent_cate: parent_cate === '' ? null : parent_cate,
        });

        await category.save();

        if (
            req.headers.accept &&
            req.headers.accept.includes('application/json')
        ) {
            return HttpResponse.success(res, category);
        } else {
            res.locals.response = HttpResponse.successResponse(category);
            return next();
        }
    } catch (error) {
        console.log('[---Log---][---createCategory---]: ', error);
        if (
            req.headers.accept &&
            req.headers.accept.includes('application/json')
        ) {
            return HttpResponse.internalServerError(res);
        } else {
            res.locals.response = HttpResponse.internalServerErrorResponse();
            return next();
        }
    }
};

/**
 * @swagger
 * /api/category/{id}:
 *   get:
 *     summary: Get a category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The category ID
 *     responses:
 *       200:
 *         description: Category found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized access.
 *       403:
 *         description: Access forbidden.
 *       404:
 *         description: Resource not found.
 *       500:
 *         description: Internal server error.
 */
exports.getCategoryById = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            if (
                req.headers.accept &&
                req.headers.accept.includes('application/json')
            ) {
                return HttpResponse.badRequest(
                    res,
                    [],
                    req.t('category.category_not_found'),
                );
            } else {
                res.locals.response = HttpResponse.badRequestResponse(
                    [],
                    req.t('category.category_not_found'),
                );
                return next();
            }
        }

        return HttpResponse.success(res, category);
    } catch (error) {
        console.log('[---Log---][---getCategoryById---]: ', error);
        if (
            req.headers.accept &&
            req.headers.accept.includes('application/json')
        ) {
            return HttpResponse.internalServerError(res);
        } else {
            res.locals.response = HttpResponse.internalServerErrorResponse();
            return next();
        }
    }
};

/**
 * @swagger
 * /api/category/{id}:
 *   put:
 *     summary: Update a category by ID
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized access.
 *       403:
 *         description: Access forbidden.
 *       404:
 *         description: Resource not found.
 *       500:
 *         description: Internal server error.
 */
exports.updateCategory = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const translatedErrors = errors.array().map((error) => ({
                ...error,
                msg: req.t(error.msg),
            }));

            if (
                req.headers.accept &&
                req.headers.accept.includes('application/json')
            ) {
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
        }

        const { position, name, description, parent_cate } = req.body;
        const category = await Category.findById(req.params.id);

        if (!category) {
            if (
                req.headers.accept &&
                req.headers.accept.includes('application/json')
            ) {
                return HttpResponse.badRequest(
                    res,
                    [],
                    req.t('category.category_not_found'),
                );
            } else {
                res.locals.response = HttpResponse.badRequestResponse(
                    [],
                    req.t('category.category_not_found'),
                );
                return next();
            }
        }

        if (position) category.position = position;
        if (name) category.name = name;
        if (description) category.description = description;
        if (parent_cate) category.parent_cate = parent_cate;
        else category.parent_cate = null;

        await category.save();

        if (
            req.headers.accept &&
            req.headers.accept.includes('application/json')
        ) {
            return HttpResponse.success(res, category);
        } else {
            res.locals.response = HttpResponse.successResponse(category);
            return next();
        }
    } catch (error) {
        console.log('[---Log---][---updateCategory---]: ', error);
        if (
            req.headers.accept &&
            req.headers.accept.includes('application/json')
        ) {
            return HttpResponse.internalServerError(res);
        } else {
            res.locals.response = HttpResponse.internalServerErrorResponse();
            return next();
        }
    }
};

/**
 * @swagger
 * /api/category/{id}:
 *   delete:
 *     summary: Delete a category by ID
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized access.
 *       403:
 *         description: Access forbidden.
 *       404:
 *         description: Resource not found.
 *       500:
 *         description: Internal server error.
 */
exports.deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            if (
                req.headers.accept &&
                req.headers.accept.includes('application/json')
            ) {
                return HttpResponse.badRequest(
                    res,
                    [],
                    req.t('category.category_not_found'),
                );
            } else {
                res.locals.response = HttpResponse.badRequestResponse(
                    [],
                    req.t('category.category_not_found'),
                );
                return next();
            }
        }

        await Category.deleteOne({ _id: req.params.id });

        if (
            req.headers.accept &&
            req.headers.accept.includes('application/json')
        ) {
            return HttpResponse.success(res, { id: req.params.id });
        } else {
            res.locals.response = HttpResponse.successResponse({
                id: req.params.id,
            });
            return next();
        }
    } catch (error) {
        console.log('[---Log---][---deleteCategory---]: ', error);
        if (
            req.headers.accept &&
            req.headers.accept.includes('application/json')
        ) {
            return HttpResponse.internalServerError(res);
        } else {
            res.locals.response = HttpResponse.internalServerErrorResponse();
            return next();
        }
    }
};
