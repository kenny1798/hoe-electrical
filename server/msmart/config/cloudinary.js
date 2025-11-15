const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

// Configure Cloudinary with credentials from .env
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure storage engine for Multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'msmart/form-images', // Folder name in Cloudinary
        format: async (req, file) => 'webp', // Automatically convert images to modern WebP format
        public_id: (req, file) => Date.now() + '-' + file.originalname.split('.')[0],
        transformation: [ // Automatically resize and compress images
            { width: 1080, height: 1080, crop: "limit", quality: "auto" }
        ]
    },
});

module.exports = {
    cloudinary,
    storage,
};