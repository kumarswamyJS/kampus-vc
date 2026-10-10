import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import {
  getMyConversations,
  getConversationByProject,
  getMessages,
  sendMessage,
} from '../controllers/conversationController';

const router = Router();

router.use(authenticate);

router.get('/', getMyConversations);
router.get('/project/:projectId', getConversationByProject);
router.get('/:conversationId/messages', getMessages);
router.post('/:conversationId/messages', sendMessage);

export default router;
