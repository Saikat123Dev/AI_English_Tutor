import { GoogleGenerativeAI } from "@google/generative-ai";
import { AssemblyAI } from 'assemblyai';
import { v2 as cloudinary } from 'cloudinary';
import express from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from "../lib/db.js";
import redisClient from "../lib/redis.js";
import { tavilySearch } from "../lib/tavily.js";

// Configure external services
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
  limits: { fileSize: 10 * 1024 * 1024 },
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

// ======================================
// ENHANCED REDIS CACHE CONFIGURATION
// ======================================

// Cache configuration - TTLs in seconds
const CACHE_TTL = {
  TIPS: 60 * 60 * 24 * 7, // 7 days for pronunciation tips
  RECOMMENDATIONS: 60 * 60 * 24, // 1 day for word recommendations
  TRENDING: 60 * 60 * 6, // 6 hours for trending words
  HISTORY: 60 * 5, // 5 minutes for user history
  ATTEMPT: 60 * 60 * 24 * 30, // 30 days for pronunciation attempts
  PERSONALIZED: 60 * 60 * 3, // 3 hours for personalized content
  USER_PROFILE: 60 * 60 * 24, // 1 day for user profiles
  WORD_DICT: 60 * 60 * 24 * 30 // 30 days for word dictionary entries
};

// Redis key generators to ensure consistent key formats
const cacheKeys = {
  tips: (word, lang = null) => `pronunciation:tips:${word.toLowerCase()}${lang ? `:${lang}` : ''}`,
  recommendations: (email, count) => `pronunciation:recommendations:${email}:${count || 5}`,
  history: (email) => `pronunciation:history:${email}`,
  attempt: (id) => `pronunciation:attempt:${id}`,
  personalized: (email) => `pronunciation:personalized:${email}`,
  trendingWords: () => `pronunciation:trendingWords`,
  userProfile: (email) => `user:email:${email}`,
  wordDictionary: (word) => `word:dict:${word.toLowerCase()}`
};

/**
 * Enhanced helper function to get/set cache with TTL and logging
 * - Fixed to handle client connection issues gracefully
 */
async function withCache(key, ttl, fetchFn, options = {}) {
  const { logHits = true, logMisses = true, forceFresh = false, maxRetries = 2, retryDelay = 200 } = options;

  // Check if Redis client is disabled (for testing or development)
  const redisDisabled = process.env.DISABLE_REDIS === 'true';
  if (redisDisabled) {
    console.log(`⏩ Redis disabled by environment variable, bypassing cache for key: ${key}`);
    return await fetchFn();
  }

  try {
    // Verify that Redis client exists and is connected
    if (!redisClient.client || !redisClient.client.isOpen) {
      console.warn(`⚠️ Redis client not connected, bypassing cache for key: ${key}`);
      return await fetchFn();
    }

    // Skip cache lookup if forceFresh is true
    if (!forceFresh) {
      try {
        // Try to get data from cache
        const cachedData = await redisClient.client.get(key);

        if (cachedData) {
          if (logHits) {
            console.log(`✅ CACHE HIT: ${key}`);
          }

          try {
            return JSON.parse(cachedData);
          } catch (parseError) {
            console.error(`Error parsing cached data for key ${key}:`, parseError);
            // Continue to fetch fresh data if parsing fails
          }
        } else if (logMisses) {
          console.log(`❌ CACHE MISS: ${key}`);
        }
      } catch (cacheGetError) {
        console.error(`Error getting cache for key ${key}:`, cacheGetError);
        // Continue execution with fresh data fetch
      }
    } else if (logMisses) {
      console.log(`⏩ CACHE BYPASS (forceFresh): ${key}`);
    }

    // If not in cache or forceFresh, fetch data
    const startTime = Date.now();
    const freshData = await fetchFn();
    const fetchTime = Date.now() - startTime;

    if (logMisses) {
      console.log(`⏱️ Fetch completed in ${fetchTime}ms for ${key}`);
    }

    // Store in cache with TTL if Redis is available
    if (redisClient.client && redisClient.client.isOpen) {
      try {
        await redisClient.client.setEx(key, ttl, JSON.stringify(freshData));

        if (logMisses) {
          console.log(`📦 Cached ${key} for ${ttl} seconds`);
        }
      } catch (cacheError) {
        console.error(`Error caching data for key ${key}:`, cacheError);
        // Continue returning the freshly fetched data even if caching fails
      }
    } else {
      console.warn(`⚠️ Redis not available, skipping cache storage for ${key}`);
    }

    return freshData;
  } catch (error) {
    console.error(`Cache operation failed for key ${key}:`, error);
    // Fallback to fetching data directly if cache fails
    return await fetchFn();
  }
}

/**
 * Helper to efficiently invalidate multiple cache keys by pattern
 * @param {string} pattern - Redis key pattern with wildcard (*)
 * @returns {Promise<number>} - Number of keys deleted
 */
async function invalidateCacheByPattern(pattern) {
  try {
    // First check if Redis client is available
    if (!redisClient.client || !redisClient.client.isOpen) {
      console.warn(`⚠️ Redis client not connected, cannot invalidate cache pattern: ${pattern}`);
      return 0;
    }

    const keys = await redisClient.client.keys(pattern);
    if (keys.length > 0) {
      const deletedCount = await redisClient.client.del(keys);
      console.log(`🧹 Invalidated ${deletedCount} cache keys matching pattern: ${pattern}`);
      return deletedCount;
    }
    return 0;
  } catch (error) {
    console.error(`Failed to invalidate cache with pattern ${pattern}:`, error);
    return 0;
  }
}

/**
 * Enhanced function to get user profile with better error handling and logging
 * @param {string} email - The user's email
 * @param {boolean} forceFresh - Whether to force a fresh fetch from the database
 * @returns {Promise<Object>} - The user profile data
 */
async function getUserProfile(email, forceFresh = false) {
  if (!email) {
    throw new Error("Email is required to fetch user profile");
  }

  const userCacheKey = cacheKeys.userProfile(email);

  try {
    console.log(await withCache(userCacheKey, CACHE_TTL.USER_PROFILE))
    return await withCache(userCacheKey, CACHE_TTL.USER_PROFILE, async () => {
      console.log(`👤 Fetching user profile for ${email} from database`);

      const userData = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          motherToung: true,
          englishLevel: true,
          occupation: true,
          interests: true,
          focus: true
        }
      });

      if (!userData) {
        throw new Error(`User not found with email: ${email}`);
      }

      console.log(`✅ Found user ${userData.name || email} (ID: ${userData.id})`);
      return userData;
    }, { forceFresh });
  } catch (error) {
    console.error(`❌ Error fetching user profile for ${email}:`, error);
    throw error;
  }
}

/**
 * Function to update user cache after profile changes
 * @param {string} email - The user's email
 * @returns {Promise<void>}
 */
async function invalidateUserCache(email) {
  if (!email) return;

  try {
    const userCacheKey = cacheKeys.userProfile(email);
    console.log(`🧹 Invalidating user profile cache for ${email}`);

    if (redisClient.client && redisClient.client.isOpen) {
      await redisClient.client.del(userCacheKey);

      // Also invalidate associated recommendations
      await invalidateCacheByPattern(`pronunciation:recommendations:${email}:*`);
      await invalidateCacheByPattern(`pronunciation:personalized:${email}`);
      await invalidateCacheByPattern(`pronunciation:history:${email}`);

      console.log(`✅ Successfully invalidated user caches for ${email}`);
    } else {
      console.warn(`⚠️ Redis client not available, skipping user cache invalidation for ${email}`);
    }
  } catch (error) {
    console.error(`❌ Error invalidating user cache for ${email}:`, error);
    // Don't throw - this is a non-critical operation
  }
}

/**
 * Function to store pronunciation attempts in the database
 * - FIXED to properly handle user relationship
 * @param {Object} attemptData - The pronunciation attempt data to store
 * @param {string} attemptData.userId - User ID
 * @param {string} attemptData.word - The word being practiced
 * @param {string} attemptData.audioUrl - URL to the audio recording
 * @param {number} attemptData.accuracy - Accuracy score (0-100)
 * @param {Object} attemptData.feedback - Feedback object from AI
 * @param {Object} attemptData.transcriptionData - Data from speech-to-text
 * @param {number} attemptData.assemblyConfidence - Confidence score from AssemblyAI
 * @param {string} attemptData.detectedText - The text detected by speech-to-text
 * @returns {Promise<Object>} - The saved pronunciation attempt
 */
async function storePronunciationAttempt(attemptData) {
  try {
    console.log("💾 Saving pronunciation attempt to database...");

    // Validate that userId exists
    if (!attemptData.userId) {
      throw new Error("User ID is required to save pronunciation attempt");
    }

    // Ensure feedback is stored as a string if it's an object
    const feedbackStr = typeof attemptData.feedback === 'object'
      ? JSON.stringify(attemptData.feedback)
      : attemptData.feedback;

    // Ensure transcriptionData is stored as a string if it's an object
    const transcriptionStr = typeof attemptData.transcriptionData === 'object'
      ? JSON.stringify(attemptData.transcriptionData)
      : attemptData.transcriptionData;

    // Store the attempt in the database
    const savedAttempt = await prisma.pronunciationAttempt.create({
      data: {
        userId: attemptData.userId,
        word: attemptData.word,
        audioUrl: attemptData.audioUrl,
        accuracy: attemptData.accuracy || 0,
        feedback: feedbackStr,
        transcriptionData: transcriptionStr,
        assemblyConfidence: attemptData.assemblyConfidence || 0,
        detectedText: attemptData.detectedText || ""
      }
    });

    console.log(`✅ Successfully saved pronunciation attempt for "${attemptData.word}" (ID: ${savedAttempt.id})`);

    // Invalidate relevant caches
    try {
      if (attemptData.email) {
        console.log(`🧹 Invalidating history cache for ${attemptData.email}`);
        await redisClient.client.del(cacheKeys.history(attemptData.email));

        // Also invalidate any recommendation caches that might be affected
        await invalidateCacheByPattern(`pronunciation:recommendations:${attemptData.email}:*`);
      }
    } catch (cacheError) {
      console.error("❌ Failed to invalidate cache:", cacheError);
      // Continue even if cache invalidation fails
    }

    return savedAttempt;
  } catch (error) {
    console.error("❌ Database error saving pronunciation attempt:", error);
    throw new Error(`Failed to save pronunciation attempt: ${error.message}`);
  }
}

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

    const transcript = await assemblyClient.transcripts.transcribe({
      audio: fs.createReadStream(audioFile.path)
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
 * Enhanced to better support British accent and provide more accurate scoring
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
      accuracyScore: 0,
      accentVariant: null
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
    accuracyScore: 0,
    accentVariant: null
  };

  // Detect accent variant based on language code
  if (analysis.languageDetected === "en-GB") {
    analysis.accentVariant = "British";
  } else if (analysis.languageDetected === "en-US") {
    analysis.accentVariant = "American";
  } else if (analysis.languageDetected === "en-AU") {
    analysis.accentVariant = "Australian";
  } else {
    analysis.accentVariant = "General";
  }

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
  let phonemeMatchBonus = 0;

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

  // Phonetic equivalence mapping for British/American differences
  const phoneticEquivalents = {
    // Common British-American pronunciation differences
    'əʊ': 'oʊ', // British 'go' vs American 'go'
    'ɒ': 'ɑː', // British 'lot' vs American 'lot'
    'ɑː': 'æ', // British 'bath' vs American 'bath'
    'ɪə': 'ɪr', // British 'near' vs American 'near'
    'eə': 'er', // British 'square' vs American 'square'
    'tʃ': 't', // Some British 'tune' vs American 'tune'
    'ʊə': 'ʊr', // British 'cure' vs American 'cure'
    'r': '', // Non-rhotic in British English (car, far)
    't': 'd', // Flapped T in American English (better)
  };

  // British-specific common spelling patterns
  const britishSpellingPatterns = [
    { brit: 'our', us: 'or' }, // colour/color
    { brit: 're', us: 'er' },  // centre/center
    { brit: 'ise', us: 'ize' }, // recognise/recognize
    { brit: 'yse', us: 'yze' }, // analyse/analyze
    { brit: 'ogue', us: 'og' }, // catalogue/catalog
    { brit: 'ae', us: 'e' },    // anaemia/anemia
    { brit: 'oe', us: 'e' },    // oestrogen/estrogen
    { brit: 'l', us: 'll' },    // travelled/traveled (doubled final consonant)
  ];

  // Apply phonetic matching bonus for accent variants
  function calculatePhoneticMatchBonus() {
    let bonus = 0;

    // Check for British spelling patterns in the target word
    if (analysis.accentVariant === "British" || analysis.accentVariant === "General") {
      for (const pattern of britishSpellingPatterns) {
        if (lowerCaseTarget.includes(pattern.brit)) {
          bonus += 5; // Bonus for matching British spelling patterns
          break;
        }
      }
    }

    // Check audio duration (British pronunciation often more deliberate)
    if (analysis.totalDuration > 0) {
      const expectedDuration = lowerCaseTarget.length * 0.15; // approx 150ms per character
      const durationRatio = analysis.totalDuration / expectedDuration;

      // British speakers often take slightly longer on certain vowel sounds
      if (analysis.accentVariant === "British" && durationRatio > 1 && durationRatio < 1.5) {
        bonus += 5;
      }
    }

    return bonus;
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

    // IMPROVED: More generous base accuracy for exact matches
    // Removed the artificial ceiling - perfect pronunciations can reach 100%
    baseAccuracy = 80 + (analysis.confidenceScore * 20); // Max 100%
    confidentMatch = true;

    // Apply accent-specific bonus
    phonemeMatchBonus = calculatePhoneticMatchBonus();
  }
  // Case 2: The transcription matches exactly the target word (full transcription)
  else if (detectedTextLower === lowerCaseTarget) {
    analysis.wordMatch = true;
    analysis.confidenceScore = 0.95; // High confidence for exact match
    baseAccuracy = 95; // Very good match - increased from 90
    confidentMatch = true;

    // Apply accent-specific bonus
    phonemeMatchBonus = calculatePhoneticMatchBonus();
  }
  // Case 3: The target word is contained within the transcription
  else if (detectedTextLower.includes(lowerCaseTarget)) {
    analysis.wordMatch = true;
    analysis.confidenceScore = 0.8; // Increased from 0.7
    analysis.note = "Word detected as part of a longer phrase";
    baseAccuracy = 80; // Good but not perfect - increased from 75

    // Apply accent-specific bonus
    phonemeMatchBonus = calculatePhoneticMatchBonus();
  }
  // Case 4: Partial match using string similarity
  else if (detectedTextLower) {
    const similarity = calculateSimilarity(lowerCaseTarget, detectedTextLower);

    // Handle British-American variations through phonetic equivalence matching
    let enhancedSimilarity = similarity;

    // Check for potential British-American pronunciation differences
    // This helps with words like "water", "schedule", "aluminum/aluminium", etc.
    if (similarity >= 60 && similarity < 90) {
      // Apply phonetic equivalence checks
      for (const [britPron, usPron] of Object.entries(phoneticEquivalents)) {
        // If the word contains this sound pattern, consider it equivalent
        if (detectedTextLower.includes(britPron) || detectedTextLower.includes(usPron)) {
          enhancedSimilarity = Math.min(enhancedSimilarity + 15, 95); // Boost similarity but cap at 95%
          break;
        }
      }
    }

    if (enhancedSimilarity >= 75) {
      analysis.wordMatch = true;
      analysis.confidenceScore = enhancedSimilarity / 100;
      analysis.note = "Close pronunciation detected";
      baseAccuracy = enhancedSimilarity;

      // Apply accent-specific bonus
      phonemeMatchBonus = calculatePhoneticMatchBonus();
    } else if (enhancedSimilarity >= 60) {
      analysis.wordMatch = false;
      analysis.confidenceScore = enhancedSimilarity / 150; // Lower confidence
      analysis.note = "Partial pronunciation detected";
      baseAccuracy = enhancedSimilarity / 1.5; // Less penalty

      // Apply accent-specific bonus (smaller)
      phonemeMatchBonus = calculatePhoneticMatchBonus() / 2;
    } else {
      analysis.note = "Target word not clearly detected in transcript";
      analysis.detectedTextInstead = detectedTextLower;
      console.log(similarity);
      baseAccuracy = Math.max(20, similarity / 2); // Minimum 20% if anything was detected
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

  // IMPROVED: Apply the phoneme match bonus for accent variants
  baseAccuracy = Math.min(100, baseAccuracy + phonemeMatchBonus);

  // Finalize accuracy score
  analysis.accuracyScore = Math.round(baseAccuracy);

  // Include accent information in the analysis
  analysis.accentNotes = analysis.accentVariant
    ? `Detected ${analysis.accentVariant} accent patterns`
    : "No specific accent variant detected";

  return analysis;
}

// Updated safeJsonParse function with better error handling
function safeJsonParse(jsonString, fallback = {}) {
  try {
    // Remove any potential code block formatting and control characters
    const cleanedText = jsonString
      .replace(/```json|```/g, '')
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
      .trim();

    if (!cleanedText) {
      return fallback;
    }
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("JSON parse error:", error);
    console.error("Failed to parse:", jsonString.substring(0, 100) + "...");
    return fallback;
  }
}

// Updated prompt for Gemini - enhanced for better accent awareness
const buildPrompt = (word, user, pronunciationAnalysis) => {
  return `
  You are an expert English pronunciation coach evaluating a student's spoken word based on an uploaded **audio file**, not just transcribed text.

  Your evaluation should prioritize **acoustic and phonetic accuracy**, and you should appreciate both British and American pronunciation standards, acknowledging that both are equally valid.

  ### Student Profile:
  - Native language: ${user.motherToung || "Unknown"}
  - Current English level: ${user.englishLevel || "Intermediate"}

  ### Word to Pronounce:
  - Target Word: "${word}"

  ### Audio Analysis:
  You are provided with:
  - System-generated speech-to-text result: "${pronunciationAnalysis.detectedText}"
  - Word match detected: ${pronunciationAnalysis.wordMatch}
  - Confidence score: ${(pronunciationAnalysis.confidenceScore || 0) * 100}%
  - Calculated accuracy score: ${pronunciationAnalysis.accuracyScore || 0}%
  - Pronunciation speed: ${(pronunciationAnalysis.pronunciationSpeed || 0).toFixed(2)} characters/second
  - Speech duration: ${(pronunciationAnalysis.totalDuration || 0).toFixed(2)} seconds
  - Language/accent detected: ${pronunciationAnalysis.languageDetected || "en"}
  - Accent variant detected: ${pronunciationAnalysis.accentVariant || "General English"}
  - Contains disfluencies: ${pronunciationAnalysis.disfluencies || false}
  ${pronunciationAnalysis.note ? `- Note: ${pronunciationAnalysis.note}` : ''}
  ${pronunciationAnalysis.detectedTextInstead ? `- Detected instead: "${pronunciationAnalysis.detectedTextInstead}"` : ''}

  ### Important Instruction:
  - Do NOT artificially cap scores - if the pronunciation is excellent, it should receive an appropriately high score (90-100%).
  - British, American, Australian and other standard English accent variants should all be considered correct.
  - Focus on clarity and intelligibility rather than strict adherence to one accent standard.

  ### Your Task:
  1. Analyze the transcription data to evaluate the pronunciation against standard English pronunciation (both British and American standards are acceptable).
  2. Use the provided speech-to-text and confidence score as your primary data source.
  3. Focus on **phoneme-level precision**, intonation, stress, and clarity.
  4. If the student has achieved a near-perfect pronunciation (accuracy > 95%), make sure to acknowledge this.
### Output:
  Please return your evaluation in valid JSON format (strictly no trailing commas) like this:

  {
    "success": true,
    "word": "${word}",
    "accuracy": 85,
    "correctSounds": ["specific phonemes or syllables pronounced well"],
    "improvementNeeded": ["specific phonemes or syllables needing improvement"],
    "accentNotes": "Brief notes about the accent detected (if any)",
    "commonIssues": "Brief explanation of typical pronunciation challenges for speakers of ${user.motherToung || "this language"} when saying '${word}'",
    "practiceExercises": [
      "Practice breaking '${word}' into syllables and pronounce each slowly.",
      "Record yourself saying the word and compare it with native audio (e.g., Oxford Learner Dictionary).",
      "Use minimal pairs practice if similar sounds are getting mixed up."
    ],
    "encouragement": "You're doing great! With a little focused practice, your pronunciation will become even more clear and native-like. Keep it up!",
    "transcriptionDetails": {
      "detectedText": "${pronunciationAnalysis.detectedText || ""}",
      "confidenceScore": ${(pronunciationAnalysis.confidenceScore || 0) * 100},
      "accentVariant": "${pronunciationAnalysis.accentVariant || "General English"}"
    }
  }
  `;
};

/**
 * Enhanced function to fetch trending words with caching and backup
 * Includes fallback mechanism in case of failure
 * @param {number} count - Number of trending words to return
 * @returns {Promise<string[]>} - Array of trending words
 */
async function getTrendingWords(count = 10) {
  const cacheKey = cacheKeys.trendingWords();

  // Fallback data in case everything fails
  const fallbackWords = [
    "sustainability", "innovation", "cryptocurrency", "pandemic",
    "artificial", "intelligence", "climate", "remote", "digital",
    "transformation", "vaccine", "algorithm", "biodiversity", "equity",
    "metaverse", "blockchain", "resilience", "mindfulness", "automation"
  ];

  try {
    return await withCache(cacheKey, CACHE_TTL.TRENDING, async () => {
      try {
        // In a real implementation, these would come from an API
        // You could add actual API call here
        const trendingWords = [
          "sustainability", "innovation", "cryptocurrency", "pandemic",
          "artificial", "intelligence", "climate", "remote", "digital",
          "transformation", "vaccine", "algorithm", "biodiversity", "equity",
          "metaverse", "blockchain", "resilience", "mindfulness", "automation",
          "ecosystem", "sustainable", "infrastructure", "transparency", "renewable"
        ];

        console.log(`📊 Retrieved ${trendingWords.length} trending words`);
        return trendingWords;
      } catch (error) {
        console.error("Error fetching trending words from source:", error);
        return fallbackWords;
      }
    }, { logHits: true });
  } catch (error) {
    console.error("Complete failure in getTrendingWords:", error);
    return fallbackWords.slice(0, count);
  }
}

/**
 * Enhanced function to call Gemini API with retry logic
 * @param {string} prompt - The prompt to send to Gemini
 * @param {Object} options - Options including retryCount and model
 * @returns {Promise<Object>} - Parsed JSON response
 */
async function callGeminiAPI(prompt, options = {}) {
  const { retryCount = 2, model = "gemini-2.0-flash" } = options;
  let lastError = null;

  for (let attempt = 0; attempt <= retryCount; attempt++) {
    if (attempt > 0) {
      console.log(`🔄 Retry attempt ${attempt}/${retryCount} for Gemini API call`);
      // Add exponential backoff
      await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, attempt)));
    }

    try {
      // Get the generative model
      const genModel = genAI.getGenerativeModel({ model });

      // Generate content
      const result = await genModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Clean the text of any code block markup that might be present
      const cleanedText = text.replace(/```json|```/g, '').trim();

      // Try to parse as JSON
      try {
        return JSON.parse(cleanedText);
      } catch (e) {
        console.error("Error parsing Gemini response as JSON:", e);
        // Attempt a more aggressive cleanup and parsing
        const extractedJSON = cleanedText.match(/\{[\s\S]*?\}/);
        if (extractedJSON) {
          try {
            return JSON.parse(extractedJSON[0]);
          } catch (e2) {
            console.error("Second attempt to parse JSON failed:", e2);
            lastError = e2;
            // Continue to retry or return raw response if this is the last attempt
            if (attempt === retryCount) {
              return { rawResponse: cleanedText };
            }
          }
        } else {
          lastError = new Error("No JSON object found in response");
          // Continue to retry or return raw response if this is the last attempt
          if (attempt === retryCount) {
            return { rawResponse: cleanedText };
          }
        }
      }
    } catch (error) {
      console.error(`Attempt ${attempt + 1}/${retryCount + 1} failed:`, error);
      lastError = error;

      // If this is the last attempt, throw the error
      if (attempt === retryCount) {
        throw new Error("Failed to process with Gemini after multiple attempts: " + error.message);
      }
    }
  }

  // This should not be reached due to the throw in the last iteration
  throw lastError || new Error("Unknown error in Gemini API call");
}

/**
 * Enhanced function to fetch and cache word dictionary information with database lookup
 * Three-tier caching: Redis → DB → AI
 * @param {string} word - The word to look up
 * @returns {Promise<Object>} - Word dictionary data
 */
async function getWordDictionaryData(word) {
  const cacheKey = cacheKeys.wordDictionary(word);
  const normalizedWord = word.toLowerCase().trim();

  return withCache(cacheKey, CACHE_TTL.WORD_DICT, async () => {
    // Step 1: Not in Redis cache, try to find in database
    console.log(`📚 Checking database for word: "${normalizedWord}"`);
    try {
      const dbWordData = await prisma.wordDictionary.findUnique({
        where: { word: normalizedWord }
      });

      // Found in database, return the data
      if (dbWordData) {
        console.log(`✅ Found word "${normalizedWord}" in database`);
        // Parse the stored content and add metadata
        let dictData = typeof dbWordData.content === 'string'
          ? JSON.parse(dbWordData.content)
          : dbWordData.content;

        return {
          ...dictData,
          phonetic: dbWordData.phonetic || dictData.phonetic,
          syllables: dbWordData.syllables || dictData.syllables,
          source: "database",
          cachedAt: dbWordData.updatedAt.toISOString()
        };
      }
    } catch (dbError) {
      console.error(`❌ Database error looking up word "${normalizedWord}":`, dbError);
      // Continue to AI generation if database lookup fails
    }

    // Step 2: Not in Redis or DB, generate with AI
    console.log(`🤖 Generating dictionary data for word: "${normalizedWord}" using AI`);

    // Get detailed word information from Gemini
    const prompt = `
      As a dictionary expert, please provide detailed information about the word "${normalizedWord}".

      Include the following information:
      1. Phonetic transcription (IPA)
      2. Syllable breakdown
      3. Part of speech
      4. Etymology (brief)
      5. Common usage examples

      Format your response as valid JSON with this structure:
      {
        "word": "${normalizedWord}",
        "phonetic": "IPA transcription",
        "syllables": ["how", "the", "word", "is", "broken", "down"],
        "stress": "which syllable has primary stress (1-based index)",
        "partOfSpeech": ["noun", "verb", "adjective"], // can be multiple
        "definition": "brief definition",
        "etymology": "brief etymology",
        "examples": ["usage example 1", "usage example 2"],
        "difficulty": "Easy/Medium/Hard",
        "frequency": "Common/Uncommon/Rare"
      }
    `;

    try {
      const wordData = await callGeminiAPI(prompt, {
        retryCount: 1,
        model: "gemini-2.0-flash"
      });

      // Add timestamp and source for cache age tracking
      wordData.source = "ai";
      wordData.cachedAt = new Date().toISOString();

      // Step 3: Save to database for future use
      try {
        console.log(`💾 Saving word "${normalizedWord}" to database`);
        await prisma.wordDictionary.create({
          data: {
            word: normalizedWord,
            phonetic: wordData.phonetic || `/${normalizedWord}/`,
            syllables: Array.isArray(wordData.syllables)
              ? wordData.syllables.join('-')
              : wordData.syllables,
            content: wordData
          }
        });
        console.log(`✅ Saved word "${normalizedWord}" to database`);
      } catch (saveError) {
        console.error(`❌ Error saving word "${normalizedWord}" to database:`, saveError);
        // Continue even if saving to DB fails
      }

      return wordData;
    } catch (error) {
      console.error(`❌ Error fetching dictionary data for word "${normalizedWord}":`, error);

      // Return minimal fallback data
      const fallbackData = {
        word: normalizedWord,
        phonetic: `/${normalizedWord}/`,
        syllables: normalizedWord.split('').filter(c => 'aeiou'.includes(c.toLowerCase())).length > 1
          ? normalizedWord.replace(/([aeiou]+)/gi, '-$1-').replace(/^-|-$/g, '').split('-').filter(Boolean)
          : [normalizedWord],
        stress: "1",
        partOfSpeech: ["unknown"],
        definition: "Definition unavailable",
        etymology: "Etymology unavailable",
        examples: [`This is an example with the word "${normalizedWord}".`],
        difficulty: normalizedWord.length <= 4 ? "Easy" : normalizedWord.length <= 7 ? "Medium" : "Hard",
        frequency: "Unknown",
        source: "fallback",
        cachedAt: new Date().toISOString(),
        note: "Fallback data due to API error"
      };

      return fallbackData;
    }
  });
}

/**
 * Centralized error handler for API responses
 * @param {Error} error - The error that occurred
 * @param {Object} res - Express response object
 * @param {string} context - Context where the error occurred for better logging
 */
function handleApiError(error, res, context = "API") {
  // Log the error with context
  console.error(`❌ Error in ${context}:`, error);

  // Check for specific error types
  if (error.message.includes("User not found") || error.message.includes("No user with")) {
    return res.status(404).json({
      success: false,
      error: "User not found",
      message: "No user account found with the provided credentials"
    });
  }

  if (error.code === "P2025") {
    // Prisma record not found error
    return res.status(404).json({
      success: false,
      error: "Resource not found",
      message: error.meta?.cause || error.message
    });
  }

  if (error.code === "P2002") {
    // Prisma unique constraint error
    return res.status(409).json({
      success: false,
      error: "Duplicate entry",
      message: `A record with this ${error.meta?.target?.[0] || 'identifier'} already exists`
    });
  }

  if (error.code === "P2003") {
    // Prisma foreign key constraint error
    return res.status(400).json({
      success: false,
      error: "Invalid reference",
      message: `The referenced ${error.meta?.field_name || 'record'} does not exist`
    });
  }

  // Default to 500 for unexpected errors
  return res.status(500).json({
    success: false,
    error: "Internal Server Error",
    message: process.env.NODE_ENV === 'production'
      ? "An unexpected error occurred"
      : error.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  });
}

/**
 * File cleanup utility for temporary uploaded files
 * @param {Object} file - Multer file object
 */
function cleanupTempFile(file) {
  if (!file || !file.path) return;

  try {
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
      console.log(`🧹 Cleaned up temporary file: ${file.path}`);
    }
  } catch (error) {
    console.error(`⚠️ Error cleaning up temporary file: ${file.path}`, error);
    // Non-critical error, so we don't throw
  }
}

// POST /pronunciation/assess - Assess pronunciation (audio upload)
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

    console.log(`🎤 Processing pronunciation assessment for ${email}, word: "${word}"`);

    // Find the user (with enhanced function)
    let user = null;
    try {
      user = await getUserProfile(email);
    } catch (userError) {
      console.error("Failed to fetch user:", userError);
      return res.status(404).json({
        success: false,
        error: "User not found",
        message: userError.message
      });
    }

    // Ensure user was found and has an ID
    if (!user || !user.id) {
      return res.status(404).json({
        success: false,
        error: "User not found or invalid user ID"
      });
    }

    // Step 1: Get AssemblyAI transcription and analysis
    console.log("🎙️ Submitting to AssemblyAI...");
    let assemblyResults;
    let pronunciationAnalysis;
    try {
      // Pass the audioFile directly (before uploading to Cloudinary)
      assemblyResults = await getAssemblyAITranscription(audioFile, word);
      console.log("🔍 AssemblyAI transcription results:", assemblyResults.text);
      pronunciationAnalysis = analyzeAssemblyResults(assemblyResults, word);
      console.log("📊 Pronunciation analysis:", {
        detectedText: pronunciationAnalysis.detectedText,
        wordMatch: pronunciationAnalysis.wordMatch,
        confidenceScore: pronunciationAnalysis.confidenceScore,
        accuracyScore: pronunciationAnalysis.accuracyScore
      });
    } catch (error) {
      console.error("❌ Error with speech analysis:", error);
      pronunciationAnalysis = {
        detectedText: "Analysis failed",
        wordMatch: false,
        confidenceScore: 0,
        accuracyScore: 0,
        error: error.message
      };
    }

    // After AssemblyAI processing, continue with Cloudinary upload
    let audioUrl = '';
    try {
      console.log("☁️ Uploading audio to Cloudinary...");
      const uploadResult = await cloudinary.uploader.upload(audioFile.path, {
        resource_type: "video", // Audio files are handled as video in Cloudinary
        public_id: `pronunciation/${uuidv4()}`,
        folder: 'pronunciation_assessments'
      });
      audioUrl = uploadResult.secure_url;
      console.log("✅ Audio uploaded to:", audioUrl);
    } catch (uploadError) {
      console.error("❌ Cloudinary upload error:", uploadError);
      return res.status(500).json({
        success: false,
        error: "Failed to upload audio file",
        message: uploadError.message
      });
    }

    // Step 2: Create a prompt for Gemini with the AssemblyAI data
    console.log("🤖 Generating feedback prompt for Gemini...");
    const prompt = buildPrompt(word, user, pronunciationAnalysis);

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

    // Get the model and generate content
    try {
      console.log("🤖 Calling Gemini API for pronunciation feedback...");
      const aiResponse = await callGeminiAPI(prompt, {
        retryCount: 2,
        model: "gemini-2.0-flash"
      });

      console.log("✅ Successfully received Gemini feedback");

      // Parse the response to ensure it's properly formatted
      let jsonResponse;

      if (aiResponse.success && typeof aiResponse.accuracy === 'number') {
        jsonResponse = aiResponse;
        console.log(`✅ Using Gemini feedback directly`);
      } else if (aiResponse.rawResponse) {
        console.log(`⚠️ Using fallback feedback structure`);
        jsonResponse = fallbackResponse;
        jsonResponse.rawResponse = aiResponse.rawResponse.substring(0, 100) + "...";
      } else {
        console.log(`⚠️ Restructuring AI response`);
        // We got a response but need to ensure it has all expected fields
        jsonResponse = {
          ...fallbackResponse,
          ...aiResponse,
          accuracy: aiResponse.accuracy || fallbackResponse.accuracy
        };
      }

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

      // Try to get word dictionary data to enhance the response
      try {
        console.log(`🔍 Enhancing response with dictionary data for "${word}"`);
        const dictData = await getWordDictionaryData(word);

        // Add dictionary data to the response
        jsonResponse.dictionaryData = {
          phonetic: dictData.phonetic,
          syllables: dictData.syllables,
          partOfSpeech: dictData.partOfSpeech,
          examples: dictData.examples ? dictData.examples.slice(0, 2) : []
        };
      } catch (dictError) {
        console.error(`❌ Failed to get dictionary data for "${word}":`, dictError);
        // Continue without dictionary data
      }

      // Save the pronunciation attempt in the database with enhanced data
      // IMPORTANT: Fixed - ensure userId is properly passed
      try {
        const savedAttempt = await storePronunciationAttempt({
          userId: user.id, // Ensure user.id is passed here
          email: email, // For cache invalidation
          word: word,
          audioUrl: audioUrl,
          accuracy: jsonResponse.accuracy || pronunciationAnalysis.accuracyScore || 0,
          feedback: jsonResponse,
          transcriptionData: pronunciationAnalysis,
          assemblyConfidence: (pronunciationAnalysis.confidenceScore || 0) * 100,
          detectedText: pronunciationAnalysis.detectedText || ""
        });

        // Add the attempt ID and audio URL to the response
        jsonResponse.attemptId = savedAttempt.id;
        jsonResponse.audioUrl = audioUrl;
        jsonResponse.timestamp = new Date().toISOString();

        console.log(`✅ Assessment complete for "${word}" (ID: ${savedAttempt.id})`);
        return res.json(jsonResponse);
      } catch (dbError) {
        console.error("❌ Database error saving attempt:", dbError);

        // Continue with response even if DB save fails
        jsonResponse.attemptId = "temporary-" + Date.now();
        jsonResponse.audioUrl = audioUrl;
        jsonResponse.dbError = "Failed to save attempt: " + dbError.message;
        jsonResponse.timestamp = new Date().toISOString();

        return res.json(jsonResponse);
      }
    } catch (aiError) {
      console.error("❌ AI processing error:", aiError);

      // Use fallback with calculated accuracy if AI fails
      fallbackResponse.audioUrl = audioUrl;
      fallbackResponse.aiError = "AI processing failed: " + aiError.message;
      fallbackResponse.timestamp = new Date().toISOString();

      try {
        // Save fallback response using our updated function
        const savedAttempt = await storePronunciationAttempt({
          userId: user.id, // Ensure user.id is passed here
          email: email, // For cache invalidation
          word: word,
          audioUrl: audioUrl,
          accuracy: fallbackResponse.accuracy,
          feedback: fallbackResponse,
          transcriptionData: pronunciationAnalysis,
          assemblyConfidence: (pronunciationAnalysis.confidenceScore || 0) * 100,
          detectedText: pronunciationAnalysis.detectedText || ""
        });

        fallbackResponse.attemptId = savedAttempt.id;
      } catch (dbError) {
        console.error("❌ Database error saving fallback:", dbError);
        fallbackResponse.attemptId = "temporary-" + Date.now();
        fallbackResponse.dbError = "Failed to save attempt: " + dbError.message;
      }

      return res.json(fallbackResponse);
    }
  } catch (error) {
    console.error("❌ Error processing pronunciation:", error);
    return handleApiError(error, res, "Pronunciation Assessment");
  } finally {
    // Always try to clean up temp files
    if (audioFile && audioFile.path && fs.existsSync(audioFile.path)) {
      cleanupTempFile(audioFile);
    }
  }
});

router.get("/recommendations", async (req, res) => {
  try {
    const { email, count = 5, refresh = false } = req.query;
    const forceFresh = refresh === 'true';

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required"
      });
    }

    console.log(`📝 Getting recommendations for ${email}, count=${count}, refresh=${forceFresh}`);

    const cacheKey = cacheKeys.recommendations(email, count);

    const recommendations = await withCache(cacheKey, CACHE_TTL.RECOMMENDATIONS, async () => {
      console.log(`🔍 Fetching fresh recommendations for ${email}`);

      // Get user data with enhanced function
      let user;
      try {
        user = await getUserProfile(email);
      } catch (userError) {
        console.error(`Failed to fetch user profile for recommendations:`, userError);
        throw new Error("User not found");
      }

      // Get the user's pronunciation attempts
      const attempts = await prisma.pronunciationAttempt.findMany({
        where: { userId: user.id },
        select: {
          word: true,
          accuracy: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      });

      // Get trending words with caching
      const trendingWords = await getTrendingWords(Math.max(5, parseInt(count)));
      console.log(`📊 Got ${trendingWords.length} trending words for recommendations`);

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

      console.log(`📊 Found ${difficultWords.length} difficult words for user`);

      // If user has fewer than 3 attempts, provide trending and basic recommendations
      if (attempts.length < 3) {
        console.log(`👶 New user with <3 attempts, providing basic recommendations`);

        // Combine trending words with basic recommendations
        const basicRecommendations = [
          "hello", "thank", "please", "water", "language",
          "beautiful", "necessary", "comfortable", "opportunity", "communicate",
          "specifically", "pronunciation", "interesting", "environment", "regularly"
        ];

        // Select words, prioritizing trending words
        const numToRecommend = Math.min(parseInt(count) || 5, basicRecommendations.length + trendingWords.length);

        // Combine and shuffle both sets
        const combinedWords = [...trendingWords, ...basicRecommendations]
          .filter((word, index, self) => self.indexOf(word) === index) // Remove duplicates
          .sort(() => 0.5 - Math.random());

        const selectedWords = combinedWords.slice(0, numToRecommend);

        // Enhance the basic recommendations with dictionary data where possible
        const enhancedRecommendations = await Promise.all(
          selectedWords.map(async (word) => {
            try {
              // Try to get dictionary data for each word
              const dictData = await getWordDictionaryData(word);

              return {
                word,
                reason: trendingWords.includes(word)
                  ? "Trending topic in current discussions"
                  : "Recommended for English learners",
                difficulty: dictData.difficulty || calculateWordDifficulty(word),
                phonetic: dictData.phonetic || getSimplePhonetic(word),
                isTrending: trendingWords.includes(word),
                syllables: dictData.syllables || [word],
                partOfSpeech: dictData.partOfSpeech || ["unknown"]
              };
            } catch (error) {
              console.error(`Error enhancing word data for ${word}:`, error);

              // Fallback to simple data
              return {
                word,
                reason: trendingWords.includes(word)
                  ? "Trending topic in current discussions"
                  : "Recommended for English learners",
                difficulty: calculateWordDifficulty(word),
                phonetic: getSimplePhonetic(word),
                isTrending: trendingWords.includes(word)
              };
            }
          })
        );

        return {
          success: true,
          recommendations: enhancedRecommendations,
          note: "Based on trending topics and common English words",
          timestamp: new Date().toISOString()
        };
      }

      // Helper functions for fallback
      function calculateWordDifficulty(word) {
        if (word.length <= 4) return "Easy";
        if (word.length <= 7) return "Medium";
        return "Hard";
      }

      function getSimplePhonetic(word) {
        return `/${word.split('').join('.')}/`;
      }

      // Create prompt for Gemini to get personalized recommendations
      console.log(`🤖 Generating personalized recommendations via Gemini`);

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

        Current trending topics include:
        ${trendingWords.join(', ')}

        Based on this information, recommend ${count || 5} words for them to practice that:
        1. Include some words they found difficult (if any)
        2. Include new words with similar phonetic patterns that might be challenging
        3. Match their English level
        4. Include some trending/current words if appropriate for their level
        5. Would be useful for everyday conversation

        IMPORTANT: Ensure your response is valid JSON with no trailing commas or syntax errors.
        Format your response exactly like this:
        {
          "success": true,
          "recommendations": [
            {
              "word": "example",
              "reason": "Brief explanation of why this word is recommended",
              "difficulty": "Easy/Medium/Hard",
              "phonetic": "phonetic transcription",
              "isTrending": true/false
            }
          ]
        }
      `;

      try {
        // Generate content with retry capability
        const aiResponse = await callGeminiAPI(prompt, {
          retryCount: 2,
          model: "gemini-2.0-flash"
        });

        console.log(`✅ Successfully generated AI recommendations`);

        // Create fallback data for merging
       // Create fallback data for merging
       const fallbackRecommendations = [
        ...(difficultWords.slice(0, 2).map(w => ({
          word: w.word,
          reason: "Previous difficulty with this word",
          difficulty: "Hard",
          phonetic: getSimplePhonetic(w.word),
          isTrending: false
        }))),
        ...(trendingWords.slice(0, 2).map(w => ({
          word: w,
          reason: "Currently trending topic",
          difficulty: calculateWordDifficulty(w),
          phonetic: getSimplePhonetic(w),
          isTrending: true
        }))),
        {
          word: "pronunciation",
          reason: "Common challenge for language learners",
          difficulty: "Hard",
          phonetic: "/prəˌnʌn.siˈeɪ.ʃən/",
          isTrending: false
        },
        {
          word: "opportunity",
          reason: "Contains several challenging vowel sounds",
          difficulty: "Medium",
          phonetic: "/ˌɒp.əˈtjuː.nə.ti/",
          isTrending: false
        }
      ].slice(0, parseInt(count) || 5);

      // Parse and validate the response
      let jsonResponse;

      // Check if we got a properly structured response
      if (aiResponse.success && Array.isArray(aiResponse.recommendations)) {
        jsonResponse = aiResponse;
        console.log(`✅ Using AI recommendations directly`);
      } else if (aiResponse.rawResponse) {
        // We got a text response that couldn't be parsed as JSON
        console.log(`⚠️ Falling back to structured recommendations`);
        jsonResponse = {
          success: true,
          recommendations: fallbackRecommendations,
          note: "Generated using fallback mechanism",
          rawResponse: aiResponse.rawResponse.substring(0, 100) + "..."
        };
      } else {
        // We got a response but it's not in the expected format
        console.log(`⚠️ Restructuring AI response to match expected format`);
        jsonResponse = {
          success: true,
          recommendations: Array.isArray(aiResponse.recommendations)
            ? aiResponse.recommendations
            : fallbackRecommendations,
          note: "AI response restructured to match expected format"
        };
      }

      // Enhance the recommendations with word dictionary data
      console.log(`🔍 Enhancing recommendation data with dictionary information`);
      const wordPromises = jsonResponse.recommendations.map(async (rec) => {
        try {
          const dictData = await getWordDictionaryData(rec.word);

          // Merge dictionary data with recommendation data
          return {
            ...rec,
            difficulty: rec.difficulty || dictData.difficulty || calculateWordDifficulty(rec.word),
            phonetic: rec.phonetic || dictData.phonetic || getSimplePhonetic(rec.word),
            syllables: dictData.syllables || [rec.word],
            partOfSpeech: dictData.partOfSpeech || ["unknown"],
            examples: dictData.examples || [`Example with "${rec.word}"`]
          };
        } catch (dictError) {
          console.error(`Error enhancing word ${rec.word} with dictionary data:`, dictError);
          return rec;
        }
      });

      const enhancedRecommendations = await Promise.all(wordPromises);
      jsonResponse.recommendations = enhancedRecommendations;

      // Add timestamp
      jsonResponse.timestamp = new Date().toISOString();
      jsonResponse.cacheTTL = CACHE_TTL.RECOMMENDATIONS;

      return jsonResponse;

    } catch (aiError) {
      console.error("AI processing error for recommendations:", aiError);

      // Fallback to basic recommendations with trending words
      console.log(`❌ Using fallback recommendations due to AI error`);

      return {
        success: true,
        recommendations: [
          ...(difficultWords.slice(0, 2).map(w => ({
            word: w.word,
            reason: "Previous difficulty with this word",
            difficulty: "Hard",
            phonetic: `/${w.word}/`,
            isTrending: false
          }))),
          ...(trendingWords.slice(0, 2).map(w => ({
            word: w,
            reason: "Currently trending topic",
            difficulty: w.length <= 5 ? "Easy" : w.length <= 8 ? "Medium" : "Hard",
            phonetic: `/${w}/`,
            isTrending: true
          }))),
          {
            word: "pronunciation",
            reason: "Common challenge for language learners",
            difficulty: "Hard",
            phonetic: "/prəˌnʌn.siˈeɪ.ʃən/",
            isTrending: false
          }
        ].slice(0, parseInt(count) || 5),
        note: "Fallback recommendations due to processing error",
        error: aiError.message,
        timestamp: new Date().toISOString()
      };
    }
  }, { forceFresh });

  return res.json(recommendations);
} catch (error) {
  console.error("Error getting pronunciation recommendations:", error);
  return handleApiError(error, res, "Recommendations");
}
});

// GET /pronunciation/history - Get user's pronunciation history with enhanced caching
router.get("/history", async (req, res) => {
try {
  const { email, refresh = false } = req.query;
  const forceFresh = refresh === 'true';

  if (!email) {
    return res.status(400).json({
      success: false,
      error: "Email is required"
    });
  }

  console.log(`📜 Fetching pronunciation history for ${email}, refresh=${forceFresh}`);

  const cacheKey = cacheKeys.history(email);

  const historyData = await withCache(cacheKey, CACHE_TTL.HISTORY, async () => {
    console.log(`🔍 Getting fresh history data for ${email} from database`);

    // Check if user exists and get their ID (using our enhanced function)
    let userId;
    try {
      const user = await getUserProfile(email);
      userId = user.id;
    } catch (userError) {
      console.error(`❌ Error finding user with email ${email}:`, userError);
      throw new Error("User not found");
    }

    // Get the user's pronunciation history with the valid userId
    const history = await prisma.pronunciationAttempt.findMany({
      where: {
        userId: userId
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

    console.log(`📊 Found ${history.length} history records for user ${userId}`);

    // Format the history records
    return history.map(attempt => {
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
          transcriptionData = typeof attempt.transcriptionData === 'string'
            ? JSON.parse(attempt.transcriptionData)
            : attempt.transcriptionData;
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
  }, { forceFresh });

  // Group history by day for better UI presentation
  const groupedHistory = {};
  historyData.forEach(item => {
    const date = new Date(item.date).toISOString().split('T')[0];
    if (!groupedHistory[date]) {
      groupedHistory[date] = [];
    }
    groupedHistory[date].push(item);
  });

  res.json({
    success: true,
    history: historyData,
    groupedHistory: groupedHistory,
    stats: {
      totalAttempts: historyData.length,
      averageAccuracy: historyData.length > 0
        ? Math.round(historyData.reduce((sum, item) => sum + item.accuracy, 0) / historyData.length)
        : 0,
      recentAccuracy: historyData.length > 0
        ? Math.round(historyData.slice(0, 5).reduce((sum, item) => sum + item.accuracy, 0) / Math.min(5, historyData.length))
        : 0
    },
    timestamp: new Date().toISOString()
  });
} catch (error) {
  console.error("Error fetching pronunciation history:", error);
  return handleApiError(error, res, "History");
}
});

// GET /pronunciation/tips - With database caching integration
router.get("/tips", async (req, res) => {
try {
  const { word, email, language, refresh = false } = req.query;
  const forceFresh = refresh === 'true';

  if (!word) {
    return res.status(400).json({
      success: false,
      error: "Word parameter is required"
    });
  }

  console.log(`🔤 Getting pronunciation tips for word: "${word}", language: ${language || 'default'}, refresh: ${forceFresh}`);

  // First check if we already have tips for this word in the database
  const normalizedWord = word.toLowerCase().trim();
  const cacheKey = cacheKeys.tips(normalizedWord, language);

  // If forceFresh is true, bypass Redis cache but still check DB unless forceFreshAll is also true
  const forceFreshAll = req.query.forceFreshAll === 'true';

  if (!forceFreshAll && !forceFresh) {
    // Check database for existing tips first if we're not forcing fresh data
    try {
      const dbTips = await prisma.wordTips.findUnique({
        where: {
          wordLanguage: {
            word: normalizedWord,
            language: language || 'general'
          }
        }
      });

      if (dbTips) {
        console.log(`✅ Found tips for "${normalizedWord}" in database`);
        // If we have tips in the database and we're not bypassing cache,
        // store it in Redis for faster access next time
        if (!forceFresh) {
          try {
            await redisClient.client.setEx(cacheKey, CACHE_TTL.TIPS, JSON.stringify(dbTips.content));
            console.log(`📦 Cached database tips to Redis for ${normalizedWord}`);
          } catch (redisError) {
            console.error(`❌ Failed to cache tips to Redis:`, redisError);
            // Continue even if Redis caching fails
          }
        }

        // Return the database tips directly
        return res.json(typeof dbTips.content === 'string' ? JSON.parse(dbTips.content) : dbTips.content);
      }
    } catch (dbError) {
      console.error(`❌ Database error looking up tips for "${normalizedWord}":`, dbError);
      // Continue to standard flow if database lookup fails
    }
  }

  // Try to get word dictionary data first (which is cached)
  let dictData = null;
  try {
    console.log(`📖 Fetching dictionary data for "${normalizedWord}"`);
    dictData = await getWordDictionaryData(normalizedWord);
    console.log(`✅ Found dictionary data for "${normalizedWord}" from ${dictData.source || 'unknown source'}`);
  } catch (dictError) {
    console.error(`❌ Error fetching dictionary data for "${normalizedWord}":`, dictError);
    // Continue without dictionary data
  }

  // Get tips with caching
  const tips = await withCache(cacheKey, CACHE_TTL.TIPS, async () => {
    console.log(`🔍 Generating fresh pronunciation tips for "${normalizedWord}"`);

    // Get user info if email is provided
    let userInfo = {};
    if (email) {
      try {
        const user = await getUserProfile(email);
        if (user) {
          userInfo = {
            nativeLanguage: user.motherToung || "Unknown",
            englishLevel: user.englishLevel || "Intermediate"
          };
        }
      } catch (userError) {
        console.error("Error fetching user data for tips:", userError);
        // Continue without user info
      }
    }

    // Build on dictionary data if available to avoid duplication
    const dictFields = dictData ? {
      phonetic: JSON.stringify(dictData.phonetic) || `/${normalizedWord}/`,
      syllables: dictData.syllables
        ? Array.isArray(dictData.syllables)
          ? dictData.syllables.join('-')
          : dictData.syllables
        : normalizedWord
    } : {};

    // Initialize the Gemini model
    console.log(`🤖 Generating pronunciation tips via Gemini API`);

    // Create prompt for pronunciation tips - incorporate dictionary data if available
    const prompt = `
      You are an expert English pronunciation coach providing tips on how to pronounce a specific word.

      ${userInfo.nativeLanguage ? `The student's native language is ${userInfo.nativeLanguage}.` : ''}
      ${userInfo.englishLevel ? `Their English level is ${userInfo.englishLevel}.` : ''}
      ${language ? `The student is specifically interested in the ${language} pronunciation.` : ''}

      The word they want to learn is: "${normalizedWord}"

      ${dictData ? `Dictionary data for this word:
      - Phonetic: ${dictData.phonetic || 'Not available'}
      - Syllables: ${Array.isArray(dictData.syllables) ? dictData.syllables.join('-') : (dictData.syllables || 'Not available')}
      - Part of speech: ${Array.isArray(dictData.partOfSpeech) ? dictData.partOfSpeech.join(', ') : (dictData.partOfSpeech || 'Not available')}
      - Stress: ${dictData.stress || 'Not available'}` : ''}

      Provide a comprehensive guide on how to pronounce this word correctly, including:
      1. Phonetic transcription (IPA)
      2. Syllable breakdown
      3. Stress pattern
      4. Common pronunciation mistakes
      5. Step-by-step instructions for articulation

      ${language ? `Focus specifically on ${language} pronunciation standards.` : 'Include both American and British pronunciation variants if they differ significantly.'}
      ${userInfo.nativeLanguage ? `Highlight specific challenges for ${userInfo.nativeLanguage} speakers.` : ''}

      IMPORTANT: Ensure your response is valid JSON with no trailing commas or syntax errors.
      Format your response exactly like this:
      {
        "success": true,
        "word": "${normalizedWord}",
        "phonetic": "IPA transcription",
        "syllables": "Breakdown of syllables",
        "stress": "Which syllable has primary stress",
        "pronunciation": {
          "american": "American pronunciation notes",
          "british": "British pronunciation notes"
        },
        "soundGuide": [
          {"sound": "specific sound", "howTo": "how to form this sound"}
        ],
        "commonErrors": ["typical mistakes"],
        "practiceExercises": ["2-3 exercises"]
      }
    `;

    // Create fallback response in advance, using dictionary data if available
    const fallbackResponse = {
      success: true,
      word: normalizedWord,
      ...dictFields,
      phonetic: dictFields.phonetic || `/${normalizedWord}/`,
      syllables: dictFields.syllables || normalizedWord.match(/[aeiouy]{1,2}/gi)?.join('-') || normalizedWord,
      stress: dictData?.stress || "First syllable",
      pronunciation: {
        american: "Standard American pronunciation",
        british: "Standard British pronunciation"
      },
      soundGuide: [
        {
          sound: normalizedWord[0],
          howTo: `Focus on pronouncing the '${normalizedWord[0]}' sound clearly`
        },
        {
          sound: normalizedWord.slice(-1),
          howTo: `End with a clear '${normalizedWord.slice(-1)}' sound`
        }
      ],
      commonErrors: [
        "Incorrect stress placement",
        "Unclear vowel sounds"
      ],
      practiceExercises: [
        `Say the word slowly: ${normalizedWord.split('').join('-')}`,
        "Record yourself and compare with reference pronunciation",
        "Practice each syllable separately"
      ],
      note: "Using simplified pronunciation guide"
    };

    try {
      // Generate content with retry capacity
      const aiResponse = await callGeminiAPI(prompt, {
        retryCount: 2,
        model: "gemini-2.0-flash"
      });

      console.log(`✅ Successfully generated pronunciation tips for "${normalizedWord}"`);

      // Check if we got a valid response or need to use fallback
      let finalResponse;

      if (aiResponse.success && aiResponse.word) {
        // Add timestamp and information about the response
        finalResponse = {
          ...aiResponse,
          generatedAt: new Date().toISOString(),
          language: language || "general",
          ...(dictData ? { dictionaryData: {
            partOfSpeech: dictData.partOfSpeech,
            examples: dictData.examples?.slice(0, 2),
            etymology: dictData.etymology
          }} : {})
        };
      } else if (aiResponse.rawResponse) {
        console.log(`⚠️ Got raw text response, using fallback structure`);
        finalResponse = {
          ...fallbackResponse,
          rawResponse: aiResponse.rawResponse.substring(0, 100) + "...",
          generatedAt: new Date().toISOString(),
          language: language || "general"
        };
      } else {
        console.log(`⚠️ Got unexpected response structure, merging with fallback`);
        finalResponse = {
          ...fallbackResponse,
          ...aiResponse,
          generatedAt: new Date().toISOString(),
          language: language || "general"
        };
      }

      // Save the tips to the database for future use
      try {
        console.log(`💾 Saving tips for "${normalizedWord}" to database`);
        await prisma.wordTips.upsert({
          where: {
            wordLanguage: {
              word: normalizedWord,
              language: language || 'general'
            }
          },
          update: {
            content: finalResponse,
            updatedAt: new Date()
          },
          create: {
            word: normalizedWord,
            language: language || 'general',
            content: finalResponse
          }
        });
        console.log(`✅ Saved tips for "${normalizedWord}" to database`);
      } catch (saveError) {
        console.error(`❌ Error saving tips for "${normalizedWord}" to database:`, saveError);
        // Continue even if saving to DB fails
      }

      return finalResponse;
    } catch (error) {
      console.error("Error getting pronunciation tips:", error);
      const errorResponse = {
        ...fallbackResponse,
        error: error.message,
        generatedAt: new Date().toISOString(),
        language: language || "general"
      };

      // Even for error cases, save to DB to avoid repeated failures
      try {
        console.log(`💾 Saving fallback tips for "${normalizedWord}" to database`);
        await prisma.wordTips.upsert({
          where: {
            wordLanguage: {
              word: normalizedWord,
              language: language || 'general'
            }
          },
          update: {
            content: errorResponse,
            updatedAt: new Date()
          },
          create: {
            word: normalizedWord,
            language: language || 'general',
            content: errorResponse
          }
        });
      } catch (saveError) {
        console.error(`❌ Error saving fallback tips to database:`, saveError);
      }

      return errorResponse;
    }
  }, { forceFresh });

  return res.json(tips);
} catch (error) {
  console.error("Error getting pronunciation tips:", error);
  return handleApiError(error, res, "Pronunciation Tips");
}
});

// GET /pronunciation/attempt/:id - Get details of a specific pronunciation attempt
router.get("/attempt/:id", async (req, res) => {
try {
  const { id } = req.params;
  const { refresh = false } = req.query;
  const forceFresh = refresh === 'true';

  if (!id) {
    return res.status(400).json({
      success: false,
      error: "Attempt ID is required"
    });
  }

  console.log(`🔍 Fetching pronunciation attempt ${id}, refresh=${forceFresh}`);

  const cacheKey = cacheKeys.attempt(id);

  const attemptData = await withCache(cacheKey, CACHE_TTL.ATTEMPT, async () => {
    console.log(`🔍 Getting fresh data for attempt ${id}`);

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
      throw new Error("Pronunciation attempt not found");
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
        transcriptionData = typeof attempt.transcriptionData === 'string'
          ? JSON.parse(attempt.transcriptionData)
          : attempt.transcriptionData;
      }
    } catch (error) {
      console.error("Error parsing transcription data:", error);
    }

    // Try to get dictionary data for the word
    let dictData = null;
    try {
      dictData = await getWordDictionaryData(attempt.word);
    } catch (dictError) {
      console.error(`Failed to get dictionary data for "${attempt.word}":`, dictError);
    }

    // Format response
    return {
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
      },
      dictionaryData: dictData ? {
        phonetic: dictData.phonetic,
        syllables: dictData.syllables,
        partOfSpeech: dictData.partOfSpeech,
        examples: dictData.examples ? dictData.examples.slice(0, 2) : []
      } : null,
      timestamp: new Date().toISOString()
    };
  }, { forceFresh });

  res.json({
    success: true,
    attempt: attemptData
  });
} catch (error) {
  console.error("Error fetching pronunciation attempt:", error);
  return handleApiError(error, res, "Attempt Details");
}
});

// ===================================
// CACHE MANAGEMENT ROUTES
// ===================================

// POST /pronunciation/cache/clear - Clear specific cache types
router.post("/cache/clear", async (req, res) => {
try {
  const { type, id } = req.body;

  if (!type) {
    return res.status(400).json({
      success: false,
      error: "Cache type parameter is required"
    });
  }

  console.log(`🧹 Cache clear request: type=${type}, id=${id || 'all'}`);

  let deletedKeys = 0;

  switch (type) {
    case 'all':
      // Clear all pronunciation-related cache - don't use flushDb to avoid affecting other services
      deletedKeys = await invalidateCacheByPattern('pronunciation:*');
      // Also clear word dictionary cache
      deletedKeys += await invalidateCacheByPattern('word:dict:*');
      // And user profiles
      deletedKeys += await invalidateCacheByPattern('user:profile:*');
      break;

    case 'recommendations':
      if (id) {
        deletedKeys = await invalidateCacheByPattern(`pronunciation:recommendations:${id}:*`);
      } else {
        deletedKeys = await invalidateCacheByPattern('pronunciation:personalized:*');
      }
      break;

    case 'dictionary':
      if (id) {
        const dictKey = cacheKeys.wordDictionary(id);
        deletedKeys = await redisClient.client.del(dictKey) ? 1 : 0;
      } else {
        deletedKeys = await invalidateCacheByPattern('word:dict:*');
      }
      break;

    case 'user':
      if (id) {
        const userKey = cacheKeys.userProfile(id);
        deletedKeys = await redisClient.client.del(userKey) ? 1 : 0;
      } else {
        deletedKeys = await invalidateCacheByPattern('user:profile:*');
      }
      break;

    default:
      return res.status(400).json({
        success: false,
        error: "Invalid cache type"
      });
  }

  console.log(`✅ Cleared ${deletedKeys} keys for cache type: ${type}`);

  return res.json({
    success: true,
    message: `Cache for ${type} ${id ? 'with ID ' + id : ''} cleared successfully`,
    deletedKeys: deletedKeys
  });
} catch (error) {
  console.error("Error clearing cache:", error);
  return handleApiError(error, res, "Cache Clearing");
}
});

// GET /pronunciation/cache/stats - Get cache statistics
router.get("/cache/stats", async (req, res) => {
try {
  console.log(`📊 Generating cache statistics...`);

  // Get Redis info
  const info = await redisClient.client.info();

  // Get all pronunciation keys
  const pronunciationKeys = await redisClient.client.keys('pronunciation:*');
  const wordDictKeys = await redisClient.client.keys('word:dict:*');
  const userProfileKeys = await redisClient.client.keys('user:profile:*');

  // Calculate memory usage if possible
  let memoryUsage = {};
  try {
    // Get memory usage for sample keys to estimate total usage
    const sampleCount = Math.min(50, pronunciationKeys.length);
    const sampleKeys = pronunciationKeys.slice(0, sampleCount);

    let totalBytes = 0;
    if (sampleKeys.length > 0) {
      const pipeline = redisClient.client.pipeline();
      sampleKeys.forEach(key => {
        pipeline.memory('USAGE', key);
      });

      const results = await pipeline.exec();
      if (results) {
        results.forEach(result => {
          if (result[1]) {
            totalBytes += parseInt(result[1]) || 0;
          }
        });

        const averageBytes = totalBytes / sampleCount;
        const estimatedTotalBytes = averageBytes * pronunciationKeys.length;

        memoryUsage = {
          sampleCount,
          averageBytesPerKey: Math.round(averageBytes),
          estimatedTotalBytes,
          estimatedTotalMB: Math.round(estimatedTotalBytes / (1024 * 1024) * 100) / 100,
          note: 'Estimated based on sample keys'
        };
      }
    }
  } catch (memoryError) {
    console.error("Error calculating memory usage:", memoryError);
    memoryUsage = { error: "Failed to calculate memory usage" };
  }

  // Group keys by type for better stats visualization
  const allKeys = [...pronunciationKeys, ...wordDictKeys, ...userProfileKeys];
  const keysByType = {
    recommendations: pronunciationKeys.filter(k => k.startsWith('pronunciation:recommendations:')).length,
    tips: pronunciationKeys.filter(k => k.startsWith('pronunciation:tips:')).length,
    history: pronunciationKeys.filter(k => k.startsWith('pronunciation:history:')).length,
    attempt: pronunciationKeys.filter(k => k.startsWith('pronunciation:attempt:')).length,
    personalized: pronunciationKeys.filter(k => k.startsWith('pronunciation:personalized:')).length,
    trending: pronunciationKeys.filter(k => k.startsWith('pronunciation:trendingWords')).length,
    dictionary: wordDictKeys.length,
    userProfile: userProfileKeys.length,
    other: pronunciationKeys.filter(k => !k.match(/^pronunciation:(recommendations|tips|history|attempt|personalized|trendingWords)/)).length
  };

  // Get TTL stats for different key types
  const ttlStats = {};
  try {
    for (const type of Object.keys(keysByType)) {
      if (keysByType[type] === 0) continue;

      let pattern;
      switch (type) {
        case 'recommendations': pattern = 'pronunciation:recommendations:*'; break;
        case 'tips': pattern = 'pronunciation:tips:*'; break;
        case 'history': pattern = 'pronunciation:history:*'; break;
        case 'attempt': pattern = 'pronunciation:attempt:*'; break;
        case 'personalized': pattern = 'pronunciation:personalized:*'; break;
        case 'trending': pattern = 'pronunciation:trendingWords*'; break;
        case 'dictionary': pattern = 'word:dict:*'; break;
        case 'userProfile': pattern = 'user:profile:*'; break;
        default: continue;
      }

      const keys = await redisClient.client.keys(pattern);
      if (keys.length === 0) continue;

      // Sample up to 10 keys to get TTL stats
     // Sample up to 10 keys to get TTL stats
     const sampleKeys = keys.slice(0, 10);
     const ttls = await Promise.all(sampleKeys.map(key => redisClient.client.ttl(key)));

     const validTtls = ttls.filter(ttl => ttl > 0);
     if (validTtls.length === 0) continue;

     ttlStats[type] = {
       averageTtl: Math.round(validTtls.reduce((sum, ttl) => sum + ttl, 0) / validTtls.length),
       minTtl: Math.min(...validTtls),
       maxTtl: Math.max(...validTtls),
       sampleSize: validTtls.length,
       expiresIn: {
         minutes: Math.round(Math.min(...validTtls) / 60),
         hours: Math.round(Math.min(...validTtls) / 3600)
       }
     };
   }
 } catch (ttlError) {
   console.error("Error calculating TTL stats:", ttlError);
   ttlStats.error = "Failed to calculate TTL statistics";
 }

 // Prepare hit/miss stats if available in info
 const hitMissStats = {};
 try {
   const keyspaceHits = info.match(/keyspace_hits:(\d+)/);
   const keyspaceMisses = info.match(/keyspace_misses:(\d+)/);

   if (keyspaceHits && keyspaceMisses) {
     const hits = parseInt(keyspaceHits[1]);
     const misses = parseInt(keyspaceMisses[1]);
     const total = hits + misses;

     hitMissStats.hits = hits;
     hitMissStats.misses = misses;
     hitMissStats.total = total;
     hitMissStats.hitRate = total > 0 ? Math.round((hits / total) * 100) : 0;
     hitMissStats.missRate = total > 0 ? Math.round((misses / total) * 100) : 0;
   }
 } catch (hitMissError) {
   console.error("Error calculating hit/miss stats:", hitMissError);
   hitMissStats.error = "Failed to calculate hit/miss statistics";
 }

 return res.json({
   success: true,
   totalKeys: allKeys.length,
   keysByType,
   ttlStats,
   memoryUsage,
   hitMissStats,
   timestamp: new Date().toISOString(),
   redisVersion: info.match(/redis_version:([\d.]+)/)?.[1] || 'unknown'
 });
} catch (error) {
 console.error("Error getting cache stats:", error);
 return handleApiError(error, res, "Cache Statistics");
}
});

// GET /pronunciation/health - Health check endpoint with detailed cache status
router.get("/health", async (req, res) => {
try {
 console.log(`🏥 Running health check...`);

 const healthData = {
   success: true,
   status: "healthy",
   services: {},
   dependencies: {},
   timestamp: new Date().toISOString()
 };

 // Check Redis connection
 try {
   const startTime = Date.now();
   const redisStatus = await redisClient.client.ping();
   const responseTime = Date.now() - startTime;

   healthData.services.redis = {
     status: redisStatus === 'PONG' ? 'connected' : 'error',
     responseTime: `${responseTime}ms`
   };
 } catch (redisError) {
   healthData.services.redis = {
     status: 'error',
     error: redisError.message
   };
   healthData.status = "degraded";
 }

 // Check database connection
 try {
   const startTime = Date.now();
   const dbStatus = await prisma.$queryRaw`SELECT 1 as connected`;
   const responseTime = Date.now() - startTime;

   healthData.services.database = {
     status: Array.isArray(dbStatus) && dbStatus.length > 0 ? 'connected' : 'error',
     responseTime: `${responseTime}ms`
   };
 } catch (dbError) {
   healthData.services.database = {
     status: 'error',
     error: dbError.message
   };
   healthData.status = "degraded";
 }

 // Add API status
 healthData.services.api = {
   status: 'running',
   uptime: process.uptime()
 };

 // Check external dependencies
 // AssemblyAI
 try {
   healthData.dependencies.assemblyAI = {
     status: ASSEMBLY_AI_API_KEY ? 'configured' : 'not configured'
   };
 } catch (assemblyError) {
   healthData.dependencies.assemblyAI = {
     status: 'error',
     error: assemblyError.message
   };
 }

 // Cloudinary
 try {
   healthData.dependencies.cloudinary = {
     status: process.env.CLOUDINARY_API_KEY ? 'configured' : 'not configured'
   };
 } catch (cloudinaryError) {
   healthData.dependencies.cloudinary = {
     status: 'error',
     error: cloudinaryError.message
   };
 }

 // Gemini
 try {
   healthData.dependencies.gemini = {
     status: process.env.GEMINI_API_KEY ? 'configured' : 'not configured'
   };
 } catch (geminiError) {
   healthData.dependencies.gemini = {
     status: 'error',
     error: geminiError.message
   };
 }

 // Tavily
 try {
   healthData.dependencies.tavily = {
     status: 'configured' // Assuming configuration is in tavilySearch
   };
 } catch (tavilyError) {
   healthData.dependencies.tavily = {
     status: 'error',
     error: tavilyError.message
   };
 }

 // Check overall status
 if (Object.values(healthData.services).some(service => service.status === 'error')) {
   healthData.status = "unhealthy";
 } else if (Object.values(healthData.dependencies).some(dep => dep.status === 'not configured')) {
   healthData.status = "degraded";
 }

 return res.json(healthData);
} catch (error) {
 console.error("Health check failed:", error);
 res.status(500).json({
   success: false,
   status: "unhealthy",
   error: error.message,
   timestamp: new Date().toISOString()
 });
}
});

// POST /pronunciation/compare - Compare user pronunciation with reference
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

 console.log(`🔄 Processing pronunciation comparison for word: "${word}"`);

 let userAudioUrl = '';
 let referenceAudioUrl = '';

 try {
   console.log(`☁️ Uploading audio files to Cloudinary...`);
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
   console.log(`✅ Audio files uploaded successfully`);
 } catch (uploadError) {
   console.error("❌ Error uploading audio files:", uploadError);
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
 console.log(`🎙️ Processing user audio with AssemblyAI...`);
 const userTranscription = await getAssemblyAITranscription(files.userAudio[0], word);

 console.log(`🎙️ Processing reference audio with AssemblyAI...`);
 const referenceTranscription = await getAssemblyAITranscription(files.referenceAudio[0], word);

 // Analyze both transcriptions
 console.log(`📊 Analyzing transcriptions...`);
 const userAnalysis = analyzeAssemblyResults(userTranscription, word);
 const referenceAnalysis = analyzeAssemblyResults(referenceTranscription, word);

 // Get word dictionary data if available
 let dictData = null;
 try {
   dictData = await getWordDictionaryData(word);
   console.log(`📖 Retrieved dictionary data for "${word}"`);
 } catch (dictError) {
   console.error(`Failed to get dictionary data for "${word}":`, dictError);
 }

 // Prepare prompt for Gemini to compare the pronunciations
 console.log(`🤖 Generating comparison analysis via Gemini...`);
 const prompt = `
   You are an expert English pronunciation coach comparing a student's pronunciation with a reference pronunciation.

   Word being pronounced: "${word}"

   ${dictData ? `Dictionary data:
   - Phonetic: ${dictData.phonetic || 'Not available'}
   - Syllables: ${Array.isArray(dictData.syllables) ? dictData.syllables.join('-') : (dictData.syllables || 'Not available')}
   - Part of speech: ${Array.isArray(dictData.partOfSpeech) ? dictData.partOfSpeech.join(', ') : (dictData.partOfSpeech || 'Not available')}` : ''}

   Student's Pronunciation:
   - Transcribed text: "${userAnalysis.detectedText}"
   - Accuracy score: ${userAnalysis.accuracyScore || 0}%
   - Confidence score: ${(userAnalysis.confidenceScore || 0) * 100}%
   - Accent detected: ${userAnalysis.accentVariant || "General"}
   ${userAnalysis.note ? `- Note: ${userAnalysis.note}` : ''}

   Reference Pronunciation:
   - Transcribed text: "${referenceAnalysis.detectedText}"
   - Accuracy score: ${referenceAnalysis.accuracyScore || 0}%
   - Confidence score: ${(referenceAnalysis.confidenceScore || 0) * 100}%
   - Accent detected: ${referenceAnalysis.accentVariant || "General"}
   ${referenceAnalysis.note ? `- Note: ${referenceAnalysis.note}` : ''}

   Please analyze:
   1. How closely the student's pronunciation matches the reference
   2. Specific differences in pronunciation
   3. What the student is doing well
   4. What the student needs to improve
   5. Specific exercises to help improve

   Be sure to note any accent differences that might be perfectly valid variations.

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
     "accentNotes": "Notes about accent differences if any",
     "transcriptionDetails": {
       "user": "${userAnalysis.detectedText || ""}",
       "reference": "${referenceAnalysis.detectedText || ""}"
     }
   }
 `;

 try {
   // Generate content with Gemini
   const aiResponse = await callGeminiAPI(prompt, {
     retryCount: 2,
     model: "gemini-2.0-flash"
   });

   console.log(`✅ Successfully generated comparison analysis`);

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

   // Parse the response and ensure it's properly formatted
   let jsonResponse;

   if (aiResponse.success && aiResponse.word === word && aiResponse.matchPercentage) {
     jsonResponse = aiResponse;
     console.log(`✅ Using AI comparison directly`);
   } else if (aiResponse.rawResponse) {
     console.log(`⚠️ Using fallback comparison structure`);
     jsonResponse = fallbackResponse;
     jsonResponse.rawResponse = aiResponse.rawResponse.substring(0, 100) + "...";
   } else {
     console.log(`⚠️ Merging AI response with fallback structure`);
     jsonResponse = {
       ...fallbackResponse,
       ...aiResponse
     };
   }

   // Add audio URLs to the response
   jsonResponse.audioUrls = {
     user: userAudioUrl,
     reference: referenceAudioUrl
   };

   // Add dictionary data if available
   if (dictData) {
     jsonResponse.dictionaryData = {
       phonetic: dictData.phonetic,
       syllables: dictData.syllables,
       partOfSpeech: dictData.partOfSpeech
     };
   }

   // Add timestamp
   jsonResponse.timestamp = new Date().toISOString();

   return res.json(jsonResponse);
 } catch (aiError) {
   console.error("❌ AI processing error:", aiError);

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
     error: "AI processing failed: " + aiError.message,
     timestamp: new Date().toISOString()
   };

   return res.json(fallbackResponse);
 }
} catch (error) {
 console.error("❌ Error comparing pronunciations:", error);
 return handleApiError(error, res, "Pronunciation Comparison");
} finally {
 // Ensure we clean up any temporary files
 if (files.userAudio && files.userAudio[0]) {
   cleanupTempFile(files.userAudio[0]);
 }
 if (files.referenceAudio && files.referenceAudio[0]) {
   cleanupTempFile(files.referenceAudio[0]);
 }
}
});

// POST /pronunciation/personalized - Get personalized word recommendations
router.post("/personalized", async (req, res) => {
try {
 const { email, refresh = false } = req.body;
 const forceFresh = refresh === true;

 if (!email) {
   return res.status(400).json({
     success: false,
     message: "Email is required",
   });
 }

 console.log(`🎯 Getting personalized recommendations for ${email}, refresh=${forceFresh}`);

 const cacheKey = cacheKeys.personalized(email);

 const personalizedData = await withCache(cacheKey, CACHE_TTL.PERSONALIZED, async () => {
   console.log(`🔍 Generating fresh personalized recommendations for ${email}`);

   // Get user preferences using the enhanced function
   let user;
   try {
     user = await getUserProfile(email);
   } catch (userError) {
     throw new Error("User not found: " + userError.message);
   }

   console.log(`👤 User data: occupation=${user.occupation}, interests=${user.interests}, focus=${user.focus}`);

   // Create a more structured query for Tavily
   const tavilyQuery = `Find current trending keywords and terms (April 2025) specific to professionals in ${user.occupation || 'various fields'}
     who are interested in ${user.interests || 'general topics'} and focusing on ${user.focus || 'professional development'}.
     Include industry-specific terminology, emerging concepts, and high-growth topics.`;

   // Get search results from Tavily
   console.log(`🔍 Searching Tavily for personalized keywords...`);
   const tavilyResults = await tavilySearch(tavilyQuery);
   console.log(`✅ Received ${tavilyResults.results.length} results from Tavily`);

   // Feed the results to Gemini to extract and organize trending words
   console.log(`🤖 Processing results with Gemini to extract keywords...`);
   const geminiPrompt = `
   Based on these search results about trending topics for ${user.occupation || 'professionals'}, ${user.interests || 'various interests'}, and ${user.focus || 'different focus areas'}:
   ${JSON.stringify(tavilyResults.results.map(r => r.content).join('\n\n'))}

   Extract ONLY the most relevant trending specific words and short phrases (maximum 2-3 words each) into these categories:
   1. ${user.occupation || 'Professional'} - Professional terminology specific to this field
   2. ${user.interests || 'Interest'} - Terms related to this interest area
   3. ${user.focus || 'Focus'} - Concepts specifically related to this focus

   Do NOT include any explanations. Return just a clean JSON object with arrays of words/phrases.

   Format as:
   {
     "industrySpecificTerms": ["term1", "term2", "term3"],
     "technicalConcepts": ["concept1", "concept2", "concept3"],
     "emergingMethodologies": ["method1", "method2"],
     "popularToolsAndPlatforms": ["tool1", "tool2"]
   }
   `;

   // Call Gemini API with retry capability
   const geminiResponse = await callGeminiAPI(geminiPrompt, {
     retryCount: 2,
     model: "gemini-2.0-flash"
   });

   console.log(`✅ Successfully processed keywords from search results`);

   // Enhance the data with phonetic information
   let enhancedTerms = {};

   if (geminiResponse.industrySpecificTerms) {
     console.log(`🔤 Enhancing industry terms with pronunciation data...`);
     const termsWithPhonetics = await Promise.allSettled(
       geminiResponse.industrySpecificTerms.map(async term => {
         try {
           const dictData = await getWordDictionaryData(term);
           return {
             term,
             phonetic: dictData.phonetic || `/${term}/`,
             difficulty: dictData.difficulty || (term.length <= 4 ? "Easy" : term.length <= 7 ? "Medium" : "Hard")
           };
         } catch (error) {
           return { term, phonetic: `/${term}/`, difficulty: "Unknown" };
         }
       })
     );

     enhancedTerms.industrySpecificTerms = termsWithPhonetics
       .filter(result => result.status === 'fulfilled')
       .map(result => result.value);
   }

   // Process other term categories similarly
   if (geminiResponse.technicalConcepts) {
     const termsWithPhonetics = await Promise.allSettled(
       geminiResponse.technicalConcepts.map(async term => {
         try {
           const dictData = await getWordDictionaryData(term);
           return {
             term,
             phonetic: dictData.phonetic || `/${term}/`,
             difficulty: dictData.difficulty || (term.length <= 4 ? "Easy" : term.length <= 7 ? "Medium" : "Hard")
           };
         } catch (error) {
           return { term, phonetic: `/${term}/`, difficulty: "Unknown" };
         }
       })
     );

     enhancedTerms.technicalConcepts = termsWithPhonetics
       .filter(result => result.status === 'fulfilled')
       .map(result => result.value);
   }

   return {
     success: true,
     message: "Here are some personalized trending words based on your preferences",
     words: {
       query: tavilyQuery,
       userProfile: {
         occupation: user.occupation || "Not specified",
         interests: user.interests || "Not specified",
         focus: user.focus || "Not specified"
       },
       trendingTerms: geminiResponse,
       enhancedTerms,
       lastUpdated: new Date().toISOString()
     },
   };
 }, { forceFresh });

 return res.status(200).json(personalizedData);
} catch (error) {
 console.error("Error generating personalized trending words:", error);
 return handleApiError(error, res, "Personalized Recommendations");
}
});

// Cache pre-warming route to populate key caches in the background
router.post("/cache/warm", async (req, res) => {
// Respond immediately while cache warming happens in the background
res.json({
 success: true,
 message: "Cache warming started in the background",
 timestamp: new Date().toISOString()
});

try {
 console.log(`🔥 Starting cache warming process...`);

 // Start warming process in the background
 warmCaches().catch(error => {
   console.error("Error during cache warming:", error);
 });
} catch (error) {
 console.error("Failed to initiate cache warming:", error);
}
});

/**
* Background cache warming function
* Pre-populates important caches for faster initial responses
*/
async function warmCaches() {
console.log(`🌡️ Cache warming started at ${new Date().toISOString()}`);

try {
 // 1. Warm trending words cache if not already present
 const trendingKey = cacheKeys.trendingWords();
 const trendingExists = await redisClient.client.exists(trendingKey);

 if (!trendingExists) {
   console.log(`Warming trending words cache...`);
   await getTrendingWords();
   console.log(`✅ Trending words cache warmed`);
 } else {
   console.log(`Trending words cache already exists, skipping`);
 }

 // 2. Pre-warm common word dictionary entries
 const commonWords = [
   "hello", "pronunciation", "language", "beautiful", "necessary",
   "comfortable", "opportunity", "communicate", "specifically",
   "environment", "regularly", "technology", "innovation", "sustainability",
   "digital", "transformation", "intelligence"
 ];

 console.log(`Warming dictionary cache for ${commonWords.length} common words...`);

 const wordPromises = commonWords.map(async word => {
   const dictKey = cacheKeys.wordDictionary(word);
   const exists = await redisClient.client.exists(dictKey);

   if (!exists) {
     try {
       await getWordDictionaryData(word);
       return { word, status: 'cached' };
     } catch (error) {
       return { word, status: 'error', error: error.message };
     }
   }
   return { word, status: 'already cached' };
 });

 const wordResults = await Promise.allSettled(wordPromises);
 const successCount = wordResults.filter(r => r.status === 'fulfilled' && r.value.status !== 'error').length;
 console.log(`✅ Dictionary cache warming completed: ${successCount}/${commonWords.length} words cached`);

 // 3. Pre-warm pronunciation tips for common words
 console.log(`Warming pronunciation tips cache...`);

 const tipsPromises = commonWords.slice(0, 5).map(async word => {
   const tipsKey = cacheKeys.tips(word);
   const exists = await redisClient.client.exists(tipsKey);

   if (!exists) {
     // Use withCache with the appropriate parameters
     await withCache(tipsKey, CACHE_TTL.TIPS, async () => {
       // This is the implementation from the /tips endpoint, simplified
       const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

       const dictData = await getWordDictionaryData(word);

       const prompt = `
         You are an expert English pronunciation coach providing tips on how to pronounce a specific word.

         The word is: "${word}"

         Provide a comprehensive guide on how to pronounce this word correctly, including:
         1. Phonetic transcription (IPA)
         2. Syllable breakdown
         3. Stress pattern
         4. Common pronunciation mistakes
         5. Step-by-step instructions for articulation

         Include both American and British pronunciation variants if they differ significantly.

         Format your response as valid JSON.
       `;

       try {
         const result = await model.generateContent(prompt);
         const response = await result.response;
         const text = response.text();
         const jsonResponse = safeJsonParse(text, {
           success: true,
           word: word,
           phonetic: dictData?.phonetic || `/${word}/`,
           syllables: dictData?.syllables || word,
           note: "Cache warming response"
         });

         return {
           ...jsonResponse,
           generatedAt: new Date().toISOString(),
           language: "general"
         };
       } catch (error) {
         console.error(`Error generating tips for "${word}":`, error);
         return {
           success: true,
           word: word,
           phonetic: dictData?.phonetic || `/${word}/`,
           syllables: dictData?.syllables || word,
           note: "Fallback during cache warming",
           error: error.message,
           generatedAt: new Date().toISOString()
         };
       }
     });
     return { word, status: 'cached' };
   }
   return { word, status: 'already cached' };
 });

 const tipsResults = await Promise.allSettled(tipsPromises);
 const tipsSuccessCount = tipsResults.filter(r => r.status === 'fulfilled' && r.value.status !== 'error').length;
 console.log(`✅ Tips cache warming completed: ${tipsSuccessCount}/${Math.min(5, commonWords.length)} tips cached`);

 console.log(`🎉 Cache warming completed at ${new Date().toISOString()}`);

} catch (error) {
 console.error(`❌ Cache warming failed:`, error);
}
}

// Export the router
export default router;
