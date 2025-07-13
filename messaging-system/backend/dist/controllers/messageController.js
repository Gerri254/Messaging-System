"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageController = void 0;
const messageService_1 = require("../services/messageService");
const smsService_1 = require("../services/smsService");
exports.messageController = {
    async sendMessage(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            const { content, recipients, scheduledAt } = req.body;
            const message = await messageService_1.messageService.sendMessage(req.user.id, {
                content,
                recipients,
                scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
            });
            return res.status(201).json({
                message: 'Message sent successfully',
                data: { message },
            });
        }
        catch (error) {
            return res.status(400).json({
                error: error.message || 'Failed to send message',
            });
        }
    },
    async bulkSendMessage(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            const { content, contactIds, groupIds, scheduledAt } = req.body;
            const message = await messageService_1.messageService.bulkSendMessage(req.user.id, {
                content,
                contactIds,
                groupIds,
                scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
            });
            return res.status(201).json({
                message: 'Bulk message sent successfully',
                data: { message },
            });
        }
        catch (error) {
            return res.status(400).json({
                error: error.message || 'Failed to send bulk message',
            });
        }
    },
    async getMessages(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const status = req.query.status;
            const result = await messageService_1.messageService.getMessages(req.user.id, page, limit, status);
            return res.status(200).json(result);
        }
        catch (error) {
            return res.status(500).json({
                error: error.message || 'Failed to get messages',
            });
        }
    },
    async getMessageById(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            const { id } = req.params;
            const message = await messageService_1.messageService.getMessageById(req.user.id, id);
            if (!message) {
                return res.status(404).json({
                    error: 'Message not found',
                });
            }
            return res.status(200).json({ message });
        }
        catch (error) {
            return res.status(500).json({
                error: error.message || 'Failed to get message',
            });
        }
    },
    async getMessageStatus(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            const { id } = req.params;
            const message = await messageService_1.messageService.getMessageById(req.user.id, id);
            if (!message) {
                return res.status(404).json({
                    error: 'Message not found',
                });
            }
            return res.status(200).json({
                message,
                recipients: message.recipients || [],
            });
        }
        catch (error) {
            return res.status(500).json({
                error: error.message || 'Failed to get message status',
            });
        }
    },
    async cancelMessage(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            const { id } = req.params;
            await messageService_1.messageService.cancelMessage(req.user.id, id);
            return res.status(200).json({
                message: 'Message cancelled successfully',
            });
        }
        catch (error) {
            return res.status(400).json({
                error: error.message || 'Failed to cancel message',
            });
        }
    },
    async getMessageHistory(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const result = await messageService_1.messageService.getMessages(req.user.id, page, limit);
            return res.status(200).json(result);
        }
        catch (error) {
            return res.status(500).json({
                error: error.message || 'Failed to get message history',
            });
        }
    },
    async validatePhoneNumber(req, res) {
        try {
            const { phone } = req.body;
            if (!phone) {
                return res.status(400).json({ error: 'Phone number is required' });
            }
            const validation = smsService_1.smsService.validatePhoneNumber(phone);
            return res.status(200).json(validation);
        }
        catch (error) {
            return res.status(500).json({
                error: error.message || 'Failed to validate phone number',
            });
        }
    },
    async getSMSUsageStats(req, res) {
        try {
            const { phone } = req.query;
            const stats = await smsService_1.smsService.getUsageStats(phone);
            return res.status(200).json(stats);
        }
        catch (error) {
            return res.status(500).json({
                error: error.message || 'Failed to get SMS usage statistics',
            });
        }
    },
};
//# sourceMappingURL=messageController.js.map