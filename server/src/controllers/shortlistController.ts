import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { BrandShortlist } from '../models/BrandShortlist';

// GET /api/v1/shortlists/mine
export const getMyShortlists = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const brandUserId = req.user!._id;
    let shortlists = await BrandShortlist.find({ brandUserId })
      .populate('creatorUserIds', 'displayName avatarUrl role isVerified')
      .populate('campaignBriefId', 'title category status')
      .sort({ updatedAt: -1 });

    if (shortlists.length === 0) {
      const defaultList = await BrandShortlist.create({
        brandUserId,
        name: 'My Creator Shortlist',
        creatorUserIds: [],
        notes: 'Private shortlist for saved AI creators.',
      });
      shortlists = [defaultList];
    }

    res.status(200).json({
      success: true,
      count: shortlists.length,
      data: shortlists,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/shortlists
export const createShortlist = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const brandUserId = req.user!._id;
    const { name, campaignBriefId, notes } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ success: false, error: 'Shortlist name is required' });
      return;
    }

    const shortlist = await BrandShortlist.create({
      brandUserId,
      campaignBriefId: campaignBriefId ? new mongoose.Types.ObjectId(campaignBriefId) : undefined,
      name: name.trim(),
      creatorUserIds: [],
      notes: (notes || '').trim(),
    });

    res.status(201).json({
      success: true,
      data: shortlist,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/shortlists/:id/creators
export const addCreatorToShortlist = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const brandUserId = req.user!._id.toString();
    const { id } = req.params;
    const { creatorUserId } = req.body;

    if (!creatorUserId) {
      res.status(400).json({ success: false, error: 'creatorUserId is required' });
      return;
    }

    const shortlist = await BrandShortlist.findById(id);
    if (!shortlist) {
      res.status(404).json({ success: false, error: 'Shortlist not found' });
      return;
    }

    if (shortlist.brandUserId.toString() !== brandUserId) {
      res.status(403).json({ success: false, error: 'Forbidden: Private shortlist' });
      return;
    }

    const exists = shortlist.creatorUserIds.some((cId) => cId.toString() === creatorUserId);
    if (!exists) {
      shortlist.creatorUserIds.push(new mongoose.Types.ObjectId(creatorUserId));
      shortlist.updatedAt = new Date();
      await shortlist.save();
    }

    res.status(200).json({
      success: true,
      data: shortlist,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/v1/shortlists/:id/creators/:creatorUserId
export const removeCreatorFromShortlist = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const brandUserId = req.user!._id.toString();
    const { id, creatorUserId } = req.params;

    const shortlist = await BrandShortlist.findById(id);
    if (!shortlist) {
      res.status(404).json({ success: false, error: 'Shortlist not found' });
      return;
    }

    if (shortlist.brandUserId.toString() !== brandUserId) {
      res.status(403).json({ success: false, error: 'Forbidden: Private shortlist' });
      return;
    }

    shortlist.creatorUserIds = shortlist.creatorUserIds.filter((cId) => cId.toString() !== creatorUserId);
    shortlist.updatedAt = new Date();
    await shortlist.save();

    res.status(200).json({
      success: true,
      data: shortlist,
    });
  } catch (error) {
    next(error);
  }
};
