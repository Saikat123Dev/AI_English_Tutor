import { Router } from "express";
import { prisma } from "../lib/db.js";

const router = Router();


router.get("/getHistory", async (req, res) => {
  const {email} = req.query;
  try {
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
            console.log(e);
        }

        conversationContext += `[${timestamp}]\n`;
        conversationContext += `Student: ${item.userres}\n`;
        conversationContext += `Tutor: ${formattedResponse}\n\n`;
      });
    }

    // Return the conversation history
    res.json({
      success: true,
      history: conversationHistory,
      context: conversationContext
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message
    });
  }
})
export default router;
