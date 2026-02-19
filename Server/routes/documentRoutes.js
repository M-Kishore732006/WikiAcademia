const express = require("express");
const router = express.Router();
const { upload, uploadDocument, getDocuments, downloadDocument } = require("../controllers/documentController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.route("/")
    .post(protect, authorize("faculty", "admin"), upload.single("file"), uploadDocument)
    .get(getDocuments);

router.route("/:id/download").get(downloadDocument);

module.exports = router;
