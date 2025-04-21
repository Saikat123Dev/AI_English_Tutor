// api/user-profile.js
import { PrismaClient } from '@prisma/client';
import express from 'express';

const router = express.Router();
const prisma = new PrismaClient();

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

    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required' });
    }

    // Find the user by email
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
      learningProgress: calculateLearningProgress(user)
    };

    // Combine user data with calculated stats
    const userData = {
      ...user,
      stats
    };

    // Return the complete user profile data
    res.status(200).json(userData);

  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile data' });
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

export default router;
