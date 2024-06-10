const ResourceService = require('@services/resource');
const HttpResponse = require('@services/httpResponse');

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
 *     security:
 *       - bearerAuth: []
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
 *         description: Bad request. Invalid email or password.
 *       401:
 *         description: Unauthorized access.
 *       403:
 *         description: Access forbidden.
 *       404:
 *         description: Resource not found.
 *       500:
 *         description: Internal server error.
 */

exports.uploadFiles = async (req, res) => {
    try {
        if(req.files) {
            return HttpResponse.badRequest(res, [], 'No files selected');
        }

        const uploadedFiles = await ResourceService.uploadFiles(req, res);

        return HttpResponse.success(res, {files: uploadedFiles} , 'Files uploaded successfully');
    } catch (error) {
        return HttpResponse.internalServerError(res, [], error.message);
    }
};

/**
 * @swagger
 * /api/resource/{id}:
 *   delete:
 *     summary: Delete a file
 *     tags: [Resource]
 *     security:
 *       - bearerAuth: []
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
 *         description: Bad request. Invalid email or password.
 *       401:
 *         description: Unauthorized access.
 *       403:
 *         description: Access forbidden.
 *       404:
 *         description: Resource not found.
 *       500:
 *         description: Internal server error.
 */

exports.deleteFile = async (req, res) => {
    try {
        await ResourceService.deleteFile(req.params.id);

        return HttpResponse.success(res, {files: uploadedFiles} , 'File deleted successfully');
    } catch (error) {
        return HttpResponse.internalServerError(res, [], error.message);
    }
};

/**
 * @swagger
 * /api/resource/get-files:
 *   get:
 *     summary: Get list of files in the uploads directory
 *     tags: [Resource]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of files
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       400:
 *         description: Bad request. Invalid email or password.
 *       401:
 *         description: Unauthorized access.
 *       403:
 *         description: Access forbidden.
 *       404:
 *         description: Resource not found.
 *       500:
 *         description: Internal server error.
 */
exports.getStaticFiles = async (req, res) => {
    try {
        const files = await ResourceService.getStaticFiles();
        
        return HttpResponse.success(res, files);
    } catch (error) {
        return HttpResponse.internalServerError(res, [], error.message);
    }
};

/**
 * @swagger
 * /api/resource/delete-files:
 *   post:
 *     summary: Delete a file or all files in the uploads directory
 *     tags: [Resource]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               filePath:
 *                 type: string
 *                 description: The path or name of the file to delete
 *                 example: "uploads/example.png"
 *     responses:
 *       200:
 *         description: A list of files
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       400:
 *         description: Bad request. Invalid email or password.
 *       401:
 *         description: Unauthorized access.
 *       403:
 *         description: Access forbidden.
 *       404:
 *         description: Resource not found.
 *       500:
 *         description: Internal server error.
 */

exports.deleteStaticFiles = async (req, res) => {
    try {
        const { filePath } = req.body;

        await ResourceService.deleteStaticFiles(filePath);

        return HttpResponse.success(res, {}, 'Static files deleted successfully');
    } catch (error) {
        return HttpResponse.internalServerError(res, [], error.message);
    }
};