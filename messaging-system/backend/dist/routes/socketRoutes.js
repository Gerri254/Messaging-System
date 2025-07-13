"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const socketService_1 = require("../services/socketService");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/stats', (req, res) => {
    try {
        const stats = socketService_1.socketService.getConnectionStats();
        return res.status(200).json(stats);
    }
    catch (error) {
        return res.status(500).json({
            error: error.message || 'Failed to get connection stats',
        });
    }
});
router.get('/user/:userId/online', (req, res) => {
    try {
        const { userId } = req.params;
        const isOnline = socketService_1.socketService.isUserOnline(userId);
        return res.status(200).json({
            userId,
            isOnline,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        return res.status(500).json({
            error: error.message || 'Failed to check user status',
        });
    }
});
router.post('/notify/:userId', (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const { userId } = req.params;
        const { title, message, type = 'system' } = req.body;
        if (!title || !message) {
            return res.status(400).json({
                error: 'Title and message are required'
            });
        }
        if (req.user.id !== userId) {
            return res.status(403).json({
                error: 'You can only send notifications to yourself'
            });
        }
        socketService_1.socketService.sendNotificationToUser(userId, {
            id: `manual_${Date.now()}`,
            type: type,
            title,
            message,
            timestamp: new Date(),
            read: false,
        });
        return res.status(200).json({
            message: 'Notification sent successfully'
        });
    }
    catch (error) {
        return res.status(500).json({
            error: error.message || 'Failed to send notification',
        });
    }
});
router.post('/broadcast', (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const { title, message, type = 'system' } = req.body;
        if (!title || !message) {
            return res.status(400).json({
                error: 'Title and message are required'
            });
        }
        socketService_1.socketService.broadcastSystemNotification({
            type: type,
            title,
            message,
            read: false,
        });
        return res.status(200).json({
            message: 'System notification broadcasted successfully'
        });
    }
    catch (error) {
        return res.status(500).json({
            error: error.message || 'Failed to broadcast notification',
        });
    }
});
router.post('/ping', (req, res) => {
    try {
        socketService_1.socketService.pingAllClients();
        return res.status(200).json({
            message: 'Ping sent to all clients',
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        return res.status(500).json({
            error: error.message || 'Failed to ping clients',
        });
    }
});
router.get('/online-count', (req, res) => {
    try {
        const count = socketService_1.socketService.getOnlineUsersCount();
        return res.status(200).json({
            onlineUsers: count,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        return res.status(500).json({
            error: error.message || 'Failed to get online count',
        });
    }
});
exports.default = router;
//# sourceMappingURL=socketRoutes.js.map