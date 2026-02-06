import rateLimit from 'express-rate-limit';

export const authRateLimiter = rateLimit({
 windowMs: 15 * 60 * 1000, // 15 minutes
 max: 5, // 5 attempts per window
 message: {
  success: false,
  message: 'Too many login attempts, try again later'
 },
 standardHeaders: true,
 legacyHeaders: false,
 handler: (req, res, next) => {
  res.status(429).json({
   success: false,
   message: 'Too many login attempts, try again later'
  });
 }
});

// Global rate limiter for other endpoints
export const generalRateLimiter = rateLimit({
 windowMs: 15 * 60 * 1000, // 15 minutes
 max: 100, // 100 requests per window
 standardHeaders: true,
 legacyHeaders: false
});
