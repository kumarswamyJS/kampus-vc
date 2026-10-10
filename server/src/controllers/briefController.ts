import { Response } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { CampaignBrief, BriefStatus } from '../models/CampaignBrief';
import { Brand } from '../models/Brand';
import { generateBriefFromConcept } from '../services/aiBriefService';
import { generateCreativeDirections } from '../services/timeMachineService';
import { processUploadedFile, deleteStoredMedia } from '../services/storageService';

const briefCreateSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  summary: z.string().optional().default(''),
  objective: z.string().optional().default(''),
  description: z.string().optional().default(''),
  targetAudience: z.string().optional().default(''),
  category: z.string().optional().default('Tech & Digital'),
  distributionPlatforms: z.array(z.string()).optional().default([]),
  brandPersonality: z.string().optional().default(''),
  desiredOutcome: z.string().optional().default(''),
  visualStyle: z.string().optional().default(''),
  mood: z.string().optional().default(''),
  colorPreferences: z.array(z.string()).optional().default([]),
  lighting: z.string().optional().default(''),
  subjectInfo: z.string().optional().default(''),
  requiredElements: z.array(z.string()).optional().default([]),
  excludedElements: z.array(z.string()).optional().default([]),
  inspirationLinks: z.array(z.string()).optional().default([]),
  selectedDirection: z.any().optional(),
  referenceAssets: z.array(z.any()).optional().default([]),
  deliverables: z.array(z.any()).optional().default([]),
  budget: z.object({
    amount: z.number().min(0, 'Budget cannot be negative').default(15000),
    currency: z.string().default('INR'),
    flexibility: z.enum(['Fixed', 'Negotiable', 'Range']).default('Negotiable'),
  }).optional().default({ amount: 15000, currency: 'INR', flexibility: 'Negotiable' }),
  deadline: z.string().optional(),
  milestones: z.array(z.string()).optional().default([]),
  revisionLimit: z.number().min(0).optional().default(3),
  acceptanceCriteria: z.array(z.string()).optional().default([]),
  licensingPreferences: z.string().optional().default('Commercial Buyout'),
  exclusivity: z.boolean().optional().default(false),
  attribution: z.boolean().optional().default(false),
  status: z.enum(['draft', 'published', 'closed', 'archived']).optional().default('draft'),
});

export const createBrief = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    return;
  }

  const brand = await Brand.findOne({ userId: req.user._id });
  if (!brand) {
    res.status(403).json({ success: false, error: { code: 'NO_BRAND_PROFILE', message: 'Brand profile required to create campaign briefs.' } });
    return;
  }

  const parseResult = briefCreateSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid brief payload', details: parseResult.error.flatten().fieldErrors },
    });
    return;
  }

  const deadlineDate = parseResult.data.deadline ? new Date(parseResult.data.deadline) : undefined;

  const newBrief = new CampaignBrief({
    ...parseResult.data,
    userId: req.user._id,
    brandId: brand._id,
    deadline: deadlineDate,
    status: 'draft',
  });

  await newBrief.save();

  res.status(201).json({
    success: true,
    data: newBrief,
  });
};

export const getMyBriefs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    return;
  }

  const { status } = req.query;
  const filter: Record<string, unknown> = { userId: req.user._id };

  if (status && typeof status === 'string' && ['draft', 'published', 'closed', 'archived'].includes(status)) {
    filter.status = status;
  }

  const briefs = await CampaignBrief.find(filter).sort({ updatedAt: -1 });
  const counts = {
    all: await CampaignBrief.countDocuments({ userId: req.user._id }),
    draft: await CampaignBrief.countDocuments({ userId: req.user._id, status: 'draft' }),
    published: await CampaignBrief.countDocuments({ userId: req.user._id, status: 'published' }),
    closed: await CampaignBrief.countDocuments({ userId: req.user._id, status: 'closed' }),
  };

  res.status(200).json({
    success: true,
    data: briefs,
    counts,
  });
};

export const getPublicBriefs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { category, search } = req.query;
  const filter: Record<string, unknown> = { status: 'published' };

  if (category && typeof category === 'string' && category !== 'All') {
    filter.category = category;
  }

  if (search && typeof search === 'string' && search.trim()) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { summary: { $regex: search, $options: 'i' } },
      { objective: { $regex: search, $options: 'i' } },
    ];
  }

  const briefs = await CampaignBrief.find(filter)
    .populate('brandId', 'companyName logoUrl industry verified')
    .sort({ publishedAt: -1, createdAt: -1 });

  res.status(200).json({
    success: true,
    data: briefs,
  });
};

export const getBriefById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Campaign brief not found' } });
    return;
  }

  const brief = await CampaignBrief.findById(id).populate('brandId', 'companyName logoUrl industry verified');

  if (!brief) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Campaign brief not found' } });
    return;
  }

  // Draft/Closed brief ownership check
  if (brief.status !== 'published') {
    if (!req.user || req.user._id.toString() !== brief.userId.toString()) {
      res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Private campaign brief' } });
      return;
    }
  }

  res.status(200).json({
    success: true,
    data: brief,
  });
};

export const updateBrief = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    return;
  }

  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Campaign brief not found' } });
    return;
  }

  const brief = await CampaignBrief.findById(id);

  if (!brief) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Campaign brief not found' } });
    return;
  }

  if (brief.userId.toString() !== req.user._id.toString()) {
    res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'You do not own this campaign brief.' } });
    return;
  }

  // Mass assignment protection: disallow modifying userId, brandId, or status directly via patch
  const { userId, brandId, _id, status, ...updatePayload } = req.body;

  if (updatePayload.deadline) {
    updatePayload.deadline = new Date(updatePayload.deadline);
  }

  Object.assign(brief, updatePayload);
  brief.version += 1;
  await brief.save();

  res.status(200).json({
    success: true,
    data: brief,
  });
};

export const publishBrief = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    return;
  }

  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Campaign brief not found' } });
    return;
  }

  const brief = await CampaignBrief.findById(id);

  if (!brief || brief.userId.toString() !== req.user._id.toString()) {
    res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Unauthorized or brief not found' } });
    return;
  }

  if (!brief.title || brief.title.length < 2) {
    res.status(400).json({ success: false, error: { code: 'INVALID_BRIEF', message: 'Brief must have a valid title to be published.' } });
    return;
  }

  brief.status = 'published';
  brief.publishedAt = new Date();
  await brief.save();

  res.status(200).json({
    success: true,
    data: brief,
  });
};

export const closeBrief = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    return;
  }

  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Campaign brief not found' } });
    return;
  }

  const brief = await CampaignBrief.findById(id);

  if (!brief || brief.userId.toString() !== req.user._id.toString()) {
    res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Unauthorized' } });
    return;
  }

  brief.status = 'closed';
  brief.closedAt = new Date();
  await brief.save();

  res.status(200).json({
    success: true,
    data: brief,
  });
};

export const deleteBrief = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    return;
  }

  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Campaign brief not found' } });
    return;
  }

  const brief = await CampaignBrief.findById(id);

  if (!brief || brief.userId.toString() !== req.user._id.toString()) {
    res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Unauthorized' } });
    return;
  }

  // Cleanup reference asset media
  if (brief.referenceAssets && brief.referenceAssets.length > 0) {
    for (const ref of brief.referenceAssets) {
      if (ref.url) await deleteStoredMedia(ref.url);
    }
  }

  await brief.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Campaign brief deleted successfully.',
  });
};

export const uploadReferenceAsset = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ success: false, error: { code: 'NO_FILE', message: 'No reference image file provided.' } });
    return;
  }

  try {
    const fileResult = await processUploadedFile(req.file);
    res.status(200).json({
      success: true,
      data: {
        url: fileResult.url,
        publicId: fileResult.publicId,
        mediaType: fileResult.mediaType,
        originalName: req.file.originalname,
        size: req.file.size,
        uploadedAt: new Date(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'UPLOAD_FAILED', message: 'Reference upload failed' } });
  }
};

export const generateAIBrief = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { conceptIdea, productDescription, objective, targetAudience, category, budgetAmount } = req.body;
    const generated = await generateBriefFromConcept({
      conceptIdea,
      productDescription,
      objective,
      targetAudience,
      category,
      budgetAmount,
    });
    res.status(200).json({
      success: true,
      data: generated,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'AI_ERROR', message: 'AI generation failed' } });
  }
};

export const generateTimeMachineDirections = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { conceptIdea, category } = req.body;
    const directions = await generateCreativeDirections(conceptIdea, category);
    res.status(200).json({
      success: true,
      data: directions,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'TIME_MACHINE_ERROR', message: 'Creative directions generation failed' } });
  }
};
