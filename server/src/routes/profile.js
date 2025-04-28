// api/user-profile.js
import { PrismaClient } from '@prisma/client';
import express from 'express';
import redisClient from "../lib/redis.js";

const router = express.Router();
const prisma = new PrismaClient();

// Cache expiration time in seconds
const CACHE_TTL = 3600; // 1 hour for all user data

/**
 * GET /api/user-profile
 * Fetches user profile data with caching
 */
router.get('/user-profile', async (req, res) => {
  try {
    const { email } = req.query;
    const { skipCache } = req.query; // Optional parameter to bypass cache

    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required' });
    }

    // Check cache first (unless skipCache is true)
    if (!skipCache) {
      try {
        const cachedProfile = await redisClient.get(`profile:${email}`);
        if (cachedProfile) {
          console.log(`Profile for ${email} served from cache`);
          return res.status(200).json(JSON.parse(cachedProfile));
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
        vocabularyWords: {
          select: {
            id: true,
            word: true,
            phonetic: true,
            timestamp: true
          }
        },
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
        studySessions: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            mode: true,
            records: true
          },
          orderBy: { startTime: 'desc' },
          take: 10
        },
        pronunciationAttempts: {
          select: {
            id: true,
            word: true,
            accuracy: true,
            feedback: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 20
        },
        dailyStreaks: {
          select: {
            id: true,
            date: true,
            count: true
          },
          orderBy: { date: 'desc' },
          take: 30
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Process array fields if stored as comma-separated strings
    ['preferredTopics', 'challengeAreas', 'preferredContentType'].forEach(field => {
      if (user[field] && typeof user[field] === 'string') {
        user[field] = user[field].split(',');
      }
    });

    // Calculate user stats
    const stats = {
      vocabularyCount: user.vocabularyWords.length,
      favoritesCount: user.favorites.length,
      completedSessionsCount: user.studySessions.filter(session => session.endTime).length,
      currentStreak: user.dailyStreaks.length > 0 ? user.dailyStreaks[0].count : 0,
      pronunciationAccuracy: calculatePronunciationAccuracy(user.pronunciationAttempts),
      learningProgress: calculateLearningProgress(user),
      lastActivity: getLastActivityTimestamp(user)
    };

    // Final user data with stats
    const userData = { ...user, stats };

    // Cache the profile data
    try {
      await redisClient.set(`profile:${email}`, JSON.stringify(userData), { EX: CACHE_TTL });
      console.log(`Profile cached for user: ${email}`);
    } catch (redisError) {
      console.error('Redis caching error:', redisError);
      // Continue even if caching fails
    }

    // Return the user data
    res.status(200).json(userData);

  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile data' });
  }
});

/**
 * POST /api/user-profile/invalidate-cache
 * Invalidate user cache (for logout or profile updates)
 */
router.post('/user-profile/invalidate-cache', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    await redisClient.del(`profile:${email}`);
    console.log(`Cache invalidated for user: ${email}`);

    res.status(200).json({ message: 'Cache invalidated successfully' });
  } catch (error) {
    console.error('Error invalidating cache:', error);
    res.status(500).json({ error: 'Failed to invalidate cache' });
  }
});

// Helper functions

function calculatePronunciationAccuracy(attempts) {
  if (!attempts || attempts.length === 0) return 0;

  const validAttempts = attempts.filter(attempt => attempt.accuracy !== null);
  if (validAttempts.length === 0) return 0;

  const sum = validAttempts.reduce((total, attempt) => total + (attempt.accuracy || 0), 0);
  return Math.round(sum / validAttempts.length);
}

function calculateLearningProgress(user) {
  const vocabScore = Math.min(user.vocabularyWords.length / 10, 1) * 0.4;
  const sessionsScore = Math.min((user.studySessions.filter(s => s.endTime).length) / 5, 1) * 0.3;
  const pronunciationScore = Math.min((calculatePronunciationAccuracy(user.pronunciationAttempts) / 100), 1) * 0.3;

  return Math.round((vocabScore + sessionsScore + pronunciationScore) * 100);
}

function getLastActivityTimestamp(user) {
  const timestamps = [
    ...user.pronunciationAttempts.map(a => new Date(a.createdAt).getTime()),
    ...user.studySessions.map(s => new Date(s.startTime).getTime()),
    ...user.favorites.map(f => new Date(f.createdAt).getTime()),
    ...user.dailyStreaks.map(d => new Date(d.date).getTime())
  ].filter(Boolean);

  return timestamps.length === 0 ? user.createdAt : new Date(Math.max(...timestamps));
}

export default router;
