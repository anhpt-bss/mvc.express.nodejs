const bcrypt = require('bcrypt');
const User = require('@models/user');
const { validationResult } = require('express-validator');
const { generateToken } = require('@config/jwt');
const HttpResponse = require('@services/httpResponse');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           description: The user's email
 *         password:
 *           type: string
 *           description: The user's password
 *       example:
 *         email: admin@mvc.com
 *         password: a@dmin1996
 *
 *     LoginResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: The JWT token
 *       example:
 *         token: "your.jwt.token"
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
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
exports.login = async (req, res, next) => {
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

        const { email, password, source } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            const errorMessage = req.t('auth.invalid_email_password');
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return HttpResponse.badRequest(res, [], errorMessage);
            } else {
                res.locals.response = HttpResponse.badRequestResponse([], errorMessage);
                return next();
            }
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            const errorMessage = req.t('auth.invalid_email_password');
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return HttpResponse.badRequest(res, [], errorMessage);
            } else {
                res.locals.response = HttpResponse.badRequestResponse([], errorMessage);
                return next();
            }
        }

        let errorMessage = null;
        if (source === 'client' && user.is_admin) {
            errorMessage = req.t('auth.invalid_client_user');
        } else if (!source && !user.is_admin) {
            errorMessage = req.t('auth.invalid_admin_user');
        }

        if (errorMessage) {
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return HttpResponse.badRequest(res, [], errorMessage);
            } else {
                res.locals.response = HttpResponse.badRequestResponse([], errorMessage);
                return next();
            }
        }

        const token = generateToken(user);

        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.success(res, { token }, req.t('auth.login_successful'));
        } else {
            if (source === 'client') {
                res.cookie('client_access_token', token, {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'Strict',
                });
            } else {
                res.cookie('admin_access_token', token, {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'Strict',
                });
            }

            res.locals.response = HttpResponse.successResponse({ token }, req.t('auth.login_successful'));
            return next();
        }
    } catch (error) {
        console.log('[---Log---][---login---]: ', error);
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
 * /api/auth/logout:
 *   post:
 *     summary: Logout a user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
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
exports.logout = (req, res, next) => {
    try {
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.success(res, null, req.t('auth.logout_successful'));
        } else {
            if (req.user.is_admin) {
                res.clearCookie('admin_access_token');
            } else {
                res.clearCookie('client_access_token');
            }
            res.locals.response = HttpResponse.successResponse(null, req.t('auth.logout_successful'));
            return next();
        }
    } catch (error) {
        console.log('[---Log---][---logout---]: ', error);
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.internalServerError(res);
        } else {
            res.locals.response = HttpResponse.internalServerErrorResponse();
            return next();
        }
    }
};
