const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    is_verified: {
        type: Boolean,
        default: false
    },
    verify_token: {
        type: String,
        default: null
    },
    reset_token: {
        type: String,
        default: null
    },
    reset_token_expiry: {
        type: Date,
        default: null
    },
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    cart: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        price: Number,
        image: String,
        stock: Number,
        quantity: { type: Number, default: 1 }
    }]
}, {
    timestamps: true // Adds createdAt and updatedAt
});

module.exports = mongoose.model('User', userSchema);
