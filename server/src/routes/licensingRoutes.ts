import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import {
  analyzeBriefLicensing,
  analyzeProposalLicensing,
  analyzeProjectLicensing,
} from '../controllers/licensingController';

const router = Router();

router.use(authenticate);

router.post('/licensing/analyze-brief', analyzeBriefLicensing);
router.post('/licensing/analyze-proposal', analyzeProposalLicensing);
router.post('/licensing/analyze-project', analyzeProjectLicensing);

export default router;
