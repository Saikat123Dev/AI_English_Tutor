import express from 'express';
import { prisma } from '../index.js';

const router = express.Router();

// Signup endpoint
router.post('/signup', async (req, res) => {
  const { email } = req.body;

  // Validate email
  if (!email) {
    console.log('Signup attempt failed: No email provided');
    return res.status(400).json({ error: 'Email is required' });
  }

  console.log(`Signup attempt with email: ${email}`);

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log(`User already exists with email: ${email}`);
      return res.json({ user: existingUser, message: 'User already exists' });
    }

    // Create new user
    const user = await prisma.user.create({
      data: {
        email,
        name: email.split('@')[0],
      },
    });

    console.log(`User created with id: ${user.id}, email: ${user.email}`);
    return res.status(201).json({ user });
  } catch (error) {
    console.error('Error creating user:', error);

    // Check for specific Prisma errors
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Email already exists' });
    }

    return res.status(500).json({ error: 'An error occurred while creating user' });
  }
});

export default router;
