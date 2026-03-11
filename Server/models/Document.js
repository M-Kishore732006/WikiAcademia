const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String
    },
    department: {
      type: String
    },
    subject: {
      type: String
    },
    semester: {
      type: String
    },
    materialType: {
      type: String,
      enum: ["File", "Link"],
      default: "File"
    },
    fileUrl: {
      type: String
    },
    linkUrl: {
      type: String
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category"
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    downloads: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", documentSchema);
