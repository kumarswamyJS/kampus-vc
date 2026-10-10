import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Conversation } from '../models/Conversation';
import { Message } from '../models/Message';
import { Project } from '../models/Project';
import { Notification } from '../models/Notification';

export const getMyConversations = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const conversations = await Conversation.find({ participants: userId })
      .sort({ updatedAt: -1 })
      .populate('projectId', 'title status totalAmount currency')
      .populate('briefId', 'title category')
      .populate('participants', 'displayName role email avatarUrl');

    res.json({ success: true, data: { conversations } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const getConversationByProject = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
      return;
    }

    const userId = req.user!._id.toString();
    if (project.brandUserId.toString() !== userId && project.creatorUserId.toString() !== userId) {
      res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied to project messaging.' } });
      return;
    }

    let conversation = await Conversation.findOne({ projectId });
    if (!conversation) {
      conversation = await Conversation.create({
        projectId: project._id,
        briefId: project.briefId,
        participants: [project.brandUserId, project.creatorUserId],
        lastMessageText: 'Project conversation started.',
        lastMessageAt: new Date(),
      });
    }

    res.json({ success: true, data: { conversation } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const getMessages = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Conversation not found' } });
      return;
    }

    const userId = req.user!._id.toString();
    const isParticipant = conversation.participants.some((p) => p.toString() === userId);
    if (!isParticipant) {
      res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
      return;
    }

    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
    res.json({ success: true, data: { messages } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const sendMessage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const { text, attachmentUrl } = req.body;

    if (!text || !text.trim()) {
      res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Message text cannot be empty.' } });
      return;
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Conversation not found' } });
      return;
    }

    const userId = req.user!._id;
    const isParticipant = conversation.participants.some((p) => p.toString() === userId.toString());
    if (!isParticipant) {
      res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
      return;
    }

    const recipientUserId = conversation.participants.find((p) => p.toString() !== userId.toString());
    if (!recipientUserId) {
      res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Recipient participant not found.' } });
      return;
    }

    const message = await Message.create({
      conversationId: conversation._id,
      projectId: conversation.projectId,
      senderUserId: userId,
      recipientUserId,
      text: text.trim(),
      attachmentUrl: attachmentUrl || undefined,
    });

    conversation.lastMessageText = text.trim();
    conversation.lastMessageAt = new Date();
    await conversation.save();

    await Notification.create({
      recipientUserId,
      senderUserId: userId,
      type: 'new_message',
      title: 'New Project Message',
      message: `${req.user!.displayName}: "${text.trim().substring(0, 60)}..."`,
      linkUrl: `/projects/${conversation.projectId}`,
      resourceId: message._id.toString(),
    });

    res.status(201).json({ success: true, data: { message } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};
