const Blog = require('@models/blog');
const ResourceService = require('@services/resource');
const { validationResult } = require('express-validator');
const HttpResponse = require('@services/httpResponse');

/**
 * @swagger
 * tags:
 *   name: Blogs
 *   description: API endpoints for managing blogs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Blog:
 *       type: object
 *       required:
 *         - title
 *         - summary
 *         - content
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the blog
 *         summary:
 *           type: string
 *           description: The summary of the blog
 *         banner:
 *           type: string
 *           description: The ID of the banner resource
 *         content:
 *           type: string
 *           description: The content of the blog
 *         category:
 *           type: string
 *           description: The category ID
 *         created_by:
 *           type: string
 *           description: The creator of the blog
 *         created_time:
 *           type: string
 *           format: date-time
 *           description: The creation time of the blog
 *       example:
 *         title: Blog Title
 *         summary: Blog Summary
 *         banner: 60b5ed725e5f5c1b4aef1a23
 *         content: Blog Content
 *         category: 60b5ed725e5f5c1b4aef1a23
 *         created_by: Admin
 *         created_time: 2021-05-31T14:48:00.000Z
 */

/**
 * @swagger
 * /api/blog/get-list:
 *   get:
 *     summary: Get all blogs
 *     tags: [Blogs]
 *     responses:
 *       200:
 *         description: List of blogs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Blog'
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
exports.getAllBlogs = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            sort = 'created_time',
            order = 'desc',
        } = req.query;

        const blogs = await Blog.find()
            .sort({ [sort]: order === 'asc' ? 1 : -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate('banner')
            .populate('category');

        const total = await Blog.countDocuments();

        const response = {
            data_list: blogs,
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
        console.log('[---Log---][---getAllBlogs---]: ', error);
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
 * /api/blog/create:
 *   post:
 *     summary: Create a new blog
 *     tags: [Blogs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Blog'
 *     responses:
 *       200:
 *         description: New blog created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
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
exports.createBlog = async (req, res, next) => {
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

        const { title, summary, content, category } = req.body;

        let bannerFile;
        if (req.files) {
            req.body.resource_category = 'Blog';
            bannerFile = await ResourceService.uploadFiles(req, res);
        }

        const blog = new Blog({
            title,
            summary,
            banner:
                bannerFile && bannerFile?.length > 0 ? bannerFile[0]._id : null,
            content,
            category,
        });

        await blog.save();

        if (
            req.headers.accept &&
            req.headers.accept.includes('application/json')
        ) {
            return HttpResponse.success(res, blog);
        } else {
            res.locals.response = HttpResponse.successResponse(blog);
            return next();
        }
    } catch (error) {
        console.log('[---Log---][---createBlog---]: ', error);
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
 * /api/blog/{id}:
 *   get:
 *     summary: Get a blog by ID
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The blog ID
 *     responses:
 *       200:
 *         description: Blog found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
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
exports.getBlogById = async (req, res, next) => {
    try {
        const blog = await Blog.findById(req.params.id).populate('banner');
        if (!blog) {
            if (
                req.headers.accept &&
                req.headers.accept.includes('application/json')
            ) {
                return HttpResponse.badRequest(
                    res,
                    [],
                    req.t('blog.blog_not_found'),
                );
            } else {
                res.locals.response = HttpResponse.badRequestResponse(
                    [],
                    req.t('blog.blog_not_found'),
                );
                return next();
            }
        }

        return HttpResponse.success(res, blog);
    } catch (error) {
        console.log('[---Log---][---getBlogById---]: ', error);
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
 * /api/blog/{id}:
 *   put:
 *     summary: Update a blog by ID
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The blog ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Blog'
 *     responses:
 *       200:
 *         description: Blog updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Blog'
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
exports.updateBlog = async (req, res, next) => {
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

        const { title, summary, content, category } = req.body;
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            if (
                req.headers.accept &&
                req.headers.accept.includes('application/json')
            ) {
                return HttpResponse.badRequest(
                    res,
                    [],
                    req.t('blog.blog_not_found'),
                );
            } else {
                res.locals.response = HttpResponse.badRequestResponse(
                    [],
                    req.t('blog.blog_not_found'),
                );
                return next();
            }
        }

        blog.title = title;
        blog.summary = summary;
        blog.content = content;
        blog.category = category;

        let bannerFile;
        if (req.files) {
            req.body.resource_category = 'Blog';
            bannerFile = await ResourceService.uploadFiles(req, res);
            blog.banner =
                bannerFile && bannerFile?.length > 0
                    ? bannerFile[0]._id
                    : blog.banner;
        }

        await blog.save();

        if (
            req.headers.accept &&
            req.headers.accept.includes('application/json')
        ) {
            return HttpResponse.success(res, blog);
        } else {
            res.locals.response = HttpResponse.successResponse(blog);
            return next();
        }
    } catch (error) {
        console.log('[---Log---][---updateBlog---]: ', error);
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
 * /api/blog/{id}:
 *   delete:
 *     summary: Delete a blog by ID
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The blog ID
 *     responses:
 *       200:
 *         description: Blog deleted successfully
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
exports.deleteBlog = async (req, res, next) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            if (
                req.headers.accept &&
                req.headers.accept.includes('application/json')
            ) {
                return HttpResponse.badRequest(
                    res,
                    [],
                    req.t('blog.blog_not_found'),
                );
            } else {
                res.locals.response = HttpResponse.badRequestResponse(
                    [],
                    req.t('blog.blog_not_found'),
                );
                return next();
            }
        }

        await Blog.deleteOne({ _id: req.params.id });

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
        console.log('[---Log---][---deleteBlog---]: ', error);
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
