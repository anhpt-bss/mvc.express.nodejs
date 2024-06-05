// routes/resourceRoutes.js
const express = require('express');
const router = express.Router();
const resourceController = require('@controllers/resource');

router.post('/upload', resourceController.uploadFiles);
router.delete('/:id', resourceController.deleteFile);
router.get('/get-files', resourceController.getStaticFiles);
router.post('/delete-files', resourceController.deleteStaticFiles);

module.exports = router;
