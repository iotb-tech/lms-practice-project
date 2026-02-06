import mongoose from 'mongoose';
import { logError, logInfo } from '../utils/logger.js';

export const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    console.log('MONGO_URI:', process.env.MONGO_URI ? 'Loaded' : 'Missing');

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      family: 4, // IPv4 only (fixes DNS issues)
      serverSelectionTimeoutMS: 10000, // 10s timeout
      socketTimeoutMS: 45000,
      maxPoolSize: 10, // Connection pooling
      retryWrites: true,
      w: 'majority',

    });

    console.log('MongoDB connected successfully!');
    console.log(`Database: ${conn.connection.name}`);
    console.log(`Host: ${conn.connection.host}`);

    // Graceful shutdown handlers
    mongoose.connection.on('disconnected', () => {
      logInfo('MongoDB disconnected');
    });

    process.on('SIGINT', async () => {
      logInfo('SIGINT received, closing MongoDB connection...');
      await mongoose.connection.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logInfo('SIGTERM received, closing MongoDB connection...');
      await mongoose.connection.close();
      process.exit(0);
    });

  } catch (err) {
    console.error('MongoDB connection FAILED:', err.message);

    if (err.message.includes('ECONNREFUSED')) {
      console.error('\nQUICK FIXES:');
      console.error('1. MongoDB Atlas → Network Access → Add IP: 0.0.0.0/0');
      console.error('2. Check MONGO_URI credentials');
      console.error('3. Test: mongosh "your-connection-string"');
    } else if (err.message.includes('authentication')) {
      console.error('Check MONGO_URI username/password');
    }

    process.exit(1);
  }
};

// Connection events
mongoose.connection.on('connected', () => {
  logInfo('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  logError('Mongoose connection error:', err.message);
});
