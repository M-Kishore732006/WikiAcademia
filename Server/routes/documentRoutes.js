const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const { upload, uploadDocument, getDocuments, downloadDocument, deleteDocument, updateDocument } = require("../controllers/documentController");
const { protect, authorize } = require("../middleware/authMiddleware");

const multer = require("multer");

const validateUpload = [
    check("title", "Title is required").not().isEmpty(),
    check("materialType", "Material type is required").not().isEmpty(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const multerUpload = upload.single("file");
const handleUploadError = (req, res, next) => {
    multerUpload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: "File size exceeds the 10MB limit. Please upload a smaller file." });
            }
            return res.status(400).json({ message: err.message });
        } else if (err) {
            return res.status(400).json({ message: err.message });
        }
        next();
    });
};

router.route("/")
    .post(protect, authorize("faculty", "admin"), handleUploadError, validateUpload, uploadDocument)
    .get(getDocuments);

router.route("/:id")
    .put(protect, authorize("faculty", "admin"), updateDocument)
    .delete(protect, authorize("faculty", "admin"), deleteDocument);

router.route("/:id/download").get(downloadDocument);

module.exports = router;
