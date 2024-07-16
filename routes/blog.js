const express = require('express');
const { blogValidationRules, validate } = require('@middleware/validator');
const { verifyAPIToken } = require('@middleware/auth');

const router = express.Router();
const blogController = require('@controllers/blog');

// Routes public
router.get('/get-list', blogController.getAllBlogs);
router.get('/:id', blogController.getBlogById);

// Verify token
router.use(verifyAPIToken);

// Routes privated
router.post(
    '/create',
    blogValidationRules(),
    validate,
    blogController.createBlog,
);
router.put('/:id', blogValidationRules(), validate, blogController.updateBlog);
router.delete('/:id', blogController.deleteBlog);

module.exports = router;
