const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const { authMiddleware } = require("../middleware/auth");
const { sendVerificationEmail, sendPasswordResetEmail } = require("../utils/email");

function createToken(user) {
    return jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
}

router.post("/register", async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        if (!name || !email || !phone || !password)
            return res.status(400).json({ message: "All fields are required." });

        if (password.length < 6)
            return res.status(400).json({ message: "Password must be at least 6 characters." });

        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(409).json({ message: "An account with this email already exists." });

        const hashedPassword = await bcrypt.hash(password, 10);
        const verifyToken = crypto.randomBytes(32).toString("hex");

        const newUser = await User.create({
            name,
            email,
            phone,
            password: hashedPassword,
            verify_token: verifyToken
        });

        let emailSent = true;
        try {
            await sendVerificationEmail(email, verifyToken);
        } catch (emailErr) {
            emailSent = false;
            console.error("Email send failed (check EMAIL_USER / EMAIL_PASS in .env):", emailErr.message);
        }

        res.status(201).json({
            message: emailSent
                ? "Account created! Please check your email to verify your account before logging in."
                : "Account created! Email sending failed — check server .env email config. For now, use the verify link printed in the server console.",
            verifyToken: emailSent ? undefined : verifyToken,
        });
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ message: "Something went wrong. Please try again." });
    }
});

router.get("/verify-email/:token", async (req, res) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({ verify_token: token, is_verified: false });

        if (!user)
            return res.status(400).json({ message: "Invalid or already used verification link." });

        user.is_verified = true;
        user.verify_token = null;
        await user.save();

        res.status(200).json({ message: "Email verified successfully! You can now login." });
    } catch (error) {
        console.error("Verify email error:", error);
        res.status(500).json({ message: "Something went wrong." });
    }
});

router.post("/resend-verification", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email)
            return res.status(400).json({ message: "Email is required." });

        const user = await User.findOne({ email });

        if (!user)
            return res.status(404).json({ message: "No account found with this email." });

        if (user.is_verified)
            return res.status(400).json({ message: "This account is already verified. You can login." });

        const newToken = crypto.randomBytes(32).toString("hex");
        user.verify_token = newToken;
        await user.save();

        let emailSent = true;
        try {
            await sendVerificationEmail(email, newToken);
        } catch (emailErr) {
            emailSent = false;
            console.error("Resend verification email failed:", emailErr.message);
            console.log("Manual verify token for", email, ":", newToken);
        }

        res.status(200).json({
            message: emailSent
                ? "Verification email resent! Please check your inbox."
                : "Email sending failed. Check server .env email config.",
            verifyToken: emailSent ? undefined : newToken,
        });
    } catch (error) {
        console.error("Resend verification error:", error);
        res.status(500).json({ message: "Something went wrong. Please try again." });
    }
});


router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ message: "Email and password are required." });

        const user = await User.findOne({ email });

        if (!user)
            return res.status(401).json({ message: "Invalid email or password." });

        if (!user.is_verified)
            return res.status(403).json({ message: "Please verify your email before logging in. Check your inbox." });

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect)
            return res.status(401).json({ message: "Invalid email or password." });

        const token = createToken(user);
        res.status(200).json({
            message: "Login successful!",
            token,
            user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Something went wrong. Please try again." });
    }
});

router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email)
            return res.status(400).json({ message: "Email is required." });

        const user = await User.findOne({ email });

        if (!user)
            return res.status(200).json({ message: "If this email exists, a reset link has been sent." });

        const resetToken = crypto.randomBytes(32).toString("hex");
        const expiry = new Date(Date.now() + 60 * 60 * 1000);

        user.reset_token = resetToken;
        user.reset_token_expiry = expiry;
        await user.save();

        let emailSent = true;
        try {
            await sendPasswordResetEmail(email, resetToken);
        } catch (emailErr) {
            emailSent = false;
            console.error("Email send failed (check EMAIL_USER / EMAIL_PASS in .env):", emailErr.message);
        }

        res.status(200).json({
            message: emailSent
                ? "Password reset link sent to your email."
                : "Email sending failed — check .env email config. Reset token printed in server console.",
            resetToken: emailSent ? undefined : resetToken,
        });
    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ message: "Something went wrong. Please try again." });
    }
});

router.post("/reset-password", async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || !password)
            return res.status(400).json({ message: "Token and new password are required." });

        if (password.length < 6)
            return res.status(400).json({ message: "Password must be at least 6 characters." });

        const user = await User.findOne({
            reset_token: token,
            reset_token_expiry: { $gt: Date.now() }
        });

        if (!user)
            return res.status(400).json({ message: "Reset link is invalid or has expired. Please request a new one." });

        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword;
        user.reset_token = null;
        user.reset_token_expiry = null;
        await user.save();

        res.status(200).json({ message: "Password reset successfully! You can now login." });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ message: "Something went wrong. Please try again." });
    }
});

router.get("/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password -verify_token -reset_token -reset_token_expiry");
        if (!user) return res.status(404).json({ message: "User not found." });
        res.status(200).json({ user });
    } catch (error) {
        console.error("Me error:", error);
        res.status(500).json({ message: "Something went wrong." });
    }
});

module.exports = router;
