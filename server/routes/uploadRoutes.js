const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter (optional but good practice to limit to images)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload an image.'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// @route   POST /api/upload
// @desc    Upload an image
// @access  Private/Admin
router.post('/', authMiddleware, authorizeRoles('admin'), upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }

        // Construct complete URL for the uploaded file
        const protocol = req.protocol;
        const host = req.get('host');
        const imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

        res.status(200).json({
            success: true,
            imageUrl: imageUrl
        });
    } catch (error) {
        console.error('Upload Error:', error.message);
        res.status(500).json({ success: false, message: 'Server error during upload.' });
    }
});

module.exports = router;
