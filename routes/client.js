const express = require('express');

const router = express.Router();

router.get('/', async (req, res) => {

    const response = {};

    res.render('client', { response }, (error, html) => {
        if (error) {
            console.log('[---Log---][---client/---]: ', error);
            return res.status(500).send(error.message);
        }

        // Pass the rendered content to the layout
        res.render('client/layout', {
            body: html,
            title: 'Trang Chủ',
            currentUser: req.user,
        });
    });
});

module.exports = router;
