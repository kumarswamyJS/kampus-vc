import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/authMiddleware';
import {
  createProposal,
  getMyProposals,
  getProposalsForBrief,
  getProposalById,
  acceptProposal,
  rejectProposal,
  withdrawProposal,
} from '../controllers/proposalController';

const router = Router();

router.use(authenticate);

router.post('/', requireRole('creator'), createProposal);
router.get('/mine', getMyProposals);
router.get('/brief/:briefId', requireRole('brand'), getProposalsForBrief);
router.get('/:id', getProposalById);
router.post('/:id/accept', requireRole('brand'), acceptProposal);
router.post('/:id/reject', requireRole('brand'), rejectProposal);
router.post('/:id/withdraw', requireRole('creator'), withdrawProposal);

export default router;
