import { GoogleGenerativeAI } from "@google/generative-ai";
import express from "express";
import { prisma } from "../lib/db.js";
const router = express.Router();

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({
      where: { email},
      select: {
        name: true,
        motherToung: true, // Consider fixing this typo in your schema (motherToung → motherTongue)
        englishLevel: true,
        learningGoal: true,
        interests: true,
        focus: true
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Create a more structured prompt with explicit formatting instructions
    const prompt = `
You are an AI English tutor creating personalized questions for an English learner.

STUDENT PROFILE:
- Name: ${user.name}
- Native language: ${user?.motherToung || "Unknown"}
- English level: ${user?.englishLevel || "Intermediate"}
- Learning goal: ${user?.learningGoal || "General improvement"}
- Interests: ${user?.interests || "Various topics"}
- Focus area: ${user?.focus || "All-around practice"}

TASK:
Generate exactly 6 engaging and personalized questions for this student.
The questions should be tailored to their level, interests, and learning goals.

IMPORTANT GUIDELINES:
1. If their goal is speaking fluency, include conversational questions about their interests.
2. If their goal is grammar improvement, include questions that practice specific grammar points.
3. If their goal is vocabulary expansion, include questions that naturally introduce new vocabulary.
4. Ensure questions are appropriate for their English level.
5. Make questions friendly, encouraging, and relevant to their learning goals.

FORMAT YOUR RESPONSE AS A JSON ARRAY WITH EXACTLY 6 QUESTIONS:
[
  "First question that is personalized and relevant to their profile?",
  "Second question focusing on their learning goal?",
  "Third question related to their interests?",
  "Fourth question with appropriate difficulty for their level?",
  "Fifth question targeting their focus area?",
  "Sixth question that encourages them to express opinions or experiences?"
]

DO NOT include any text outside of the JSON array. Return ONLY the array of 6 questions.
`;

    // Get the model and generate content
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Parse the response to ensure it's valid JSON
    // This tries to extract a JSON array if the model didn't follow instructions perfectly
    try {
      // Clean up the text if it contains markdown code blocks or extra text
      if (text.includes("```json")) {
        text = text.split("```json")[1].split("```")[0].trim();
      } else if (text.includes("```")) {
        text = text.split("```")[1].split("```")[0].trim();
      }

      // Parse the JSON array
      const questions = JSON.parse(text);

      // Ensure we have exactly 6 questions
      if (!Array.isArray(questions) || questions.length !== 6) {
        throw new Error("Invalid response format");
      }

      res.json({
        success: true,
        questions: questions
      });
    } catch (parseError) {
      console.error("Error parsing model response:", parseError);
      // Fallback: If we can't parse the JSON, return a structured error
      res.status(500).json({
        success: false,
        error: "Failed to generate properly formatted questions",
        rawResponse: text
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
});

export default router;
