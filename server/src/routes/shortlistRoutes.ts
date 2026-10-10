import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import {
  getMyShortlists,
  createShortlist,
  addCreatorToShortlist,
  removeCreatorFromShortlist,
} from '../controllers/shortlistController';

const router = Router();

router.use(authenticate);

router.get('/shortlists/mine', getMyShortlists);
router.post('/shortlists', createShortlist);
router.post('/shortlists/:id/creators', addCreatorToShortlist);
router.delete('/shortlists/:id/creators/:creatorUserId', removeCreatorFromShortlist);

export default router;
