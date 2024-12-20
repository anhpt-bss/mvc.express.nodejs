const moment = require('moment');
const User = require('@models/user');
const { validationResult } = require('express-validator');
const HttpResponse = require('@services/httpResponse');
const ResourceService = require('@services/resource');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API endpoints for managing users
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the user
 *         email:
 *           type: string
 *           description: The email of the user
 *         password:
 *           type: string
 *           description: The password of the user
 *         is_admin:
 *           type: boolean
 *           description: Flag indicating whether the user is an admin
 *       example:
 *         name: John Doe
 *         email: john@example.com
 *         password: mypassword@123
 *         is_admin: false
 */

/**
 * @swagger
 * /api/user/get-list:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request. Invalid email or password.
 *       401:
 *         description: Unauthorized access.
 *       403:
 *         description: Access forbidden.
 *       404:
 *         description: Resource not found.
 *       500:
 *         description: Internal server error.
 */
exports.getAllUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, sort = 'created_time', order = 'desc' } = req.query;

        const users = await User.find()
            .sort({ [sort]: order === 'asc' ? 1 : -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate('avatar');

        const total = await User.countDocuments();

        const response = {
            data_list: users,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            sort,
            order,
        };

        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.success(res, response);
        } else {
            res.locals.response = HttpResponse.successResponse(response);
            return next();
        }
    } catch (error) {
        console.log('[---Log---][---getAllUsers---]: ', error);
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.internalServerError(res);
        } else {
            res.locals.response = HttpResponse.internalServerErrorResponse();
            return next();
        }
    }
};

/**
 * @swagger
 * /api/user/create:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: New user created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request. Invalid email or password.
 *       401:
 *         description: Unauthorized access.
 *       403:
 *         description: Access forbidden.
 *       404:
 *         description: Resource not found.
 *       500:
 *         description: Internal server error.
 */
exports.createUser = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
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
        }

        const { name, email, password, is_admin } = req.body;

        const existingUser = await User.findOne({ email: email });

        if (existingUser) {
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return HttpResponse.badRequest(res, [], req.t('user.email_already_exists'));
            } else {
                res.locals.response = HttpResponse.badRequestResponse([], req.t('user.email_already_exists'));
                return next();
            }
        }

        const user = new User({
            name: name,
            email: email,
            password: password,
            is_admin: is_admin ? true : false,
            created_by: req.user ? req.user.email : email,
        });

        await user.save();

        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.success(res, user);
        } else {
            res.locals.response = HttpResponse.successResponse(user);
            return next();
        }
    } catch (error) {
        console.log('[---Log---][---createUser---]: ', error);
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.internalServerError(res);
        } else {
            res.locals.response = HttpResponse.internalServerErrorResponse();
            return next();
        }
    }
};

/**
 * @swagger
 * /api/user/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request. Invalid email or password.
 *       401:
 *         description: Unauthorized access.
 *       403:
 *         description: Access forbidden.
 *       404:
 *         description: Resource not found.
 *       500:
 *         description: Internal server error.
 */
exports.getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).populate('avatar');
        if (!user) {
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return HttpResponse.badRequest(res, [], req.t('user.user_not_found'));
            } else {
                res.locals.response = HttpResponse.badRequestResponse([], req.t('user.user_not_found'));
                return next();
            }
        }

        return HttpResponse.success(res, user);
    } catch (error) {
        console.log('[---Log---][---getUserById---]: ', error);
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.internalServerError(res);
        } else {
            res.locals.response = HttpResponse.internalServerErrorResponse();
            return next();
        }
    }
};

/**
 * @swagger
 * /api/user/{id}:
 *   put:
 *     summary: Update a user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request. Invalid email or password.
 *       401:
 *         description: Unauthorized access.
 *       403:
 *         description: Access forbidden.
 *       404:
 *         description: Resource not found.
 *       500:
 *         description: Internal server error.
 */
exports.updateUser = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
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
        }

        const { name, email, password, is_admin, phone_number, address, gender, birthday } = req.body;

        let user = null;
        if (req.params.id) {
            user = await User.findById(req.params.id);
        } else if (email) {
            user = await User.findOne({ email: email });
        }

        if (!user) {
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return HttpResponse.badRequest(res, [], req.t('user.user_not_found'));
            } else {
                res.locals.response = HttpResponse.badRequestResponse([], req.t('user.user_not_found'));
                return next();
            }
        }

        let avatarFile;
        if (req.files) {
            req.body.resource_category = 'User';
            avatarFile = await ResourceService.uploadFiles(req, res);
            user.avatar = avatarFile && avatarFile?.length > 0 ? avatarFile[0]._id : user.avatar;
        }

        user.name = name;
        user.email = email;
        user.password = password;
        user.phone_number = phone_number;
        user.address = address;
        user.gender = gender;
        user.birthday = birthday;
        user.is_admin = is_admin ? true : false;
        user.created_by = req.user ? req.user.email : email;

        // await user.save();
        await User.findByIdAndUpdate(user._id, user, { new: true });

        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.success(res, user);
        } else {
            res.locals.response = HttpResponse.successResponse(user);
            return next();
        }
    } catch (error) {
        console.log('[---Log---][---updateUser---]: ', error);
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.internalServerError(res);
        } else {
            res.locals.response = HttpResponse.internalServerErrorResponse();
            return next();
        }
    }
};

/**
 * @swagger
 * /api/user/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Bad request. Invalid email or password.
 *       401:
 *         description: Unauthorized access.
 *       403:
 *         description: Access forbidden.
 *       404:
 *         description: Resource not found.
 *       500:
 *         description: Internal server error.
 */
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return HttpResponse.badRequest(res, [], req.t('user.user_not_found'));
            } else {
                res.locals.response = HttpResponse.badRequestResponse([], req.t('user.user_not_found'));
                return next();
            }
        }

        await User.deleteOne({ _id: req.params.id });

        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.success(res, { id: req.params.id });
        } else {
            res.locals.response = HttpResponse.successResponse({
                id: req.params.id,
            });
            return next();
        }
    } catch (error) {
        console.log('[---Log---][---deleteUser---]: ', error);
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.internalServerError(res);
        } else {
            res.locals.response = HttpResponse.internalServerErrorResponse();
            return next();
        }
    }
};
