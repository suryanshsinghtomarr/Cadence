import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { verifyToken } from './middleware/authMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import timetableRoutes from './routes/timetableRoutes.js';

dotenv.config({
  path: fileURLToPath(new URL('./.env', import.meta.url)),
  override: true,
});

const startServer = async () => {
  try {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'change_this_secret') {
      throw new Error('JWT_SECRET is missing or still uses the default value')
    }

    await connectDB()

    const PORT = process.env.PORT || 5000
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Server startup failed:', error.message)
    process.exitCode = 1
  }
}

const app = express();

const defaultOrigins = [
  'https://student-dashboard-sand-psi.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
];

const envOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
  : [];

const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/analytics', verifyToken, analyticsRoutes);
app.use('/api/timetable', verifyToken, timetableRoutes);
app.use('/api/goals', verifyToken, goalRoutes);
app.use('/api/tasks', verifyToken, taskRoutes);

startServer()
