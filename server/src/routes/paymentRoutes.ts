import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import {
  createPaymentOrder,
  verifyPayment,
  handlePaymentWebhook,
  getMyPayments,
  processRefund,
} from '../controllers/paymentController';

const router = Router();

router.post('/payments/webhook', handlePaymentWebhook);

router.use(authenticate);

router.post('/payments/create-order', createPaymentOrder);
router.post('/payments/verify', verifyPayment);
router.get('/payments/mine', getMyPayments);
router.post('/payments/:id/refund', processRefund);

export default router;
