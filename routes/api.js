const express = require('express');
const router = express.Router();
const authRoutes = require('@routes/auth');
const userRoutes = require('@routes/user');
const resourceRoutes = require('@routes/resource');
const blogRoutes = require('@routes/blog');
const cartRoutes = require('@routes/cart');

// Defined routes
router.use('/auth', authRoutes);

router.use('/user', userRoutes);

router.use('/resource', resourceRoutes);

router.use('/blog', blogRoutes);

router.use('/cart', cartRoutes);

module.exports = router;
