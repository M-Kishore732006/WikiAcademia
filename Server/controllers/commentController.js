const Comment = require("../models/Comment");

// @desc    Get all top-level comments and their replies for a document
// @route   GET /api/comments/:documentId
// @access  Public
exports.getCommentsByDocument = async (req, res) => {
  try {
    const { documentId } = req.params;

    // Get all comments for the document
    const allComments = await Comment.find({ documentId })
      .populate("user", "name role") // Populate user details
      .sort({ createdAt: 1 }); // Sort chronologically initially

    if (!allComments) {
      return res.status(200).json([]);
    }

    // Separate top-level comments and replies
    const topLevelComments = allComments.filter((c) => !c.parentComment);
    const replies = allComments.filter((c) => c.parentComment);

    // Attach replies to their parent comments and calculate net score
    const formattedComments = topLevelComments.map((comment) => {
      const commentObj = comment.toObject();
      commentObj.netScore = comment.upvotes.length - comment.downvotes.length;
      
      commentObj.replies = replies
        .filter((r) => r.parentComment.toString() === comment._id.toString())
        .map((r) => {
           const rObj = r.toObject();
           rObj.netScore = r.upvotes.length - r.downvotes.length;
           return rObj;
        })
        // Sort replies chronologically
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      return commentObj;
    });

    // Sort top-level comments by pinned status, then net score, then chronologically
    formattedComments.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      if (b.netScore !== a.netScore) {
        return b.netScore - a.netScore;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json(formattedComments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Post a new top-level comment
// @route   POST /api/comments/:documentId
// @access  Private
exports.postComment = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    const comment = await Comment.create({
      documentId,
      user: req.user._id,
      content,
    });

    // Populate user before sending back so UI can display name instantly
    await comment.populate("user", "name role");

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reply to an existing comment
// @route   POST /api/comments/reply/:commentId
// @access  Private
exports.postReply = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      return res.status(404).json({ message: "Parent comment not found" });
    }

    const reply = await Comment.create({
      documentId: parentComment.documentId,
      user: req.user._id,
      content,
      parentComment: commentId,
    });

    await reply.populate("user", "name role");

    res.status(201).json(reply);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle Upvote / Downvote on a comment
// @route   PUT /api/comments/vote/:commentId
// @access  Private
exports.voteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { voteType } = req.body; // 'upvote' or 'downvote'
    const userId = req.user._id;

    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({ message: "Invalid vote type" });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const hasUpvoted = comment.upvotes.includes(userId);
    const hasDownvoted = comment.downvotes.includes(userId);

    if (voteType === 'upvote') {
      if (hasUpvoted) {
        // Toggle off upvote
        comment.upvotes.pull(userId);
      } else {
        // Add upvote, remove downvote if exists
        comment.upvotes.push(userId);
        if (hasDownvoted) comment.downvotes.pull(userId);
      }
    } else if (voteType === 'downvote') {
      if (hasDownvoted) {
        // Toggle off downvote
        comment.downvotes.pull(userId);
      } else {
        // Add downvote, remove upvote if exists
        comment.downvotes.push(userId);
        if (hasUpvoted) comment.upvotes.pull(userId);
      }
    }

    await comment.save();
    
    // Return updated comment with populated user
    await comment.populate("user", "name role");
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:commentId
// @access  Private
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check permissions: Owner, admin, or faculty
    if (
      comment.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin" &&
      req.user.role !== "faculty"
    ) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    // Delete the comment and all its replies if it's a top-level comment
    await Comment.deleteMany({ parentComment: comment._id });
    await comment.deleteOne();

    res.json({ message: "Comment removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Pin or unpin a comment
// @route   PUT /api/comments/pin/:commentId
// @access  Private (Admin/Faculty)
exports.pinComment = async (req, res) => {
  try {
    // Check permissions
    if (req.user.role !== "admin" && req.user.role !== "faculty") {
      return res.status(403).json({ message: "Not authorized to pin comments" });
    }

    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    
    // Only top level comments can be pinned
    if (comment.parentComment) {
      return res.status(400).json({ message: "Cannot pin a reply" });
    }

    comment.isPinned = !comment.isPinned;
    await comment.save();

    await comment.populate("user", "name role");
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
