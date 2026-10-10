import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Creator, ICreator } from '../models/Creator';
import { Brand, IBrand } from '../models/Brand';
import { User } from '../models/User';

// Calculate Creator profile completion percentage
export const calculateCreatorCompletion = (profile: Partial<ICreator>): number => {
  let score = 0;
  if (profile.name && profile.name.trim().length > 0) score += 15;
  if (profile.bio && profile.bio.trim().length > 10) score += 20;
  if (profile.specialtyCategory && profile.specialtyCategory.trim().length > 0) score += 15;
  if (profile.aiTools && profile.aiTools.length > 0) score += 20;
  if (profile.experienceLevel) score += 15;
  if ((profile.portfolioSamples && profile.portfolioSamples.length > 0) || (profile.portfolioIntro && profile.portfolioIntro.length > 0)) score += 15;
  return score;
};

// Calculate Brand profile completion percentage
export const calculateBrandCompletion = (profile: Partial<IBrand>): number => {
  let score = 0;
  if (profile.companyName && profile.companyName.trim().length > 0) score += 20;
  if (profile.industry && profile.industry.trim().length > 0) score += 20;
  if (profile.description && profile.description.trim().length > 10) score += 20;
  if (profile.website && profile.website.trim().length > 0) score += 15;
  if (profile.targetAudience && profile.targetAudience.trim().length > 0) score += 15;
  if (profile.preferredVisualStyles && profile.preferredVisualStyles.length > 0) score += 10;
  return score;
};

export const getMyProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
    return;
  }

  if (req.user.role === 'creator') {
    const creator = await Creator.findOne({ userId: req.user._id });
    const completionScore = creator ? calculateCreatorCompletion(creator) : 0;
    res.status(200).json({
      success: true,
      data: {
        role: 'creator',
        profile: creator,
        completionScore,
        isComplete: completionScore >= 80,
      },
    });
  } else {
    const brand = await Brand.findOne({ userId: req.user._id });
    const completionScore = brand ? calculateBrandCompletion(brand) : 0;
    res.status(200).json({
      success: true,
      data: {
        role: 'brand',
        profile: brand,
        completionScore,
        isComplete: completionScore >= 80,
      },
    });
  }
};

export const updateMyProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
    return;
  }

  // Mass assignment protection: disallow updating role, userId, email, or status directly
  const { role, userId, email, status, _id, ...updatePayload } = req.body;

  if (req.user.role === 'creator') {
    let creator = await Creator.findOne({ userId: req.user._id });
    if (!creator) {
      creator = new Creator({ userId: req.user._id, name: req.user.displayName, email: req.user.email, handle: req.user.email.split('@')[0] });
    }

    Object.assign(creator, updatePayload);
    await creator.save();

    const score = calculateCreatorCompletion(creator);
    const isComplete = score >= 80;

    await User.findByIdAndUpdate(req.user._id, {
      displayName: creator.name || req.user.displayName,
      isProfileComplete: isComplete,
    });

    res.status(200).json({
      success: true,
      data: {
        profile: creator,
        completionScore: score,
        isComplete,
      },
    });
  } else {
    let brand = await Brand.findOne({ userId: req.user._id });
    if (!brand) {
      brand = new Brand({ userId: req.user._id, companyName: req.user.displayName, email: req.user.email, industry: 'Technology' });
    }

    Object.assign(brand, updatePayload);
    await brand.save();

    const score = calculateBrandCompletion(brand);
    const isComplete = score >= 80;

    await User.findByIdAndUpdate(req.user._id, {
      displayName: brand.companyName || req.user.displayName,
      isProfileComplete: isComplete,
    });

    res.status(200).json({
      success: true,
      data: {
        profile: brand,
        completionScore: score,
        isComplete,
      },
    });
  }
};

export const getCreatorById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (mongoose.connection.readyState !== 1) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Creator profile not found' } });
    return;
  }
  const { id } = req.params;
  const isObjId = mongoose.Types.ObjectId.isValid(id);
  const creator = await Creator.findOne(
    isObjId ? { $or: [{ _id: id }, { handle: id }] } : { handle: id }
  );

  if (!creator) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Creator profile not found' } });
    return;
  }
  res.status(200).json({ success: true, data: creator });
};

export const getBrandById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (mongoose.connection.readyState !== 1) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Brand profile not found' } });
    return;
  }
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Brand profile not found' } });
    return;
  }
  const brand = await Brand.findById(id);
  if (!brand) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Brand profile not found' } });
    return;
  }
  res.status(200).json({ success: true, data: brand });
};
