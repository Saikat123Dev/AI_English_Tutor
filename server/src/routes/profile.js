// api/user-profile.js
import { PrismaClient } from '@prisma/client';
import express from 'express';
import redisClient from "../lib/redis.js"; // Import the Redis client

const router = express.Router();
const prisma = new PrismaClient();

// Cache expiration time in seconds
const CACHE_TTL = {
  USER_PROFILE: 3600, // 1 hour for complete profile
  USER_BASIC: 86400,  // 24 hours for basic user data
};



/**
 * Cache user profile data in Redis
 * @param {string} email - User email
 * @param {object} data - User profile data to cache
 */
async function cacheUserProfile(email, data) {
  try {
    // Cache full profile data
    await redisClient.set(`profile:${email}`, JSON.stringify(data), { EX: CACHE_TTL.USER_PROFILE });

    // Cache basic user data separately with longer TTL
    const basicData = {
      id: data.id,
      email: data.email,
      name: data.name,
      motherToung: data.motherToung,
      englishLevel: data.englishLevel,
      learningGoal: data.learningGoal,
      interests: data.interests,
      focus: data.focus,
      voice: data.voice,
      occupation: data.occupation,
      studyTime: data.studyTime,
      preferredTopics: data.preferredTopics,
      challengeAreas: data.challengeAreas,
      learningStyle: data.learningStyle,
      practiceFrequency: data.practiceFrequency,
      vocabularyLevel: data.vocabularyLevel,
      grammarKnowledge: data.grammarKnowledge,
      previousExperience: data.previousExperience,
      preferredContentType: data.preferredContentType,
      createdAt: data.createdAt
    };

    await redisClient.set(`user:email:${email}`, JSON.stringify(basicData), { EX: CACHE_TTL.USER_BASIC });
    await redisClient.set(`user:${data.id}`, JSON.stringify(basicData), { EX: CACHE_TTL.USER_BASIC });

    console.log(`Profile cached for user: ${email}`);
  } catch (error) {
    console.error('Redis caching error:', error);
  }
}

/**
 * Invalidate user cache
 * @param {string} email - User email
 * @param {string} id - User ID
 */
async function invalidateUserCache(email, id) {
  try {
    await redisClient.del(`profile:${email}`);
    await redisClient.del(`user:email:${email}`);
    await redisClient.del(`user:${id}`);
    console.log(`Cache invalidated for user: ${email}`);
  } catch (error) {
    console.error('Redis cache invalidation error:', error);
  }
}

/**
 * GET /api/user-profile
 * Fetches complete user profile data including:
 * - Basic user info (name, email, learning preferences)
 * - Vocabulary words count
 * - Favorites
 * - Study sessions
 * - Pronunciation attempts
 * - Daily streaks
 */
router.get('/user-profile', async (req, res) => {
  try {
    const { email } = req.query;
    const { skipCache } = req.query; // Optional parameter to bypass cache

    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required' });
    }

    // Attempt to get data from Redis cache first (unless skipCache is true)
    if (!skipCache) {
      try {
        const cachedProfile = await redisClient.get(`profile:${email}`);
        if (cachedProfile) {
          const profileData = JSON.parse(cachedProfile);
          console.log(`Profile for ${email} served from cache`);
          console.log('Cached profile data:', profileData);
          // Add cache indicator for debugging purposes
          profileData.fromCache = true;

          return res.status(200).json(profileData);
        }
      } catch (redisError) {
        console.error('Redis get operation error:', redisError);
        // Continue with database lookup if Redis fails
      }
    }

    // Find the user by email (cache miss or skipCache true)
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        motherToung: true,
        englishLevel: true,
        learningGoal: true,
        interests: true,
        focus: true,
        voice: true,
        createdAt: true,
        // Include all the new fields
        occupation: true,
        studyTime: true,
        preferredTopics: true,
        challengeAreas: true,
        learningStyle: true,
        practiceFrequency: true,
        vocabularyLevel: true,
        grammarKnowledge: true,
        previousExperience: true,
        preferredContentType: true,


        // Get vocabulary words
        vocabularyWords: {
          select: {
            id: true,
            word: true,
            phonetic: true,
            timestamp: true
          }
        },

        // Get favorite words with their details
        favorites: {
          select: {
            id: true,
            createdAt: true,
            word: {
              select: {
                id: true,
                word: true,
                phonetic: true,
                meanings: true
              }
            }
          }
        },

        // Get study sessions with their records
        studySessions: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            mode: true,
            records: {
              select: {
                id: true,
                difficultyRating: true,
                isCorrect: true,
                timeSpent: true,
                word: {
                  select: {
                    id: true,
                    word: true
                  }
                }
              }
            }
          },
          orderBy: {
            startTime: 'desc'
          },
          take: 10 // Limit to recent 10 sessions for performance
        },

        // Get pronunciation attempts
        pronunciationAttempts: {
          select: {
            id: true,
            word: true,
            accuracy: true,
            feedback: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 20 // Limit to recent 20 attempts for performance
        },

        // Get daily streaks
        dailyStreaks: {
          select: {
            id: true,
            date: true,
            count: true
          },
          orderBy: {
            date: 'desc'
          },
          take: 30 // Get last 30 days
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Process array fields that might be stored as comma-separated strings
    if (user.preferredTopics && typeof user.preferredTopics === 'string') {
      user.preferredTopics = user.preferredTopics.split(',');
    }

    if (user.challengeAreas && typeof user.challengeAreas === 'string') {
      user.challengeAreas = user.challengeAreas.split(',');
    }

    if (user.preferredContentType && typeof user.preferredContentType === 'string') {
      user.preferredContentType = user.preferredContentType.split(',');
    }

    // Calculate additional statistics that might be useful for the UI
    const stats = {
      vocabularyCount: user.vocabularyWords.length,
      favoritesCount: user.favorites.length,
      completedSessionsCount: user.studySessions.filter(session => session.endTime).length,
      totalSessionsCount: user.studySessions.length,
      currentStreak: user.dailyStreaks.length > 0 ? user.dailyStreaks[0].count : 0,

      // Calculate average pronunciation accuracy
      pronunciationAccuracy: calculatePronunciationAccuracy(user.pronunciationAttempts),

      // Calculate learning progress based on completed sessions and vocabulary
      learningProgress: calculateLearningProgress(user),

      // Add last activity timestamp
      lastActivity: getLastActivityTimestamp(user)
    };

    // Combine user data with calculated stats
    const userData = {
      ...user,
      stats,
      fromCache: false
    };

    // Cache the user profile data for future requests
    await cacheUserProfile(email, userData);

    // Return the complete user profile data
    res.status(200).json(userData);

  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile data' });
  }
});

/**
 * POST /api/user-profile/invalidate-cache
 * Manually invalidate user cache
 */
router.post('/user-profile/invalidate-cache', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Get user ID for complete cache invalidation
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await invalidateUserCache(email, user.id);

    res.status(200).json({ message: 'Cache invalidated successfully' });
  } catch (error) {
    console.error('Error invalidating cache:', error);
    res.status(500).json({ error: 'Failed to invalidate cache' });
  }
});

// Helper function to calculate pronunciation accuracy
function calculatePronunciationAccuracy(attempts) {
  if (!attempts || attempts.length === 0) return 0;

  const validAttempts = attempts.filter(attempt => attempt.accuracy !== null);
  if (validAttempts.length === 0) return 0;

  const sum = validAttempts.reduce((total, attempt) => total + (attempt.accuracy || 0), 0);
  return Math.round(sum / validAttempts.length);
}

// Helper function to calculate overall learning progress
function calculateLearningProgress(user) {
  // This is a simplified example - you might want to adjust the weights
  // based on your app's specific learning model
  const vocabScore = Math.min(user.vocabularyWords.length / 10, 1) * 0.4; // 40% weight
  const sessionsScore = Math.min((user.studySessions.filter(s => s.endTime).length) / 5, 1) * 0.3; // 30% weight
  const pronunciationScore = Math.min((calculatePronunciationAccuracy(user.pronunciationAttempts) / 100), 1) * 0.3; // 30% weight

  return Math.round((vocabScore + sessionsScore + pronunciationScore) * 100);
}

// Helper function to determine last activity timestamp
function getLastActivityTimestamp(user) {
  const timestamps = [
    ...user.pronunciationAttempts.map(a => new Date(a.createdAt).getTime()),
    ...user.studySessions.map(s => new Date(s.startTime).getTime()),
    ...user.favorites.map(f => new Date(f.createdAt).getTime()),
    ...user.dailyStreaks.map(d => new Date(d.date).getTime())
  ].filter(Boolean);

  if (timestamps.length === 0) {
    return user.createdAt;
  }

  return new Date(Math.max(...timestamps));
}

// Webhook endpoint to invalidate cache when related data changes
router.post('/user-profile/webhook', async (req, res) => {
  try {
    const { action, userId, email } = req.body;

    if (!userId && !email) {
      return res.status(400).json({ error: 'Either userId or email is required' });
    }

    // If we only have userId, we need to get the email
    let userEmail = email;
    let userId2 = userId;

    if (!userEmail) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      userEmail = user.email;
    }

    if (!userId2) {
      const user = await prisma.user.findUnique({
        where: { email: userEmail },
        select: { id: true }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      userId2 = user.id;
    }

    await invalidateUserCache(userEmail, userId2);

    res.status(200).json({ message: 'Cache invalidated successfully' });
  } catch (error) {
    console.error('Error in webhook:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  try {
    await redisClient.quit();
    console.log('Redis client disconnected');
  } catch (err) {
    console.error('Error disconnecting from Redis:', err);
  }
  process.exit(0);
});

export default router;
