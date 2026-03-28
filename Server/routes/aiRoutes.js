const express = require("express");
const router = express.Router();
const { summarizeDocument, askDocument } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

// Route -> /api/ai

// Automatically summarize and save to document
router.route("/summarize/:documentId").post(protect, summarizeDocument);

// Ask a direct question about the document text
router.route("/ask/:documentId").post(protect, askDocument);

module.exports = router;
