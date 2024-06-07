// controllers/auth.js

const bcrypt = require('bcrypt');
const User = require('@models/user');
const { validationResult } = require('express-validator');
const { generateToken } = require('@config/jwt');

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
 *         description: Invalid email or password
 *       500:
 *         description: Server error
 */
exports.login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(400).json({ errors: errors.array() });
        } else {
            return res.render('admin/signin', {
                errors: errors.array(),
                message: null
            });
        }
    }

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            const errorMessage = { message: 'Invalid email or password' };
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return res.status(400).json(errorMessage);
            } else {
                return res.render('admin/signin', {
                    ...errorMessage,
                    errors: []
                });
            }
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            const errorMessage = { message: 'Invalid email or password' };
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return res.status(400).json(errorMessage);
            } else {
                return res.render('admin/signin', {
                    ...errorMessage,
                    errors: []
                });
            }
        }

        if (!user.is_admin) {
            const errorMessage = { message: 'Invalid admin user' };
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return res.status(400).json(errorMessage);
            } else {
                return res.render('admin/signin', {
                    ...errorMessage,
                    errors: []
                });
            }
        }

        const token = generateToken(user);

        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(200).json({ token });
        } else {
            // Set token in cookie for admin login
            res.cookie('access_token', token, { httpOnly: true, secure: false, sameSite: 'Strict' });
            // Redirect to admin dashboard
            return res.redirect('/admin');
        }
    } catch (error) {
        const errorMessage = { message: 'Server error' };
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(500).json(errorMessage);
        } else {
            return res.render('admin/signin', {
                ...errorMessage,
                errors: []
            });
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                   example: Successfully logged out
 *       500:
 *         description: Server error
 */

exports.logout = (req, res) => {
    try {
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            console.log('success');
            res.status(200).json({ message: 'Successfully logged out' });
        } else {
            res.clearCookie('access_token');
            res.redirect('/admin/auth/login');
        }
    } catch (error) {
        console.log(error);
        const errorMessage = { message: 'Server error' };
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(500).json(errorMessage);
        } else {
            return res.render('admin/signin', {
                ...errorMessage,
                errors: []
            });
        }
    }
};