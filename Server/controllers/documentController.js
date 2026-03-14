const Document = require("../models/Document");
const mongoose = require("mongoose");
const upload = require("../config/gridfs");

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

        // We now use "File" instead of just "PDF" since we support PDFs, PPTs, ODFs
        if (materialType === "File") {
            if (!req.file) {
                return res.status(400).json({ message: "Please upload a document file" });
            }
            // Store Cloudinary secure_url for retrieval
            fileUrl = req.file.path;
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
        const { department, semester, subject, search, category, sort } = req.query;

        let query = {};

        if (department) query.department = department;
        if (semester) query.semester = semester;
        if (subject) query.subject = subject;
        if (category) query.category = category;

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { subject: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { semester: { $regex: search, $options: "i" } }
            ];
        }

        let sortOption = { createdAt: -1 }; // Default: Newest first
        
        if (sort === 'oldest') {
            sortOption = { createdAt: 1 };
        } else if (sort === 'a-z') {
            sortOption = { title: 1 };
        } else if (sort === 'z-a') {
            sortOption = { title: -1 };
        }

        const documents = await Document.find(query)
            .collation({ locale: "en", strength: 2 }) // Ensure case-insensitive alphabetical sorting
            .populate("uploadedBy", "name")
            .populate("category", "name") // Populate category
            .sort(sortOption);

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
                return res.json({ url: document.linkUrl });
            }

            // For "raw" files on free Cloudinary tiers, directly redirecting to the URL 
            // can sometimes trigger security headers or CORB issues that prevent the browser 
            // from embedding/viewing the PDF natively or cause it to download a 0-byte file.
            // The most robust way is to fetch the ArrayBuffer from Cloudinary on the backend 
            // and pipe it directly to the response with the correct headers.

            const axios = require('axios');

            try {
                const response = await axios({
                    method: 'GET',
                    url: document.fileUrl,
                    responseType: 'stream',
                });

                // Determine filename
                const parts = document.fileUrl.split('/');
                let rawFilename = parts.pop();
                if (!rawFilename.includes('.')) {
                    rawFilename += '.pdf';
                }
                const encodedFilename = encodeURIComponent(rawFilename);

                // Set headers so browser opens it natively
                res.setHeader('Content-Type', response.headers['content-type'] || 'application/pdf');
                res.setHeader('Content-Disposition', `inline; filename="${encodedFilename}"`);

                // Stream the data directly to the client
                response.data.pipe(res);
            } catch (streamError) {
                console.error("Error streaming from Cloudinary via axios:", streamError);
                require('fs').appendFileSync('log.txt', new Date().toISOString() + ' - ' + streamError.message + '\n' + (streamError.response ? JSON.stringify(streamError.response.headers) : '') + '\n');
                return res.status(500).json({ 
                    message: "Failed to fetch document from cloud storage.", 
                    error: streamError.message, 
                    code: streamError.code,
                    url: document.fileUrl
                });
            }

        } else {
            res.status(404).json({ message: "Document not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a document
// @route   DELETE /api/documents/:id
// @access  Private (Faculty/Admin)
const deleteDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        // Check if user is the one who uploaded it or if they are an admin
        if (document.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Not authorized to delete this document" });
        }

        // If it's a File (PDF, PPT, ODF), delete from Cloudinary
        if (document.materialType === "File" && document.fileUrl) {
            try {
                const cloudinary = require("cloudinary").v2;
                // Extract public_id from Cloudinary URL
                const parts = document.fileUrl.split('/');
                const filename = parts.pop(); // keep the extension!
                const folder = parts.pop(); // typically 'academic_documents'
                const public_id = `${folder}/${filename}`;

                // Cloudinary requires { resource_type: 'raw' } to delete non-image/video files
                await cloudinary.uploader.destroy(public_id, { resource_type: "raw" });
            } catch (cloudErr) {
                console.error("Cloudinary deletion error:", cloudErr);
                // Continue with database deletion even if cloud deletion fails
            }
        }

        await document.deleteOne();
        res.json({ message: "Document removed successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a document
// @route   PUT /api/documents/:id
// @access  Private (Faculty/Admin)
const updateDocument = async (req, res) => {
    try {
        const { title, description, department, subject, semester, linkUrl, category } = req.body;
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        // Check auth
        if (document.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Not authorized to update this document" });
        }

        let categoryId = document.category;
        if (category) {
            const Category = require("../models/Category");
            if (mongoose.Types.ObjectId.isValid(category)) {
                categoryId = category;
            } else {
                let cat = await Category.findOne({ name: category });
                if (!cat) {
                    cat = await Category.create({ name: category });
                }
                categoryId = cat._id;
            }
        }

        document.title = title || document.title;
        document.description = description || document.description;
        document.department = department || document.department;
        document.subject = subject || document.subject;
        document.semester = semester || document.semester;
        document.linkUrl = linkUrl || document.linkUrl;
        document.category = categoryId;

        const updatedDocument = await document.save();
        res.json(updatedDocument);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    upload, // Export the configured upload middleware
    uploadDocument,
    getDocuments,
    downloadDocument,
    deleteDocument,
    updateDocument
};
