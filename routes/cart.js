const express = require('express');
const router = express.Router();
const cartController = require('@controllers/cart');
const { verifyAPIToken } = require('@middleware/auth');

// Verify token
router.use(verifyAPIToken);

// Routes privated
router.post('/add', cartController.addToCart);

module.exports = router;
