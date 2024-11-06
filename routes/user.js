const express = require('express');
const { createUserValidationRules, validate } = require('@middleware/validator');
const { verifyAPIToken } = require('@middleware/auth');

const router = express.Router();
const userController = require('@controllers/user');

// Routes public
router.get('/get-list', userController.getAllUsers);
router.get('/:id', userController.getUserById);

// Verify token
router.use(verifyAPIToken);

// Routes privated
router.post('/create', createUserValidationRules(), validate, userController.createUser);
router.put('/:id', createUserValidationRules(), validate, userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
