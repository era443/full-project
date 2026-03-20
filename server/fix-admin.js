const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const { connectDB } = require('./db/database');
const dotenv = require('dotenv');
const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

dotenv.config();

const fixAdmin = async () => {
    await connectDB();
    const admin = await User.findOne({ email: 'adminseeder@example.com' });
    if (admin) {
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash('password123', salt);
        await admin.save();
        console.log("Admin password hashed and fixed. Try 'adminseeder@example.com' and 'password123' now.");
    } else {
        console.log("Admin not found.");
    }
    process.exit(0);
};

fixAdmin();
