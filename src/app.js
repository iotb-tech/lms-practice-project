import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js'
const app = express();
const PORT = process.env.PORT || 9000;

// MIDDLEWARE FIRST (CRITICAL ORDER)
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || 'http://localhost:3000'
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({ message: 'LMS API is running...' });
});

// ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); 

// GLOBAL ERROR HANDLER (LAST - FIXED)
app.use((err, req, res, next) => {
  console.error('Global error:', err.name, err.message);
  console.log('Error data:', err.data); // Debug
  
  // Handle AppError with validation details
  if (err.name === 'AppError') {
    return res.status(err.statusCode || 400).json({
      success: false,
      message: err.message,
      ...(err.data && { 
        ...(err.data.errors && { errors: err.data.errors }),
        ...(err.data && !err.data.errors && { data: err.data })
      })
    });
  }

  // Zod validation fallback
  if (err.errors) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors
    });
  }

  // Generic server error
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// START SERVER
const startServer = async () => {
  try {
    await connectDB();
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
export default app;
