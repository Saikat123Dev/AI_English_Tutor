// // routes/stars.js

// const express = require('express');
// const router = express.Router();
// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();

// /**
//  * @route   GET /api/stars
//  * @desc    Get user's stars and timer information
//  * @access  Private
//  */
// router.get('/', async (req, res) => {
//   try {
//     // Fix email extraction - properly handle both URL query params and body params
//     const email = req.query.email || (req.body ? req.body.email : undefined);

//     if (!email) {
//       return res.status(400).json({ message: 'Email is required' });
//     }

//     console.log(`Fetching stars for email: ${email}`);

//     // Get user with star information
//     const user = await prisma.user.findUnique({
//       where: { email },
//       select: {
//         id: true,
//         pronunciationStars: true,
//         vocabularyStars: true,
//         learningStars: true,
//         totalStars: true,
//         lastResetTime: true
//       }
//     });

//     if (!user) {
//       console.log(`User not found with email: ${email}`);
//       return res.status(404).json({ message: 'User not found' });
//     }

//     console.log(`Found user: ${user.id}`);

//     // Calculate next reset time (7 days from last reset or now if no reset yet)
//     const lastResetTime = user.lastResetTime || new Date();
//     const nextResetTime = new Date(lastResetTime);
//     nextResetTime.setDate(nextResetTime.getDate() + 7);

//     // Calculate time remaining until next reset
//     const now = new Date();
//     const diffTime = Math.max(0, nextResetTime - now);

//     // Calculate days, hours, minutes, seconds
//     const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
//     const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
//     const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
//     const seconds = Math.floor((diffTime % (1000 * 60)) / 1000);

//     // Get current learning progress metrics for reference
//     // 1. Get pronunciation attempts count and accuracy
//     const pronunciationAttempts = await prisma.pronunciationAttempt.findMany({
//       where: {
//         userId: user.id,
//         createdAt: {
//           gte: lastResetTime
//         }
//       },
//       select: {
//         accuracy: true
//       }
//     });

//     const accuracyValues = pronunciationAttempts
//       .filter(item => item.accuracy !== null)
//       .map(item => item.accuracy || 0);

//     const avgAccuracy = accuracyValues.length > 0
//       ? accuracyValues.reduce((sum, val) => sum + val, 0) / accuracyValues.length
//       : 0;

//     // 2. Count vocabulary words added since last reset
//     const vocabularyCount = await prisma.vocabularyWord.count({
//       where: {
//         userId: user.id,
//         timestamp: {
//           gte: lastResetTime
//         }
//       }
//     });

//     // 3. Count completed study sessions
//     const studySessionCount = await prisma.studySession.count({
//       where: {
//         userId: user.id,
//         startTime: {
//           gte: lastResetTime
//         },
//         endTime: {
//           not: null
//         }
//       }
//     });

//     // Calculate learning progress as percentage (max 100%)
//     // Using 10 study sessions as the goal for 100%
//     const studySessionGoal = 10;
//     const learningProgressPercentage = Math.min(100, Math.round((studySessionCount / studySessionGoal) * 100));

//     return res.json({
//       stars: {
//         pronunciation: user.pronunciationStars || 0,
//         vocabulary: user.vocabularyStars || 0,
//         learning: user.learningStars || 0,
//         total: user.totalStars || 0
//       },
//       progress: {
//         pronunciationAccuracy: Math.round(avgAccuracy * 10) / 10, // Round to 1 decimal place
//         vocabularyCount,
//         studySessionCount,
//         learningProgressPercentage
//       },
//       timer: {
//         lastResetTime: lastResetTime.toISOString(),
//         nextResetTime: nextResetTime.toISOString(),
//         timeRemaining: {
//           days,
//           hours,
//           minutes,
//           seconds
//         }
//       }
//     });
//   } catch (error) {
//     console.error('Error fetching stars:', error);
//     console.error(error.stack);
//     res.status(500).json({ message: 'Server error when fetching stars', error: error.message });
//   }
// });

// /**
//  * @route   POST /api/stars/check-reset
//  * @desc    Check if timer has completed and reset progress if needed
//  * @access  Private
//  */
// router.post('/check-reset', async (req, res) => {
//   try {
//     // Fix email extraction
//     const email = req.body.email || req.query.email;

//     if (!email) {
//       return res.status(400).json({ message: 'Email is required' });
//     }

//     console.log(`Checking reset for email: ${email}`);

//     // Get user with star information
//     const user = await prisma.user.findUnique({
//       where: { email },
//       select: {
//         id: true,
//         lastResetTime: true,
//         pronunciationStars: true,
//         vocabularyStars: true,
//         learningStars: true,
//         totalStars: true
//       }
//     });

//     if (!user) {
//       console.log(`User not found with email: ${email}`);
//       return res.status(404).json({ message: 'User not found' });
//     }

//     console.log(`Found user: ${user.id}`);

//     const now = new Date();

//     // If no last reset time, set it to now
//     if (!user.lastResetTime) {
//       console.log(`User has no last reset time, setting initial timer`);

//       await prisma.user.update({
//         where: { id: user.id },
//         data: { lastResetTime: now }
//       });

//       const nextResetTime = new Date(now);
//       nextResetTime.setDate(nextResetTime.getDate() + 7);

//       return res.json({
//         wasReset: false,
//         message: 'Initial timer set',
//         timer: {
//           lastResetTime: now.toISOString(),
//           nextResetTime: nextResetTime.toISOString(),
//           timeRemaining: {
//             days: 7,
//             hours: 0,
//             minutes: 0,
//             seconds: 0
//           }
//         }
//       });
//     }

//     // Calculate if 7 days have passed since last reset
//     const lastReset = new Date(user.lastResetTime);
//     const nextResetTime = new Date(lastReset);
//     nextResetTime.setDate(nextResetTime.getDate() + 7);

//     console.log(`Last reset: ${lastReset.toISOString()}`);
//     console.log(`Next reset: ${nextResetTime.toISOString()}`);
//     console.log(`Current time: ${now.toISOString()}`);

//     // Check if it's time to reset
//     if (now >= nextResetTime) {
//       console.log(`Time to reset progress!`);

//       // Calculate stars earned in this cycle
//       let newPronunciationStar = 0;
//       let newVocabularyStar = 0;
//       let newLearningStar = 0;

//       // 1. Get pronunciation accuracy from attempts
//       const pronunciationData = await prisma.pronunciationAttempt.findMany({
//         where: {
//           userId: user.id,
//           createdAt: {
//             gte: lastReset
//           }
//         },
//         select: {
//           accuracy: true
//         }
//       });

//       // Calculate average pronunciation accuracy
//       const accuracyValues = pronunciationData
//         .filter(item => item.accuracy !== null)
//         .map(item => item.accuracy || 0);

//       const avgAccuracy = accuracyValues.length > 0
//         ? accuracyValues.reduce((sum, val) => sum + val, 0) / accuracyValues.length
//         : 0;

//       console.log(`Pronunciation attempts: ${pronunciationData.length}, Avg accuracy: ${avgAccuracy}`);

//       // 2. Count vocabulary words added since last reset
//       const vocabularyCount = await prisma.vocabularyWord.count({
//         where: {
//           userId: user.id,
//           timestamp: {
//             gte: lastReset
//           }
//         }
//       });

//       console.log(`New vocabulary words: ${vocabularyCount}`);

//       // 3. Count study sessions completed since last reset
//       const studySessionCount = await prisma.studySession.count({
//         where: {
//           userId: user.id,
//           startTime: {
//             gte: lastReset
//           },
//           endTime: {
//             not: null
//           }
//         }
//       });

//       console.log(`Completed study sessions: ${studySessionCount}`);

//       // Define star thresholds
//       if (avgAccuracy >= 85) newPronunciationStar = 1;
//       if (vocabularyCount >= 20) newVocabularyStar = 1;
//       if (studySessionCount >= 5) newLearningStar = 1;

//       const totalNewStars = newPronunciationStar + newVocabularyStar + newLearningStar;

//       console.log(`Stars earned: Pronunciation: ${newPronunciationStar}, Vocabulary: ${newVocabularyStar}, Learning: ${newLearningStar}`);

//       // Update user with new stars
//       const updatedUser = await prisma.user.update({
//         where: { id: user.id },
//         data: {
//           lastResetTime: now,
//           pronunciationStars: {
//             increment: newPronunciationStar
//           },
//           vocabularyStars: {
//             increment: newVocabularyStar
//           },
//           learningStars: {
//             increment: newLearningStar
//           },
//           totalStars: {
//             increment: totalNewStars
//           }
//         }
//       });

//       console.log(`Updated user: ${JSON.stringify(updatedUser)}`);

//       // Calculate next reset time
//       const newNextResetTime = new Date(now);
//       newNextResetTime.setDate(newNextResetTime.getDate() + 7);

//       // Calculate learning progress as percentage (max 100%)
//       const studySessionGoal = 10;
//       const learningProgressPercentage = Math.min(100, Math.round((studySessionCount / studySessionGoal) * 100));

//       return res.json({
//         wasReset: true,
//         message: 'Progress cycle completed and reset',
//         newStars: {
//           pronunciation: newPronunciationStar,
//           vocabulary: newVocabularyStar,
//           learning: newLearningStar,
//           total: totalNewStars
//         },
//         stars: {
//           pronunciation: updatedUser.pronunciationStars,
//           vocabulary: updatedUser.vocabularyStars,
//           learning: updatedUser.learningStars,
//           total: updatedUser.totalStars
//         },
//         progress: {
//           pronunciationAccuracy: Math.round(avgAccuracy * 10) / 10,
//           vocabularyCount,
//           studySessionCount,
//           learningProgressPercentage
//         },
//         timer: {
//           lastResetTime: now.toISOString(),
//           nextResetTime: newNextResetTime.toISOString(),
//           timeRemaining: {
//             days: 7,
//             hours: 0,
//             minutes: 0,
//             seconds: 0
//           }
//         }
//       });
//     }

//     // If not time to reset yet, just return current state
//     console.log(`No reset needed yet`);

//     const diffTime = Math.max(0, nextResetTime - now);
//     const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
//     const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
//     const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
//     const seconds = Math.floor((diffTime % (1000 * 60)) / 1000);

//     // Get current learning progress metrics
//     // 1. Get pronunciation attempts count and accuracy
//     const pronunciationAttempts = await prisma.pronunciationAttempt.findMany({
//       where: {
//         userId: user.id,
//         createdAt: {
//           gte: lastReset
//         }
//       },
//       select: {
//         accuracy: true
//       }
//     });

//     const accuracyValues = pronunciationAttempts
//       .filter(item => item.accuracy !== null)
//       .map(item => item.accuracy || 0);

//     const avgAccuracy = accuracyValues.length > 0
//       ? accuracyValues.reduce((sum, val) => sum + val, 0) / accuracyValues.length
//       : 0;

//     // 2. Count vocabulary words added since last reset
//     const vocabularyCount = await prisma.vocabularyWord.count({
//       where: {
//         userId: user.id,
//         timestamp: {
//           gte: lastReset
//         }
//       }
//     });

//     // 3. Count completed study sessions
//     const studySessionCount = await prisma.studySession.count({
//       where: {
//         userId: user.id,
//         startTime: {
//           gte: lastReset
//         },
//         endTime: {
//           not: null
//         }
//       }
//     });

//     // Calculate learning progress as percentage (max 100%)
//     const studySessionGoal = 10;
//     const learningProgressPercentage = Math.min(100, Math.round((studySessionCount / studySessionGoal) * 100));

//     return res.json({
//       wasReset: false,
//       message: 'No reset needed yet',
//       stars: {
//         pronunciation: user.pronunciationStars || 0,
//         vocabulary: user.vocabularyStars || 0,
//         learning: user.learningStars || 0,
//         total: user.totalStars || 0
//       },
//       progress: {
//         pronunciationAccuracy: Math.round(avgAccuracy * 10) / 10,
//         vocabularyCount,
//         studySessionCount,
//         learningProgressPercentage
//       },
//       timer: {
//         lastResetTime: lastReset.toISOString(),
//         nextResetTime: nextResetTime.toISOString(),
//         timeRemaining: {
//           days,
//           hours,
//           minutes,
//           seconds
//         }
//       }
//     });
//   } catch (error) {
//     console.error('Error checking reset:', error);
//     console.error(error.stack);
//     res.status(500).json({
//       message: 'Server error when checking reset',
//       error: error.message
//     });
//   }
// });

// /**
//  * @route   POST /api/stars/manual-reset
//  * @desc    Manually reset the timer and assign stars (for testing or admin use)
//  * @access  Private
//  */
// router.post('/manual-reset', async (req, res) => {
//   try {
//     const email = req.body.email || req.query.email;
//     const { awardStars = false } = req.body;

//     if (!email) {
//       return res.status(400).json({ message: 'Email is required' });
//     }

//     console.log(`Manual reset requested for email: ${email}`);

//     // Get current user data
//     const user = await prisma.user.findUnique({
//       where: { email },
//       select: {
//         id: true,
//         pronunciationStars: true,
//         vocabularyStars: true,
//         learningStars: true,
//         totalStars: true,
//         lastResetTime: true
//       }
//     });

//     if (!user) {
//       console.log(`User not found with email: ${email}`);
//       return res.status(404).json({ message: 'User not found' });
//     }

//     console.log(`Found user: ${user.id}`);

//     // Calculate stars to award if requested
//     let newPronunciationStar = 0;
//     let newVocabularyStar = 0;
//     let newLearningStar = 0;

//     if (awardStars) {
//       console.log(`Calculating stars to award`);

//       const lastReset = user.lastResetTime || new Date(0);

//       // Get pronunciation accuracy data
//       const pronunciationData = await prisma.pronunciationAttempt.findMany({
//         where: {
//           userId: user.id,
//           createdAt: {
//             gte: lastReset
//           }
//         },
//         select: {
//           accuracy: true
//         }
//       });

//       // Calculate average pronunciation accuracy
//       const accuracyValues = pronunciationData
//         .filter(item => item.accuracy !== null)
//         .map(item => item.accuracy || 0);

//       const avgAccuracy = accuracyValues.length > 0
//         ? accuracyValues.reduce((sum, val) => sum + val, 0) / accuracyValues.length
//         : 0;

//       console.log(`Pronunciation attempts: ${pronunciationData.length}, Avg accuracy: ${avgAccuracy}`);

//       // Count vocabulary words added
//       const vocabularyCount = await prisma.vocabularyWord.count({
//         where: {
//           userId: user.id,
//           timestamp: {
//             gte: lastReset
//           }
//         }
//       });

//       console.log(`New vocabulary words: ${vocabularyCount}`);

//       // Count study sessions completed
//       const studySessionCount = await prisma.studySession.count({
//         where: {
//           userId: user.id,
//           startTime: {
//             gte: lastReset
//           },
//           endTime: {
//             not: null
//           }
//         }
//       });

//       console.log(`Completed study sessions: ${studySessionCount}`);

//       // Define thresholds for earning stars
//       if (avgAccuracy >= 85) newPronunciationStar = 1;
//       if (vocabularyCount >= 20) newVocabularyStar = 1;
//       if (studySessionCount >= 5) newLearningStar = 1;

//       console.log(`Stars earned: Pronunciation: ${newPronunciationStar}, Vocabulary: ${newVocabularyStar}, Learning: ${newLearningStar}`);
//     }

//     const totalNewStars = newPronunciationStar + newVocabularyStar + newLearningStar;

//     // Update user with new stars and reset lastResetTime
//     const now = new Date();
//     const updatedUser = await prisma.user.update({
//       where: { id: user.id },
//       data: {
//         lastResetTime: now,
//         pronunciationStars: {
//           increment: newPronunciationStar
//         },
//         vocabularyStars: {
//           increment: newVocabularyStar
//         },
//         learningStars: {
//           increment: newLearningStar
//         },
//         totalStars: {
//           increment: totalNewStars
//         }
//       }
//     });

//     console.log(`Updated user: ${JSON.stringify(updatedUser)}`);

//     // Calculate next reset time
//     const nextResetTime = new Date(now);
//     nextResetTime.setDate(nextResetTime.getDate() + 7);

//     // Calculate learning progress as percentage (max 100%)
//     const studySessionGoal = 10;
//     const studySessionCount = 0; // After reset, this is 0
//     const learningProgressPercentage = 0; // After reset, this is 0

//     return res.json({
//       message: 'Manual reset completed',
//       newStars: {
//         pronunciation: newPronunciationStar,
//         vocabulary: newVocabularyStar,
//         learning: newLearningStar,
//         total: totalNewStars
//       },
//       stars: {
//         pronunciation: updatedUser.pronunciationStars,
//         vocabulary: updatedUser.vocabularyStars,
//         learning: updatedUser.learningStars,
//         total: updatedUser.totalStars
//       },
//       progress: {
//         pronunciationAccuracy: 0,
//         vocabularyCount: 0,
//         studySessionCount: 0,
//         learningProgressPercentage: 0
//       },
//       timer: {
//         lastResetTime: now.toISOString(),
//         nextResetTime: nextResetTime.toISOString(),
//         timeRemaining: {
//           days: 7,
//           hours: 0,
//           minutes: 0,
//           seconds: 0
//         }
//       }
//     });
//   } catch (error) {
//     console.error('Error during manual reset:', error);
//     console.error(error.stack);
//     res.status(500).json({
//       message: 'Server error during manual reset',
//       error: error.message
//     });
//   }
// });

// module.exports = router;
