const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const path = require("path");
require("dotenv").config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create Cloudinary storage engine
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // Extract the original extension and base name
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');

        return {
            folder: 'academic_documents',
            resource_type: 'raw', // Important for handling non-standard image/video formats properly (like PDF, PPT)
            // Explicitly appending the extension to public_id is required for 'raw' files
            public_id: `${name}_${Date.now()}${ext}`
        };
    },
});

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10 MB limit
    },
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf|odf|ppt|pptx/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        // Mimetypes for these can be tricky, so checking extname is usually safer alongside a loose mimetype check
        if (extname) {
            cb(null, true);
        } else {
            cb(new Error("Error: Unsupported file format! Please upload PDF, ODF, PPT, or PPTX."));
        }
    }
});

module.exports = upload;
