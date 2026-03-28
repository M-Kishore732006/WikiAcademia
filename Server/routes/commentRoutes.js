const express = require("express");
const router = express.Router();
const {
  getCommentsByDocument,
  postComment,
  postReply,
  voteComment,
  deleteComment,
  pinComment
} = require("../controllers/commentController");
const { protect } = require("../middleware/authMiddleware");

// Route -> /api/comments

// Get all comments for a document (Public/Protected depending on document visibility, but kept simple here)
router.route("/:documentId").get(getCommentsByDocument);

// Post a top-level comment
router.route("/:documentId").post(protect, postComment);

// Post a reply to an existing comment
router.route("/reply/:commentId").post(protect, postReply);

// Toggle upvote/downvote
router.route("/vote/:commentId").put(protect, voteComment);

// Delete a comment
router.route("/:commentId").delete(protect, deleteComment);

// Pin a comment
router.route("/pin/:commentId").put(protect, pinComment);

module.exports = router;
