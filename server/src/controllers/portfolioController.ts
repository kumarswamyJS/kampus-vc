import { Response } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { PortfolioItem } from '../models/PortfolioItem';
import { Creator } from '../models/Creator';
import { processUploadedFile, deleteStoredMedia } from '../services/storageService';

const portfolioCreateSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional().default(''),
  category: z.string().optional().default('Generative Visuals'),
  mediaType: z.enum(['image', 'video']).default('image'),
  mediaUrl: z.string().min(1, 'Media URL is required'),
  thumbnailUrl: z.string().optional().default(''),
  tags: z.array(z.string()).optional().default([]),
  toolsUsed: z.array(z.string()).optional().default([]),
  projectRole: z.string().optional().default('AI Director'),
  aiInvolvement: z.enum(['Full Generative', 'Hybrid AI-VFX', 'AI Assisted']).default('Full Generative'),
  workflowDescription: z.string().optional().default(''),
  commercialLicensing: z.enum(['Commercial Buyout', 'Personal Non-Commercial', 'Exclusive Rights']).default('Commercial Buyout'),
  visibility: z.enum(['public', 'private', 'draft']).default('public'),
  isFeatured: z.boolean().optional().default(false),
  aspectRatio: z.string().optional().default('16:9'),
});

export const uploadMediaFile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({
      success: false,
      error: { code: 'NO_FILE', message: 'No file was uploaded.' },
    });
    return;
  }

  try {
    const fileResult = await processUploadedFile(req.file);
    res.status(200).json({
      success: true,
      data: fileResult,
    });
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : 'Media upload failed';
    res.status(500).json({
      success: false,
      error: { code: 'UPLOAD_FAILED', message: errMessage },
    });
  }
};

export const createPortfolioItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    return;
  }

  const creator = await Creator.findOne({ userId: req.user._id });
  if (!creator) {
    res.status(403).json({ success: false, error: { code: 'NO_CREATOR_PROFILE', message: 'Creator profile required to add portfolio items.' } });
    return;
  }

  const parseResult = portfolioCreateSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid portfolio metadata', details: parseResult.error.flatten().fieldErrors },
    });
    return;
  }

  const count = await PortfolioItem.countDocuments({ creatorId: creator._id });

  const newItem = new PortfolioItem({
    ...parseResult.data,
    userId: req.user._id,
    creatorId: creator._id,
    displayOrder: count,
  });

  await newItem.save();

  // Also push sample to Creator model for profile preview
  creator.portfolioSamples.push({
    id: newItem._id.toString(),
    title: newItem.title,
    imageUrl: newItem.mediaUrl,
    category: newItem.category,
  });
  await creator.save();

  res.status(201).json({
    success: true,
    data: newItem,
  });
};

export const getMyPortfolioItems = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    return;
  }

  const items = await PortfolioItem.find({ userId: req.user._id }).sort({ displayOrder: 1, createdAt: -1 });
  res.status(200).json({
    success: true,
    data: items,
  });
};

export const getPublicPortfolioItems = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (mongoose.connection.readyState !== 1) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Creator not found' } });
    return;
  }

  const { creatorId } = req.params;
  const isObjId = mongoose.Types.ObjectId.isValid(creatorId);

  const creator = await Creator.findOne(
    isObjId ? { $or: [{ _id: creatorId }, { handle: creatorId }] } : { handle: creatorId }
  );

  if (!creator) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Creator not found' } });
    return;
  }

  const items = await PortfolioItem.find({
    creatorId: creator._id,
    visibility: 'public',
  }).sort({ isFeatured: -1, displayOrder: 1, createdAt: -1 });

  res.status(200).json({
    success: true,
    data: items,
  });
};

export const getPortfolioItemById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (mongoose.connection.readyState !== 1) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Portfolio item not found' } });
    return;
  }

  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Portfolio item not found' } });
    return;
  }

  const item = await PortfolioItem.findById(id);

  if (!item) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Portfolio item not found' } });
    return;
  }

  // If item is not public, verify owner
  if (item.visibility !== 'public') {
    if (!req.user || req.user._id.toString() !== item.userId.toString()) {
      res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Private portfolio item' } });
      return;
    }
  }

  res.status(200).json({
    success: true,
    data: item,
  });
};

export const updatePortfolioItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    return;
  }

  const { id } = req.params;
  const item = await PortfolioItem.findById(id);

  if (!item) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Portfolio item not found' } });
    return;
  }

  // Server-side ownership check
  if (item.userId.toString() !== req.user._id.toString()) {
    res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'You do not own this portfolio item.' } });
    return;
  }

  const { userId, creatorId, _id, ...updatePayload } = req.body;
  Object.assign(item, updatePayload);
  await item.save();

  res.status(200).json({
    success: true,
    data: item,
  });
};

export const deletePortfolioItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    return;
  }

  const { id } = req.params;
  const item = await PortfolioItem.findById(id);

  if (!item) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Portfolio item not found' } });
    return;
  }

  if (item.userId.toString() !== req.user._id.toString()) {
    res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'You do not own this portfolio item.' } });
    return;
  }

  // Clean up stored media
  if (item.mediaUrl) {
    await deleteStoredMedia(item.mediaUrl);
  }

  await item.deleteOne();

  // Remove sample from Creator model
  await Creator.updateOne(
    { userId: req.user._id },
    { $pull: { portfolioSamples: { id } } }
  );

  res.status(200).json({
    success: true,
    message: 'Portfolio item deleted successfully.',
  });
};

export const toggleFeatureItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    return;
  }

  const { id } = req.params;
  const item = await PortfolioItem.findById(id);

  if (!item || item.userId.toString() !== req.user._id.toString()) {
    res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Unauthorized or item not found' } });
    return;
  }

  item.isFeatured = !item.isFeatured;
  await item.save();

  res.status(200).json({
    success: true,
    data: item,
  });
};
