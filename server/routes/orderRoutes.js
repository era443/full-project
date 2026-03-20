const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
    try {
        const {
            orderItems,
            shippingInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            paymentInfo
        } = req.body;

        if (orderItems && orderItems.length === 0) {
            return res.status(400).json({ success: false, message: 'No order items' });
        } else {
            const order = new Order({
                orderItems,
                user: req.user.id,
                shippingInfo,
                itemsPrice,
                taxPrice,
                shippingPrice,
                totalPrice,
                paymentInfo,
                paidAt: paymentInfo && paymentInfo.status === 'Paid' ? Date.now() : undefined
            });

            const createdOrder = await order.save();
            
            // Deduct stock
            for (const item of orderItems) {
                const product = await Product.findById(item.product);
                if (product) {
                    product.stock -= item.quantity;
                    await product.save({ validateBeforeSave: false });
                }
            }

            res.status(201).json({ success: true, order: createdOrder });
        }
    } catch (err) {
        console.error("Order Creation Error:", err.message);
        res.status(500).json({ success: false, message: err.message || 'Server Error' });
    }
});

// @route   GET /api/orders/myorders
// @desc    Get logged in user orders
// @access  Private
router.get('/myorders', authMiddleware, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id });
        res.json({ success: true, orders });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Only admin or the user who created the order can view it
        if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
             return res.status(401).json({ success: false, message: 'Not authorized to view this order' });
        }

        res.json({ success: true, order });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/orders
// @desc    Get all orders
// @access  Private/Admin
router.get('/', authMiddleware, authorizeRoles('admin'), async (req, res) => {
    try {
        const orders = await Order.find().populate('user', 'id name email phone');
        
        let totalAmount = 0;
        orders.forEach(order => {
            totalAmount += order.totalPrice;
        });

        res.json({ success: true, totalAmount, orders });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private/Admin
router.put('/:id/status', authMiddleware, authorizeRoles('admin'), async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (order.orderStatus === 'Delivered') {
            return res.status(400).json({ success: false, message: 'You have already delivered this order' });
        }

        order.orderStatus = req.body.status;
        
        if (req.body.status === 'Delivered') {
            order.deliveredAt = Date.now();
        }

        await order.save();

        res.json({ success: true, order });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
