import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { getMyPassport, reanalyzePassport, getCreatorPassport } from '../controllers/passportController';

const router = Router();

router.use(authenticate);

router.get('/passport/me', getMyPassport);
router.post('/passport/reanalyze', reanalyzePassport);
router.get('/passport/creator/:creatorId', getCreatorPassport);

export default router;
