import express from 'express';

import { prisma } from "../lib/db.js";
const router = express.Router();

// Signup endpoint
router.post('/create', async (req, res) => {
  const { email ,motherToung,englishLevel,learningGoal,interests,focus,voice} = req.body;

  // Validate email
  if (!email) {
    console.log('Signup attempt failed: No email provided');
    return res.status(400).json({ error: 'Email is required' });
  }
 console.log(email,motherToung,englishLevel,learningGoal,interests,focus,voice);
  console.log(`Signup attempt with email: ${email}`);

  try {
    // Check if user already exists


    // Create new user
    const user = await prisma.user.upsert({
      where: { email },
      update:{
        motherToung,
        englishLevel,
        learningGoal,
        interests,
        focus,
        voice
      },
      create: {
        email,
       name: email.split('@')[0]
      },
    });

    console.log(`User created with id: ${user.id}, email: ${user.email}`);
    return res.status(201).json({ user });
  } catch (error) {
    console.error('Error creating user:', error);

    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Email already exists' });
    }

    return res.status(500).json({ error: 'An error occurred while creating user' });
  }
});

export default router;
