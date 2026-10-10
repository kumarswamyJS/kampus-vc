import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Dispute } from '../models/Dispute';
import { Project } from '../models/Project';
import { Notification } from '../models/Notification';

// POST /api/v1/projects/:projectId/disputes
export const createDispute = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const { projectId } = req.params;
    const { category, title, description, requestedResolution, milestoneId } = req.body;

    if (!title || !title.trim() || !description || !description.trim() || !requestedResolution || !requestedResolution.trim()) {
      res.status(400).json({ success: false, error: 'Title, description, and requested resolution are required' });
      return;
    }

    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found' });
      return;
    }

    const isBrand = project.brandUserId.toString() === userId;
    const isCreator = project.creatorUserId.toString() === userId;

    if (!isBrand && !isCreator) {
      res.status(403).json({ success: false, error: 'Forbidden: You are not a participant in this project' });
      return;
    }

    const respondentUserId = isBrand ? project.creatorUserId : project.brandUserId;

    const dispute = await Dispute.create({
      projectId: project._id,
      milestoneId: milestoneId ? new mongoose.Types.ObjectId(milestoneId) : undefined,
      initiatorUserId: req.user!._id,
      respondentUserId,
      category: category || 'deliverable_quality',
      title: title.trim(),
      description: description.trim(),
      requestedResolution: requestedResolution.trim(),
      status: 'open',
      evidence: [],
      discussion: [],
    });

    // Send Notification to respondent
    await Notification.create({
      userId: respondentUserId,
      title: 'Dispute Filed on Project',
      message: `${req.user!.displayName} filed a dispute on "${project.title}": ${title.trim()}`,
      type: 'project_update',
      linkUrl: `/projects/${project._id}?tab=disputes`,
    });

    res.status(201).json({
      success: true,
      data: dispute,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/disputes/mine
export const getMyDisputes = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id;

    const disputes = await Dispute.find({
      $or: [{ initiatorUserId: userId }, { respondentUserId: userId }],
    })
      .populate('projectId', 'title status contractAmount')
      .populate('initiatorUserId', 'displayName avatarUrl role')
      .populate('respondentUserId', 'displayName avatarUrl role')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: disputes.length,
      data: disputes,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/disputes/:id
export const getDisputeById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const { id } = req.params;

    const dispute = await Dispute.findById(id)
      .populate('projectId', 'title status contractAmount milestones')
      .populate('initiatorUserId', 'displayName avatarUrl role email')
      .populate('respondentUserId', 'displayName avatarUrl role email')
      .populate('evidence.submittedBy', 'displayName avatarUrl')
      .populate('discussion.senderUserId', 'displayName avatarUrl role');

    if (!dispute) {
      res.status(404).json({ success: false, error: 'Dispute not found' });
      return;
    }

    const isInitiator = (dispute.initiatorUserId as any)._id?.toString() === userId || dispute.initiatorUserId.toString() === userId;
    const isRespondent = (dispute.respondentUserId as any)._id?.toString() === userId || dispute.respondentUserId.toString() === userId;

    if (!isInitiator && !isRespondent && (req.user!.role as string) !== 'admin') {
      res.status(403).json({ success: false, error: 'Forbidden: You are not a party to this dispute' });
      return;
    }

    res.status(200).json({
      success: true,
      data: dispute,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/disputes/:id/respond
export const addDisputeResponse = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const { id } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      res.status(400).json({ success: false, error: 'Response text cannot be empty' });
      return;
    }

    const dispute = await Dispute.findById(id);
    if (!dispute) {
      res.status(404).json({ success: false, error: 'Dispute not found' });
      return;
    }

    const isInitiator = dispute.initiatorUserId.toString() === userId;
    const isRespondent = dispute.respondentUserId.toString() === userId;

    if (!isInitiator && !isRespondent) {
      res.status(403).json({ success: false, error: 'Forbidden: You are not a party to this dispute' });
      return;
    }

    dispute.discussion.push({
      _id: new mongoose.Types.ObjectId(),
      senderUserId: req.user!._id,
      text: text.trim(),
      createdAt: new Date(),
    });

    if (dispute.status === 'open' && isRespondent) {
      dispute.status = 'awaiting_response';
    }

    dispute.updatedAt = new Date();
    await dispute.save();

    const otherUserId = isInitiator ? dispute.respondentUserId : dispute.initiatorUserId;
    await Notification.create({
      userId: otherUserId,
      title: 'New Dispute Response',
      message: `${req.user!.displayName} replied to dispute "${dispute.title}"`,
      type: 'project_update',
      linkUrl: `/disputes/${dispute._id}`,
    });

    res.status(200).json({
      success: true,
      data: dispute,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/disputes/:id/evidence
export const submitDisputeEvidence = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const { id } = req.params;
    const { title, description, mediaUrl } = req.body;

    if (!title || !title.trim()) {
      res.status(400).json({ success: false, error: 'Evidence title is required' });
      return;
    }

    const dispute = await Dispute.findById(id);
    if (!dispute) {
      res.status(404).json({ success: false, error: 'Dispute not found' });
      return;
    }

    const isInitiator = dispute.initiatorUserId.toString() === userId;
    const isRespondent = dispute.respondentUserId.toString() === userId;

    if (!isInitiator && !isRespondent) {
      res.status(403).json({ success: false, error: 'Forbidden: You are not a party to this dispute' });
      return;
    }

    dispute.evidence.push({
      _id: new mongoose.Types.ObjectId(),
      submittedBy: req.user!._id,
      title: title.trim(),
      description: (description || '').trim(),
      mediaUrl: mediaUrl || undefined,
      createdAt: new Date(),
    });

    dispute.updatedAt = new Date();
    await dispute.save();

    res.status(200).json({
      success: true,
      data: dispute,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/disputes/:id/propose-resolution
export const proposeSettlement = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const { id } = req.params;
    const { terms } = req.body;

    if (!terms || !terms.trim()) {
      res.status(400).json({ success: false, error: 'Settlement terms are required' });
      return;
    }

    const dispute = await Dispute.findById(id);
    if (!dispute) {
      res.status(404).json({ success: false, error: 'Dispute not found' });
      return;
    }

    const isInitiator = dispute.initiatorUserId.toString() === userId;
    const isRespondent = dispute.respondentUserId.toString() === userId;

    if (!isInitiator && !isRespondent) {
      res.status(403).json({ success: false, error: 'Forbidden' });
      return;
    }

    dispute.settlementProposal = {
      proposedBy: req.user!._id,
      terms: terms.trim(),
      status: 'pending',
      proposedAt: new Date(),
    };

    dispute.status = 'under_review';
    dispute.updatedAt = new Date();
    await dispute.save();

    const otherUserId = isInitiator ? dispute.respondentUserId : dispute.initiatorUserId;
    await Notification.create({
      userId: otherUserId,
      title: 'Settlement Proposal Received',
      message: `${req.user!.displayName} proposed settlement terms for dispute "${dispute.title}"`,
      type: 'project_update',
      linkUrl: `/disputes/${dispute._id}`,
    });

    res.status(200).json({
      success: true,
      data: dispute,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/disputes/:id/acknowledge-resolution
export const acknowledgeResolution = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const { id } = req.params;
    const { accept, responseNotes } = req.body;

    const dispute = await Dispute.findById(id);
    if (!dispute || !dispute.settlementProposal) {
      res.status(404).json({ success: false, error: 'Dispute or pending settlement proposal not found' });
      return;
    }

    if (dispute.settlementProposal.proposedBy.toString() === userId) {
      res.status(400).json({ success: false, error: 'You cannot acknowledge your own proposed settlement' });
      return;
    }

    const isInitiator = dispute.initiatorUserId.toString() === userId;
    const isRespondent = dispute.respondentUserId.toString() === userId;

    if (!isInitiator && !isRespondent) {
      res.status(403).json({ success: false, error: 'Forbidden' });
      return;
    }

    if (accept) {
      dispute.settlementProposal.status = 'accepted';
      dispute.status = 'resolved';
      dispute.resolutionSummary = `Settlement Accepted: ${dispute.settlementProposal.terms}. ${responseNotes ? `Notes: ${responseNotes}` : ''}`;
      dispute.resolvedAt = new Date();
    } else {
      dispute.settlementProposal.status = 'rejected';
      dispute.status = 'open';
      dispute.discussion.push({
        _id: new mongoose.Types.ObjectId(),
        senderUserId: req.user!._id,
        text: `Rejected settlement proposal. ${responseNotes ? `Notes: ${responseNotes}` : ''}`,
        createdAt: new Date(),
      });
    }

    dispute.updatedAt = new Date();
    await dispute.save();

    const otherUserId = dispute.settlementProposal.proposedBy;
    await Notification.create({
      userId: otherUserId,
      title: accept ? 'Dispute Resolved' : 'Settlement Rejected',
      message: accept
        ? `Settlement agreed for dispute "${dispute.title}"`
        : `${req.user!.displayName} declined the settlement proposal for "${dispute.title}"`,
      type: 'project_update',
      linkUrl: `/disputes/${dispute._id}`,
    });

    res.status(200).json({
      success: true,
      data: dispute,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/disputes/:id/escalate
export const escalateDispute = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const { id } = req.params;
    const { reason } = req.body;

    const dispute = await Dispute.findById(id);
    if (!dispute) {
      res.status(404).json({ success: false, error: 'Dispute not found' });
      return;
    }

    const isInitiator = dispute.initiatorUserId.toString() === userId;
    const isRespondent = dispute.respondentUserId.toString() === userId;

    if (!isInitiator && !isRespondent) {
      res.status(403).json({ success: false, error: 'Forbidden' });
      return;
    }

    dispute.status = 'escalated_admin';
    dispute.discussion.push({
      _id: new mongoose.Types.ObjectId(),
      senderUserId: req.user!._id,
      text: `[ESCALATED TO ADMIN REVIEW] Reason: ${reason || 'No specific reason given'}`,
      createdAt: new Date(),
    });

    dispute.updatedAt = new Date();
    await dispute.save();

    res.status(200).json({
      success: true,
      data: dispute,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/disputes/:id/reopen
export const reopenDispute = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const { id } = req.params;
    const { reason } = req.body;

    const dispute = await Dispute.findById(id);
    if (!dispute) {
      res.status(404).json({ success: false, error: 'Dispute not found' });
      return;
    }

    const isInitiator = dispute.initiatorUserId.toString() === userId;
    const isRespondent = dispute.respondentUserId.toString() === userId;

    if (!isInitiator && !isRespondent) {
      res.status(403).json({ success: false, error: 'Forbidden' });
      return;
    }

    if (dispute.status !== 'resolved' && dispute.status !== 'closed') {
      res.status(400).json({ success: false, error: 'Only resolved or closed disputes can be reopened' });
      return;
    }

    dispute.status = 'open';
    dispute.discussion.push({
      _id: new mongoose.Types.ObjectId(),
      senderUserId: req.user!._id,
      text: `[REOPENED DISPUTE] Reason: ${reason || 'New issues identified'}`,
      createdAt: new Date(),
    });

    dispute.updatedAt = new Date();
    await dispute.save();

    res.status(200).json({
      success: true,
      data: dispute,
    });
  } catch (error) {
    next(error);
  }
};
