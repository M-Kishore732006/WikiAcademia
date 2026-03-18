const multer = require("multer");
const path = require("path");

// Use memory storage to buffer the file directly in the server's RAM
// This completely removes the need for intermediate Cloudinary storage wrappers
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10 MB limit
    },
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf|odf|ppt|pptx/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        // Check the extension strictly to prevent corrupt file types
        if (extname) {
            cb(null, true);
        } else {
            cb(new Error("Error: Unsupported file format! Please upload PDF, ODF, PPT, or PPTX."));
        }
    }
});

module.exports = upload;
