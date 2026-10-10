import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import mongoose from 'mongoose';
import { Proposal } from '../models/Proposal';
import { CampaignBrief } from '../models/CampaignBrief';
import { Creator } from '../models/Creator';
import { Brand } from '../models/Brand';
import { Project } from '../models/Project';
import { Conversation } from '../models/Conversation';
import { Notification } from '../models/Notification';

export const createProposal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const creatorUserId = req.user!._id;
    const creatorProfile = await Creator.findOne({ userId: creatorUserId });
    if (!creatorProfile) {
      res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Only registered creators can submit proposals.' } });
      return;
    }

    const { briefId, title, coverMessage, proposedApproach, relevantPortfolioItemIds, deliverables, proposedBudget, currency, proposedTimeline, milestones, revisionTerms } = req.body;

    const brief = await CampaignBrief.findById(briefId);
    if (!brief || brief.status !== 'published') {
      res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Campaign brief is not eligible for proposals.' } });
      return;
    }

    // Check duplicate proposal concurrency safeguard
    const existing = await Proposal.findOne({ briefId, creatorUserId, status: { $ne: 'withdrawn' } });
    if (existing) {
      res.status(409).json({ success: false, error: { code: 'CONFLICT', message: 'You have already submitted an active proposal for this campaign brief.' } });
      return;
    }

    const brandProfile = await Brand.findOne({ userId: brief.userId });

    const proposal = await Proposal.create({
      briefId: brief._id,
      creatorUserId,
      creatorProfileId: creatorProfile._id,
      brandUserId: brief.userId,
      brandProfileId: brandProfile?._id || brief.brandId,
      title: title || `Proposal for ${brief.title}`,
      coverMessage,
      proposedApproach: proposedApproach || '',
      relevantPortfolioItemIds: relevantPortfolioItemIds || [],
      deliverables: deliverables || [],
      proposedBudget: Number(proposedBudget),
      currency: currency || brief.budget?.currency || 'INR',
      proposedTimeline: proposedTimeline || '14 days',
      milestones: milestones || [{ title: 'Final Deliverables', amount: Number(proposedBudget), description: 'Complete project assets' }],
      revisionTerms: revisionTerms || '2 Revisions Included',
      status: 'submitted',
      submittedAt: new Date(),
    });

    // Notify brand
    await Notification.create({
      recipientUserId: brief.userId,
      senderUserId: creatorUserId,
      type: 'proposal_received',
      title: 'New Proposal Received',
      message: `${creatorProfile.name || req.user!.displayName} submitted a proposal for "${brief.title}".`,
      linkUrl: `/briefs/${brief._id}`,
      resourceId: proposal._id.toString(),
    });

    res.status(201).json({ success: true, data: { proposal } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: error.message } });
  }
};

export const getMyProposals = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    let proposals;
    if (req.user!.role === 'creator') {
      proposals = await Proposal.find({ creatorUserId: userId }).sort({ createdAt: -1 }).populate('briefId', 'title summary status category');
    } else {
      proposals = await Proposal.find({ brandUserId: userId }).sort({ createdAt: -1 }).populate('briefId', 'title summary status category').populate('creatorProfileId', 'name handle specialtyCategory avatarUrl');
    }
    res.json({ success: true, data: { proposals } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const getProposalsForBrief = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { briefId } = req.params;
    const brief = await CampaignBrief.findById(briefId);

    if (!brief) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Brief not found' } });
      return;
    }

    if (brief.userId.toString() !== req.user!._id.toString()) {
      res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Only the campaign brand owner can view incoming proposals.' } });
      return;
    }

    const proposals = await Proposal.find({ briefId }).sort({ createdAt: -1 }).populate('creatorProfileId', 'name handle specialtyCategory avatarUrl hourlyRate aiTools rating');

    res.json({ success: true, data: { proposals } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const getProposalById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const proposal = await Proposal.findById(id)
      .populate('briefId')
      .populate('creatorProfileId', 'name handle specialtyCategory avatarUrl hourlyRate aiTools rating')
      .populate('relevantPortfolioItemIds');

    if (!proposal) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Proposal not found' } });
      return;
    }

    const userId = req.user!._id.toString();
    if (proposal.creatorUserId.toString() !== userId && proposal.brandUserId.toString() !== userId) {
      res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
      return;
    }

    res.json({ success: true, data: { proposal } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const acceptProposal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const proposal = await Proposal.findById(id);

    if (!proposal) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Proposal not found' } });
      return;
    }

    if (proposal.brandUserId.toString() !== req.user!._id.toString()) {
      res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Only the brand owner can accept this proposal.' } });
      return;
    }

    if (proposal.status === 'accepted') {
      const existingProject = await Project.findOne({ proposalId: proposal._id });
      res.json({ success: true, data: { proposal, project: existingProject } });
      return;
    }

    if (proposal.status !== 'submitted' && proposal.status !== 'resubmitted') {
      res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: `Proposal cannot be accepted from current status "${proposal.status}".` } });
      return;
    }

    const brief = await CampaignBrief.findById(proposal.briefId);
    if (!brief) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Associated campaign brief not found.' } });
      return;
    }

    // Update proposal status
    proposal.status = 'accepted';
    proposal.acceptedAt = new Date();
    await proposal.save();

    // Map proposal milestones to project milestones
    const projectMilestones = (proposal.milestones || []).map((m, idx) => ({
      _id: new mongoose.Types.ObjectId(),
      title: m.title,
      description: m.description || '',
      amount: m.amount,
      dueDate: m.dueDate || undefined,
      sequence: idx + 1,
      status: 'pending' as const,
      revisionCount: 0,
      paymentState: 'unfunded' as const,
    }));

    if (projectMilestones.length === 0) {
      projectMilestones.push({
        _id: new mongoose.Types.ObjectId(),
        title: 'Project Completion Deliverable',
        description: 'Complete project execution and deliverables',
        amount: proposal.proposedBudget,
        dueDate: undefined,
        sequence: 1,
        status: 'pending' as const,
        revisionCount: 0,
        paymentState: 'unfunded' as const,
      });
    }

    // Create Project
    const project = await Project.create({
      briefId: brief._id,
      proposalId: proposal._id,
      brandUserId: proposal.brandUserId,
      brandProfileId: proposal.brandProfileId,
      creatorUserId: proposal.creatorUserId,
      creatorProfileId: proposal.creatorProfileId,
      title: `${brief.title} — Project`,
      description: proposal.coverMessage,
      totalAmount: proposal.proposedBudget,
      currency: proposal.currency,
      licensingTerms: proposal.revisionTerms || brief.licensingPreferences || 'Commercial Usage',
      revisionLimit: brief.revisionLimit || 2,
      status: 'ready',
      milestones: projectMilestones,
      agreementSnapshot: {
        briefTitle: brief.title,
        proposalTitle: proposal.title,
        acceptedAt: new Date(),
        acceptedBudget: proposal.proposedBudget,
        currency: proposal.currency,
      },
    });

    // Create Project-linked Conversation
    await Conversation.create({
      projectId: project._id,
      briefId: brief._id,
      participants: [proposal.brandUserId, proposal.creatorUserId],
      lastMessageText: 'Project agreement created and accepted.',
      lastMessageAt: new Date(),
    });

    // Reject competing proposals for this brief automatically
    await Proposal.updateMany(
      { briefId: brief._id, _id: { $ne: proposal._id }, status: 'submitted' },
      { $set: { status: 'rejected', decisionReason: 'Another proposal was accepted for this campaign brief.' } }
    );

    // Notify creator
    await Notification.create({
      recipientUserId: proposal.creatorUserId,
      senderUserId: req.user!._id,
      type: 'proposal_accepted',
      title: 'Proposal Accepted! Project Created',
      message: `Congratulations! Your proposal for "${brief.title}" was accepted.`,
      linkUrl: `/projects/${project._id}`,
      resourceId: project._id.toString(),
    });

    res.json({ success: true, data: { proposal, project } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const rejectProposal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { decisionReason } = req.body;
    const proposal = await Proposal.findById(id);

    if (!proposal || proposal.brandUserId.toString() !== req.user!._id.toString()) {
      res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
      return;
    }

    proposal.status = 'rejected';
    proposal.decisionReason = decisionReason || 'Not selected for this campaign.';
    await proposal.save();

    await Notification.create({
      recipientUserId: proposal.creatorUserId,
      senderUserId: req.user!._id,
      type: 'proposal_rejected',
      title: 'Proposal Decision Updated',
      message: `Your proposal was not selected.`,
      resourceId: proposal._id.toString(),
    });

    res.json({ success: true, data: { proposal } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const withdrawProposal = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const proposal = await Proposal.findById(id);

    if (!proposal || proposal.creatorUserId.toString() !== req.user!._id.toString()) {
      res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
      return;
    }

    proposal.status = 'withdrawn';
    await proposal.save();

    res.json({ success: true, data: { proposal } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};
