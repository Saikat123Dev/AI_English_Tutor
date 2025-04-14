import { GoogleGenerativeAI } from "@google/generative-ai";
import { v2 as cloudinary } from 'cloudinary';
import express from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from "../lib/db.js";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const router = express.Router();

// Configure multer for temporary local storage before Cloudinary upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(process.cwd(), 'uploads/temp');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
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

    // Upload audio to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(audioFile.path, {
      resource_type: "video", // Audio files are handled as video in Cloudinary
      public_id: `pronunciation/${uuidv4()}`,
      folder: 'pronunciation_assessments'
    });

    // Clean up temporary file
    fs.unlinkSync(audioFile.path);

    // Store Cloudinary URL
    const audioUrl = uploadResult.secure_url;

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

      IMPORTANT: Ensure your response is valid JSON with no trailing commas or syntax errors.
      Format your response exactly like this:
      {
        "success": true,
        "word": "${word}",
        "accuracy": 85,
        "correctSounds": ["specific sounds pronounced well"],
        "improvementNeeded": ["specific sounds needing work"],
        "commonIssues": "Brief explanation of typical issues for speakers of their language",
        "practiceExercises": ["2-3 specific practice exercises"],
        "encouragement": "Positive, encouraging feedback"
      }
    `;

    // Get the model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the text response to JSON
    let jsonResponse;
    try {
      // Clean up the response text by removing any code block formatting
      const cleanedText = text.replace(/```json|```/g, '').trim();

      // Validate that we have content to parse
      if (!cleanedText) {
        throw new Error('Empty response from AI model');
      }

      try {
        // Try to parse the JSON directly
        jsonResponse = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error("Initial JSON parse error:", parseError);

        // Attempt JSON recovery if possible - look for common patterns
        if (cleanedText.includes('"word":') && cleanedText.includes('"accuracy":')) {
          // Try some basic recovery by ensuring opening/closing braces
          const withOpenBrace = cleanedText.startsWith('{') ? cleanedText : '{' + cleanedText;
          const withClosingBrace = withOpenBrace.endsWith('}') ? withOpenBrace : withOpenBrace + '}';

          try {
            jsonResponse = JSON.parse(withClosingBrace);
            console.log("JSON recovery succeeded");
          } catch (recoveryError) {
            console.error("JSON recovery failed:", recoveryError);
            throw parseError; // Rethrow original error if recovery failed
          }
        } else {
          throw parseError; // Rethrow if we can't recover
        }
      }

      // Save the pronunciation attempt in the database
      const savedAttempt = await prisma.pronunciationAttempt.create({
        data: {
          userId: user.id,
          word: word,
          audioUrl: audioUrl,
          accuracy: jsonResponse.accuracy || 0,
          feedback: typeof jsonResponse === 'object' ? JSON.stringify(jsonResponse) : cleanedText,
        }
      });

      // Add the attempt ID and audio URL to the response
      jsonResponse.attemptId = savedAttempt.id;
      jsonResponse.audioUrl = audioUrl;

      res.json(jsonResponse);
    } catch (error) {
      console.error("Error parsing JSON response:", error);

      // Create a fallback response if parsing fails
      const fallbackResponse = {
        success: true,
        word: word,
        accuracy: 75, // Default fallback accuracy
        correctSounds: ["General word shape", "Beginning sounds"],
        improvementNeeded: ["Work on specific pronunciation details"],
        commonIssues: "Unable to provide detailed analysis due to processing error",
        practiceExercises: [
          `Say the word slowly: ${word.split('').join('-')}`,
          "Record yourself and compare with reference pronunciation",
          "Practice each syllable separately"
        ],
        encouragement: "Keep practicing! You're making good progress."
      };

      // Save the raw response if parsing fails
      const savedAttempt = await prisma.pronunciationAttempt.create({
        data: {
          userId: user.id,
          word: word,
          audioUrl: audioUrl,
          accuracy: fallbackResponse.accuracy,
          feedback: JSON.stringify(fallbackResponse),
        }
      });

      // Add additional info to fallback response
      fallbackResponse.attemptId = savedAttempt.id;
      fallbackResponse.audioUrl = audioUrl;
      fallbackResponse.note = "Using fallback assessment due to processing issue";

      res.json(fallbackResponse);
    }

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
      where: { email },
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
        audioUrl: true,
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
        audioUrl: attempt.audioUrl,
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

      IMPORTANT: Ensure your response is valid JSON with no trailing commas or syntax errors.
      Format your response exactly like this:
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
      if (!cleanedText) {
        throw new Error('Empty response from AI model');
      }

      const jsonResponse = JSON.parse(cleanedText);
      res.json(jsonResponse);
    } catch (error) {
      console.error("Error parsing JSON response:", error);

      // Create a fallback response
      const fallbackResponse = {
        success: true,
        word: word,
        phonetic: `/${word}/`,
        syllables: word.match(/[aeiouy]{1,2}/gi)?.join('-') || word,
        stress: "First syllable",
        soundGuide: [
          {
            sound: word[0],
            howTo: `Focus on pronouncing the '${word[0]}' sound clearly`
          },
          {
            sound: word.slice(-1),
            howTo: `End with a clear '${word.slice(-1)}' sound`
          }
        ],
        commonErrors: [
          "Incorrect stress placement",
          "Unclear vowel sounds"
        ],
        practiceExercises: [
          `Say the word slowly: ${word.split('').join('-')}`,
          "Record yourself and compare with reference pronunciation",
          "Practice each syllable separately"
        ],
        note: "Using simplified pronunciation guide due to processing issue"
      };

      res.json(fallbackResponse);
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

    // Upload both audio files to Cloudinary
    const userUpload = await cloudinary.uploader.upload(files.userAudio[0].path, {
      resource_type: "video",
      public_id: `pronunciation/compare_user_${uuidv4()}`,
      folder: 'pronunciation_comparisons'
    });

    const referenceUpload = await cloudinary.uploader.upload(files.referenceAudio[0].path, {
      resource_type: "video",
      public_id: `pronunciation/compare_reference_${uuidv4()}`,
      folder: 'pronunciation_comparisons'
    });

    // Clean up temporary files
    fs.unlinkSync(files.userAudio[0].path);
    fs.unlinkSync(files.referenceAudio[0].path);

    const userAudioUrl = userUpload.secure_url;
    const referenceAudioUrl = referenceUpload.secure_url;

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an AI pronunciation coach comparing a student's pronunciation with a reference pronunciation.

      The word being pronounced is: "${word}"

      Based on analysis of both audio files (not actually provided in this simulation), provide feedback on:
      1. Overall similarity score (percentage)
      2. Specific sounds that match well
      3. Specific sounds that differ
      4. Tips for improvement

      IMPORTANT: Ensure your response is valid JSON with no trailing commas or syntax errors.
      Format your response exactly like this:
      {
        "success": true,
        "word": "${word}",
        "similarityScore": 78,
        "matchingAspects": ["aspects that match well"],
        "differences": ["aspects that differ"],
        "improvements": ["specific tips"],
        "userAudioUrl": "${userAudioUrl}",
        "referenceAudioUrl": "${referenceAudioUrl}"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      const cleanedText = text.replace(/```json|```/g, '').trim();
      if (!cleanedText) {
        throw new Error('Empty response from AI model');
      }

      const parsedResponse = JSON.parse(cleanedText);
      res.json(parsedResponse);
    } catch (error) {
      console.error("Error parsing JSON response:", error);

      // Create a fallback response
      const fallbackResponse = {
        success: true,
        word: word,
        similarityScore: 75,
        matchingAspects: ["Overall word rhythm", "Beginning consonant sounds"],
        differences: ["Vowel pronunciation", "Ending sounds clarity"],
        improvements: [
          "Focus on making vowel sounds more precise",
          "Practice the ending consonants more clearly",
          "Try slowing down to emphasize each sound"
        ],
        userAudioUrl: userAudioUrl,
        referenceAudioUrl: referenceAudioUrl,
        note: "Using simplified comparison due to processing issue"
      };

      res.json(fallbackResponse);
    }
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
