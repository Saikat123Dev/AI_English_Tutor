import { PrismaClient } from '@prisma/client';
import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import fetch from 'node-fetch';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * Search for a word in external dictionary API
 */
router.get(
  '/search/:word',
  param('word').trim().isString().isLength({ min: 1 }),
  query('email').isEmail(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { word } = req.params;
      const { email } = req.query;

      if (!email) {
        return res.status(401).json({ message: 'Unauthorized: email is required' });
      }

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Record search in history
      await prisma.searchHistory.create({
        data: {
          term: word.toLowerCase(),
          userId: user.id,
        },
      });

      // Fetch word details from external API
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.toLowerCase())}`
      );

      if (!response.ok) {
        return res.status(404).json({ message: 'Word not found' });
      }

      const data = await response.json();

      // Return the first entry (most relevant)
      res.json(data[0]);
    } catch (error) {
      console.error('Error searching for word:', error);
      res.status(500).json({ message: 'Failed to search for word' });
    }
  }
);

/**
 * Get random words
 */
router.get('/random', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Fetch random words from external API
    const response = await fetch('https://random-word-api.herokuapp.com/all');

    if (!response.ok) {
      return res.status(500).json({ message: 'Failed to fetch random words' });
    }

    const words = await response.json();

    // Get random subset of words
    const randomWords = [];
    const totalWords = words.length;

    for (let i = 0; i < Math.min(limit, 100); i++) {
      const randomIndex = Math.floor(Math.random() * totalWords);
      randomWords.push(words[randomIndex]);
    }

    res.json(randomWords);
  } catch (error) {
    console.error('Error fetching random words:', error);
    res.status(500).json({ message: 'Failed to fetch random words' });
  }
});

/**
 * Save word to user's vocabulary
 */
router.post(
  '/words',
  body('email').isEmail(),
  body('word').trim().isString().isLength({ min: 1 }),
  body('phonetic').optional(),
  body('origin').optional(),
  body('meanings').isArray(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, word, phonetic, origin, meanings } = req.body;

      // Check if user exists first
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Add new word to vocabulary
      const newWord = await prisma.vocabularyWord.create({
        data: {
          word: word.toLowerCase(),
          phonetic,
          origin,
          meanings,
          userId: user.id,
        },
      });

      res.status(201).json(newWord);
    } catch (error) {
      console.error('Error saving word:', error);
      res.status(500).json({ message: 'Failed to save word' });
    }
  }
);

/**
 * Get user's vocabulary
 */
router.get(
  '/words',
  query('email').isEmail(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email } = req.query;

      if (!email) {
        return res.status(401).json({ message: 'Unauthorized: email is required' });
      }

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const filter = req.query.filter || 'all'; // 'all', 'favorites', 'recent'

      let words;

      switch (filter) {
        case 'favorites':
          words = await prisma.vocabularyWord.findMany({
            where: {
              userId: user.id,
              favorites: {
                some: {
                  userId: user.id,
                },
              },
            },
            orderBy: {
              timestamp: 'desc',
            },
          });
          break;

        case 'recent':
          words = await prisma.vocabularyWord.findMany({
            where: {
              userId: user.id,
            },
            orderBy: {
              timestamp: 'desc',
            },
            take: 20,
          });
          break;

        default:
          words = await prisma.vocabularyWord.findMany({
            where: {
              userId: user.id,
            },
            orderBy: {
              timestamp: 'desc',
            },
          });
      }

      // Get favorites to mark them in the response
      const favorites = await prisma.favorite.findMany({
        where: {
          userId: user.id,
        },
        select: {
          wordId: true,
        },
      });

      const favoriteIds = favorites.map((fav) => fav.wordId);

      // Add isFavorite flag to words
      const wordsWithFavoriteFlag = words.map((word) => ({
        ...word,
        isFavorite: favoriteIds.includes(word.id),
      }));

      res.json(wordsWithFavoriteFlag);
    } catch (error) {
      console.error('Error fetching vocabulary:', error);
      res.status(500).json({ message: 'Failed to fetch vocabulary' });
    }
  }
);

/**
 * Delete a word from vocabulary
 */
router.delete(
  '/words/:id',
  param('id').isString(),
  body('email').isEmail(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { email } = req.body;

      if (!email) {
        return res.status(401).json({ message: 'Unauthorized: email is required' });
      }

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if word exists and belongs to user
      const word = await prisma.vocabularyWord.findFirst({
        where: {
          id,
          userId: user.id,
        },
      });

      if (!word) {
        return res.status(404).json({ message: 'Word not found' });
      }

      // Delete word
      await prisma.vocabularyWord.delete({
        where: {
          id,
        },
      });

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting word:', error);
      res.status(500).json({ message: 'Failed to delete word' });
    }
  }
);

/**
 * Toggle word as favorite
 */
router.post(
  '/favorites',
  body('email').isEmail(),
  body('wordId').isString(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, wordId } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if word exists and belongs to user
      const word = await prisma.vocabularyWord.findFirst({
        where: {
          id: wordId,
          userId: user.id,
        },
      });

      if (!word) {
        return res.status(404).json({ message: 'Word not found' });
      }

      // Check if already favorite
      const existingFavorite = await prisma.favorite.findUnique({
        where: {
          userId_wordId: {
            userId: user.id,
            wordId,
          },
        },
      });

      if (existingFavorite) {
        // Remove from favorites
        await prisma.favorite.delete({
          where: {
            id: existingFavorite.id,
          },
        });

        return res.json({ isFavorite: false });
      }

      // Add to favorites
      await prisma.favorite.create({
        data: {
          userId: user.id,
          wordId,
        },
      });

      res.json({ isFavorite: true });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      res.status(500).json({ message: 'Failed to toggle favorite' });
    }
  }
);

/**
 * Start a study session
 */
router.post(
  '/study-sessions',
  body('email').isEmail(),
  body('mode').isIn(['study', 'flashcard']),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, mode } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Create new study session
      const session = await prisma.studySession.create({
        data: {
          userId: user.id,
          mode,
          startTime: new Date(),
        },
      });

      // Update daily streak
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existingStreak = await prisma.dailyStreak.findUnique({
        where: {
          userId_date: {
            userId: user.id,
            date: today,
          },
        },
      });

      if (!existingStreak) {
        // Check if there was a streak yesterday
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const yesterdayStreak = await prisma.dailyStreak.findUnique({
          where: {
            userId_date: {
              userId: user.id,
              date: yesterday,
            },
          },
        });

        let newCount = 1;

        if (yesterdayStreak) {
          // Continue streak
          newCount = yesterdayStreak.count + 1;
        }

        // Create today's streak
        await prisma.dailyStreak.create({
          data: {
            userId: user.id,
            date: today,
            count: newCount,
          },
        });
      }

      res.status(201).json(session);
    } catch (error) {
      console.error('Error starting study session:', error);
      res.status(500).json({ message: 'Failed to start study session' });
    }
  }
);

/**
 * End a study session
 */
router.put(
  '/study-sessions/:id',
  param('id').isString(),
  body('email').isEmail(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { email } = req.body;

      if (!email) {
        return res.status(401).json({ message: 'Unauthorized: email is required' });
      }

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if session exists and belongs to user
      const session = await prisma.studySession.findFirst({
        where: {
          id,
          userId: user.id,
        },
      });

      if (!session) {
        return res.status(404).json({ message: 'Study session not found' });
      }

      // Update session with end time
      const updatedSession = await prisma.studySession.update({
        where: {
          id,
        },
        data: {
          endTime: new Date(),
        },
      });

      res.json(updatedSession);
    } catch (error) {
      console.error('Error ending study session:', error);
      res.status(500).json({ message: 'Failed to end study session' });
    }
  }
);

/**
 * Record word study attempt
 */
router.post(
  '/study-records',
  body('email').isEmail(),
  body('sessionId').isString(),
  body('wordId').isString(),
  body('difficultyRating').optional().isIn(['easy', 'medium', 'hard']),
  body('isCorrect').optional().isBoolean(),
  body('timeSpent').optional().isInt(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, sessionId, wordId, difficultyRating, isCorrect, timeSpent } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if session exists and belongs to user
      const session = await prisma.studySession.findFirst({
        where: {
          id: sessionId,
          userId: user.id,
        },
      });

      if (!session) {
        return res.status(404).json({ message: 'Study session not found' });
      }

      // Check if word exists and belongs to user
      const word = await prisma.vocabularyWord.findFirst({
        where: {
          id: wordId,
          userId: user.id,
        },
      });

      if (!word) {
        return res.status(404).json({ message: 'Word not found' });
      }

      // Create study record
      const record = await prisma.studyRecord.create({
        data: {
          sessionId,
          wordId,
          difficultyRating,
          isCorrect,
          timeSpent,
        },
      });

      res.status(201).json(record);
    } catch (error) {
      console.error('Error creating study record:', error);
      res.status(500).json({ message: 'Failed to create study record' });
    }
  }
);

/**
 * Get user's current streak
 */
router.get(
  '/streak',
  query('email').isEmail(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email } = req.query;

      if (!email) {
        return res.status(401).json({ message: 'Unauthorized: email is required' });
      }

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const currentStreak = await prisma.dailyStreak.findUnique({
        where: {
          userId_date: {
            userId: user.id,
            date: today,
          },
        },
      });

      if (!currentStreak) {
        // Check if there was a streak yesterday
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const yesterdayStreak = await prisma.dailyStreak.findUnique({
          where: {
            userId_date: {
              userId: user.id,
              date: yesterday,
            },
          },
        });

        if (yesterdayStreak) {
          // User has an active streak but hasn't studied today yet
          return res.json({ streak: yesterdayStreak.count, lastActive: yesterday });
        }

        // No recent streak
        return res.json({ streak: 0, lastActive: null });
      }

      // Return current streak
      res.json({ streak: currentStreak.count, lastActive: today });
    } catch (error) {
      console.error('Error fetching streak:', error);
      res.status(500).json({ message: 'Failed to fetch streak' });
    }
  }
);

/**
 * Get search history
 */
router.get(
  '/search-history',
  query('email').isEmail(),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email } = req.query;

      if (!email) {
        return res.status(401).json({ message: 'Unauthorized: email is required' });
      }

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const limit = parseInt(req.query.limit) || 20;

      const history = await prisma.searchHistory.findMany({
        where: {
          userId: user.id,
        },
        orderBy: {
          timestamp: 'desc',
        },
        take: limit,
        select: {
          term: true,
          timestamp: true,
        },
      });

      // Remove duplicates, keeping the most recent
      const uniqueTerms = new Map();
      history.forEach((item) => {
        if (!uniqueTerms.has(item.term) || uniqueTerms.get(item.term) < item.timestamp) {
          uniqueTerms.set(item.term, item.timestamp);
        }
      });

      const uniqueHistory = Array.from(uniqueTerms.keys()).map((term) => ({
        term,
        timestamp: uniqueTerms.get(term),
      }));

      // Sort by timestamp (most recent first)
      uniqueHistory.sort((a, b) => b.timestamp - a.timestamp);

      res.json(uniqueHistory);
    } catch (error) {
      console.error('Error fetching search history:', error);
      res.status(500).json({ message: 'Failed to fetch search history' });
    }
  }
);

export default router;
