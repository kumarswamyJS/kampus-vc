import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { CreatorAvailability } from '../models/CreatorAvailability';
import { Creator } from '../models/Creator';

// GET /api/v1/availability/me
export const getMyAvailability = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    let avail = await CreatorAvailability.findOne({ creatorUserId: userId });

    if (!avail) {
      avail = await CreatorAvailability.create({
        creatorUserId: req.user!._id,
        isAcceptingInquiries: true,
        weeklyCapacityHours: 40,
        timezone: 'Asia/Kolkata',
        blockedDates: [],
        inquiries: [],
      });
    }

    res.status(200).json({
      success: true,
      data: avail,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/availability/me
export const updateMyAvailability = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const { isAcceptingInquiries, weeklyCapacityHours, timezone, blockedDates } = req.body;

    let avail = await CreatorAvailability.findOne({ creatorUserId: userId });
    if (!avail) {
      avail = await CreatorAvailability.create({
        creatorUserId: req.user!._id,
        isAcceptingInquiries: isAcceptingInquiries ?? true,
        weeklyCapacityHours: weeklyCapacityHours || 40,
        timezone: timezone || 'Asia/Kolkata',
        blockedDates: blockedDates || [],
        inquiries: [],
      });
    } else {
      if (typeof isAcceptingInquiries === 'boolean') avail.isAcceptingInquiries = isAcceptingInquiries;
      if (weeklyCapacityHours) avail.weeklyCapacityHours = weeklyCapacityHours;
      if (timezone) avail.timezone = timezone;
      if (Array.isArray(blockedDates)) avail.blockedDates = blockedDates;
      await avail.save();
    }

    res.status(200).json({
      success: true,
      data: avail,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/availability/creators/:creatorId
export const getCreatorAvailability = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { creatorId } = req.params;
    const creator = await Creator.findById(creatorId);

    if (!creator) {
      res.status(404).json({ success: false, error: 'Creator not found' });
      return;
    }

    let avail = await CreatorAvailability.findOne({ creatorUserId: creator.userId });
    if (!avail) {
      avail = await CreatorAvailability.create({
        creatorUserId: creator.userId,
        isAcceptingInquiries: true,
        weeklyCapacityHours: 40,
        timezone: 'Asia/Kolkata',
        blockedDates: [],
        inquiries: [],
      });
    }

    res.status(200).json({
      success: true,
      data: {
        isAcceptingInquiries: avail.isAcceptingInquiries,
        weeklyCapacityHours: avail.weeklyCapacityHours,
        timezone: avail.timezone,
        blockedDates: avail.blockedDates,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/availability/requests
export const sendBookingInquiry = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const brandUserId = req.user!._id;
    const { creatorUserId, projectTitle, startDate, endDate, offeredBudget, currency, notes } = req.body;

    if (!creatorUserId || !projectTitle || !startDate || !endDate) {
      res.status(400).json({ success: false, error: 'Creator, project title, start date, and end date are required' });
      return;
    }

    let avail = await CreatorAvailability.findOne({ creatorUserId });
    if (!avail) {
      avail = await CreatorAvailability.create({
        creatorUserId: new mongoose.Types.ObjectId(creatorUserId),
        isAcceptingInquiries: true,
        weeklyCapacityHours: 40,
        timezone: 'Asia/Kolkata',
        blockedDates: [],
        inquiries: [],
      });
    }

    if (!avail.isAcceptingInquiries) {
      res.status(400).json({ success: false, error: 'Creator is currently not accepting new booking inquiries' });
      return;
    }

    avail.inquiries.push({
      _id: new mongoose.Types.ObjectId(),
      brandUserId,
      projectTitle: projectTitle.trim(),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      offeredBudget,
      currency: currency || 'INR',
      notes: (notes || '').trim(),
      status: 'pending',
      createdAt: new Date(),
    });

    await avail.save();

    res.status(201).json({
      success: true,
      data: avail,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/availability/requests/:id/respond
export const respondToBookingInquiry = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const { id } = req.params;
    const { action } = req.body; // 'accept' | 'decline' | 'cancel'

    const avail = await CreatorAvailability.findOne({ creatorUserId: userId });
    if (!avail) {
      res.status(404).json({ success: false, error: 'Availability profile not found' });
      return;
    }

    const inquiry = avail.inquiries.find((inq) => inq._id.toString() === id);
    if (!inquiry) {
      res.status(404).json({ success: false, error: 'Inquiry request not found' });
      return;
    }

    if (action === 'accept') {
      inquiry.status = 'accepted';
    } else if (action === 'decline') {
      inquiry.status = 'declined';
    } else if (action === 'cancel') {
      inquiry.status = 'cancelled';
    }

    await avail.save();

    res.status(200).json({
      success: true,
      data: avail,
    });
  } catch (error) {
    next(error);
  }
};
