import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
 windowMs: 15 * 60 * 1000, // 15 minutes
 max: 5, // 5 attempts per window
 message: { success: false, message: 'Too many attempts' }
});

router.use('/register', authLimiter);
router.use('/login', authLimiter);
