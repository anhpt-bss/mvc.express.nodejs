// routes/auth.js

const express = require('express');
const router = express.Router();
const { verifyAPIToken } = require('@middleware/auth');
const { loginValidationRules, validate } = require('@middleware/validator');
const authController = require('@controllers/auth');

// Routes public
router.post('/login', loginValidationRules(), validate, authController.login);

// Verify token
router.use(verifyAPIToken);

// Routes privated
router.post('/logout', authController.logout);

module.exports = router;
