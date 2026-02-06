import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema({
 token: {
  type: String,
  required: true,
  index: true
 },
 userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  required: true,
  index: true
 },
 expiresAt: {
  type: Date,
  required: true,
  index: { expires: '0' } // Auto-expire
 }
}, {
 timestamps: true
});

// Compound index for fast lookup
refreshTokenSchema.index({ userId: 1, token: 1 });

export default mongoose.model('RefreshToken', refreshTokenSchema);
