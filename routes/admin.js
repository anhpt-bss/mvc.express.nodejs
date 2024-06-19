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
    res.render('admin', { page_title: 'Trang quản trị' });
});

router.get('/auth/logout', authController.logout);

module.exports = router;
