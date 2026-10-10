import { Router } from 'express';
import {
  createBrief,
  getMyBriefs,
  getPublicBriefs,
  getBriefById,
  updateBrief,
  publishBrief,
  closeBrief,
  deleteBrief,
  uploadReferenceAsset,
  generateAIBrief,
  generateTimeMachineDirections,
} from '../controllers/briefController';
import { authenticate, requireRole } from '../middleware/authMiddleware';
import { uploadSingleMedia } from '../middleware/uploadMiddleware';

const router = Router();

// Reference File Upload (Brand only)
router.post('/upload-reference', authenticate, requireRole('brand'), uploadSingleMedia, uploadReferenceAsset);

// AI & Time Machine Endpoints (Brand only)
router.post('/generate', authenticate, requireRole('brand'), generateAIBrief);
router.post('/time-machine', authenticate, requireRole('brand'), generateTimeMachineDirections);

// Brand Brief CRUD
router.post('/', authenticate, requireRole('brand'), createBrief);
router.get('/mine', authenticate, requireRole('brand'), getMyBriefs);
router.get('/public', getPublicBriefs);
router.get('/:id', getBriefById);
router.patch('/:id', authenticate, requireRole('brand'), updateBrief);
router.post('/:id/publish', authenticate, requireRole('brand'), publishBrief);
router.post('/:id/close', authenticate, requireRole('brand'), closeBrief);
router.delete('/:id', authenticate, requireRole('brand'), deleteBrief);

export default router;
