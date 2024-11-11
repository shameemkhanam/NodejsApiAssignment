const multer = require('multer');

// Set storage options for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        return cb(null, './uploads/'); // Directory to store uploaded images
    },
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// File filter to allow only image files
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new CustomError('Only image files are allowed!', 400), false);
    }
};

// Initialize multer with storage and file filter options
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // Limit file size to 2MB
});

module.exports = upload; // Export both storage and fileUpload
