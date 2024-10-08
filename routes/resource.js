// routes/resourceRoutes.js
const express = require('express');
const router = express.Router();
const resourceController = require('@controllers/resource');
const { verifyAPIToken } = require('@middleware/auth');

// Routes need authentication
router.use(verifyAPIToken);

router.post('/upload', resourceController.uploadFiles);
router.delete('/:id', resourceController.deleteFile);
router.get('/get-files', resourceController.getStaticFiles);
router.post('/delete-files', resourceController.deleteStaticFiles);
router.post('/download-urls', resourceController.downloadFilesFromUrls);

module.exports = router;
