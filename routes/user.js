const express = require('express');
const { userValidationRules, validate } = require('../middleware/validator');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { verifyToken } = require('../middleware/auth');

const router = express.Router();
const userController = require('../controllers/user');

router.get('/get-list', userController.getAllUsers);

router.use(verifyToken);

router.route('/create')
    .post(
        userValidationRules(),
        validate,
        upload.single('avatar'),
        userController.createUser,
    );

module.exports = router;
