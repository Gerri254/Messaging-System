import { Router } from 'express';
import { analyticsController } from '../controllers/analyticsController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/dashboard', analyticsController.getDashboardStats);
router.get('/reports', analyticsController.getMessageReports);
router.get('/usage', analyticsController.getUsageStats);
router.get('/export', analyticsController.exportData);

export default router;