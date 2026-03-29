const express = require('express');
const router = express.Router();
const { setRole, getMatches } = require('../controllers/peerController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/peer/set-role
// @desc    Set or update a user's role for a document
// @access  Private
router.post('/set-role', protect, setRole);

// @route   GET /api/peer/get-matches
// @desc    Get top 5 recent matches of opposite role for a document
// @access  Private
router.get('/get-matches', protect, getMatches);

module.exports = router;
