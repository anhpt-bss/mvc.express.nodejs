const express = require('express');
const router = express.Router();
const serviceController = require('@controllers/service');

// Routes privated
router.get('/global-search', serviceController.globalSearch);

module.exports = router;
