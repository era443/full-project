const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');

// @route   GET /api/products
// @desc    Get all products
// @access  Public
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.json({
            success: true,
            count: products.length,
            products
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.json({ success: true, product });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/products
// @desc    Create a product
// @access  Private/Admin
router.post('/', authMiddleware, authorizeRoles('admin'), async (req, res) => {
    try {
        req.body.user = req.user.id; // Record who created it
        
        const product = await Product.create(req.body);

        res.status(201).json({
            success: true,
            product
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private/Admin
router.put('/:id', authMiddleware, authorizeRoles('admin'), async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        });

        res.status(200).json({
            success: true,
            product
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private/Admin
router.delete('/:id', authMiddleware, authorizeRoles('admin'), async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        await product.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Product deleted'
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/products/:id/review
// @desc    Create/Update review
// @access  Private
router.put('/:id/review', authMiddleware, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const productId = req.params.id;

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        const hasPurchased = await Order.findOne({
            user: req.user.id,
            'orderItems.product': productId
        });

        const user = await User.findById(req.user.id);

        const review = {
            user: req.user.id,
            name: user.name,
            rating: Number(rating),
            comment,
            purchased: !!hasPurchased
        };

        const isReviewed = product.reviews.find(r => r.user.toString() === req.user.id.toString());
        if (isReviewed) {
            product.reviews.forEach(r => {
                if (r.user.toString() === req.user.id.toString()) {
                    r.rating = rating;
                    r.comment = comment;
                    r.purchased = review.purchased;
                }
            });
        } else {
            product.reviews.push(review);
            product.numOfReviews = product.reviews.length;
        }

        product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

        await product.save({ validateBeforeSave: false });
        res.status(200).json({ success: true, message: 'Review added', product });
    } catch (err) {
        console.error("Review error:", err.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
