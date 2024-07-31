const Resource = require('@models/resource');
const { validationResult } = require('express-validator');
const ResourceService = require('@services/resource');
const HttpResponse = require('@services/httpResponse');
const Blog = require('@models/blog');
const Product = require('@models/product');

/**
 * @swagger
 * tags:
 *   name: Resources
 *   description: API endpoints for managing resources
 */

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
 *           type: number
 *           description: The size of the file in bytes
 *         mimetype:
 *           type: string
 *           description: The MIME type of the file
 *         path:
 *           type: string
 *           description: The path to the file
 *         category:
 *           type: string
 *           description: The category of the file
 *       example:
 *         filename: example.txt
 *         size: 1234
 *         mimetype: text/plain
 *         path: /uploads/example.txt
 *         category: documents
 */

/**
 * @swagger
 * /api/resource/get-list:
 *   get:
 *     summary: Get all resources
 *     tags: [Resources]
 *     responses:
 *       200:
 *         description: List of resources
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Resource'
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized access.
 *       403:
 *         description: Access forbidden.
 *       404:
 *         description: Resource not found.
 *       500:
 *         description: Internal server error.
 */
exports.getAllResources = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            sort = 'filename',
            order = 'asc',
        } = req.query;

        const resources = await Resource.find()
            .sort({ [sort]: order === 'asc' ? 1 : -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        console.log(resources);
        const total = await Resource.countDocuments();

        const response = {
            data_list: resources,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            sort,
            order,
        };

        if (
            req.headers.accept &&
            req.headers.accept.includes('application/json')
        ) {
            return HttpResponse.success(res, response);
        } else {
            res.locals.response = HttpResponse.successResponse(response);
            return next();
        }
    } catch (error) {
        console.log('[---Log---][---getAllResources---]: ', error);
        if (
            req.headers.accept &&
            req.headers.accept.includes('application/json')
        ) {
            return HttpResponse.internalServerError(res);
        } else {
            res.locals.response = HttpResponse.internalServerErrorResponse();
            return next();
        }
    }
};

/**
 * @swagger
 * /api/resource/create:
 *   post:
 *     summary: Create a new resource
 *     tags: [Resources]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Resource'
 *     responses:
 *       200:
 *         description: New resource created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resource'
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized access.
 *       403:
 *         description: Access forbidden.
 *       404:
 *         description: Resource not found.
 *       500:
 *         description: Internal server error.
 */
exports.createResource = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const translatedErrors = errors.array().map((error) => ({
                ...error,
                msg: req.t(error.msg),
            }));

            if (
                req.headers.accept &&
                req.headers.accept.includes('application/json')
            ) {
                return HttpResponse.badRequest(
                    res,
                    translatedErrors,
                    req.t('validation.errors'),
                );
            } else {
                res.locals.response = HttpResponse.badRequestResponse(
                    translatedErrors,
                    req.t('validation.errors'),
                );
                return next();
            }
        }

        const { filename, size, mimetype, path, category } = req.body;

        const resource = new Resource({
            filename,
            size,
            mimetype,
            path,
            category: category || 'system',
        });

        await resource.save();

        if (
            req.headers.accept &&
            req.headers.accept.includes('application/json')
        ) {
            return HttpResponse.success(res, resource);
        } else {
            res.locals.response = HttpResponse.successResponse(resource);
            return next();
        }
    } catch (error) {
        console.log('[---Log---][---createResource---]: ', error);
        if (
            req.headers.accept &&
            req.headers.accept.includes('application/json')
        ) {
            return HttpResponse.internalServerError(res);
        } else {
            res.locals.response = HttpResponse.internalServerErrorResponse();
            return next();
        }
    }
};

/**
 * @swagger
 * /api/resource/{id}:
 *   get:
 *     summary: Get a resource by ID
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The resource ID
 *     responses:
 *       200:
 *         description: Resource found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resource'
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized access.
 *       403:
 *         description: Access forbidden.
 *       404:
 *         description: Resource not found.
 *       500:
 *         description: Internal server error.
 */
exports.getResourceById = async (req, res, next) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) {
            if (
                req.headers.accept &&
                req.headers.accept.includes('application/json')
            ) {
                return HttpResponse.badRequest(
                    res,
                    [],
                    req.t('resource.resource_not_found'),
                );
            } else {
                res.locals.response = HttpResponse.badRequestResponse(
                    [],
                    req.t('resource.resource_not_found'),
                );
                return next();
            }
        }

        return HttpResponse.success(res, resource);
    } catch (error) {
        console.log('[---Log---][---getResourceById---]: ', error);
        if (
            req.headers.accept &&
            req.headers.accept.includes('application/json')
        ) {
            return HttpResponse.internalServerError(res);
        } else {
            res.locals.response = HttpResponse.internalServerErrorResponse();
            return next();
        }
    }
};

/**
 * @swagger
 * /api/resource/{id}:
 *   put:
 *     summary: Update a resource by ID
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The resource ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Resource'
 *     responses:
 *       200:
 *         description: Resource updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resource'
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized access.
 *       403:
 *         description: Access forbidden.
 *       404:
 *         description: Resource not found.
 *       500:
 *         description: Internal server error.
 */
exports.updateResource = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const translatedErrors = errors.array().map((error) => ({
                ...error,
                msg: req.t(error.msg),
            }));

            if (
                req.headers.accept &&
                req.headers.accept.includes('application/json')
            ) {
                return HttpResponse.badRequest(
                    res,
                    translatedErrors,
                    req.t('validation.errors'),
                );
            } else {
                res.locals.response = HttpResponse.badRequestResponse(
                    translatedErrors,
                    req.t('validation.errors'),
                );
                return next();
            }
        }

        const { filename, size, mimetype, path, category } = req.body;
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            if (
                req.headers.accept &&
                req.headers.accept.includes('application/json')
            ) {
                return HttpResponse.badRequest(
                    res,
                    [],
                    req.t('resource.resource_not_found'),
                );
            } else {
                res.locals.response = HttpResponse.badRequestResponse(
                    [],
                    req.t('resource.resource_not_found'),
                );
                return next();
            }
        }

        resource.filename = filename;
        resource.size = size;
        resource.mimetype = mimetype;
        resource.path = path;
        resource.category = category || 'system';

        await resource.save();

        if (
            req.headers.accept &&
            req.headers.accept.includes('application/json')
        ) {
            return HttpResponse.success(res, resource);
        } else {
            res.locals.response = HttpResponse.successResponse(resource);
            return next();
        }
    } catch (error) {
        console.log('[---Log---][---updateResource---]: ', error);
        if (
            req.headers.accept &&
            req.headers.accept.includes('application/json')
        ) {
            return HttpResponse.internalServerError(res);
        } else {
            res.locals.response = HttpResponse.internalServerErrorResponse();
            return next();
        }
    }
};

/**
 * @swagger
 * /api/resource/{id}:
 *   delete:
 *     summary: Delete a resource by ID
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The resource ID
 *     responses:
 *       200:
 *         description: Resource deleted successfully
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized access.
 *       403:
 *         description: Access forbidden.
 *       404:
 *         description: Resource not found.
 *       500:
 *         description: Internal server error.
 */
exports.deleteResource = async (req, res, next) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) {
            if (
                req.headers.accept &&
                req.headers.accept.includes('application/json')
            ) {
                return HttpResponse.badRequest(
                    res,
                    [],
                    req.t('resource.resource_not_found'),
                );
            } else {
                res.locals.response = HttpResponse.badRequestResponse(
                    [],
                    req.t('resource.resource_not_found'),
                );
                return next();
            }
        }

        // Check if the resource is being used in a blog as a banner
        const blogUsingResource = await Blog.findOne({ banner: req.params.id });
        if (blogUsingResource) {
            if (
                req.headers.accept &&
                req.headers.accept.includes('application/json')
            ) {
                return HttpResponse.badRequest(
                    res,
                    [],
                    req.t('resource.resource_in_use_blog'),
                );
            } else {
                res.locals.response = HttpResponse.badRequestResponse(
                    [],
                    req.t('resource.resource_in_use_blog'),
                );
                return next();
            }
        }

        // Check if the resource is being used in a product gallery
        const productUsingResource = await Product.findOne({
            product_gallery: req.params.id,
        });
        if (productUsingResource) {
            if (
                req.headers.accept &&
                req.headers.accept.includes('application/json')
            ) {
                return HttpResponse.badRequest(
                    res,
                    [],
                    req.t('resource.resource_in_use_product'),
                );
            } else {
                res.locals.response = HttpResponse.badRequestResponse(
                    [],
                    req.t('resource.resource_in_use_product'),
                );
                return next();
            }
        }

        await Resource.deleteOne({ _id: req.params.id });

        if (
            req.headers.accept &&
            req.headers.accept.includes('application/json')
        ) {
            return HttpResponse.success(res, { id: req.params.id });
        } else {
            res.locals.response = HttpResponse.successResponse({
                id: req.params.id,
            });
            return next();
        }
    } catch (error) {
        console.log('[---Log---][---deleteResource---]: ', error);
        if (
            req.headers.accept &&
            req.headers.accept.includes('application/json')
        ) {
            return HttpResponse.internalServerError(res);
        } else {
            res.locals.response = HttpResponse.internalServerErrorResponse();
            return next();
        }
    }
};

/**
 * @swagger
 * /api/resource/upload:
 *   post:
 *     summary: Upload multiple files
 *     tags: [Resources]
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
exports.uploadFiles = async (req, res, next) => {
    try {
        if (!req.files) {
            if (
                req.headers.accept &&
                req.headers.accept.includes('application/json')
            ) {
                return HttpResponse.badRequest(
                    res,
                    [],
                    req.t('resource.no_files_selected'),
                );
            } else {
                res.locals.response = HttpResponse.badRequestResponse(
                    [],
                    req.t('resource.no_files_selected'),
                );
                return next();
            }
        }

        const uploadedFiles = await ResourceService.uploadFiles(req, res);

        if (
            req.headers.accept &&
            req.headers.accept.includes('application/json')
        ) {
            return HttpResponse.success(
                res,
                uploadedFiles,
                req.t('resource.files_uploaded_successfully'),
            );
        } else {
            res.locals.response = HttpResponse.successResponse(
                uploadedFiles,
                req.t('resource.files_uploaded_successfully'),
            );
            return next();
        }
    } catch (error) {
        console.log('[---Log---][---uploadFiles---]: ', error);
        if (
            req.headers.accept &&
            req.headers.accept.includes('application/json')
        ) {
            return HttpResponse.internalServerError(res);
        } else {
            res.locals.response = HttpResponse.internalServerErrorResponse();
            return next();
        }
    }
};

/**
 * @swagger
 * /api/resource/{id}:
 *   delete:
 *     summary: Delete a file
 *     tags: [Resources]
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
exports.deleteFile = async (req, res, next) => {
    try {
        await ResourceService.deleteFile(req.params.id);

        if (
            req.headers.accept &&
            req.headers.accept.includes('application/json')
        ) {
            return HttpResponse.success(
                res,
                {},
                req.t('resource.file_deleted_successfully'),
            );
        } else {
            res.locals.response = HttpResponse.successResponse(
                {},
                req.t('resource.file_deleted_successfully'),
            );
            return next();
        }
    } catch (error) {
        console.log('[---Log---][---deleteFile---]: ', error);
        if (
            req.headers.accept &&
            req.headers.accept.includes('application/json')
        ) {
            return HttpResponse.internalServerError(res);
        } else {
            res.locals.response = HttpResponse.internalServerErrorResponse();
            return next();
        }
    }
};

/**
 * @swagger
 * /api/resource/get-files:
 *   get:
 *     summary: Get list of files in the uploads directory
 *     tags: [Resources]
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
exports.getStaticFiles = async (req, res, next) => {
    try {
        const files = await ResourceService.getStaticFiles();

        if (
            req.headers.accept &&
            req.headers.accept.includes('application/json')
        ) {
            return HttpResponse.success(res, files);
        } else {
            res.locals.response = HttpResponse.successResponse(files);
            return next();
        }
    } catch (error) {
        console.log('[---Log---][---getStaticFiles---]: ', error);
        if (
            req.headers.accept &&
            req.headers.accept.includes('application/json')
        ) {
            return HttpResponse.internalServerError(res);
        } else {
            res.locals.response = HttpResponse.internalServerErrorResponse();
            return next();
        }
    }
};

/**
 * @swagger
 * /api/resource/delete-files:
 *   post:
 *     summary: Delete a file or all files in the uploads directory
 *     tags: [Resources]
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
exports.deleteStaticFiles = async (req, res, next) => {
    try {
        const { filePath } = req.body;

        await ResourceService.deleteStaticFiles(filePath);

        if (
            req.headers.accept &&
            req.headers.accept.includes('application/json')
        ) {
            return HttpResponse.success(
                res,
                {},
                req.t('resource.static_files_deleted_successfully'),
            );
        } else {
            res.locals.response = HttpResponse.successResponse(
                {},
                req.t('resource.static_files_deleted_successfully'),
            );
            return next();
        }
    } catch (error) {
        console.log('[---Log---][---deleteStaticFiles---]: ', error);
        if (
            req.headers.accept &&
            req.headers.accept.includes('application/json')
        ) {
            return HttpResponse.internalServerError(res);
        } else {
            res.locals.response = HttpResponse.internalServerErrorResponse();
            return next();
        }
    }
};

/**
 * @swagger
 * /api/resource/download-urls:
 *   post:
 *     summary: Download files from a list of URLs
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               server_path:
 *                 type: string
 *                 description: The path of the file server
 *                 example: "https://thdaudio.com/img/products/ap200/description"
 *               urls:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Files downloaded successfully
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
 *         description: Bad request. Invalid input.
 *       500:
 *         description: Internal server error.
 */
exports.downloadFilesFromUrls = async (req, res, next) => {
    try {
        const { server_path, urls } = req.body;

        if (!Array.isArray(urls)) {
            if (
                req.headers.accept &&
                req.headers.accept.includes('application/json')
            ) {
                return HttpResponse.badRequest(
                    res,
                    [],
                    'URLs should be an array',
                );
            } else {
                res.locals.response = HttpResponse.badRequestResponse(
                    [],
                    'URLs should be an array',
                );
                return next();
            }
        }

        const downloadedFiles = await ResourceService.downloadFilesFromUrls(
            server_path,
            urls,
        );

        if (
            req.headers.accept &&
            req.headers.accept.includes('application/json')
        ) {
            return HttpResponse.success(
                res,
                { files: downloadedFiles },
                'Files downloaded successfully',
            );
        } else {
            res.locals.response = HttpResponse.successResponse(
                { files: downloadedFiles },
                'Files downloaded successfully',
            );
            return next();
        }
    } catch (error) {
        console.log('[---Log---][---downloadFilesFromUrls---]: ', error);
        if (
            req.headers.accept &&
            req.headers.accept.includes('application/json')
        ) {
            return HttpResponse.internalServerError(res);
        } else {
            res.locals.response = HttpResponse.internalServerErrorResponse();
            return next();
        }
    }
};
