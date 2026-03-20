const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");
const { sendContactThankYouEmail } = require("../utils/email");

router.post("/", async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        if (!name || !email || !phone || !subject || !message)
            return res.status(400).json({ message: "All fields are required." });

        await Contact.create({
            name,
            email,
            phone,
            subject,
            message
        });

        let emailSent = true;
        try {
            await sendContactThankYouEmail(email, name);
        } catch (emailErr) {
            emailSent = false;
            console.error("Thank you email send failed (check EMAIL_USER / EMAIL_PASS in .env):", emailErr.message);
        }

        res.status(201).json({ message: "Your message has been sent! We'll get back to you soon." });
    } catch (error) {
        console.error("Contact error:", error);
        res.status(500).json({ message: "Something went wrong. Please try again." });
    }
});

module.exports = router;
