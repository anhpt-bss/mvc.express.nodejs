const express = require('express');

const router = express.Router();

const HttpResponse = require('@services/httpResponse');

const Category = require('@models/category');
const Blog = require('@models/blog');
const Product = require('@models/product');

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

router.get('/about', async (req, res) => {

    const response = {};

    res.render('client/about', { response }, (error, html) => {
        if (error) {
            console.log('[---Log---][---client/about---]: ', error);
            return res.status(500).send(error.message);
        }

        // Pass the rendered content to the layout
        res.render('client/layout', {
            body: html,
            title: 'Giới Thiệu',
            currentUser: req.user,
        });
    });
});

router.get('/contact', async (req, res) => {

    const response = {};

    res.render('client/contact', { title: 'Liên Hệ', response }, (error, html) => {
        if (error) {
            console.log('[---Log---][---client/contact---]: ', error);
            return res.status(500).send(error.message);
        }

        // Pass the rendered content to the layout
        res.render('client/layout', {
            body: html,
            title: 'Liên Hệ',
            currentUser: req.user,
        });
    });
});

router.get('/:slug', async (req, res) => {
    const { slug } = req.params;
    const rootCategories = res.locals.app_categories;

    const category = await Category.findOne({ slug });

    if (!category) {
        return res.status(404).send('Category not found');
    }

    const findCategoryInRoot = async (categoryRootItem) => {
        if (categoryRootItem._id.toString() === category._id.toString()) {
            return categoryRootItem;
        }

        if (Array.isArray(categoryRootItem.sub_category)) {
            for (const subCategory of categoryRootItem.sub_category) {
                const foundCategory = await findCategoryInRoot(subCategory);
                if (foundCategory) {
                    return foundCategory;
                }
            }
        }

        return null;
    };

    let parentCategory = null;
    for (const rootCategory of rootCategories) {
        parentCategory = await findCategoryInRoot(rootCategory);
        if (parentCategory) {
            break;
        }
    }

    let blogs = [];
    let products = [];

    const findBlogsBySubCategories = async (categoryItem) => {
        const blogFound = await Blog.find({ category: categoryItem._id })
            .populate('category')
            .populate('banner');
    
        blogs = [...blogs, ...blogFound];
    
        if (Array.isArray(categoryItem.sub_category)) {
            for (const subCategory of categoryItem.sub_category) {
                await findBlogsBySubCategories(subCategory);
            }
        }
    };

    const findProductsBySubCategories = async (categoryItem) => {
        const productFound = await Product.find({ category: categoryItem._id })
            .populate('product_gallery')
            .populate('category');

        products = [...products, ...productFound];

        if (Array.isArray(categoryItem.sub_category)) {
            for (const subCategory of categoryItem.sub_category) {
                await findProductsBySubCategories(subCategory);
            }
        }
    };

    if (parentCategory) {
        await findProductsBySubCategories(parentCategory);
        await findBlogsBySubCategories(parentCategory);
    }

    const response = { category, blogs, products };

    res.render('client/category', { response }, (error, html) => {
        if (error) {
            console.error('[---Log---][---client/category---]: ', error);
            return res.status(500).send(error.message);
        }

        res.render('client/layout', {
            body: html,
            title: 'Liên Hệ',
            currentUser: req.user,
        });
    });
});

router.get('/product/:slug', async (req, res) => {
    const { slug } = req.params;

    const product = await Product.findOne({ slug }).populate('product_gallery')
        .populate('category');

    if (!product) {
        return res.status(404).send('Product not found');
    }

    const response = {product};

    res.render('client/product', { response }, (error, html) => {
        if (error) {
            console.log('[---Log---][---client/product---]: ', error);
            return res.status(500).send(error.message);
        }

        // Pass the rendered content to the layout
        res.render('client/layout', {
            body: html,
            title: product.product_name,
            currentUser: req.user,
        });
    });
});

router.get('/blog/:slug', async (req, res) => {
    const { slug } = req.params;

    const blog = await Blog.findOne({ slug }).populate('category')
        .populate('banner');

    if (!blog) {
        return res.status(404).send('Blog not found');
    }

    const response = {blog};

    res.render('client/blog', { response }, (error, html) => {
        if (error) {
            console.log('[---Log---][---client/blog---]: ', error);
            return res.status(500).send(error.message);
        }

        // Pass the rendered content to the layout
        res.render('client/layout', {
            body: html,
            title: 'Chi Tiết Blog',
            currentUser: req.user,
        });
    });
});

module.exports = router;
