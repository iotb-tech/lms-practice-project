import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import { logError, logInfo, logWarn } from './utils/logger.js';
import { globalErrorHandler } from './utils/errorHandler.js';
import authRoutes from './routes/authRoutes.js';

/*// Database connection FIRST
mongoose.connect(config.database.url, {
  serverSelectionTimeoutMS: 5000,
})
  .then(() => logInfo('MongoDB connected successfully'))
  .catch(err => {
    logError('MongoDB connection failed', err.message);
    process.exit(1);
  });
*/
connectDB();

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false
}));
app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true
}));

// Request parsers
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

app.use('/api/v1/auth', authRoutes);


app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});
app.use((req, res, next) => {
  // Only 404 for API routes under /api/v1
  if (req.originalUrl.startsWith('/api/v1')) {
    logWarn(`404 API Route not found: ${req.originalUrl}`);
    return res.status(404).json({
      success: false,
      message: 'API endpoint not found'
    });
  }
  next();
});

// Global error handler (LAST)
app.use(globalErrorHandler);

/*const port = config.port || 3000;
app.listen(port, () => {
  logInfo(` LMS API Server running on port ${port} (${config.nodeEnv})`);
});*/
export default app;