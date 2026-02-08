import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
 res.send('API is running...');
});


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public auth routes
app.use('/api/auth', authRoutes);

// Connect to MongoDB
await connectDB();

export default app;
