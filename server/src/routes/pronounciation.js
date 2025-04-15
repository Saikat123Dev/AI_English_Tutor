import { GoogleGenerativeAI } from "@google/generative-ai";
import { AssemblyAI } from 'assemblyai';
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

// Configure AssemblyAI SDK
const ASSEMBLY_AI_API_KEY = process.env.ASSEMBLY_AI_API_KEY;
const assemblyClient = new AssemblyAI({
  apiKey: ASSEMBLY_AI_API_KEY
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
 * Function to submit audio file to AssemblyAI and get transcription with analysis
 * @param {string} audioUrl - URL of the audio file to transcribe
 * @param {string} targetWord - The word the user is attempting to pronounce
 * @returns {Promise<Object>} - Transcription and analysis data
 */
async function getAssemblyAITranscription(audioUrl, targetWord) {
  try {
    if (!audioUrl) {
      throw new Error("Audio URL is required for transcription");
    }

    // Create a transcription request using the SDK
   // Create a transcription request using the SDK
const transcript = await assemblyClient.transcripts.transcribe({
  audio_url: audioUrl,
  word_boost: [targetWord],
  boost_param: "high",
  speech_model: "universal",  // Change from "default" to "universal"
  language_detection: true,
  punctuate: true,
  format_text: true,
  disfluencies: true,
  auto_highlights: true,
  audio_start_from: 0,
  audio_end_at: null,
  speech_threshold: 0.2,
  word_confidence: true
});
    // The SDK handles polling for completion automatically
    return transcript;
  } catch (error) {
    console.error("Error with AssemblyAI transcription:", error);
    // Return a structured error response instead of throwing
    return {
      error: true,
      message: error.message || "Transcription failed",
      text: "",
      words: [],
      audio_duration: 0,
      language_code: "en"
    };
  }
}

/**
 * Function to analyze pronunciation match based on AssemblyAI results
 * @param {Object} transcriptionData - Data from AssemblyAI
 * @param {string} targetWord - The target word user attempted to pronounce
 * @returns {Object} - Analysis of the pronunciation
 */
function analyzeAssemblyResults(transcriptionData, targetWord) {
  // Handle error case
  if (transcriptionData.error) {
    return {
      error: true,
      message: transcriptionData.message,
      detectedText: "",
      wordMatch: false,
      confidenceScore: 0,
      wordAlignment: [],
      totalDuration: 0,
      disfluencies: false,
      languageDetected: "en",
      pronunciationSpeed: 0
    };
  }

  // Set default values in case we can't extract everything
  const analysis = {
    detectedText: transcriptionData.text || "",
    wordMatch: false,
    confidenceScore: 0,
    wordAlignment: [],
    totalDuration: transcriptionData.audio_duration || 0,
    disfluencies: false,
    languageDetected: transcriptionData.language_code || "en",
    pronunciationSpeed: 0
  };

  // Check for word match (case insensitive)
  const lowerCaseTarget = targetWord.toLowerCase();
  const words = transcriptionData.words || [];

  // Find words that might match the target
  const matchingWords = words.filter(word =>
    word && word.text && word.text.toLowerCase() === lowerCaseTarget
  );

  if (matchingWords.length > 0) {
    // Get the best match (highest confidence)
    const bestMatch = matchingWords.reduce((best, current) =>
      ((current.confidence || 0) > (best.confidence || 0)) ? current : best, matchingWords[0]);

    analysis.wordMatch = true;
    analysis.confidenceScore = bestMatch.confidence || 0;
    analysis.wordAlignment = {
      text: bestMatch.text || "",
      start: bestMatch.start || 0,
      end: bestMatch.end || 0,
      duration: ((bestMatch.end || 0) - (bestMatch.start || 0)) / 1000, // Convert to seconds
      confidence: bestMatch.confidence || 0
    };

    // Calculate pronunciation speed (if we have meaningful duration)
    if (analysis.wordAlignment.duration > 0) {
      // Word length divided by duration gives characters per second
      analysis.pronunciationSpeed = targetWord.length / analysis.wordAlignment.duration;
    }
  } else {
    const text = transcriptionData.text ? transcriptionData.text.toLowerCase() : "";
    if (text.includes(lowerCaseTarget)) {
      analysis.wordMatch = true;
      analysis.confidenceScore = 0.7;
      analysis.note = "Word detected as part of a longer phrase";
    } else if (text) {

      analysis.note = "Target word not clearly detected in transcript";
      analysis.detectedTextInstead = text;
    }
  }

  if (transcriptionData.text && /\bum\b|\buh\b|\ber\b|\behm\b/i.test(transcriptionData.text)) {
    analysis.disfluencies = true;
  }

  return analysis;
}

/**
 * Helper function to parse JSON safely with error handling
 * @param {string} jsonString - JSON string to parse
 * @param {Object} fallback - Fallback object to return if parsing fails
 * @returns {Object} - Parsed JSON object or fallback
 */
function safeJsonParse(jsonString, fallback = {}) {
  try {
    // Remove any potential code block formatting
    const cleanedText = jsonString.replace(/```json|```/g, '').trim();
    if (!cleanedText) {
      return fallback;
    }
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("JSON parse error:", error);
    return fallback;
  }
}

/**
 * Endpoint to submit a word pronunciation assessment
 * POST /pronunciation/assess
 */
router.post("/assess", upload.single('audio'), async (req, res) => {
  let audioFile = null;
  try {
    const { email, word } = req.body;
    audioFile = req.file;

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
    }).catch(err => {
      console.error("Database error finding user:", err);
      return null;
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    // Upload audio to Cloudinary
    let audioUrl = '';
    try {
      const uploadResult = await cloudinary.uploader.upload(audioFile.path, {
        resource_type: "video", // Audio files are handled as video in Cloudinary
        public_id: `pronunciation/${uuidv4()}`,
        folder: 'pronunciation_assessments'
      });
      audioUrl = uploadResult.secure_url;
      console.log("Audio uploaded to:", audioUrl);
    } catch (uploadError) {
      console.error("Cloudinary upload error:", uploadError);
      return res.status(500).json({
        success: false,
        error: "Failed to upload audio file",
        message: uploadError.message
      });
    }

    // Clean up temporary file regardless of success
    try {
      if (fs.existsSync(audioFile.path)) {
        fs.unlinkSync(audioFile.path);
      }
    } catch (fsError) {
      console.error("Error cleaning up temp file:", fsError);
      // Continue processing even if cleanup fails
    }

    // Step 1: Get AssemblyAI transcription and analysis
    console.log("Submitting to AssemblyAI...");
    let assemblyResults;
    let pronunciationAnalysis;
    try {
      assemblyResults = await getAssemblyAITranscription(audioUrl, word);
      pronunciationAnalysis = analyzeAssemblyResults(assemblyResults, word);
      console.log("AssemblyAI results:", pronunciationAnalysis);
    } catch (error) {
      console.error("Error with speech analysis:", error);
      pronunciationAnalysis = {
        detectedText: "Analysis failed",
        wordMatch: false,
        confidenceScore: 0,
        error: error.message
      };
    }

    // Step 2: Create a prompt for Gemini with the AssemblyAI data
    const prompt = `
      You are an expert English pronunciation coach evaluating a student's pronunciation.

      Student Profile:
      - Native language: ${user.motherToung || "Unknown"}
      - Current English level: ${user.englishLevel || "Intermediate"}

      The student attempted to pronounce the word: "${word}"

      Speech Analysis Data:
      - Speech-to-text result: "${pronunciationAnalysis.detectedText}"
      - Word match detected: ${pronunciationAnalysis.wordMatch}
      - Confidence score: ${(pronunciationAnalysis.confidenceScore || 0) * 100}%
      - Pronunciation speed: ${(pronunciationAnalysis.pronunciationSpeed || 0).toFixed(2)} characters/second
      - Speech duration: ${(pronunciationAnalysis.totalDuration || 0).toFixed(2)} seconds
      - Language detected: ${pronunciationAnalysis.languageDetected || "en"}
      - Contains disfluencies: ${pronunciationAnalysis.disfluencies || false}
      ${pronunciationAnalysis.note ? `- Note: ${pronunciationAnalysis.note}` : ''}
      ${pronunciationAnalysis.detectedTextInstead ? `- Detected instead: "${pronunciationAnalysis.detectedTextInstead}"` : ''}

      Based on this data, please evaluate:
      1. Overall accuracy (percentage from 0-100%, considering both the transcription match and confidence score)
      2. Specific sounds that were likely pronounced correctly
      3. Specific sounds that likely need improvement
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
        "encouragement": "Positive, encouraging feedback",
        "transcriptionDetails": {
          "detectedText": "${pronunciationAnalysis.detectedText || ""}",
          "confidenceScore": ${(pronunciationAnalysis.confidenceScore || 0) * 100}
        }
      }
    `;

    // Get the model
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Create fallback response
      const fallbackResponse = {
        success: true,
        word: word,
        accuracy: pronunciationAnalysis.wordMatch ?
          Math.round((pronunciationAnalysis.confidenceScore || 0) * 75) : 40,
        correctSounds: ["General word shape", "Beginning sounds"],
        improvementNeeded: ["Work on specific pronunciation details"],
        commonIssues: "Unable to provide detailed analysis due to processing error",
        practiceExercises: [
          `Say the word slowly: ${word.split('').join('-')}`,
          "Record yourself and compare with reference pronunciation",
          "Practice each syllable separately"
        ],
        encouragement: "Keep practicing! You're making good progress.",
        transcriptionDetails: {
          detectedText: pronunciationAnalysis.detectedText || "",
          confidenceScore: (pronunciationAnalysis.confidenceScore || 0) * 100
        },
        assemblyAiData: pronunciationAnalysis
      };

      // Parse the text response to JSON
      const jsonResponse = safeJsonParse(text, fallbackResponse);

      // Add AssemblyAI raw data to the response
      jsonResponse.assemblyAiData = {
        wordMatch: pronunciationAnalysis.wordMatch || false,
        confidenceScore: pronunciationAnalysis.confidenceScore || 0,
        detectedText: pronunciationAnalysis.detectedText || "",
        languageDetected: pronunciationAnalysis.languageDetected || "en",
        pronunciationSpeed: pronunciationAnalysis.pronunciationSpeed || 0
      };

      // Ensure we have a valid accuracy value
      if (typeof jsonResponse.accuracy !== 'number') {
        jsonResponse.accuracy = fallbackResponse.accuracy;
      }

      // Save the pronunciation attempt in the database with enhanced data
      try {
        const savedAttempt = await prisma.pronunciationAttempt.create({
          data: {
            userId: user.id,
            word: word,
            audioUrl: audioUrl,
            accuracy: jsonResponse.accuracy || 0,
            feedback: JSON.stringify(jsonResponse),
            transcriptionData: JSON.stringify(pronunciationAnalysis),
            assemblyConfidence: (pronunciationAnalysis.confidenceScore || 0) * 100,
            detectedText: pronunciationAnalysis.detectedText || ""
          }
        });

        // Add the attempt ID and audio URL to the response
        jsonResponse.attemptId = savedAttempt.id;
        jsonResponse.audioUrl = audioUrl;

        return res.json(jsonResponse);
      } catch (dbError) {
        console.error("Database error saving attempt:", dbError);

        // Continue with response even if DB save fails
        jsonResponse.attemptId = "temporary-" + Date.now();
        jsonResponse.audioUrl = audioUrl;
        jsonResponse.dbError = "Failed to save attempt";

        return res.json(jsonResponse);
      }
    } catch (aiError) {
      console.error("AI processing error:", aiError);

      // Use fallback if AI fails
      const fallbackResponse = {
        success: true,
        word: word,
        accuracy: pronunciationAnalysis.wordMatch ?
          Math.round((pronunciationAnalysis.confidenceScore || 0) * 75) : 40,
        correctSounds: ["General word shape", "Beginning sounds"],
        improvementNeeded: ["Work on specific pronunciation details"],
        commonIssues: "Unable to provide detailed analysis due to processing error",
        practiceExercises: [
          `Say the word slowly: ${word.split('').join('-')}`,
          "Record yourself and compare with reference pronunciation",
          "Practice each syllable separately"
        ],
        encouragement: "Keep practicing! You're making good progress.",
        transcriptionDetails: {
          detectedText: pronunciationAnalysis.detectedText || "",
          confidenceScore: (pronunciationAnalysis.confidenceScore || 0) * 100
        },
        assemblyAiData: pronunciationAnalysis,
        aiError: "AI processing failed: " + aiError.message
      };

      try {
        // Save fallback response
        const savedAttempt = await prisma.pronunciationAttempt.create({
          data: {
            userId: user.id,
            word: word,
            audioUrl: audioUrl,
            accuracy: fallbackResponse.accuracy,
            feedback: JSON.stringify(fallbackResponse),
            transcriptionData: JSON.stringify(pronunciationAnalysis),
            assemblyConfidence: (pronunciationAnalysis.confidenceScore || 0) * 100,
            detectedText: pronunciationAnalysis.detectedText || ""
          }
        });

        fallbackResponse.attemptId = savedAttempt.id;
        fallbackResponse.audioUrl = audioUrl;
      } catch (dbError) {
        console.error("Database error saving fallback:", dbError);
        fallbackResponse.attemptId = "temporary-" + Date.now();
        fallbackResponse.audioUrl = audioUrl;
        fallbackResponse.dbError = "Failed to save attempt";
      }

      return res.json(fallbackResponse);
    }
  } catch (error) {
    console.error("Error processing pronunciation:", error);

    // Cleanup temp file if it exists and hasn't been cleaned up yet
    if (audioFile && audioFile.path && fs.existsSync(audioFile.path)) {
      try {
        fs.unlinkSync(audioFile.path);
      } catch (cleanupError) {
        console.error("Error cleaning up file during error handling:", cleanupError);
      }
    }

    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message || "Unknown error occurred",
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
        audioUrl: true,
        createdAt: true,
        transcriptionData: true,
        assemblyConfidence: true,
        detectedText: true
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
          raw: attempt.feedback ? attempt.feedback.substring(0, 100) + '...' : 'No feedback available'
        };
      }

      // Parse transcription data if available
      let transcriptionData = {};
      try {
        if (attempt.transcriptionData) {
          transcriptionData = JSON.parse(attempt.transcriptionData);
        }
      } catch (error) {
        console.error("Error parsing transcription data:", error);
      }

      return {
        id: attempt.id,
        word: attempt.word,
        accuracy: attempt.accuracy || 0,
        feedback: feedbackObj,
        audioUrl: attempt.audioUrl,
        date: attempt.createdAt,
        assemblyConfidence: attempt.assemblyConfidence || 0,
        detectedText: attempt.detectedText || "No transcription available",
        transcriptionData: transcriptionData
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

    // Create fallback response in advance
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
      note: "Using simplified pronunciation guide"
    };

    try {
      // Generate content
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse the response using our safe parser
      const jsonResponse = safeJsonParse(text, fallbackResponse);

      return res.json(jsonResponse);
    } catch (error) {
      console.error("Error getting pronunciation tips:", error);
      return res.json(fallbackResponse);
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
 * Helper route to compare two pronunciations using AssemblyAI
 * POST /pronunciation/compare
 */
router.post("/compare", upload.fields([
  { name: 'userAudio', maxCount: 1 },
  { name: 'referenceAudio', maxCount: 1 }
]), async (req, res) => {
  let files = { userAudio: null, referenceAudio: null };

  try {
    const { word } = req.body;
    files = req.files;

    if (!word || !files.userAudio || !files.referenceAudio) {
      return res.status(400).json({
        success: false,
        error: "Word, user audio, and reference audio are required"
      });
    }

    let userAudioUrl = '';
    let referenceAudioUrl = '';

    try {
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

      userAudioUrl = userUpload.secure_url;
      referenceAudioUrl = referenceUpload.secure_url;
    } catch (uploadError) {
      console.error("Error uploading audio files:", uploadError);
      return res.status(500).json({
        success: false,
        error: "Failed to upload audio files",
        message: uploadError.message
      });
    }

    // Clean up temporary files regardless of success
    try {
      fs.existsSync(files.userAudio[0].path) && fs.unlinkSync(files.userAudio[0].path);
      fs.existsSync(files.referenceAudio[0].path) && fs.unlinkSync(files.referenceAudio[0].path);
    } catch (fsError) {
      console.error("Error cleaning up temporary files:", fsError);
      // Continue processing even if cleanup fails
    }

    // Process both audio files with AssemblyAI
    console.log("Processing user audio with AssemblyAI...");
    const userTranscription = await getAssemblyAITranscription(userAudioUrl, word);
    const userAnalysis = analyzeAssemblyResults(userTranscription, word);

    console.log("Processing reference audio with AssemblyAI...");
    const referenceTranscription = await getAssemblyAITranscription(referenceAudioUrl, word);
    const referenceAnalysis = analyzeAssemblyResults(referenceTranscription, word);

    // Define fallback response in advance
    const fallbackResponse = {
      success: true,
      word: word,
      similarityScore: Math.round(((userAnalysis.confidenceScore || 0) / Math.max(0.8, (referenceAnalysis.confidenceScore || 0.8))) * 100),
      matchingAspects: ["Overall word rhythm", "Beginning consonant sounds"],
      differences: ["Vowel pronunciation", "Ending sounds clarity"],
      improvements: [
        "Focus on making vowel sounds more precise",
        "Practice the ending consonants more clearly",
        "Try slowing down to emphasize each sound"
      ],
      userAudioUrl: userAudioUrl,
      referenceAudioUrl: referenceAudioUrl,
      userTranscription: userAnalysis.detectedText || "",
      referenceTranscription: referenceAnalysis.detectedText || "",
      analysisData: {
        user: userAnalysis,
        reference: referenceAnalysis
      },
      note: "Using data-based comparison with simplified analysis"
    };

    try {
      // Initialize Gemini model
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
        You are an AI pronunciation coach comparing a student's pronunciation with a reference pronunciation.

        The word being pronounced is: "${word}"

        User Audio Analysis:
        - Detected text: "${userAnalysis.detectedText || ""}"
        - Word match: ${userAnalysis.wordMatch || false}
        - Confidence score: ${(userAnalysis.confidenceScore || 0) * 100}%
        - Duration: ${userAnalysis.totalDuration || 0}s
        ${userAnalysis.pronunciationSpeed ? `- Speech speed: ${userAnalysis.pronunciationSpeed.toFixed(2)} chars/sec` : ''}

        Reference Audio Analysis:
        - Detected text: "${referenceAnalysis.detectedText || ""}"
        - Word match: ${referenceAnalysis.wordMatch || false}
        - Confidence score: ${(referenceAnalysis.confidenceScore || 0) * 100}%
        - Duration: ${referenceAnalysis.totalDuration || 0}s
        ${referenceAnalysis.pronunciationSpeed ? `- Speech speed: ${referenceAnalysis.pronunciationSpeed.toFixed(2)} chars/sec` : ''}

        Based on this analysis, provide feedback on:
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
          "improvements": ["specific improvement tips"],
          "userAudioUrl": "${userAudioUrl}",
          "referenceAudioUrl": "${referenceAudioUrl}",
          "userTranscription": "${userAnalysis.detectedText || ''}",
          "referenceTranscription": "${referenceAnalysis.detectedText || ''}"
        }
      `;

      // Get AI assessment
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse AI response
      const jsonResponse = safeJsonParse(text, fallbackResponse);

      // Add additional analysis data
      jsonResponse.analysisData = {
        user: userAnalysis,
        reference: referenceAnalysis
      };

      // Make sure URLs are included
      jsonResponse.userAudioUrl = userAudioUrl;
      jsonResponse.referenceAudioUrl = referenceAudioUrl;

      return res.json(jsonResponse);

    } catch (aiError) {
      console.error("AI processing error:", aiError);
      return res.json(fallbackResponse);
    }
  } catch (error) {
    console.error("Error comparing pronunciations:", error);

    // Clean up files if they exist
    try {
      if (files.userAudio && files.userAudio[0] && fs.existsSync(files.userAudio[0].path)) {
        fs.unlinkSync(files.userAudio[0].path);
      }
      if (files.referenceAudio && files.referenceAudio[0] && fs.existsSync(files.referenceAudio[0].path)) {
        fs.unlinkSync(files.referenceAudio[0].path);
      }
    } catch (cleanupError) {
      console.error("Error cleaning up during error handling:", cleanupError);
    }

    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message || "Unknown error occurred"
    });
  }
});

/**
 * Endpoint to get recommended practice words based on a user's history
 * GET /pronunciation/recommendations
 */
router.get("/recommendations", async (req, res) => {
  try {
    const { email, count = 5 } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required"
      });
    }

    const numWords = Math.min(parseInt(count) || 5, 20); // Limit max words to 20

    // Get user info
    const user = await prisma.user.findUnique({
      where: { email: email.toString() },
      select: {
        id: true,
        motherToung: true,
        englishLevel: true,
        PronunciationAttempt: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 50, // Get recent history
          select: {
            word: true,
            accuracy: true,
            createdAt: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    // Extract recent attempts history
    const attempts = user.PronunciationAttempt || [];

    // Calculate average accuracy
    let averageAccuracy = 0;
    if (attempts.length > 0) {
      const sum = attempts.reduce((total, attempt) => total + (attempt.accuracy || 0), 0);
      averageAccuracy = Math.round(sum / attempts.length);
    }

    // Extract words that need improvement (below 80% accuracy)
    const needsImprovement = attempts
      .filter(attempt => (attempt.accuracy || 0) < 80)
      .map(attempt => attempt.word);

    // Get unique words that need improvement
    const uniqueImprovement = [...new Set(needsImprovement)];

    try {
      // Initialize Gemini model
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
        You are an AI pronunciation coach recommending English words for a student to practice.

        Student Profile:
        - Native language: ${user.motherToung || "Unknown"}
        - English level: ${user.englishLevel || "Intermediate"}
        - Average pronunciation accuracy: ${averageAccuracy}%

        Words they've struggled with (below 80% accuracy):
        ${uniqueImprovement.length > 0 ? uniqueImprovement.join(', ') : "No data available yet"}

        Based on their native language and proficiency level, recommend ${numWords} appropriate English words for them to practice pronunciation. Include:
        1. Words that target sounds difficult for speakers of their native language
        2. Progressive difficulty level appropriate for their English level
        3. Some practical, everyday vocabulary and some challenging pronunciation words
        4. For each word, explain why it's challenging and what sounds to focus on

        IMPORTANT: Ensure your response is valid JSON with no trailing commas or syntax errors.
        Format your response exactly like this:
        {
          "success": true,
          "recommendations": [
            {
              "word": "example",
              "difficulty": "medium",
              "phonetic": "/ɪɡˈzæmpəl/",
              "focusAreas": ["specific sounds to focus on"],
              "reason": "Why this word was selected"
            }
          ],
          "languageSpecificTips": "Tips specific to their native language"
        }
      `;

      // Fallback response
      const fallbackRecommendations = [
        {
          word: "comfortable",
          difficulty: "medium",
          phonetic: "/ˈkʌmf(ə)təb(ə)l/",
          focusAreas: ["Unstressed syllables", "Consonant blending"],
          reason: "Common word with multiple syllables and reduced vowels"
        },
        {
          word: "refrigerator",
          difficulty: "medium",
          phonetic: "/rɪˈfrɪdʒəreɪtər/",
          focusAreas: ["Stress pattern", "R sounds"],
          reason: "Challenging stress pattern and multiple syllables"
        },
        {
          word: "specifically",
          difficulty: "hard",
          phonetic: "/spəˈsɪfɪkli/",
          focusAreas: ["Consonant clusters", "Vowel clarity"],
          reason: "Contains consonant clusters that require precise articulation"
        },
        {
          word: "thought",
          difficulty: "medium",
          phonetic: "/θɔːt/",
          focusAreas: ["TH sound", "Vowel length"],
          reason: "Contains the 'th' sound which is difficult for many language speakers"
        },
        {
          word: "world",
          difficulty: "hard",
          phonetic: "/wɜːrld/",
          focusAreas: ["R+L combination", "W sound"],
          reason: "Difficult consonant combination with R and L together"
        }
      ];

      const fallbackResponse = {
        success: true,
        recommendations: fallbackRecommendations.slice(0, numWords),
        languageSpecificTips: "Focus on vowel sounds and word stress patterns, as these often differ significantly between languages."
      };

      // Generate content
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse the response
      const jsonResponse = safeJsonParse(text, fallbackResponse);

      // Ensure we have the right number of recommendations
      if (!jsonResponse.recommendations || !Array.isArray(jsonResponse.recommendations) || jsonResponse.recommendations.length < numWords) {
        jsonResponse.recommendations = fallbackResponse.recommendations;
      }

      return res.json(jsonResponse);
    } catch (aiError) {
      console.error("AI processing error:", aiError);

      // Return fallback recommendations
      return res.json({
        success: true,
        recommendations: [
          {
            word: "comfortable",
            difficulty: "medium",
            phonetic: "/ˈkʌmf(ə)təb(ə)l/",
            focusAreas: ["Unstressed syllables", "Consonant blending"],
            reason: "Common word with multiple syllables and reduced vowels"
          },
          {
            word: "refrigerator",
            difficulty: "medium",
            phonetic: "/rɪˈfrɪdʒəreɪtər/",
            focusAreas: ["Stress pattern", "R sounds"],
            reason: "Challenging stress pattern and multiple syllables"
          },
          {
            word: "specifically",
            difficulty: "hard",
            phonetic: "/spəˈsɪfɪkli/",
            focusAreas: ["Consonant clusters", "Vowel clarity"],
            reason: "Contains consonant clusters that require precise articulation"
          },
          {
            word: "thought",
            difficulty: "medium",
            phonetic: "/θɔːt/",
            focusAreas: ["TH sound", "Vowel length"],
            reason: "Contains the 'th' sound which is difficult for many language speakers"
          },
          {
            word: "world",
            difficulty: "hard",
            phonetic: "/wɜːrld/",
            focusAreas: ["R+L combination", "W sound"],
            reason: "Difficult consonant combination with R and L together"
          }
        ].slice(0, numWords),
        languageSpecificTips: "Focus on vowel sounds and word stress patterns, as these often differ significantly between languages.",
        note: "Using fallback recommendations due to processing error"
      });
    }
  } catch (error) {
    console.error("Error getting pronunciation recommendations:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message
    });
  }
});

/**
 * Endpoint to delete a pronunciation attempt
 * DELETE /pronunciation/attempt/:id
 */
router.delete("/attempt/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.query;

    if (!id || !email) {
      return res.status(400).json({
        success: false,
        error: "Attempt ID and email are required"
      });
    }

    // Verify the user owns this attempt
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

    // Find the attempt
    const attempt = await prisma.pronunciationAttempt.findUnique({
      where: { id: id },
      select: {
        userId: true,
        audioUrl: true
      }
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        error: "Pronunciation attempt not found"
      });
    }

    // Verify ownership
    if (attempt.userId !== user.id) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized: User does not own this pronunciation attempt"
      });
    }

    // Delete the attempt from Cloudinary if possible
    if (attempt.audioUrl) {
      try {
        // Extract public ID from the URL
        const urlParts = attempt.audioUrl.split('/');
        const filenameWithExt = urlParts[urlParts.length - 1];
        const filename = filenameWithExt.split('.')[0];
        const folderPath = urlParts[urlParts.length - 2];
        const publicId = `${folderPath}/${filename}`;

        await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
        console.log("Deleted file from Cloudinary:", publicId);
      } catch (cloudinaryError) {
        console.error("Error deleting from Cloudinary:", cloudinaryError);
        // Continue with database deletion even if Cloudinary fails
      }
    }

    // Delete the attempt from database
    await prisma.pronunciationAttempt.delete({
      where: { id: id }
    });

    res.json({
      success: true,
      message: "Pronunciation attempt deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting pronunciation attempt:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message
    });
  }
});

export default router;
