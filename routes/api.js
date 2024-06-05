const express = require('express');
const router = express.Router();
const userRoutes = require('@routes/user');
const resourceRoutes = require('@routes/resource');

// Defined routes
router.use('/user', userRoutes);

router.use('/resource', resourceRoutes);

module.exports = router;
