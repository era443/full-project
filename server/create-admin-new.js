const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const { connectDB } = require('./db/database');
const dotenv = require('dotenv');
const dns = require("dns");

// Sometimes required depending on specific network environments to resolve MongoDB Atlas DNS
dns.setServers(["8.8.8.8", "8.8.4.4"]);

dotenv.config();

const createNewAdmin = async () => {
    try {
        await connectDB();
        
        let admin = await User.findOne({ email: 'admintest@gmail.com' });
        if (admin) {
            console.log("Admin 'admintest@gmail.com' already exists. Updating password to 'Admin@123'...");
        } else {
            console.log("Admin 'admintest@gmail.com' not found. Creating new admin account...");
            admin = new User({
                name: 'Admin Test',
                email: 'admintest@gmail.com',
                phone: '1234567890',
                role: 'admin',
                is_verified: true,
                status: 'active'
            });
        }
        
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash('Admin@123', salt);
        
        await admin.save();
        console.log("Admin account successfully saved. Email: admintest@gmail.com, Password: Admin@123");
    } catch (error) {
        console.error("Error creating admin:", error);
    } finally {
        process.exit(0);
    }
};

createNewAdmin();
