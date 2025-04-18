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
    const validTypes = [
      'audio/wav', 'audio/mp3', 'audio/webm', 'audio/ogg', 'audio/mpeg',
      'audio/mp4', 'audio/x-m4a', 'audio/aac', 'audio/x-aac'
    ];
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
 * @param {Object} audioFile - The audio file object from multer
 * @param {string} targetWord - The word the user is attempting to pronounce
 * @returns {Promise<Object>} - Transcription and analysis data
 */
async function getAssemblyAITranscription(audioFile, targetWord) {
  try {
    if (!audioFile) {
      throw new Error("Audio File is required for transcription");
    }

    // Validate that the file exists
    if (!audioFile.path || !fs.existsSync(audioFile.path)) {
      throw new Error("Audio file path is invalid or file does not exist");
    }

    // Create a transcription request using the SDK with the local file
    // Use the path property from the file object provided by multer
    const transcript = await assemblyClient.transcripts.transcribe({
      audio: fs.createReadStream(audioFile.path), // Use local file stream instead of URL
      word_boost: [targetWord],
      boost_param: "high",
      speech_model: "nano", // Changed to 'nano' for faster processing; use 'best' for higher accuracy if needed
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

    console.log("AssemblyAI transcription response:", transcript);

    // Return structured response
    return {
      error: false,
      message: "Transcription successful",
      text: transcript.text || "",
      words: transcript.words || [],
      audio_duration: transcript.audio_duration || 0,
      language_code: transcript.language_code || "en",
      confidence: transcript.confidence || 0
    };
  } catch (error) {
    console.error("Error with AssemblyAI transcription:", error);
    // Return a structured error response
    return {
      error: true,
      message: error.message || "Transcription failed",
      text: "",
      words: [],
      audio_duration: 0,
      language_code: "en",
      confidence: 0
    };
  }
}

/**
 * Improved function to analyze pronunciation match based on AssemblyAI results
 * Uses smarter matching and scoring algorithms
 * @param {Object} transcriptionData - Data from AssemblyAI
 * @param {string} targetWord - The target word user attempted to pronounce
 * @returns {Object} - Enhanced analysis of the pronunciation
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
      pronunciationSpeed: 0,
      accuracyScore: 0
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
    pronunciationSpeed: 0,
    accuracyScore: 0
  };

  // Check for word match (case insensitive)
  const lowerCaseTarget = targetWord.toLowerCase().trim();
  const words = transcriptionData.words || [];
  const detectedTextLower = (transcriptionData.text || "").toLowerCase().trim();

  // Find words that might match the target
  const matchingWords = words.filter(word =>
    word && word.text && word.text.toLowerCase().trim() === lowerCaseTarget
  );

  let baseAccuracy = 0;
  let confidentMatch = false;

  // Calculate Levenshtein distance for approximate matching
  function levenshteinDistance(a, b) {
    const matrix = Array(a.length + 1).fill().map(() => Array(b.length + 1).fill(0));

    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,         // deletion
          matrix[i][j - 1] + 1,         // insertion
          matrix[i - 1][j - 1] + cost   // substitution
        );
      }
    }

    return matrix[a.length][b.length];
  }

  // Calculate string similarity as a percentage
  function calculateSimilarity(str1, str2) {
    const maxLength = Math.max(str1.length, str2.length);
    if (maxLength === 0) return 100; // Both strings are empty

    const distance = levenshteinDistance(str1, str2);
    return Math.round((1 - distance / maxLength) * 100);
  }

  // Case 1: Exact word match in the individual words
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

    // High confidence full word match - most accurate case
    baseAccuracy = 85 + (analysis.confidenceScore * 15); // Max 100%
    confidentMatch = true;
  }
  // Case 2: The transcription matches exactly the target word (full transcription)
  else if (detectedTextLower === lowerCaseTarget) {
    analysis.wordMatch = true;
    analysis.confidenceScore = 0.9; // High confidence for exact match
    baseAccuracy = 90; // Very good match
    confidentMatch = true;
  }
  // Case 3: The target word is contained within the transcription
  else if (detectedTextLower.includes(lowerCaseTarget)) {
    analysis.wordMatch = true;
    analysis.confidenceScore = 0.7;
    analysis.note = "Word detected as part of a longer phrase";
    baseAccuracy = 75; // Good but not perfect
  }
  // Case 4: Partial match using string similarity
  else if (detectedTextLower) {
    const similarity = calculateSimilarity(lowerCaseTarget, detectedTextLower);

    if (similarity >= 70) {
      analysis.wordMatch = true;
      analysis.confidenceScore = similarity / 100;
      analysis.note = "Close but imperfect pronunciation detected";
      baseAccuracy = similarity;
    } else if (similarity >= 50) {
      analysis.wordMatch = false;
      analysis.confidenceScore = similarity / 200; // Lower confidence
      analysis.note = "Partial pronunciation detected";
      baseAccuracy = similarity / 2;
    } else {
      analysis.note = "Target word not clearly detected in transcript";
      analysis.detectedTextInstead = detectedTextLower;
      baseAccuracy = Math.max(20, similarity); // Minimum 20% if anything was detected
    }
  }

  // Check for disfluencies
  if (transcriptionData.text && /\bum\b|\buh\b|\ber\b|\behm\b/i.test(transcriptionData.text)) {
    analysis.disfluencies = true;
    // Penalize accuracy for disfluencies
    if (confidentMatch) {
      baseAccuracy = Math.max(50, baseAccuracy - 15);
    }
  }

  // Finalize accuracy score
  analysis.accuracyScore = Math.round(baseAccuracy);

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
        motherToung: true, // Note: This should probably be "motherTongue" but keeping as is
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

    // Step 1: Get AssemblyAI transcription and analysis
    console.log("Submitting to AssemblyAI...");
    let assemblyResults;
    let pronunciationAnalysis;
    try {
      // Pass the audioFile directly (before uploading to Cloudinary)
      assemblyResults = await getAssemblyAITranscription(audioFile, word);
      console.log("AssemblyAI results 1:", assemblyResults);
      pronunciationAnalysis = analyzeAssemblyResults(assemblyResults, word);
      console.log("AssemblyAI results:", pronunciationAnalysis);
    } catch (error) {
      console.error("Error with speech analysis:", error);
      pronunciationAnalysis = {
        detectedText: "Analysis failed",
        wordMatch: false,
        confidenceScore: 0,
        accuracyScore: 0,
        error: error.message
      };
    }

    // After AssemblyAI processing, continue with Cloudinary upload
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
      - Calculated accuracy score: ${pronunciationAnalysis.accuracyScore || 0}%
      - Pronunciation speed: ${(pronunciationAnalysis.pronunciationSpeed || 0).toFixed(2)} characters/second
      - Speech duration: ${(pronunciationAnalysis.totalDuration || 0).toFixed(2)} seconds
      - Language detected: ${pronunciationAnalysis.languageDetected || "en"}
      - Contains disfluencies: ${pronunciationAnalysis.disfluencies || false}
      ${pronunciationAnalysis.note ? `- Note: ${pronunciationAnalysis.note}` : ''}
      ${pronunciationAnalysis.detectedTextInstead ? `- Detected instead: "${pronunciationAnalysis.detectedTextInstead}"` : ''}

      Based on this data, please evaluate:
      1. Overall accuracy (percentage from 0-100%, considering both the transcription match and confidence score, use the calculated accuracy score provided as a guide but you can adjust it if warranted)
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

    // Create fallback response using the calculated accuracy
    const fallbackResponse = {
      success: true,
      word: word,
      accuracy: pronunciationAnalysis.accuracyScore ||
        (pronunciationAnalysis.wordMatch ?
          Math.round((pronunciationAnalysis.confidenceScore || 0.5) * 80) : 40),
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

    // Get the model
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse the text response to JSON
      const jsonResponse = safeJsonParse(text, fallbackResponse);

      // Add AssemblyAI raw data to the response
      jsonResponse.assemblyAiData = {
        wordMatch: pronunciationAnalysis.wordMatch || false,
        confidenceScore: pronunciationAnalysis.confidenceScore || 0,
        detectedText: pronunciationAnalysis.detectedText || "",
        languageDetected: pronunciationAnalysis.languageDetected || "en",
        pronunciationSpeed: pronunciationAnalysis.pronunciationSpeed || 0,
        calculatedAccuracy: pronunciationAnalysis.accuracyScore || 0
      };

      // Ensure we have a valid accuracy value, default to the calculated one if needed
      if (typeof jsonResponse.accuracy !== 'number' || jsonResponse.accuracy < 0) {
        jsonResponse.accuracy = pronunciationAnalysis.accuracyScore || fallbackResponse.accuracy;
      }

      // Save the pronunciation attempt in the database with enhanced data
      try {
        const savedAttempt = await prisma.pronunciationAttempt.create({
          data: {
            userId: user.id,
            word: word,
            audioUrl: audioUrl,
            accuracy: jsonResponse.accuracy || pronunciationAnalysis.accuracyScore || 0,
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

      // Use fallback with calculated accuracy if AI fails
      fallbackResponse.audioUrl = audioUrl;
      fallbackResponse.aiError = "AI processing failed: " + aiError.message;

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
      } catch (dbError) {
        console.error("Database error saving fallback:", dbError);
        fallbackResponse.attemptId = "temporary-" + Date.now();
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
// Rest of the router code remains the same
// Including: /history, /tips, /compare, /recommendations, and /attempt/:id endpoints

// The rest of the code is unchanged from the original file

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

    // Clean up temp files
    try {
      if (fs.existsSync(files.userAudio[0].path)) {
        fs.unlinkSync(files.userAudio[0].path);
      }
      if (fs.existsSync(files.referenceAudio[0].path)) {
        fs.unlinkSync(files.referenceAudio[0].path);
      }
    } catch (fsError) {
      console.error("Error cleaning up temp files:", fsError);
      // Continue processing even if cleanup fails
    }

    // Process both audio files with AssemblyAI
    const userTranscription = await getAssemblyAITranscription(userAudioUrl, word);
    const referenceTranscription = await getAssemblyAITranscription(referenceAudioUrl, word);

    // Analyze both transcriptions
    const userAnalysis = analyzeAssemblyResults(userTranscription, word);
    const referenceAnalysis = analyzeAssemblyResults(referenceTranscription, word);

    // Prepare prompt for Gemini to compare the pronunciations
    const prompt = `
      You are an expert English pronunciation coach comparing a student's pronunciation with a reference pronunciation.

      Word being pronounced: "${word}"

      Student's Pronunciation:
      - Transcribed text: "${userAnalysis.detectedText}"
      - Accuracy score: ${userAnalysis.accuracyScore || 0}%
      - Confidence score: ${(userAnalysis.confidenceScore || 0) * 100}%
      ${userAnalysis.note ? `- Note: ${userAnalysis.note}` : ''}

      Reference Pronunciation:
      - Transcribed text: "${referenceAnalysis.detectedText}"
      - Accuracy score: ${referenceAnalysis.accuracyScore || 0}%
      - Confidence score: ${(referenceAnalysis.confidenceScore || 0) * 100}%
      ${referenceAnalysis.note ? `- Note: ${referenceAnalysis.note}` : ''}

      Please analyze:
      1. How closely the student's pronunciation matches the reference
      2. Specific differences in pronunciation
      3. What the student is doing well
      4. What the student needs to improve
      5. Specific exercises to help improve

      IMPORTANT: Ensure your response is valid JSON with no trailing commas or syntax errors.
      Format your response exactly like this:
      {
        "success": true,
        "word": "${word}",
        "matchPercentage": 85,
        "differences": ["specific differences noted"],
        "strengths": ["what the student is doing well"],
        "improvements": ["what needs improvement"],
        "exercises": ["2-3 specific exercises"],
        "transcriptionDetails": {
          "user": "${userAnalysis.detectedText || ""}",
          "reference": "${referenceAnalysis.detectedText || ""}"
        }
      }
    `;

    try {
      // Generate content with Gemini
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Create fallback response
      const fallbackResponse = {
        success: true,
        word: word,
        matchPercentage: Math.min(100, Math.round(userAnalysis.accuracyScore || 0)),
        differences: ["Analysis unavailable - using basic comparison"],
        strengths: ["Attempted pronunciation"],
        improvements: ["Work on overall clarity"],
        exercises: [
          `Say the word slowly: ${word.split('').join('-')}`,
          "Practice with a native speaker",
          "Listen to reference pronunciations online"
        ],
        transcriptionDetails: {
          user: userAnalysis.detectedText || "",
          reference: referenceAnalysis.detectedText || ""
        },
        rawData: {
          userAnalysis,
          referenceAnalysis
        }
      };

      // Parse the response
      const jsonResponse = safeJsonParse(text, fallbackResponse);

      // Add audio URLs to the response
      jsonResponse.audioUrls = {
        user: userAudioUrl,
        reference: referenceAudioUrl
      };

      return res.json(jsonResponse);
    } catch (aiError) {
      console.error("AI processing error:", aiError);

      const fallbackResponse = {
        success: true,
        word: word,
        matchPercentage: Math.min(100, Math.round(userAnalysis.accuracyScore || 0)),
        differences: ["Analysis unavailable - processing error"],
        strengths: ["Attempted pronunciation"],
        improvements: ["Work on overall clarity"],
        exercises: [
          `Say the word slowly: ${word.split('').join('-')}`,
          "Practice with a native speaker",
          "Listen to reference pronunciations online"
        ],
        transcriptionDetails: {
          user: userAnalysis.detectedText || "",
          reference: referenceAnalysis.detectedText || ""
        },
        audioUrls: {
          user: userAudioUrl,
          reference: referenceAudioUrl
        },
        rawData: {
          userAnalysis,
          referenceAnalysis
        },
        error: "AI processing failed: " + aiError.message
      };

      return res.json(fallbackResponse);
    }
  } catch (error) {
    console.error("Error comparing pronunciations:", error);

    // Clean up temp files if they exist
    if (files.userAudio && files.userAudio[0] && fs.existsSync(files.userAudio[0].path)) {
      try {
        fs.unlinkSync(files.userAudio[0].path);
      } catch (cleanupError) {
        console.error("Error cleaning up user audio file:", cleanupError);
      }
    }

    if (files.referenceAudio && files.referenceAudio[0] && fs.existsSync(files.referenceAudio[0].path)) {
      try {
        fs.unlinkSync(files.referenceAudio[0].path);
      } catch (cleanupError) {
        console.error("Error cleaning up reference audio file:", cleanupError);
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
 * Endpoint to get recommendations for words to practice based on user history
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

    const user = await prisma.user.findUnique({
      where: { email: email.toString() },
      select: {
        id: true,
        motherToung: true,
        englishLevel: true,
        pronunciationAttempts: {
          select: {
            word: true,
            accuracy: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 50
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    // Get the user's pronunciation history
    const attempts = user.pronunciationAttempts;

    // If user has fewer than 3 attempts, provide basic recommendations
    if (attempts.length < 3) {
      const basicRecommendations = [
        "hello", "thank", "please", "water", "language",
        "beautiful", "necessary", "comfortable", "opportunity", "communicate",
        "specifically", "pronunciation", "interesting", "environment", "regularly"
      ];

      // Select random words from the basic list
      const numToRecommend = Math.min(parseInt(count) || 5, basicRecommendations.length);
      const shuffled = basicRecommendations.sort(() => 0.5 - Math.random());
      const selectedWords = shuffled.slice(0, numToRecommend);

      return res.json({
        success: true,
        recommendations: selectedWords.map(word => ({
          word,
          reason: "Recommended for beginners",
          difficulty: "Mixed"
        })),
        note: "Based on common English words for practice"
      });
    }

    // Create a word difficulty map based on accuracy
    const wordDifficultyMap = {};
    attempts.forEach(attempt => {
      if (!wordDifficultyMap[attempt.word] || attempt.createdAt > wordDifficultyMap[attempt.word].date) {
        wordDifficultyMap[attempt.word] = {
          accuracy: attempt.accuracy,
          date: attempt.createdAt
        };
      }
    });

    // Find difficult words (accuracy < 70%)
    const difficultWords = Object.entries(wordDifficultyMap)
      .filter(([_, data]) => data.accuracy < 70)
      .map(([word, data]) => ({
        word,
        accuracy: data.accuracy,
        date: data.date
      }))
      .sort((a, b) => a.accuracy - b.accuracy); // Sort by lowest accuracy first

    // Prepare prompt for Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Create prompt for pronunciation recommendations
    const prompt = `
      You are an expert English pronunciation coach recommending words for a student to practice.

      Student Profile:
      - Native language: ${user.motherToung || "Unknown"}
      - Current English level: ${user.englishLevel || "Intermediate"}

      Their difficult words (based on past practice):
      ${difficultWords.length > 0 ?
        difficultWords.slice(0, 5).map(w => `- "${w.word}" (${w.accuracy}% accuracy)`).join('\n')
        : "No particularly difficult words identified yet"}

      Words they've already practiced:
      ${attempts.slice(0, 10).map(a => `- "${a.word}"`).join('\n')}

      Based on this information, recommend ${count || 5} words for them to practice that:
      1. Include some words they found difficult (if any)
      2. Include new words with similar phonetic patterns that might be challenging
      3. Match their English level
      4. Would be useful for everyday conversation

      IMPORTANT: Ensure your response is valid JSON with no trailing commas or syntax errors.
      Format your response exactly like this:
      {
        "success": true,
        "recommendations": [
          {
            "word": "example",
            "reason": "Brief explanation of why this word is recommended",
            "difficulty": "Easy/Medium/Hard",
            "phonetic": "phonetic transcription"
          }
        ]
      }
    `;

    try {
      // Generate content
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Create fallback response
      const fallbackRecommendations = [
        ...(difficultWords.slice(0, 2).map(w => ({
          word: w.word,
          reason: "Previous difficulty with this word",
          difficulty: "Hard",
          phonetic: `/${w.word}/`
        }))),
        {
          word: "pronunciation",
          reason: "Common challenge for language learners",
          difficulty: "Hard",
          phonetic: "/prəˌnʌn.siˈeɪ.ʃən/"
        },
        {
          word: "opportunity",
          reason: "Contains several challenging vowel sounds",
          difficulty: "Medium",
          phonetic: "/ˌɒp.əˈtjuː.nə.ti/"
        },
        {
          word: "comfortable",
          reason: "Many English speakers reduce syllables",
          difficulty: "Medium",
          phonetic: "/ˈkʌmf.tə.bəl/"
        }
      ].slice(0, parseInt(count) || 5);

      const fallbackResponse = {
        success: true,
        recommendations: fallbackRecommendations
      };

      // Parse the response
      const jsonResponse = safeJsonParse(text, fallbackResponse);

      return res.json(jsonResponse);
    } catch (aiError) {
      console.error("AI processing error for recommendations:", aiError);

      // Fallback to basic recommendations
      return res.json({
        success: true,
        recommendations: [
          ...(difficultWords.slice(0, 2).map(w => ({
            word: w.word,
            reason: "Previous difficulty with this word",
            difficulty: "Hard",
            phonetic: `/${w.word}/`
          }))),
          {
            word: "pronunciation",
            reason: "Common challenge for language learners",
            difficulty: "Hard",
            phonetic: "/prəˌnʌn.siˈeɪ.ʃən/"
          },
          {
            word: "opportunity",
            reason: "Contains several challenging vowel sounds",
            difficulty: "Medium",
            phonetic: "/ˌɒp.əˈtjuː.nə.ti/"
          },
          {
            word: "comfortable",
            reason: "Many English speakers reduce syllables",
            difficulty: "Medium",
            phonetic: "/ˈkʌmf.tə.bəl/"
          }
        ].slice(0, parseInt(count) || 5),
        note: "Fallback recommendations due to processing error"
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
 * Endpoint to get details of a specific pronunciation attempt
 * GET /pronunciation/attempt/:id
 */
router.get("/attempt/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Attempt ID is required"
      });
    }

    // Get the pronunciation attempt
    const attempt = await prisma.pronunciationAttempt.findUnique({
      where: {
        id: id
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
        detectedText: true,
        user: {
          select: {
            name: true,
            email: true,
            motherToung: true,
            englishLevel: true
          }
        }
      }
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        error: "Pronunciation attempt not found"
      });
    }

    // Format the attempt record
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

    // Format response
    const formattedAttempt = {
      id: attempt.id,
      word: attempt.word,
      accuracy: attempt.accuracy || 0,
      feedback: feedbackObj,
      audioUrl: attempt.audioUrl,
      date: attempt.createdAt,
      transcriptionDetails: {
        assemblyConfidence: attempt.assemblyConfidence || 0,
        detectedText: attempt.detectedText || "No transcription available",
        data: transcriptionData
      },
      user: {
        name: attempt.user.name,
        email: attempt.user.email,
        nativeLanguage: attempt.user.motherToung,
        englishLevel: attempt.user.englishLevel
      }
    };

    res.json({
      success: true,
      attempt: formattedAttempt
    });
  } catch (error) {
    console.error("Error fetching pronunciation attempt:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message
    });
  }
});

export default router;
