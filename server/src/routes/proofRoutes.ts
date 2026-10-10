import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import {
  submitProofOfCreativity,
  getProofByItem,
  getAdminPendingProofs,
  reviewProof,
} from '../controllers/proofController';

const router = Router();

router.use(authenticate);

router.post('/portfolio/:itemId/proof', submitProofOfCreativity);
router.get('/portfolio/:itemId/proof', getProofByItem);
router.get('/admin/proofs', getAdminPendingProofs);
router.post('/admin/proofs/:id/review', reviewProof);

export default router;
