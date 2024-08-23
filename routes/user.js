const express = require('express');
const { userValidationRules, validate } = require('@middleware/validator');
const { verifyAPIToken } = require('@middleware/auth');

const router = express.Router();
const userController = require('@controllers/user');

// Routes public
router.get('/get-list', userController.getAllUsers);
router.get('/:id', userController.getUserById);

// Verify token
router.use(verifyAPIToken);

// Routes privated
router.post('/create', userValidationRules(), validate, userController.createUser);
router.put('/:id', userValidationRules(), validate, userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
