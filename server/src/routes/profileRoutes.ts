import { Router } from 'express';
import { getMyProfile, updateMyProfile, getCreatorById, getBrandById } from '../controllers/profileController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.get('/me', authenticate, getMyProfile);
router.patch('/me', authenticate, updateMyProfile);
router.get('/creators/:id', getCreatorById);
router.get('/brands/:id', getBrandById);

export default router;
