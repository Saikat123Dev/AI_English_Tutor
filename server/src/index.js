import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import express from 'express';
import authRoutes from './routes/auth.js';

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.get('/', (req, res) => {
  res.send('Hello World!');
});

const PORT = process.env.PORT || 3001;
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

export { prisma };
