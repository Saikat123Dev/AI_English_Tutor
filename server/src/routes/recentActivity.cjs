const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

/**
 * Get recent activity for a user by email
 * @route GET /recent
 * @param {string} email - The email of the user
 * @returns {object} 200 - Recent user activity including vocabulary, pronunciation, questions and study sessions
 */
router.get('/recent', async (req, res) => {
  try {
    // Get email from request
    const email = req.query.email;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // First find the user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = user.id;

    // Define how many items to fetch for each activity type
    const limit = 8;

    // Get recent data in parallel for better performance
    const [
      recentVocabulary,
      recentPronunciation,
      recentQuestions,
      recentStudySessions,
      streakInfo
    ] = await Promise.all([
      // Recent vocabulary words
      prisma.vocabularyWord.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: limit,
        include: { favorites: true }
      }),

      // Recent pronunciation attempts
      prisma.pronunciationAttempt.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit
      }),

      // Recent questions
      prisma.question.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit
      }),

      // Recent study sessions
      prisma.studySession.findMany({
        where: { userId },
        orderBy: { startTime: 'desc' },
        take: limit,
        include: {
          records: {
            include: {
              word: true
            }
          }
        }
      }),

      // Get current streak
      prisma.dailyStreak.findFirst({
        where: {
          userId,
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)) // Today
          }
        },
        orderBy: { date: 'desc' }
      })
    ]);

    // Format and combine activity data with timestamps for sorting
    const allActivity = [
      ...recentVocabulary.map(item => ({
        type: 'vocabulary',
        timestamp: item.timestamp,
        data: item
      })),
      ...recentPronunciation.map(item => ({
        type: 'pronunciation',
        timestamp: item.createdAt,
        data: item
      })),
      ...recentQuestions.map(item => ({
        type: 'question',
        timestamp: item.createdAt,
        data: item
      })),
      ...recentStudySessions.map(item => ({
        type: 'studySession',
        timestamp: item.startTime,
        data: item
      }))
    ];

    // Sort all activity by timestamp (newest first)
    const sortedActivity = allActivity.sort((a, b) =>
      new Date(b.timestamp) - new Date(a.timestamp)
    );

    // Calculate stats
    const stats = {
      vocabularyCount: await prisma.vocabularyWord.count({ where: { userId } }),
      pronunciationCount: await prisma.pronunciationAttempt.count({ where: { userId } }),
      questionsCount: await prisma.question.count({ where: { userId } }),
      studySessionsCount: await prisma.studySession.count({ where: { userId } }),
      currentStreak: streakInfo ? streakInfo.count : 0
    };

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      recent: sortedActivity.slice(0, limit),
      vocabulary: recentVocabulary,
      pronunciation: recentPronunciation,
      questions: recentQuestions,
      studySessions: recentStudySessions,
      stats
    });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity', message: error.message });
  }
});

module.exports = router;
