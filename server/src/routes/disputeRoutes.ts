import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import {
  createDispute,
  getMyDisputes,
  getDisputeById,
  addDisputeResponse,
  submitDisputeEvidence,
  proposeSettlement,
  acknowledgeResolution,
  escalateDispute,
  reopenDispute,
} from '../controllers/disputeController';

const router = Router();

router.use(authenticate);

router.post('/projects/:projectId/disputes', createDispute);
router.get('/disputes/mine', getMyDisputes);
router.get('/disputes/:id', getDisputeById);
router.post('/disputes/:id/respond', addDisputeResponse);
router.post('/disputes/:id/evidence', submitDisputeEvidence);
router.post('/disputes/:id/propose-resolution', proposeSettlement);
router.post('/disputes/:id/acknowledge-resolution', acknowledgeResolution);
router.post('/disputes/:id/escalate', escalateDispute);
router.post('/disputes/:id/reopen', reopenDispute);

export default router;
