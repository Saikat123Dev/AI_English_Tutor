import cors from 'cors';
import express from 'express';
import { prisma } from "./lib/db.js";
import authRoutes from './routes/auth.js';
import conversationRoutes from './routes/conversation.js';
import initialQuestionsRoutes from './routes/initialQuestions.js';
import pronounciationRoutes from './routes/pronounciation.js';
const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/initialQuestions', initialQuestionsRoutes);
app.use('/api/conversation', conversationRoutes);
app.use('/api/pronounciation', pronounciationRoutes);
app.get('/', (req, res) => {
  res.send('Hello World!');
});

const PORT = process.env.PORT || 3002;
app.listen(PORT,  "0.0.0.0",() => {
  console.log(`Server is running on port ${PORT}`);
}).on('error', (err) => {
  console.error('Server failed to start:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection:', reason);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('Prisma client disconnected');
  process.exit(0);
});
