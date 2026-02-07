import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    console.log('MONGO_URI:', process.env.MONGO_URI);
    await mongoose.connect(
      'mongodb+srv://webweavers:webweavers@library-cluster.j88zwps.mongodb.net/',
    );
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB error', err.message);
    process.exit(1);
  }
};