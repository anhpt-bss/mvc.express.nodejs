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
exports.login = async (req, res) => {
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
            return res.render(
                'admin/signin',
                HttpResponse.badRequestResponse(
                    translatedErrors,
                    req.t('validation.errors'),
                ),
            );
        }
    }

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            const errorMessage = req.t('auth.invalid_email_password');
            if (
                req.headers.accept &&
                req.headers.accept.includes('application/json')
            ) {
                return HttpResponse.badRequest(res, [], errorMessage);
            } else {
                return res.render(
                    'admin/signin',
                    HttpResponse.badRequestResponse([], errorMessage),
                );
            }
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            const errorMessage = req.t('auth.invalid_email_password');
            if (
                req.headers.accept &&
                req.headers.accept.includes('application/json')
            ) {
                return HttpResponse.badRequest(res, [], errorMessage);
            } else {
                return res.render(
                    'admin/signin',
                    HttpResponse.badRequestResponse([], errorMessage),
                );
            }
        }

        if (!user.is_admin) {
            const errorMessage = req.t('auth.invalid_admin_user');
            if (
                req.headers.accept &&
                req.headers.accept.includes('application/json')
            ) {
                return HttpResponse.badRequest(res, [], errorMessage);
            } else {
                return res.render(
                    'admin/signin',
                    HttpResponse.badRequestResponse([], errorMessage),
                );
            }
        }

        const token = generateToken(user);

        if (
            req.headers.accept &&
            req.headers.accept.includes('application/json')
        ) {
            return HttpResponse.success(
                res,
                { token },
                req.t('auth.login_successful'),
            );
        } else {
            res.cookie('access_token', token, {
                httpOnly: true,
                secure: false,
                sameSite: 'Strict',
            });
            return res.redirect('/admin');
        }
    } catch (error) {
        const errorMessage =
            error.message || req.t('auth.internal_server_error');
        if (
            req.headers.accept &&
            req.headers.accept.includes('application/json')
        ) {
            return HttpResponse.internalServerError(res, [], errorMessage);
        } else {
            return res.render(
                'admin/signin',
                HttpResponse.internalServerErrorResponse([], errorMessage),
            );
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
exports.logout = (req, res) => {
    try {
        if (
            req.headers.accept &&
            req.headers.accept.includes('application/json')
        ) {
            return HttpResponse.success(
                res,
                null,
                req.t('auth.logout_successful'),
            );
        } else {
            res.clearCookie('access_token');
            return res.redirect('/admin/auth/login');
        }
    } catch (error) {
        const errorMessage =
            error.message || req.t('auth.internal_server_error');
        if (
            req.headers.accept &&
            req.headers.accept.includes('application/json')
        ) {
            return HttpResponse.internalServerError(res, [], errorMessage);
        } else {
            return res.render(
                'admin/',
                HttpResponse.internalServerErrorResponse([], errorMessage),
            );
        }
    }
};
