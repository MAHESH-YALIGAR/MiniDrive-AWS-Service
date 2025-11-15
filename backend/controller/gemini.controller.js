const fs = require("fs");
const path = require("path");
const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(express.json());

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

// Load your project guide (for context)
const docPath = path.join(process.cwd(), "docs", "project_guide.md");
const projectContext = fs.readFileSync(docPath, "utf8");

module.exports.gemini = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message is required" });
    }

    const prompt = `
You are MiniDrive’s official help assistant.
Answer only using the information below.
If the question is unrelated to MiniDrive, say:
"I can only answer MiniDrive-related questions."

Context:
${projectContext}

User question:
${message}
`;

    // Send prompt to Gemini
    const result = await model.generateContent(prompt);
    const reply = result?.response?.text() || "Sorry, I couldn't generate a response.";

    res.status(200).json({ answer: reply });

  } catch (error) {
    console.error("Error in Gemini controller:", error);

    // ✅ Handle free-tier quota limit
    if (
      error.message.includes("429") ||
      error.message.includes("Too Many Requests") ||
      error.message.includes("quota")
    ) {
      return res.status(429).json({
        error:
          "⚠️ Gemini free-tier quota reached. Please wait for 24 hours or enable billing in Google AI Studio to continue using AI help.",
      });
    }

    // Generic error fallback
    res.status(500).json({ error: "Something went wrong while contacting Gemini API." });
  }
};














// const fs = require("fs");
// const path = require("path");
// const Groq = require("groq-sdk");

// const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// let cachedProjectContext = null;

// const readProjectFiles = () => {
//   const projectContext = {};
  
//   const filesToRead = [
//     { path: "docs/project_guide.md", name: "Project Guide" },
//     { path: "docs/README.md", name: "README" },
//     { path: "docs/API.md", name: "API Documentation" },
//     { path: "docs/FEATURES.md", name: "Features" },
//   ];

//   filesToRead.forEach(({ path: filePath, name }) => {
//     try {
//       const fullPath = path.join(process.cwd(), filePath);
//       if (fs.existsSync(fullPath)) {
//         const content = fs.readFileSync(fullPath, "utf8");
//         projectContext[name] = content;
//         console.log(`✅ Loaded: ${name}`);
//       }
//     } catch (error) {
//       console.error(`❌ Error reading ${name}:`, error.message);
//     }
//   });

//   return projectContext;
// };

// const getProjectContext = () => {
//   if (!cachedProjectContext) {
//     cachedProjectContext = readProjectFiles();
//   }
//   return cachedProjectContext;
// };

// const formatContextForAI = (projectContext) => {
//   let formattedContext = "=== PROJECT DOCUMENTATION ===\n\n";
//   for (const [name, content] of Object.entries(projectContext)) {
//     formattedContext += `--- ${name} ---\n${content}\n\n`;
//   }
//   return formattedContext;
// };

// module.exports.aiChat = async (req, res) => {
//   try {
//     const { message } = req.body;

//     if (!message || message.trim() === "") {
//       return res.status(400).json({ error: "Message is required" });
//     }

//     const projectContext = getProjectContext();
//     const formattedContext = formatContextForAI(projectContext);

//     const systemPrompt = `You are MiniDrive's assistant.
// Use only the project documentation provided below to answer questions.
// Be helpful, concise, and professional.

// ${formattedContext}`;

//     const response = await groq.chat.completions.create({
//       messages: [
//         { role: "system", content: systemPrompt },
//         { role: "user", content: message }
//       ],
//       model: "mixtral-8x7b-32768",
//       max_tokens: 1024,
//       temperature: 0.7,
//     });

//     const reply = response.choices[0]?.message?.content;

//     res.status(200).json({ reply, success: true });
//   } catch (error) {
//     console.error("❌ Error:", error.message);
//     res.status(500).json({ error: "Failed to get response" });
//   }
// };

// module.exports.reloadContext = async (req, res) => {
//   cachedProjectContext = null;
//   const newContext = getProjectContext();
//   res.status(200).json({
//     message: "Context reloaded",
//     files: Object.keys(newContext)
//   });
// };