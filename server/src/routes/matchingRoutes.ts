import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/authMiddleware';
import { getMatchesForBrief, getMatchesForCreator } from '../controllers/matchingController';

const router = Router();

router.use(authenticate);

router.get('/brief/:briefId', requireRole('brand'), getMatchesForBrief);
router.get('/me', getMatchesForCreator);

export default router;
