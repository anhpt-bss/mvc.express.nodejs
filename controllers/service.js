const HttpResponse = require('@services/httpResponse');
const Product = require('@models/product');
const Blog = require('@models/blog');
const Category = require('@models/category');

/**
 * @swagger
 * tags:
 *   name: Services
 *   description: API endpoints for services
 */

/**
 * @swagger
 * /api/service/global-search:
 *   get:
 *     summary: Global search across blogs, products, and categories
 *     tags: [Services]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query
 *     responses:
 *       200:
 *         description: Search results from blogs, products, and categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 blogs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Blog'
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 categories:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
exports.globalSearch = async (req, res, next) => {
    try {
        const { q } = req.query;
        if (!q) {
            return HttpResponse.badRequest(res, "Query parameter 'q' is required");
        }

        // Use a text search for the query
        const searchQuery = { $text: { $search: q } };

        // Search across Categories
        const categoryResults = await Category.find(searchQuery);

        // Search across Products
        const productResults = await Product.find(searchQuery).populate('category banner');

        // Search across Blogs
        const blogResults = await Blog.find(searchQuery).populate('category banner');

        // Add search_type field to each item and combine results into a single array
        const combinedResults = [
            ...categoryResults.map(item => ({ ...item.toObject(), search_type: 'category' })),
            ...productResults.map(item => ({ ...item.toObject(), search_type: 'product' })),
            ...blogResults.map(item => ({ ...item.toObject(), search_type: 'blog' })),
        ];

        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.success(res, combinedResults);
        } else {
            res.locals.response = HttpResponse.successResponse(combinedResults);
            return next();
        }

    } catch (error) {
        console.log('[---Log---][---globalSearch---]: ', error);
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return HttpResponse.internalServerError(res);
        } else {
            res.locals.response = HttpResponse.internalServerErrorResponse();
            return next();
        }
    }
};

// exports.globalSearch = async (req, res, next) => {
//     try {
//         const { q } = req.query;
//         if (!q) {
//             return HttpResponse.badRequest(res, "Query parameter 'q' is required");
//         }

//         const searchRegex = new RegExp(q, 'i'); // Case-insensitive search

//         // Search across Categories
//         const categoryResults = await Category.find({
//             $or: [
//                 { name: searchRegex },
//                 { description: searchRegex }
//             ]
//         });

//         // Search across Products
//         const productResults = await Product.find({
//             $or: [
//                 { product_code: searchRegex },
//                 { product_name: searchRegex },
//                 { product_summary: searchRegex },
//                 { manufacturer: searchRegex },
//                 { created_by: searchRegex }
//             ]
//         }).populate('category banner');

//         // Search across Blogs
//         const blogResults = await Blog.find({
//             $or: [
//                 { title: searchRegex },
//                 { summary: searchRegex },
//                 { content: searchRegex },
//                 { created_by: searchRegex }
//             ]
//         }).populate('category banner');

//         // Add search_type field to each item and combine results into a single array
//         const combinedResults = [
//             ...categoryResults.map(item => ({ ...item.toObject(), search_type: 'category' })),
//             ...productResults.map(item => ({ ...item.toObject(), search_type: 'product' })),
//             ...blogResults.map(item => ({ ...item.toObject(), search_type: 'blog' })),
//         ];

//         if (req.headers.accept && req.headers.accept.includes('application/json')) {
//             return HttpResponse.success(res, combinedResults);
//         } else {
//             res.locals.response = HttpResponse.successResponse(combinedResults);
//             return next();
//         }

//     } catch (error) {
//         console.log('[---Log---][---globalSearch---]: ', error);
//         if (req.headers.accept && req.headers.accept.includes('application/json')) {
//             return HttpResponse.internalServerError(res);
//         } else {
//             res.locals.response = HttpResponse.internalServerErrorResponse();
//             return next();
//         }
//     }
// };
