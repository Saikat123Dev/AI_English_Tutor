import { GoogleGenerativeAI } from "@google/generative-ai";
import express from 'express';
import { prisma } from "../lib/db.js";
const router = express.Router();

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/ask", async (req, res) => {
  try {
    const { email, message } = req.body;

    if (!email || !message) {
      return res.status(400).json({
        success: false,
        error: "email and message are required"
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        motherToung: true,
        englishLevel: true,
        learningGoal: true,
        interests: true,
        focus: true,
        voice: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    // Fetch previous questions and responses (most recent 5)
    const previousQuestions = await prisma.question.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5, // Retrieve last 5 conversations
      select: {
        userres: true,
        llmres: true,
        createdAt: true
      }
    });

    // Reverse to get chronological order
    const conversationHistory = previousQuestions.reverse();

    // Format conversation history for context
    let conversationContext = '';
    if (conversationHistory.length > 0) {
      conversationContext = 'Previous conversation history:\n';
      conversationHistory.forEach((item, index) => {
        const timestamp = new Date(item.createdAt).toLocaleString();
        // Try to parse the LLM response if it's in JSON format
        let formattedResponse = item.llmres;
        try {
          const parsed = JSON.parse(item.llmres);
          if (parsed.answer) {
            formattedResponse = parsed.answer;
            if (parsed.explanation) {
              formattedResponse += " " + parsed.explanation;
            }
          }
        } catch (e) {
          // If parsing fails, use the raw response
        }

        conversationContext += `[${timestamp}]\n`;
        conversationContext += `Student: ${item.userres}\n`;
        conversationContext += `Tutor: ${formattedResponse}\n\n`;
      });
    }

    // Handle potential null values with fallbacks
    const safeUser = {
      name: user.name || "Student",
      motherTongue: user.motherToung || "Unknown",
      englishLevel: user.englishLevel || "Intermediate",
      learningGoal: user.learningGoal || "General improvement",
      interests: user.interests || [],
      focus: user.focus || "General English skills",
      voice: user.voice || "Supportive and encouraging"
    };

    const prompt = `
      You are an AI English tutor helping a student learn English effectively.
      - The student's name is **${safeUser.name}**.
      - Their mother tongue is **${safeUser.motherTongue}**.
      - Their current English proficiency level is **${safeUser.englishLevel}**.
      - Their primary learning goal is **${safeUser.learningGoal}**.
      - Their interests include **${safeUser.interests.join?.(", ") || "various topics"}**.
      - They want to focus on **${safeUser.focus}**.
      - Your tutoring voice should be **${safeUser.voice}**.

      ${conversationContext}

      The student's current question is: "${message}"

      Provide a structured JSON response in the following format:
      {
        "success": true,
        "answer": "Concise and direct answer to their question",
        "explanation": "Brief educational content related to their learning goal (examples included)",
        "feedback": "A short constructive feedback on their question or English skills",
        "followUp": "A relevant follow-up question to keep the conversation going"
      }

      Guidelines for response:
      - Keep the **answer** short and clear.
      - The **explanation** should be concise, with 1-2 examples.
      - The **feedback** should be supportive and motivating.
      - The **followUp** should encourage further discussion.
      - Reference previous conversations when relevant to provide continuity.
      Make the response **engaging, educational, and user-friendly**.
      Important: Return only the JSON object without any markdown formatting or code blocks.
    `;

    // Get the model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the text response to JSON, handle potential formatting issues
    let jsonResponse;
    try {
      // Remove any potential markdown code block formatting
      const cleanedText = text.replace(/```json|```/g, '').trim();
      jsonResponse = JSON.parse(cleanedText);

      // Save the question and response to the database
      const savedQuestion = await prisma.question.create({
        data: {
          userres: message,
          llmres: cleanedText,
          userId: user.id
        }
      });

      // Add the question ID to the response
      jsonResponse.questionId = savedQuestion.id;

      // Return the parsed JSON directly
      res.json(jsonResponse);
    } catch (error) {
      console.error("Error parsing JSON response:", error);

      // Save the raw response if parsing fails
      const savedQuestion = await prisma.question.create({
        data: {
          userres: message,
          llmres: text,
          userId: user.id
        }
      });

      // If parsing fails, return the raw text
      res.json({
        success: true,
        response: text,
        questionId: savedQuestion.id
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message
    });
  }
});

export default router;
