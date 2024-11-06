const Product = require('@models/product');
const { validationResult } = require('express-validator');
const HttpResponse = require('@services/httpResponse');
const ResourceService = require('@services/resource');

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: API endpoints for managing products
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - product_name
 *         - product_summary
 *         - product_quantity
 *         - product_gallery
 *         - banner
 *         - category
 *       properties:
 *         product_name:
 *           type: string
 *           description: The name of the product
 *         product_summary:
 *           type: string
 *           description: The summary of the product
 *         product_price:
 *           type: number
 *           description: The price of the product
 *         product_discount:
 *           type: number
 *           description: The discount on the product
 *         product_quantity:
 *           type: number
 *           description: The quantity of the product
 *         shipping_fee:
 *           type: number
 *           description: The shipping fee for the product
 *         product_gallery:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *           description: The gallery of the product
 *         product_code:
 *           type: string
 *           description: The code of the product
 *         product_specifications:
 *           type: string
 *           description: The specifications of the product
 *         product_description:
 *           type: string
 *           description: The description of the product
 *         manufacturer:
 *           type: string
 *           description: The manufacturer of the product
 *         slug:
 *           type: string
 *           description: The slug of the product
 *         banner:
 *           type: string
 *           format: uuid
 *           description: The banner of the product
 *         category:
 *           type: string
 *           format: uuid
 *           description: The category of the product
 *         created_by:
 *           type: string
 *           description: The creator of the product
 *         created_time:
 *           type: string
 *           format: date-time
 *           description: The creation time of the product
 *       example:
 *         product_name: Example Product
 *         product_summary: This is an example product.
 *         product_price: 100
 *         product_discount: 10
 *         product_quantity: 50
 *         shipping_fee: 5
 *         product_gallery: ["60d21b4667d0d8992e610c85"]
 *         product_code: EX123
 *         product_specifications: Example specifications
 *         product_description: Example description
 *         manufacturer: Example Manufacturer
 *         slug: example-product
 *         banner: 60d21b4667d0d8992e610c86
 *         category: 60d21b4667d0d8992e610c87
 *         created_by: Admin
 *         created_time: 2023-07-10T10:00:00.000Z
 */

/**
 * @swagger
 * /api/product/get-list:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Access forbidden
 *       404:
 *         description: Resource not found
 *       500:
 *         description: Internal server error
 */
exports.getAllProducts = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, sort = 'created_time', order = 'desc' } = req.query;

        const products = await Product.find()
            .sort({ [sort]: order === 'asc' ? 1 : -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate('category');

        const total = await Product.countDocuments();

        const response = {
            data_list: products,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            sort,
            order,
        };

        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.success(res, response);
        } else {
            res.locals.response = HttpResponse.successResponse(response);
            return next();
        }
    } catch (error) {
        console.log('[---Log---][---getAllProducts---]: ', error);
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.internalServerError(res);
        } else {
            res.locals.response = HttpResponse.internalServerErrorResponse();
            return next();
        }
    }
};

/**
 * @swagger
 * /api/product/create:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: New product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized access
 *       403:
 *         description: Access forbidden
 *       404:
 *         description: Resource not found
 *       500:
 *         description: Internal server error
 */
exports.createProduct = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const translatedErrors = errors.array().map((error) => ({
                ...error,
                msg: req.t(error.msg),
            }));

            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return HttpResponse.badRequest(res, translatedErrors, req.t('validation.errors'));
            } else {
                res.locals.response = HttpResponse.badRequestResponse(translatedErrors, req.t('validation.errors'));
                return next();
            }
        }

        const {
            product_name,
            product_summary,
            product_price,
            product_discount,
            product_quantity,
            shipping_fee,
            product_code,
            product_specifications,
            product_description,
            manufacturer,
            banner,
            category,
        } = req.body;

        let galleryFiles = [];
        if (req.files) {
            req.body.resource_category = 'Sản Phẩm';
            galleryFiles = await ResourceService.uploadFiles(req, res);
        }

        const product = new Product({
            product_name,
            product_summary,
            product_price,
            product_discount,
            product_quantity,
            shipping_fee,
            product_gallery: galleryFiles.map((item) => item._id),
            product_code,
            product_specifications,
            product_description,
            manufacturer,
            banner,
            category,
        });

        await product.save();

        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.success(res, product);
        } else {
            res.locals.response = HttpResponse.successResponse(product);
            return next();
        }
    } catch (error) {
        console.log('[---Log---][---createProduct---]: ', error);
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.internalServerError(res);
        } else {
            res.locals.response = HttpResponse.internalServerErrorResponse();
            return next();
        }
    }
};

/**
 * @swagger
 * /api/product/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *     responses:
 *       200:
 *         description: Product found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad request. Invalid ID.
 *       401:
 *         description: Unauthorized access.
 *       403:
 *         description: Access forbidden.
 *       404:
 *         description: Resource not found.
 *       500:
 *         description: Internal server error.
 */
exports.getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return HttpResponse.badRequest(res, [], req.t('product.product_not_found'));
            } else {
                res.locals.response = HttpResponse.badRequestResponse([], req.t('product.product_not_found'));
                return next();
            }
        }

        return HttpResponse.success(res, product);
    } catch (error) {
        console.log('[---Log---][---getProductById---]: ', error);
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.internalServerError(res);
        } else {
            res.locals.response = HttpResponse.internalServerErrorResponse();
            return next();
        }
    }
};

/**
 * @swagger
 * /api/product/{id}:
 *   put:
 *     summary: Update a product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad request. Invalid data.
 *       401:
 *         description: Unauthorized access.
 *       403:
 *         description: Access forbidden.
 *       404:
 *         description: Resource not found.
 *       500:
 *         description: Internal server error.
 */
exports.updateProduct = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const translatedErrors = errors.array().map((error) => ({
                ...error,
                msg: req.t(error.msg),
            }));

            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return HttpResponse.badRequest(res, translatedErrors, req.t('validation.errors'));
            } else {
                res.locals.response = HttpResponse.badRequestResponse(translatedErrors, req.t('validation.errors'));
                return next();
            }
        }

        const {
            product_name,
            product_summary,
            product_price,
            product_discount,
            product_quantity,
            shipping_fee,
            product_gallery,
            product_code,
            product_specifications,
            product_description,
            manufacturer,
            banner,
            category,
        } = req.body;

        const product = await Product.findById(req.params.id);

        if (!product) {
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return HttpResponse.badRequest(res, [], req.t('product.product_not_found'));
            } else {
                res.locals.response = HttpResponse.badRequestResponse([], req.t('product.product_not_found'));
                return next();
            }
        }

        product.product_name = product_name;
        product.product_summary = product_summary;
        product.product_price = product_price;
        product.product_discount = product_discount;
        product.product_quantity = product_quantity;
        product.shipping_fee = shipping_fee;
        product.product_code = product_code;
        product.product_specifications = product_specifications;
        product.product_description = product_description;
        product.manufacturer = manufacturer;
        product.banner = banner;
        product.category = category;

        let galleryFiles = [];
        if (req.files) {
            req.body.resource_category = 'Sản Phẩm';
            galleryFiles = await ResourceService.uploadFiles(req, res);
            product.product_gallery =
                galleryFiles && galleryFiles?.length > 0
                    ? galleryFiles.map((item) => item._id)
                    : product.product_gallery;
        }

        await product.save();

        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.success(res, product);
        } else {
            res.locals.response = HttpResponse.successResponse(product);
            return next();
        }
    } catch (error) {
        console.log('[---Log---][---updateProduct---]: ', error);
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.internalServerError(res);
        } else {
            res.locals.response = HttpResponse.internalServerErrorResponse();
            return next();
        }
    }
};

/**
 * @swagger
 * /api/product/{id}:
 *   delete:
 *     summary: Delete a product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       400:
 *         description: Bad request. Invalid ID.
 *       401:
 *         description: Unauthorized access.
 *       403:
 *         description: Access forbidden.
 *       404:
 *         description: Resource not found.
 *       500:
 *         description: Internal server error.
 */
exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return HttpResponse.badRequest(res, [], req.t('product.product_not_found'));
            } else {
                res.locals.response = HttpResponse.badRequestResponse([], req.t('product.product_not_found'));
                return next();
            }
        }

        await Product.deleteOne({ _id: req.params.id });

        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.success(res, { id: req.params.id });
        } else {
            res.locals.response = HttpResponse.successResponse({
                id: req.params.id,
            });
            return next();
        }
    } catch (error) {
        console.log('[---Log---][---deleteProduct---]: ', error);
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.internalServerError(res);
        } else {
            res.locals.response = HttpResponse.internalServerErrorResponse();
            return next();
        }
    }
};
