"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsController = void 0;
const analyticsService_1 = require("../services/analyticsService");
exports.analyticsController = {
    async getDashboardStats(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            const stats = await analyticsService_1.analyticsService.getDashboardStats(req.user.id);
            return res.status(200).json(stats);
        }
        catch (error) {
            return res.status(500).json({
                error: error.message || 'Failed to get dashboard statistics',
            });
        }
    },
    async getMessageReports(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            const { startDate, endDate, groupBy } = req.query;
            const reports = await analyticsService_1.analyticsService.getMessageReports(req.user.id, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined, groupBy || 'day');
            return res.status(200).json(reports);
        }
        catch (error) {
            return res.status(500).json({
                error: error.message || 'Failed to get message reports',
            });
        }
    },
    async getUsageStats(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            const stats = await analyticsService_1.analyticsService.getUsageStats(req.user.id);
            return res.status(200).json(stats);
        }
        catch (error) {
            return res.status(500).json({
                error: error.message || 'Failed to get usage statistics',
            });
        }
    },
    async exportData(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            const { type } = req.query;
            return res.status(200).json({
                message: `${type} data export functionality will be implemented here`,
                downloadUrl: `/api/analytics/download/${type}/${req.user.id}`,
            });
        }
        catch (error) {
            return res.status(500).json({
                error: error.message || 'Failed to export data',
            });
        }
    },
};
//# sourceMappingURL=analyticsController.js.map