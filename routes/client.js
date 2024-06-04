const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
    res.render('client', { page_title: 'Trang người dùng' });
});

module.exports = router;