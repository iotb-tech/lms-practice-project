import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    console.log('MONGO_URI:', process.env.MONGO_URI);
    console.log('Type:', typeof process.env.MONGO_URI);

    await mongoose.connect(process.env.MONGO_URI);
    // OR hardcode temporarily: await mongoose.connect('mongodb://localhost:27017/');

    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB error', err.message);
    process.exit(1);
  }
};
