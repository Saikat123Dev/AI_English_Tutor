import { GoogleGenerativeAI } from "@google/generative-ai";
import express from 'express';
import { prisma } from "../lib/db.js";
const router = express.Router();

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Fixed delete route
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.query;
    console.log(id,email);
    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Message ID is required"
      });
    }

    // Convert id to integer explicitly
    const messageId = id


    // Verify the user owns this message if email is provided
    if (email) {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found"
        });
      }

      const question = await prisma.question.findUnique({
        where: { id: messageId }, // Now using the properly converted integer ID
        select: { userId: true }
      });

      if (!question) {
        return res.status(404).json({
          success: false,
          error: "Message not found"
        });
      }

      if (question.userId !== user.id) {
        return res.status(403).json({
          success: false,
          error: "You don't have permission to delete this message"
        });
      }
    }

    // Delete the message
    await prisma.question.delete({
      where: { id: messageId } // Now using the properly converted integer ID
    });

    return res.json({
      success: true,
      message: "Message deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message
    });
  }
});

// Fixed update route with proper handling of LLM responses
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { email, content, generateNewResponse = false } = req.body;
    console.log(email);
    if (!id || !content) {
      return res.status(400).json({
        success: false,
        error: "Message ID and content are required"
      });
    }

    // Convert id to integer explicitly
    const messageId =id;
    console.log(messageId);
    // Check if the id is a valid number


    // Verify the user owns this message
    if (email) {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true }
      });
     console.log(user);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found"
        });
      }

      const question = await prisma.question.findUnique({
        where: { id: messageId },
        select: {
          userId: true,
          llmres: true,
          userres: true
        }
      });

      if (!question) {
        return res.status(404).json({
          success: false,
          error: "Message not found"
        });
      }

      if (question.userId !== user.id) {
        return res.status(403).json({
          success: false,
          error: "You don't have permission to update this message"
        });
      }

      // Update the user message
      const updatedQuestion = await prisma.question.update({
        where: { id: messageId },
        data: { userres: content }
      });

      // If client requests a new LLM response, generate one and update the same record
      if (generateNewResponse) {
        // Fetch previous questions and responses for context
        const previousQuestions = await prisma.question.findMany({
          where: {
            userId: user.id,
            id: { not: messageId } // Exclude the current question
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5,
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
              // If parsing fails, use the raw response
            }

            conversationContext += `[${timestamp}]\n`;
            conversationContext += `Student: ${item.userres}\n`;
            conversationContext += `Tutor: ${formattedResponse}\n\n`;
          });
        }

        // Get user details for prompt
        const userDetails = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            name: true,
            motherToung: true,
            englishLevel: true,
            learningGoal: true,
            interests: true,
            focus: true,
            occupation: true,
            preferredTopics: true,
            preferredContentType: true,
            voice: true
          }
        });

        // Handle potential null values with fallbacks
        const safeUser = {
          name: userDetails.name || "Student",
          motherTongue: userDetails.motherToung || "Unknown",
          englishLevel: userDetails.englishLevel || "Intermediate",
          learningGoal: userDetails.learningGoal || "General improvement",
          interests: userDetails.interests || [],
          focus: userDetails.focus || "General English skills",
          occupation: userDetails.occupation || "Not specified",
          preferredTopics: userDetails.preferredTopics || "General topics",
          preferredContentType: userDetails.preferredContentType || "Flexible",
          voice: userDetails.voice || "Supportive and encouraging"
        };

        const prompt = `You are a highly supportive and knowledgeable AI English tutor designed to help students improve their English language skills efficiently and enjoyably.

Student Information:
- Name: **${safeUser.name}**
- Mother Tongue: **${safeUser.motherTongue}**
- English Proficiency Level: **${safeUser.englishLevel}**
- Learning Goal: **${safeUser.learningGoal}**
- Interests: **${safeUser.interests || "Various topics"}**
- Current Focus Areas: **${safeUser.focus}**
- Occupation: **${safeUser.occupation || "Not specified"}**
- Preferred Topics: **${safeUser.preferredTopics || "General topics"}**
- Preferred Content Type: **${safeUser.preferredContentType || "Flexible"}**
- Preferred Tutoring Style/Voice: **${safeUser.voice}**

${conversationContext}

Instructions:
The student has asked the following question: "${content}"

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
`;

        try {
          // Get the model
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

          // Generate content
          const result = await model.generateContent(prompt);
          const response = await result.response;
          const text = response.text();

          // Remove any potential markdown code block formatting
          const cleanedText = text.replace(/```json|```/g, '').trim();
          const jsonResponse = JSON.parse(cleanedText);

          // Update the existing question with the new LLM response
          const finalUpdatedQuestion = await prisma.question.update({
            where: { id: messageId },
            data: {
              userres: content,
              llmres: cleanedText
            }
          });

          // Return success with updated data
          return res.json({
            success: true,
            message: "Message and response updated successfully",
            data: {
              ...jsonResponse,
              questionId: messageId
            }
          });
        } catch (llmError) {
          console.error("Error generating new LLM response:", llmError);

          // If LLM fails, still return success for the user message update
          return res.json({
            success: true,
            message: "Message updated successfully, but new response generation failed",
            data: updatedQuestion,
            llmError: llmError.message
          });
        }
      } else {
        // If no new response is requested, just return success for the user message update
        return res.json({
          success: true,
          message: "Message updated successfully",
          data: updatedQuestion
        });
      }
    } else {
      // If no email is provided, just update the message without verification
      const updatedQuestion = await prisma.question.update({
        where: { id: messageId },
        data: { userres: content }
      });

      return res.json({
        success: true,
        message: "Message updated successfully",
        data: updatedQuestion
      });
    }
  } catch (error) {
    console.error("Error updating message:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message
    });
  }
});
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
      take: 5,
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
- Interests: **${safeUser.interests || "Various topics"}**
- Current Focus Areas: **${safeUser.focus}**
- Occupation: **${safeUser.occupation || "Not specified"}**
- Preferred Topics: **${safeUser.preferredTopics || "General topics"}**
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

      res.json({
        ...jsonResponse,
        questionId: savedQuestion.id,
        assistantId: savedQuestion.id // Or generate a separate one if needed
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
