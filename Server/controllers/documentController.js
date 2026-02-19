const Document = require("../models/Document");
const mongoose = require("mongoose");
const upload = require("../config/gridfs");

// Initialize GridFS Stream
let bucket;
mongoose.connection.once("open", () => {
    bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: "uploads"
    });
});

// @desc    Upload a document (PDF or Link)
// @route   POST /api/documents
// @access  Private (Faculty Only)
const uploadDocument = async (req, res) => {
    try {
        const {
            title,
            description,
            department,
            subject,
            semester,
            materialType,
            linkUrl,
            category // Can be ID or Name
        } = req.body;

        let fileUrl = "";

        if (materialType === "PDF") {
            if (!req.file) {
                return res.status(400).json({ message: "Please upload a PDF file" });
            }
            // Store filename for GridFS retrieval
            fileUrl = req.file.filename;
        } else if (materialType === "Link") {
            if (!linkUrl) {
                return res.status(400).json({ message: "Please provide a valid link" });
            }
        }

        // Handle Category (Find or Create)
        let categoryId = null;
        if (category) {
            const Category = require("../models/Category");

            if (mongoose.Types.ObjectId.isValid(category)) {
                categoryId = category;
            } else {
                // It's a name, find or create
                let cat = await Category.findOne({ name: category });
                if (!cat) {
                    cat = await Category.create({ name: category });
                }
                categoryId = cat._id;
            }
        }

        const document = await Document.create({
            title,
            description,
            department,
            subject,
            semester,
            materialType,
            fileUrl,
            linkUrl,
            category: categoryId,
            uploadedBy: req.user._id
        });

        res.status(201).json(document);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all documents with filtering
// @route   GET /api/documents
// @access  Public
const getDocuments = async (req, res) => {
    try {
        const { department, semester, subject, search, category } = req.query;

        let query = {};

        if (department) query.department = department;
        if (semester) query.semester = semester;
        if (subject) query.subject = subject;
        if (category) query.category = category;

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { subject: { $regex: search, $options: "i" } }
            ];
        }

        const documents = await Document.find(query)
            .populate("uploadedBy", "name")
            .populate("category", "name") // Populate category
            .sort({ createdAt: -1 });

        res.json(documents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Download a document (increment download count)
// @route   GET /api/documents/:id/download
// @access  Public
const downloadDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);

        if (document) {
            document.downloads = document.downloads + 1;
            await document.save();

            if (document.materialType === "Link") {
                // If expecting redirect, do redirect, or return JSON?
                // Depending on frontend. But usually download endpoint initiates download.
                // Since this is creating a blob on frontend, redirect might break blob?
                // But frontend handles it. 
                // Let's just send the link back or redirect if direct access.
                // However, for blob, we can't redirect.
                // Let's return the URL in JSON if requested via API, or redirect if via browser.
                // Current frontend expects blob stream.
                // Let's just send the text content of URL? No.
                return res.json({ url: document.linkUrl });
            }

            // Stream from GridFS
            if (!bucket) {
                return res.status(500).json({ message: "GridFS not initialized" });
            }

            const downloadStream = bucket.openDownloadStreamByName(document.fileUrl);

            downloadStream.on("error", (err) => {
                return res.status(404).json({ message: "File not found" });
            });

            res.set("Content-Type", "application/pdf");
            res.set("Content-Disposition", `attachment; filename="${document.title}.pdf"`);

            downloadStream.pipe(res);
        } else {
            res.status(404).json({ message: "Document not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    upload, // Export the configured upload middleware
    uploadDocument,
    getDocuments,
    downloadDocument
};
