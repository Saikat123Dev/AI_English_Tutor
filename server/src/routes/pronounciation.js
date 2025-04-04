import { GoogleGenerativeAI } from "@google/generative-ai";
import express from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from "../lib/db.js";

const router = express.Router();

// Configure multer for audio file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with original extension
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept common audio formats
    const validTypes = ['audio/wav', 'audio/mp3', 'audio/webm', 'audio/ogg', 'audio/mpeg'];
    if (validTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio files are allowed.'));
    }
  }
});

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Endpoint to submit a word pronunciation assessment
 * POST /pronunciation/assess
 */
router.post("/assess", upload.single('audio'), async (req, res) => {
  try {
    const { email, word } = req.body;
    const audioFile = req.file;

    if (!email || !word || !audioFile) {
      return res.status(400).json({
        success: false,
        error: "Email, word, and audio file are required"
      });
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        motherToung: true,
        englishLevel: true
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    // Convert audio to base64 for Gemini API (if needed)
    // For this example, we're just using the file path, but you could convert to base64
    const audioPath = audioFile.path;

    // Create a more detailed prompt for the pronunciation assessment
    const prompt = `
      You are an expert English pronunciation coach evaluating a student's pronunciation.

      Student Profile:
      - Native language: ${user.motherToung || "Unknown"}
      - Current English level: ${user.englishLevel || "Intermediate"}

      The student attempted to pronounce the word: "${word}"

      Based on the audio recording, please evaluate:
      1. Overall accuracy (percentage from 0-100%)
      2. Specific sounds that were pronounced correctly
      3. Specific sounds that need improvement
      4. Common pronunciation issues for speakers of their native language when saying this word
      5. Practice tips tailored to their specific difficulties

      Please provide a detailed analysis formatted as JSON with the following structure:
      {
        "success": true,
        "word": "${word}",
        "accuracy": 85, // Percentage as number
        "correctSounds": ["specific sounds pronounced well"],
        "improvementNeeded": ["specific sounds needing work"],
        "commonIssues": "Brief explanation of typical issues for speakers of their language",
        "practiceExercises": ["2-3 specific practice exercises"],
        "encouragement": "Positive, encouraging feedback"
      }

      Important: Return ONLY the JSON without any markdown formatting or code blocks.
    `;

    // Get the model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // In a real implementation, you would:
    // 1. Process the audio file (convert to compatible format if needed)
    // 2. Send the actual audio with gemini-pro-vision model or use Speech-to-Text API first
    // 3. Compare the transcription with the expected word

    // For now, we'll simulate this process with the text-only model
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the text response to JSON
    let jsonResponse;
    try {
      // Remove any potential markdown code block formatting
      const cleanedText = text.replace(/```json|```/g, '').trim();
      jsonResponse = JSON.parse(cleanedText);

      // Save the pronunciation attempt in the database
      const savedAttempt = await prisma.pronunciationAttempt.create({
        data: {
          userId: user.id,
          word: word,
          audioPath: audioPath,
          accuracy: jsonResponse.accuracy || 0,
          feedback: cleanedText,
        }
      });

      // Add the attempt ID to the response
      jsonResponse.attemptId = savedAttempt.id;

      // Return the parsed JSON
      res.json(jsonResponse);
    } catch (error) {
      console.error("Error parsing JSON response:", error);

      // Save the raw response if parsing fails
      const savedAttempt = await prisma.pronunciationAttempt.create({
        data: {
          userId: user.id,
          word: word,
          audioPath: audioPath,
          accuracy: 0,
          feedback: text,
        }
      });

      // If parsing fails, return a formatted response
      res.json({
        success: true,
        word: word,
        response: text,
        attemptId: savedAttempt.id
      });
    }

    // Clean up the audio file (optional - you might want to keep it)
    // fs.unlinkSync(audioPath);

  } catch (error) {
    console.error("Error processing pronunciation:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message
    });
  }
});

/**
 * Endpoint to get pronunciation history for a user
 * GET /pronunciation/history
 */
router.get("/history", async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required"
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toString() },
      select: { id: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    // Get the user's pronunciation history
    const history = await prisma.pronunciationAttempt.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        word: true,
        accuracy: true,
        feedback: true,
        createdAt: true
      }
    });

    // Format the history records
    const formattedHistory = history.map(attempt => {
      let feedbackObj = attempt.feedback;
      try {
        if (typeof attempt.feedback === 'string') {
          feedbackObj = JSON.parse(attempt.feedback);
        }
      } catch (error) {
        feedbackObj = {
          raw: attempt.feedback.substring(0, 100) + '...'
        };
      }

      return {
        id: attempt.id,
        word: attempt.word,
        accuracy: attempt.accuracy,
        feedback: feedbackObj,
        date: attempt.createdAt
      };
    });

    res.json({
      success: true,
      history: formattedHistory
    });
  } catch (error) {
    console.error("Error fetching pronunciation history:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message
    });
  }
});

/**
 * Endpoint to get pronunciation tips for a specific word
 * GET /pronunciation/tips
 */
router.get("/tips", async (req, res) => {
  try {
    const { word, email } = req.query;

    if (!word) {
      return res.status(400).json({
        success: false,
        error: "Word parameter is required"
      });
    }

    // Get user info if email is provided
    let userInfo = {};
    if (email) {
      const user = await prisma.user.findUnique({
        where: { email: email.toString() },
        select: {
          motherToung: true,
          englishLevel: true
        }
      });

      if (user) {
        userInfo = {
          nativeLanguage: user.motherToung || "Unknown",
          englishLevel: user.englishLevel || "Intermediate"
        };
      }
    }

    // Initialize the Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Create prompt for pronunciation tips
    const prompt = `
      You are an expert English pronunciation coach providing tips on how to pronounce a specific word.

      ${userInfo.nativeLanguage ? `The student's native language is ${userInfo.nativeLanguage}.` : ''}
      ${userInfo.englishLevel ? `Their English level is ${userInfo.englishLevel}.` : ''}

      The word they want to learn is: "${word}"

      Provide a comprehensive guide on how to pronounce this word correctly, including:
      1. Phonetic transcription (IPA)
      2. Syllable breakdown
      3. Stress pattern
      4. Common pronunciation mistakes
      5. Step-by-step instructions for articulation

      Format your response as JSON with the following structure:
      {
        "success": true,
        "word": "${word}",
        "phonetic": "IPA transcription",
        "syllables": "Breakdown of syllables",
        "stress": "Which syllable has primary stress",
        "soundGuide": [
          {"sound": "specific sound", "howTo": "how to form this sound"}
        ],
        "commonErrors": ["typical mistakes"],
        "practiceExercises": ["2-3 exercises"]
      }
    `;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the response
    try {
      const cleanedText = text.replace(/```json|```/g, '').trim();
      const jsonResponse = JSON.parse(cleanedText);
      res.json(jsonResponse);
    } catch (error) {
      console.error("Error parsing JSON response:", error);
      res.json({
        success: true,
        word: word,
        tips: text
      });
    }
  } catch (error) {
    console.error("Error getting pronunciation tips:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message
    });
  }
});

/**
 * Helper route to compare two pronunciations
 * POST /pronunciation/compare
 */
router.post("/compare", upload.fields([
  { name: 'userAudio', maxCount: 1 },
  { name: 'referenceAudio', maxCount: 1 }
]), async (req, res) => {
  try {
    const { word } = req.body;
    const files = req.files;

    if (!word || !files.userAudio || !files.referenceAudio) {
      return res.status(400).json({
        success: false,
        error: "Word, user audio, and reference audio are required"
      });
    }

    const userAudioPath = files.userAudio[0].path;
    const referenceAudioPath = files.referenceAudio[0].path;

    // In a real implementation, you'd:
    // 1. Use audio analysis APIs or services to compare the pronunciations
    // 2. Extract features like phoneme timing, pitch, etc.

    // For now, we'll use Gemini to simulate this feedback
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an AI pronunciation coach comparing a student's pronunciation with a reference pronunciation.

      The word being pronounced is: "${word}"

      Based on analysis of both audio files (not actually provided in this simulation), provide feedback on:
      1. Overall similarity score (percentage)
      2. Specific sounds that match well
      3. Specific sounds that differ
      4. Tips for improvement

      Format your response as JSON:
      {
        "success": true,
        "word": "${word}",
        "similarityScore": 78,
        "matchingAspects": ["aspects that match well"],
        "differences": ["aspects that differ"],
        "improvements": ["specific tips"]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const parsedResponse = JSON.parse(response.text().replace(/```json|```/g, '').trim());

    res.json(parsedResponse);

    // Clean up (optional)
    // fs.unlinkSync(userAudioPath);
    // fs.unlinkSync(referenceAudioPath);

  } catch (error) {
    console.error("Error comparing pronunciations:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message
    });
  }
});

export default router;
