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
      type: String,
      required: true
    },
    subject: {
      type: String,
      required: true
    },
    semester: {
      type: String,
      required: true
    },
    materialType: {
      type: String,
      enum: ["PDF", "Link"],
      default: "PDF"
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
