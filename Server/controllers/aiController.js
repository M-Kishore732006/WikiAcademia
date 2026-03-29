const { GoogleGenerativeAI } = require("@google/generative-ai");
const Document = require("../models/Document");
const axios = require("axios");
const pdfParse = require("pdf-parse");

// Helper function to extract text from a Cloudinary PDF fileUrl
const extractTextFromPDF = async (url) => {
    try {
        const response = await axios({
            url,
            responseType: "arraybuffer", // Important for passing to pdf-parse
        });
        const data = await pdfParse(response.data);
        return data.text;
    } catch (err) {
        console.error("PDF Extraction Error:", err);
        throw new Error("Could not extract text from document");
    }
};

// @desc    Generate and save a summary for a document
// @route   POST /api/ai/summarize/:documentId
// @access  Private
exports.summarizeDocument = async (req, res) => {
    try {
        const { documentId } = req.params;
        const document = await Document.findById(documentId);

        if (!document) return res.status(404).json({ message: "Document not found" });

        // If a summary already exists, just return it so we don't waste API calls
        if (document.summary && document.summary.length > 0) {
            return res.json({ summary: document.summary });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ message: "AI API Key is missing. Please configure GEMINI_API_KEY." });
        }

        // We only support Summarizing uploaded Files right now, assuming they are PDFs
        if (document.materialType !== "File" || !document.fileUrl) {
            return res.status(400).json({ message: "Can only summarize PDF files currently." });
        }

        const text = await extractTextFromPDF(document.fileUrl);

        // Limit text length to avoid token limits for basic models (chunking could be added later)
        const safeText = text.substring(0, 15000);

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });

        const prompt = `You are an academic assistant. Summarize the following educational material into 4 to 6 concise, highly important concept bullet points. Do not include introductory text, just provide the bullet points starting with a dash (-).\n\nText:\n${safeText}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const aiText = response.text();

        // Convert the string of bullet points into an array
        const bullets = aiText.split('\n')
            .filter(line => line.trim().length > 0)
            .map(line => line.replace(/^[-*•]\s*/, '').trim()); // remove leading dash/bullet

        document.summary = bullets;
        await document.save();

        res.json({ summary: bullets });

    } catch (error) {
        const is429 = error.message?.includes("429") || error.status === 429;
        res.status(is429 ? 429 : 500).json({
            message: is429
                ? "AI quota exceeded. Please try again later or contact the administrator."
                : error.message
        });
    }
};

// @desc    Ask a question about the document
// @route   POST /api/ai/ask/:documentId
// @access  Private
exports.askDocument = async (req, res) => {
    try {
        const { documentId } = req.params;
        const { question } = req.body;

        if (!question) return res.status(400).json({ message: "Question is required" });

        const document = await Document.findById(documentId);
        if (!document) return res.status(404).json({ message: "Document not found" });

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ message: "AI API Key is missing. Please configure GEMINI_API_KEY." });
        }

        if (document.materialType !== "File" || !document.fileUrl) {
            return res.status(400).json({ message: "Can only ask questions about PDF files currently." });
        }

        const text = await extractTextFromPDF(document.fileUrl);
        const safeText = text.substring(0, 15000); // Send the first 15k characters for context

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });

        const prompt = `You are a helpful teaching assistant helping a student understand their study material. Use the provided document text to answer their question accurately. If the answer is not in the text, you can use your general knowledge but mention that it wasn't in the provided document.\n\nDocument Text:\n${safeText}\n\nStudent Question:\n${question}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        res.json({ answer: response.text().trim() });

    } catch (error) {
        const is429 = error.message?.includes("429") || error.status === 429;
        res.status(is429 ? 429 : 500).json({
            message: is429
                ? "AI quota exceeded. Please try again later or contact the administrator."
                : error.message
        });
    }
};
