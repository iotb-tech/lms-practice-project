import express from 'express';
import authRoutes from './routes/auth.js';
import { authenticateToken } from './middleware/auth.js';

const app = express();

// Public auth routes
app.use('/api/auth', authRoutes);

// Protected routes example
app.use('/api/courses', authenticateToken, courseRoutes);
app.use('/api/admin', authenticateToken, authorizeRoles('admin'), adminRoutes);

app.listen(9000, () => {
  console.log('Server running on port 9000');
});
