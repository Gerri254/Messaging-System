import { Response } from 'express';
import { analyticsService } from '../services/analyticsService';
import { AuthRequest } from '../middleware/auth';

export const analyticsController = {
  async getDashboardStats(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const stats = await analyticsService.getDashboardStats(req.user.id);

      return res.status(200).json(stats);
    } catch (error: any) {
      return res.status(500).json({
        error: error.message || 'Failed to get dashboard statistics',
      });
    }
  },

  async getMessageReports(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { startDate, endDate, groupBy } = req.query;

      const reports = await analyticsService.getMessageReports(
        req.user.id,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
        (groupBy as 'day' | 'week' | 'month') || 'day'
      );

      return res.status(200).json(reports);
    } catch (error: any) {
      return res.status(500).json({
        error: error.message || 'Failed to get message reports',
      });
    }
  },

  async getUsageStats(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const stats = await analyticsService.getUsageStats(req.user.id);

      return res.status(200).json(stats);
    } catch (error: any) {
      return res.status(500).json({
        error: error.message || 'Failed to get usage statistics',
      });
    }
  },

  async exportData(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { type } = req.query;

      // For now, return a simple CSV export message
      // This would be replaced with actual CSV generation
      return res.status(200).json({
        message: `${type} data export functionality will be implemented here`,
        downloadUrl: `/api/analytics/download/${type}/${req.user.id}`,
      });
    } catch (error: any) {
      return res.status(500).json({
        error: error.message || 'Failed to export data',
      });
    }
  },
};