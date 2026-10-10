import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { User } from '../models/User';
import { Project } from '../models/Project';
import { Dispute } from '../models/Dispute';
import { Payment } from '../models/Payment';
import { ProofOfCreativity } from '../models/ProofOfCreativity';
import { ReconciliationLog } from '../models/ReconciliationLog';
import { AdminAuditLog } from '../models/AdminAuditLog';
import { runFinancialReconciliation } from '../services/reconciliationService';

// GET /api/v1/admin/dashboard
export const getAdminDashboardMetrics = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if ((req.user!.role as string) !== 'admin') {
      res.status(403).json({ success: false, error: 'Forbidden: Admin role required' });
      return;
    }

    const totalUsers = await User.countDocuments();
    const totalCreators = await User.countDocuments({ role: 'creator' });
    const totalBrands = await User.countDocuments({ role: 'brand' });
    const activeProjects = await Project.countDocuments({ status: { $in: ['in_progress', 'active'] } });
    const openDisputes = await Dispute.countDocuments({ status: { $in: ['open', 'under_review', 'escalated_admin'] } });
    const pendingProofs = await ProofOfCreativity.countDocuments({ status: 'submitted' });
    const totalCapturedPayments = await Payment.countDocuments({ status: 'captured' });

    const recentLogs = await AdminAuditLog.find().sort({ createdAt: -1 }).limit(10);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalCreators,
        totalBrands,
        activeProjects,
        openDisputes,
        pendingProofs,
        totalCapturedPayments,
        recentLogs,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/admin/users
export const getAdminUsersList = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if ((req.user!.role as string) !== 'admin') {
      res.status(403).json({ success: false, error: 'Forbidden: Admin role required' });
      return;
    }

    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/v1/admin/users/:id/status
export const updateUserStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if ((req.user!.role as string) !== 'admin') {
      res.status(403).json({ success: false, error: 'Forbidden: Admin role required' });
      return;
    }

    const { id } = req.params;
    const { status, reason } = req.body;

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    user.status = status;
    await user.save();

    await AdminAuditLog.create({
      actorUserId: req.user!._id,
      action: `user_status_${status}`,
      targetType: 'user',
      targetId: id,
      reason,
    });

    res.status(200).json({
      success: true,
      data: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/admin/reconcile/run
export const triggerReconciliation = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if ((req.user!.role as string) !== 'admin') {
      res.status(403).json({ success: false, error: 'Forbidden: Admin role required' });
      return;
    }

    const log = await runFinancialReconciliation(req.user!._id.toString());

    await AdminAuditLog.create({
      actorUserId: req.user!._id,
      action: 'run_financial_reconciliation',
      targetType: 'reconciliation',
      targetId: log._id.toString(),
    });

    res.status(200).json({
      success: true,
      data: log,
    });
  } catch (error) {
    next(error);
  }
};
