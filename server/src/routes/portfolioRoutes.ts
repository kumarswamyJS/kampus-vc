import { Router } from 'express';
import {
  uploadMediaFile,
  createPortfolioItem,
  getMyPortfolioItems,
  getPublicPortfolioItems,
  getPortfolioItemById,
  updatePortfolioItem,
  deletePortfolioItem,
  toggleFeatureItem,
} from '../controllers/portfolioController';
import { authenticate, requireRole } from '../middleware/authMiddleware';
import { uploadSingleMedia } from '../middleware/uploadMiddleware';

const router = Router();

// Upload media file (Creators only)
router.post('/upload', authenticate, requireRole('creator'), uploadSingleMedia, uploadMediaFile);

// Creator CRUD endpoints
router.post('/', authenticate, requireRole('creator'), createPortfolioItem);
router.get('/mine', authenticate, requireRole('creator'), getMyPortfolioItems);
router.get('/creator/:creatorId', getPublicPortfolioItems);
router.get('/:id', getPortfolioItemById);
router.patch('/:id', authenticate, requireRole('creator'), updatePortfolioItem);
router.delete('/:id', authenticate, requireRole('creator'), deletePortfolioItem);
router.patch('/:id/feature', authenticate, requireRole('creator'), toggleFeatureItem);

export default router;
