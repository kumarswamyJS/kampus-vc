import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { getMyNotifications, markAsRead } from '../controllers/notificationController';

const router = Router();

router.use(authenticate);

router.get('/', getMyNotifications);
router.patch('/:id/read', markAsRead);

export default router;
