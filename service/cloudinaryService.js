const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const dotenv = require('dotenv');
const multer = require('multer');
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET
});

const cloudinaryStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'blogs/images',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'],
    }
});

const upload = multer({ storage: cloudinaryStorage });

module.exports = upload;