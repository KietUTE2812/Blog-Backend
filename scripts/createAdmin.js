const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_FULLNAME = process.env.ADMIN_FULLNAME;
const ADMIN_BIO = process.env.ADMIN_BIO;

const createAdminUser = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/personal-blog', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('Connected to MongoDB');

        // Check if admin user already exists
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            console.log('Admin user already exists:', existingAdmin.username);
            process.exit(0);
        }

        // Create admin user
        const adminUser = new User({
            username: ADMIN_USERNAME,
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            fullName: ADMIN_FULLNAME,
            bio: ADMIN_BIO,
            role: 'admin',
            isActive: true
        });

        await adminUser.save();

        console.log('Admin user created successfully!');
        console.log('Username: ', ADMIN_USERNAME);
        console.log('Email: ', ADMIN_EMAIL);
        console.log('Password: ', ADMIN_PASSWORD);
        console.log('\n⚠️  IMPORTANT: Change the password after first login!');

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
};

createAdminUser(); 