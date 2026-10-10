import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { signup, login, logout, getCurrentUser, handleGoogleOAuth } from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Rate limiting for auth endpoints (15 requests per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many authentication attempts. Please try again in 15 minutes.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.get('/me', authenticate, getCurrentUser);
router.get('/google', handleGoogleOAuth);

export default router;
