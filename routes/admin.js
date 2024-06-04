const express = require('express');
const { checkAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/signin', (req, res) => {
    res.render('admin/signin', { page_title: 'Đăng nhập admin' });
});

router.use(checkAdmin);

router.get('/', (req, res) => {
    res.render('admin', { page_title: 'Trang quản trị' });
});


module.exports = router;