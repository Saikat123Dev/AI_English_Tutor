import express from 'express';
import { prisma } from "../lib/db.js";
import redisModule from "../lib/redis.js"; // Import the Redis client

const router = express.Router();

const redisClient = redisModule.client;

// Helper function to cache user data in Redis
async function cacheUserData(userId, userData) {
  try {
    // Cache user data with a 24-hour expiration (86400 seconds)
    await redisClient.set(`user:${userId}`, JSON.stringify(userData), { EX: 86400 });
    console.log(`User ${userId} cached in Redis`);
  } catch (error) {
    console.error('Redis caching error:', error);
    // Continue execution even if caching fails
  }
}

// Helper function to clear user cache when data is updated
async function clearUserCache(userId) {
  try {
    await redisClient.del(`user:${userId}`);
    console.log(`User ${userId} cache cleared from Redis`);
  } catch (error) {
    console.error('Redis cache clearing error:', error);
    // Continue execution even if cache clearing fails
  }
}

router.post('/create', async (req, res) => {
  const {
    email,
    motherToung, // Fixed typo from motherToung
    englishLevel,
    learningGoal,
    interests,
    focus,
    voice,
    // New fields
    occupation,
    studyTime,
    preferredTopics,
    challengeAreas,
    learningStyle,
    practiceFrequency,
    vocabularyLevel,
    grammarKnowledge,
    previousExperience,
    preferredContentType,
    timeZone,
    notificationPreference,
    spokenAccent
  } = req.body;

  // Basic validation
  if (!email) {
    console.log('Signup attempt failed: No email provided');
    return res.status(400).json({ error: 'Email is required' });
  }
   if(!motherToung){
    console.log('Signup attempt failed: No motherToung provided');
    return res.status(400).json({ error: 'motherToung is required' });
   }
  try {
    // Check if user exists in Redis cache first
    let existingUser = null;
    try {
      const cachedUser = await redisClient.get(`user:email:${email}`);
      if (cachedUser) {
        existingUser = JSON.parse(cachedUser);
        console.log(`User found in Redis cache: ${email}`);
      }
    } catch (redisError) {
      console.error('Redis get operation error:', redisError);
      // Continue with database operation if Redis fails
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        ...(motherToung && { motherToung }),
        ...(englishLevel && { englishLevel }),
        ...(learningGoal && { learningGoal }),
        ...(interests && { interests }),
        ...(focus && { focus }),
        ...(voice && { voice }),
        // New fields
        ...(occupation && { occupation }),
        ...(studyTime && { studyTime }),
        ...(preferredTopics && { preferredTopics: Array.isArray(preferredTopics) ? preferredTopics.join(',') : preferredTopics }),
        ...(challengeAreas && { challengeAreas: Array.isArray(challengeAreas) ? challengeAreas.join(',') : challengeAreas }),
        ...(learningStyle && { learningStyle }),
        ...(practiceFrequency && { practiceFrequency }),
        ...(vocabularyLevel && { vocabularyLevel }),
        ...(grammarKnowledge && { grammarKnowledge }),
        ...(previousExperience && { previousExperience }),
        ...(preferredContentType && { preferredContentType: Array.isArray(preferredContentType) ? preferredContentType.join(',') : preferredContentType }),
        ...(timeZone && { timeZone }),
        ...(notificationPreference && { notificationPreference }),
        ...(spokenAccent && { spokenAccent })
      },
      create: {
        email,
        name: email.split('@')[0],
        // Set initial values for any provided fields
        ...(motherToung && { motherToung }),
        ...(englishLevel && { englishLevel }),
        ...(learningGoal && { learningGoal }),
        ...(interests && { interests }),
        ...(focus && { focus }),
        ...(voice && { voice }),
        // New fields
        ...(occupation && { occupation }),
        ...(studyTime && { studyTime }),
        ...(preferredTopics && { preferredTopics: Array.isArray(preferredTopics) ? preferredTopics.join(',') : preferredTopics }),
        ...(challengeAreas && { challengeAreas: Array.isArray(challengeAreas) ? challengeAreas.join(',') : challengeAreas }),
        ...(learningStyle && { learningStyle }),
        ...(practiceFrequency && { practiceFrequency }),
        ...(vocabularyLevel && { vocabularyLevel }),
        ...(grammarKnowledge && { grammarKnowledge }),
        ...(previousExperience && { previousExperience }),
        ...(preferredContentType && { preferredContentType: Array.isArray(preferredContentType) ? preferredContentType.join(',') : preferredContentType }),
        ...(timeZone && { timeZone }),
        ...(notificationPreference && { notificationPreference }),
        ...(spokenAccent && { spokenAccent })
      },
    });

    // If this is an update, clear the existing cache first
    if (existingUser) {
      await clearUserCache(user.id);
    }

    // Cache the user data in Redis
    await cacheUserData(user.id, user);
    // Also cache by email for faster lookups
    await redisClient.set(`user:email:${user.email}`, JSON.stringify(user), { EX: 86400 });

    console.log(`User ${existingUser ? 'updated' : 'created'} successfully: ${user.email}`);
    return res.status(existingUser ? 200 : 201).json({ user });
  } catch (error) {
    console.error('Error in user operation:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    return res.status(500).json({
      error: 'An error occurred while processing user data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


// Make sure to handle shutdown properly
process.on('SIGINT', async () => {
  await redisClient.quit();
  console.log('Redis client disconnected');
  process.exit(0);
});

export default router;
