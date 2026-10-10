import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import {
  getAdminDashboardMetrics,
  getAdminUsersList,
  updateUserStatus,
  triggerReconciliation,
} from '../controllers/adminController';

const router = Router();

router.use(authenticate);

router.get('/admin/dashboard', getAdminDashboardMetrics);
router.get('/admin/users', getAdminUsersList);
router.patch('/admin/users/:id/status', updateUserStatus);
router.post('/admin/reconcile/run', triggerReconciliation);

export default router;
