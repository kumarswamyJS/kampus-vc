import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Notification } from '../models/Notification';

export const getMyNotifications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const notifications = await Notification.find({ recipientUserId: userId })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({ recipientUserId: userId, isRead: false });

    res.json({ success: true, data: { notifications, unreadCount } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

export const markAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;

    if (id === 'all') {
      await Notification.updateMany({ recipientUserId: userId, isRead: false }, { $set: { isRead: true } });
      res.json({ success: true, message: 'All notifications marked as read.' });
      return;
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipientUserId: userId },
      { $set: { isRead: true } },
      { new: true }
    );

    res.json({ success: true, data: { notification } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};
