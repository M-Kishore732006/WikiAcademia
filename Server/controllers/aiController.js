const Groq = require("groq-sdk");
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
        if (document.summary && typeof document.summary === 'object' && Object.keys(document.summary).length > 0) {
            return res.json({ summary: document.summary });
        }

        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({ message: "AI API Key is missing. Please configure GROQ_API_KEY." });
        }

        // We only support Summarizing uploaded Files right now, assuming they are PDFs
        if (document.materialType !== "File" || !document.fileUrl) {
            return res.status(400).json({ message: "Can only summarize PDF files currently." });
        }

        const text = await extractTextFromPDF(document.fileUrl);

        // Limit text length to avoid token limits for basic models (chunking could be added later)
        const safeText = text.substring(0, 15000);

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const prompt = `You are an AI tutor helping students understand academic content quickly and clearly.

Analyze the following lecture notes and generate a structured learning output.

Follow this format STRICTLY:

Topic:
(Identify the exact topic in one line)

Key Concepts:
- Point 1
- Point 2
- Point 3

Simple Explanation:
(Explain in very easy, beginner-friendly language)

Important Points:
- Key fact 1
- Key fact 2
- Key fact 3

Example:
(Give a simple real-world or exam-based example)

Flashcards:
Q1: ...
A1: ...
Q2: ...
A2: ...
Q3: ...
A3: ...

Difficulty Level:
(Easy / Medium / Hard)

Rules:
- Keep output clean and well-structured
- Do NOT add extra text outside this format
- Keep explanation simple and short
- Flashcards must be clear and useful for revision

Notes:
${safeText}

RETURN ONLY A VALID JSON OBJECT with the following keys exactly:
"topic" (string), "keyConcepts" (array of strings), "simpleExplanation" (string), "importantPoints" (array of strings), "example" (string), "flashcards" (array of objects with "question" and "answer" properties), "difficultyLevel" (string). Do not add any markdown formatting, code blocks like \`\`\`json, or explanatory text outside the JSON object.`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.2,
            response_format: { type: 'json_object' }
        });

        const aiText = chatCompletion.choices[0]?.message?.content || "{}";
        
        let parsedJson;
        try {
            parsedJson = JSON.parse(aiText);
        } catch(e) {
            console.error("Failed to parse JSON", aiText);
            throw new Error("AI returned invalid JSON structure.");
        }

        document.summary = parsedJson;
        await document.save();

        res.json({ summary: parsedJson });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
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

        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({ message: "AI API Key is missing. Please configure GROQ_API_KEY." });
        }

        if (document.materialType !== "File" || !document.fileUrl) {
            return res.status(400).json({ message: "Can only ask questions about PDF files currently." });
        }

        const text = await extractTextFromPDF(document.fileUrl);
        const safeText = text.substring(0, 15000); // Send the first 15k characters for context

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const prompt = `You are an expert teaching assistant helping a student thoroughly understand their study material. Use the provided document text as your foundation to answer their question. However, you are highly encouraged to draw upon your broad general knowledge to provide a comprehensive, well-rounded answer that covers slightly wider, related areas of the topic if it helps clarify the concept or provides useful real-world context. Seamlessly blend the document's information with your expanded knowledge without constantly stating things like "this is not in the provided text". \n\nIMPORTANT FORMATTING RULES:\n1. Be concise. Do not generate massive essays for simple questions.\n2. Keep your answer to 2-3 short, highly readable paragraphs unless explicitly asked for more detail.\n3. Use bullet points or numbered lists if you are listing 3 or more items.\n\nDocument Text:\n${safeText}\n\nStudent Question:\n${question}`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.5
        });

        const answer = chatCompletion.choices[0]?.message?.content || "Sorry, I could not generate an answer.";
        
        res.json({ answer: answer.trim() });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};
