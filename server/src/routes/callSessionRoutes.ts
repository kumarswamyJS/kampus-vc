import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { getConversationCalls, getProjectCalls } from '../controllers/callSessionController';

const router = Router();

router.use(authenticate);

router.get('/conversations/:conversationId/calls', getConversationCalls);
router.get('/projects/:projectId/calls', getProjectCalls);

export default router;
