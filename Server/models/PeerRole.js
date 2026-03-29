const mongoose = require('mongoose');

const peerRoleSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
    },
    role: {
      type: String,
      enum: ['helper', 'learner'],
      required: true,
    },
  },
  { timestamps: true }
);

// Enforce one role per user per document
peerRoleSchema.index({ user: 1, documentId: 1 }, { unique: true });

module.exports = mongoose.model('PeerRole', peerRoleSchema);
