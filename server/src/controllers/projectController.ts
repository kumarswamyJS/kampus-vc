import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Project } from '../models/Project';
import { Notification } from '../models/Notification';
import { escrowService } from '../services/escrowService';

export const getMyProjects = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    let projects;
    if (req.user!.role === 'creator') {
      projects = await Project.find({ creatorUserId: userId })
        .sort({ createdAt: -1 })
        .populate('brandProfileId', 'companyName industry logoUrl')
        .populate('briefId', 'title category');
    } else {
      projects = await Project.find({ brandUserId: userId })
        .sort({ createdAt: -1 })
        .populate('creatorProfileId', 'name handle specialtyCategory avatarUrl rating')
        .populate('briefId', 'title category');
    }

    res.json({ success: true, data: { projects } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const getProjectById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id)
      .populate('brandProfileId', 'companyName industry logoUrl email website')
      .populate('creatorProfileId', 'name handle specialtyCategory avatarUrl hourlyRate aiTools rating')
      .populate('briefId', 'title category summary deliverables visualStyle mood');

    if (!project) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
      return;
    }

    const userId = req.user!._id.toString();
    if (project.brandUserId.toString() !== userId && project.creatorUserId.toString() !== userId) {
      res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied to project details.' } });
      return;
    }

    const ledger = await escrowService.getProjectLedger(project._id.toString(), userId);

    res.json({ success: true, data: { project, ledger } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const submitMilestoneWork = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id, milestoneId } = req.params;
    const { submissionNotes, submissionMediaUrl } = req.body;

    const project = await Project.findById(id);
    if (!project) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
      return;
    }

    if (project.creatorUserId.toString() !== req.user!._id.toString()) {
      res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Only the assigned creator can submit milestone deliverables.' } });
      return;
    }

    const milestone = project.milestones.find((m) => m._id.toString() === milestoneId);
    if (!milestone) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Milestone not found' } });
      return;
    }

    milestone.status = 'submitted';
    milestone.submissionNotes = submissionNotes || '';
    milestone.submissionMediaUrl = submissionMediaUrl || milestone.submissionMediaUrl;
    milestone.submittedAt = new Date();

    if (project.status === 'ready' || project.status === 'awaiting_funding') {
      project.status = 'in_progress';
      project.startedAt = project.startedAt || new Date();
    }

    await project.save();

    await Notification.create({
      recipientUserId: project.brandUserId,
      senderUserId: req.user!._id,
      type: 'milestone_submitted',
      title: 'Milestone Work Submitted',
      message: `Creator submitted work for milestone "${milestone.title}".`,
      linkUrl: `/projects/${project._id}`,
      resourceId: milestone._id.toString(),
    });

    res.json({ success: true, data: { project } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const reviewMilestoneWork = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id, milestoneId } = req.params;
    const { action, reviewNotes } = req.body; // action: 'approve' | 'request_revision'

    const project = await Project.findById(id);
    if (!project) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
      return;
    }

    if (project.brandUserId.toString() !== req.user!._id.toString()) {
      res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Only the project brand owner can review milestone work.' } });
      return;
    }

    const milestone = project.milestones.find((m) => m._id.toString() === milestoneId);
    if (!milestone) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Milestone not found' } });
      return;
    }

    if (action === 'approve') {
      milestone.status = 'approved';
      milestone.reviewNotes = reviewNotes || 'Milestone approved by brand.';
      milestone.reviewedAt = new Date();

      await Notification.create({
        recipientUserId: project.creatorUserId,
        senderUserId: req.user!._id,
        type: 'milestone_approved',
        title: 'Milestone Work Approved!',
        message: `Brand approved your deliverable for "${milestone.title}".`,
        linkUrl: `/projects/${project._id}`,
        resourceId: milestone._id.toString(),
      });
    } else if (action === 'request_revision') {
      if (milestone.revisionCount >= project.revisionLimit) {
        res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: `Revision limit (${project.revisionLimit}) reached for this milestone.` } });
        return;
      }

      milestone.status = 'revision_requested';
      milestone.reviewNotes = reviewNotes || 'Revision requested.';
      milestone.revisionCount += 1;
      milestone.reviewedAt = new Date();

      await Notification.create({
        recipientUserId: project.creatorUserId,
        senderUserId: req.user!._id,
        type: 'milestone_revision_requested',
        title: 'Revision Requested on Milestone',
        message: `Brand requested revisions for milestone "${milestone.title}".`,
        linkUrl: `/projects/${project._id}`,
        resourceId: milestone._id.toString(),
      });
    } else {
      res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Invalid action. Must be "approve" or "request_revision".' } });
      return;
    }

    await project.save();
    res.json({ success: true, data: { project } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const fundMilestone = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id, milestoneId } = req.params;
    const { amount, currency } = req.body;

    const result = await escrowService.fundMilestone({
      projectId: id,
      milestoneId,
      brandUserId: req.user!._id.toString(),
      amount: Number(amount),
      currency: currency || 'INR',
    });

    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: error.message } });
  }
};

export const releaseMilestone = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id, milestoneId } = req.params;

    const result = await escrowService.releaseMilestone({
      projectId: id,
      milestoneId,
      brandUserId: req.user!._id.toString(),
    });

    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: error.message } });
  }
};
