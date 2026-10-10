import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import {
  getMyAvailability,
  updateMyAvailability,
  getCreatorAvailability,
  sendBookingInquiry,
  respondToBookingInquiry,
} from '../controllers/availabilityController';

const router = Router();

router.use(authenticate);

router.get('/availability/me', getMyAvailability);
router.patch('/availability/me', updateMyAvailability);
router.get('/availability/creators/:creatorId', getCreatorAvailability);
router.post('/availability/requests', sendBookingInquiry);
router.post('/availability/requests/:id/respond', respondToBookingInquiry);

export default router;
