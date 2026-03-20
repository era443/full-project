const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { authMiddleware } = require('../middleware/auth');

router.get('/key', (req, res) => {
    res.status(200).json({ key: process.env.RAZORPAY_KEY_ID || 'dummy_id_placeholder' });
});

router.post('/create-order', authMiddleware, async (req, res) => {
    try {
        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || 'dummy_id_placeholder',
            key_secret: process.env.RAZORPAY_SECRET,
        });

        const options = {
            amount: req.body.amount * 100, // amount in smallest currency unit (paise for INR)
            currency: "INR",
            receipt: `receipt_order_${Date.now()}`
        };

        const order = await instance.orders.create(options);

        if (!order) return res.status(500).send("Some error occured");

        res.json({ success: true, order });
    } catch (error) {
        console.error("Razorpay Create Order Error:", error);
        res.status(500).json({ success: false, message: error.error?.description || error.message || "Failed to create Razorpay Order" });
    }
});

router.post('/verify', authMiddleware, async (req, res) => {
    try {
        const {
            orderCreationId,
            razorpayPaymentId,
            razorpayOrderId,
            razorpaySignature,
        } = req.body;

        const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);
        shasum.update(`${orderCreationId}|${razorpayPaymentId}`);
        const digest = shasum.digest("hex");

        if (digest !== razorpaySignature) {
            return res.status(400).json({ success: false, msg: "Transaction not legit!" });
        }

        res.json({
            success: true,
            msg: "Payment successful",
            paymentId: razorpayPaymentId,
        });
    } catch (error) {
        console.error("Razorpay Verify Error:", error);
        res.status(500).send(error);
    }
});

module.exports = router;
