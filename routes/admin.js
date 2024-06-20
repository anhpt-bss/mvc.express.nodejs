const express = require('express');
const { checkAdminToken, checkTokenForLogin } = require('@middleware/auth');
const { loginValidationRules } = require('@middleware/validator');
const authController = require('@controllers/auth');
const { DEFAULT_RESPONSE } = require('@services/httpResponse/constants');
const router = express.Router();

// Routes public
router.post('/auth/login', loginValidationRules(), authController.login);

router.get('/auth/login', checkTokenForLogin, (req, res) => {
    res.render('admin/signin', { ...DEFAULT_RESPONSE });
});

// Verify token
router.use(checkAdminToken);

// Routes privated
router.get('/', (req, res) => {
    res.render('admin', {}, (err, html) => {
        if (err) {
            return res.status(500).send(err.message);
        }

        // Pass the rendered content to the layout
        res.render('admin/layout', { body: html, title: 'Bảng Điều Khiển', currentUser: req.user });
    });
});

router.get('/users', (req, res) => {
    res.render('admin/users', {}, (err, html) => {
        if (err) {
            return res.status(500).send(err.message);
        }

        // Pass the rendered content to the layout
        res.render('admin/layout', { body: html, title: 'Người Dùng', currentUser: req.user });
    });
});

router.get('/auth/logout', authController.logout);

module.exports = router;
