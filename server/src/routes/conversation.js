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
        occupation:true,
        preferredTopics:true,
        preferredTopics:true,
        preferredContentType:true,
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


    const conversationHistory = previousQuestions.reverse();

    let conversationContext = '';
    if (conversationHistory.length > 0) {
      conversationContext = 'Previous conversation history:\n';
      conversationHistory.forEach((item, index) => {
        const timestamp = new Date(item.createdAt).toLocaleString();
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

    const prompt = `You are a highly supportive and knowledgeable AI English tutor designed to help students improve their English language skills efficiently and enjoyably.

Student Information:
- Name: **${safeUser.name}**
- Mother Tongue: **${safeUser.motherTongue}**
- English Proficiency Level: **${safeUser.englishLevel}**
- Learning Goal: **${safeUser.learningGoal}**
- Interests: **${safeUser.interests.join(", ") || "Various topics"}**
- Current Focus Areas: **${safeUser.focus}**
- Occupation: **${safeUser.occupation || "Not specified"}**
- Preferred Topics: **${safeUser.preferredTopics?.join(", ") || "General topics"}**
- Preferred Content Type: **${safeUser.preferredContentType || "Flexible"}**
- Preferred Tutoring Style/Voice: **${safeUser.voice}**

${conversationContext}

Instructions:
The student has asked the following question: "${message}"

Your task is to generate a structured JSON response in the following format:
{
  "success": true,
  "answer": "Short and clear answer to their question with proper explanation",
  "explanation": "A brief educational explanation related to their learning goal (including 1-2 examples where possible)",
  "feedback": "Supportive feedback on their question or English usage",
  "followUp": "A related follow-up question to encourage further conversation"
}

Guidelines:
- Keep the **answer** concise, friendly, and easy to understand.
- The **explanation** should offer educational value based on the student's level, focus areas, and preferred content type.
- Tailor the **feedback** to motivate the student positively, referencing their learning goal or focus.
- Suggest a **follow-up question** related to their interests, occupation, or preferred topics whenever possible.
- Reference prior conversation context when appropriate to create a sense of continuity.
- Ensure the style matches the student's preferred tutoring voice (e.g., supportive, encouraging, motivating).
- Output ONLY the raw JSON object. **Do not add markdown formatting, code blocks, or any extra text.**

Be highly engaging, empathetic, and educational while keeping the tone aligned with the student's profile.
`

    // Get the model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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
