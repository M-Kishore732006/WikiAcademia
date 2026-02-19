const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const path = require("path");
require("dotenv").config();

// Create storage engine
const storage = new GridFsStorage({
    url: process.env.MONGO_URI,
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            // Use crypto or random name if preferred, here using timestamp
            const filename = `${Date.now()}-${file.originalname}`;
            const fileInfo = {
                filename: filename,
                bucketName: "uploads" // Collection: uploads.files, uploads.chunks
            };
            resolve(fileInfo);
        });
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error("Error: PDFs Only!"));
        }
    }
});

module.exports = upload;
