const ResourceService = require('@services/resource');

/**
 * @swagger
 * components:
 *   schemas:
 *     Resource:
 *       type: object
 *       required:
 *         - filename
 *         - size
 *         - mimetype
 *         - path
 *       properties:
 *         filename:
 *           type: string
 *           description: The name of the file
 *         size:
 *           type: integer
 *           description: The size of the file in bytes
 *         mimetype:
 *           type: string
 *           description: The MIME type of the file
 *         path:
 *           type: string
 *           description: The storage path of the file
 *       example:
 *         filename: "example.png"
 *         size: 102400
 *         mimetype: "image/png"
 *         path: "uploads/1622527200000-example.png"
 */

/**
 * @swagger
 * /api/resource/upload:
 *   post:
 *     summary: Upload multiple files
 *     tags: [Resource]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Files uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 files:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Resource'
 *       400:
 *         description: An error occurred
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

exports.uploadFiles = async (req, res) => {
    try {
        const uploadedFiles = await ResourceService.uploadFiles(req, res);
        res.status(201).json({ message: 'Files uploaded successfully', files: uploadedFiles });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

/**
 * @swagger
 * /api/resource/{id}:
 *   delete:
 *     summary: Delete a file
 *     tags: [Resource]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the file to delete
 *     responses:
 *       200:
 *         description: File deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: An error occurred
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

exports.deleteFile = async (req, res) => {
    try {
        await ResourceService.deleteFile(req.params.id);
        res.status(200).json({ message: 'File deleted successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
