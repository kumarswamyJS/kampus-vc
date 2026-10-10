import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/authMiddleware';
import {
  getMyProjects,
  getProjectById,
  submitMilestoneWork,
  reviewMilestoneWork,
  fundMilestone,
  releaseMilestone,
} from '../controllers/projectController';

const router = Router();

router.use(authenticate);

router.get('/mine', getMyProjects);
router.get('/:id', getProjectById);
router.post('/:id/milestones/:milestoneId/submit', requireRole('creator'), submitMilestoneWork);
router.post('/:id/milestones/:milestoneId/review', requireRole('brand'), reviewMilestoneWork);
router.post('/:id/milestones/:milestoneId/fund', requireRole('brand'), fundMilestone);
router.post('/:id/milestones/:milestoneId/release', requireRole('brand'), releaseMilestone);

export default router;
