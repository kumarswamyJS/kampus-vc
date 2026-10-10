import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { CallSession } from '../models/CallSession';
import { Conversation } from '../models/Conversation';
import { Project } from '../models/Project';

// GET /api/v1/conversations/:conversationId/calls
export const getConversationCalls = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const { conversationId } = req.params;

    const conv = await Conversation.findById(conversationId);
    if (!conv) {
      res.status(404).json({ success: false, error: 'Conversation not found' });
      return;
    }

    const isParticipant = conv.participants.some((p) => p.toString() === userId);
    if (!isParticipant) {
      res.status(403).json({ success: false, error: 'Forbidden' });
      return;
    }

    const calls = await CallSession.find({ conversationId: conv._id })
      .populate('callerUserId', 'displayName avatarUrl role')
      .populate('calleeUserId', 'displayName avatarUrl role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: calls.length,
      data: calls,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/projects/:projectId/calls
export const getProjectCalls = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ success: false, error: 'Project not found' });
      return;
    }

    const isBrand = project.brandUserId.toString() === userId;
    const isCreator = project.creatorUserId.toString() === userId;

    if (!isBrand && !isCreator) {
      res.status(403).json({ success: false, error: 'Forbidden' });
      return;
    }

    const calls = await CallSession.find({ projectId: project._id })
      .populate('callerUserId', 'displayName avatarUrl role')
      .populate('calleeUserId', 'displayName avatarUrl role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: calls.length,
      data: calls,
    });
  } catch (error) {
    next(error);
  }
};
