const express = require('express');
const router = express.Router();
const checkoutController = require('@controllers/checkout');

router.get('/', checkoutController.getCheckout);
router.post('/place-order', checkoutController.placeOrder);

module.exports = router;
