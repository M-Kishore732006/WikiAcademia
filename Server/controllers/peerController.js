const PeerRole = require('../models/PeerRole');

// @desc    Set or update a user's role (helper/learner) for a specific document
// @route   POST /api/peer/set-role
// @access  Private
exports.setRole = async (req, res) => {
  try {
    const { documentId, role } = req.body;
    const userId = req.user._id;

    if (!documentId || !role) {
      return res.status(400).json({ message: 'documentId and role are required' });
    }

    if (!['helper', 'learner'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be helper or learner.' });
    }

    // Upsert the role
    const peerRole = await PeerRole.findOneAndUpdate(
      { user: userId, documentId },
      { role },
      { new: true, upsert: true }
    );

    res.status(200).json({ message: 'Role saved successfully', peerRole });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get top 5 recent matches of the opposite role for a document
// @route   GET /api/peer/get-matches
// @access  Private
exports.getMatches = async (req, res) => {
  try {
    const { documentId, role } = req.query;
    const userId = req.user._id;

    if (!documentId || !role) {
      return res.status(400).json({ message: 'documentId and role query parameters are required' });
    }

    // Determine the opposite role we are looking for
    const targetRole = role === 'helper' ? 'learner' : 'helper';

    // Find up to 5 users with the target role on this document, excluding the current user
    const matches = await PeerRole.find({
      documentId,
      role: targetRole,
      user: { $ne: userId }
    })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate('user', 'name email'); // Populate the user's name and email

    // Fetch the latest question (top-level comment) for each match
    const Comment = require('../models/Comment');
    const matchesWithQuestions = await Promise.all(matches.map(async (match) => {
        const latestComment = await Comment.findOne({
            documentId,
            user: match.user._id,
            parentComment: null // top-level only
        }).sort({ createdAt: -1 });

        const matchObj = match.toObject();
        matchObj.latestQuestion = latestComment ? latestComment.content : 'No question yet';
        return matchObj;
    }));

    res.status(200).json(matchesWithQuestions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
