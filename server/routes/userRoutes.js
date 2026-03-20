const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');

// @route   GET /api/users
// @desc    Get all users
// @access  Private/Admin
router.get('/', authMiddleware, authorizeRoles('admin'), async (req, res) => {
    try {
        const users = await User.find().select('-password -verify_token -reset_token');
        res.json({ success: true, users });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            user.name = req.body.name || user.name;
            user.phone = req.body.phone || user.phone;
            
            if (req.body.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(req.body.password, salt);
            }
            
            await user.save();
            res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (err) {
        console.error("Profile Update Error:", err.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private/Admin
router.get('/:id', authMiddleware, authorizeRoles('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/users/:id
// @desc    Update user (e.g., role)
// @access  Private/Admin
router.put('/:id', authMiddleware, authorizeRoles('admin'), async (req, res) => {
    try {
        const newUserData = {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            role: req.body.role,
            status: req.body.status,
        };

        const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        }).select('-password');

        res.status(200).json({ success: true, user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/:id', authMiddleware, authorizeRoles('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await user.deleteOne();

        res.status(200).json({ success: true, message: 'User deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/users/wishlist
// @desc    Get user wishlist
// @access  Private
router.get('/wishlist', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('wishlist');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        
        res.status(200).json({ success: true, wishlist: user.wishlist });
    } catch (err) {
        console.error("Fetch wishlist error:", err.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   PUT /api/users/wishlist
// @desc    Update user wishlist (sync)
// @access  Private
router.put('/wishlist', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        
        // Extract array of object IDs from the payload
        const newWishlist = req.body.wishlist.map(item => item._id || item.id || item);
        user.wishlist = newWishlist;
        
        await user.save();
        res.status(200).json({ success: true, wishlist: user.wishlist });
    } catch (err) {
        console.error("Update wishlist error:", err.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   GET /api/users/cart
// @desc    Get user cart
// @access  Private
router.get('/cart', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        
        res.status(200).json({ success: true, cart: user.cart });
    } catch (err) {
        console.error("Fetch cart error:", err.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   PUT /api/users/cart
// @desc    Update user cart (sync)
// @access  Private
router.put('/cart', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        
        user.cart = req.body.cart || [];
        
        await user.save();
        res.status(200).json({ success: true, cart: user.cart });
    } catch (err) {
        console.error("Update cart error:", err.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
