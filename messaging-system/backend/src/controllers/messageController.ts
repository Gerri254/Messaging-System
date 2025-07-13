import { Response } from 'express';
import { messageService } from '../services/messageService';
import { smsService } from '../services/smsService';
import { AuthRequest } from '../middleware/auth';
import { MessageStatus } from '@prisma/client';

export const messageController = {
  async sendMessage(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { content, recipients, scheduledAt } = req.body;

      const message = await messageService.sendMessage(req.user.id, {
        content,
        recipients,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      });

      return res.status(201).json({
        message: 'Message sent successfully',
        data: { message },
      });
    } catch (error: any) {
      return res.status(400).json({
        error: error.message || 'Failed to send message',
      });
    }
  },

  async bulkSendMessage(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { content, contactIds, groupIds, scheduledAt } = req.body;

      const message = await messageService.bulkSendMessage(req.user.id, {
        content,
        contactIds,
        groupIds,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      });

      return res.status(201).json({
        message: 'Bulk message sent successfully',
        data: { message },
      });
    } catch (error: any) {
      return res.status(400).json({
        error: error.message || 'Failed to send bulk message',
      });
    }
  },

  async getMessages(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as MessageStatus;

      const result = await messageService.getMessages(req.user.id, page, limit, status);

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({
        error: error.message || 'Failed to get messages',
      });
    }
  },

  async getMessageById(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { id } = req.params;

      const message = await messageService.getMessageById(req.user.id, id);

      if (!message) {
        return res.status(404).json({
          error: 'Message not found',
        });
      }

      return res.status(200).json({ message });
    } catch (error: any) {
      return res.status(500).json({
        error: error.message || 'Failed to get message',
      });
    }
  },

  async getMessageStatus(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { id } = req.params;

      const message = await messageService.getMessageById(req.user.id, id);

      if (!message) {
        return res.status(404).json({
          error: 'Message not found',
        });
      }

      return res.status(200).json({
        message,
        recipients: (message as any).recipients || [],
      });
    } catch (error: any) {
      return res.status(500).json({
        error: error.message || 'Failed to get message status',
      });
    }
  },

  async cancelMessage(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { id } = req.params;

      await messageService.cancelMessage(req.user.id, id);

      return res.status(200).json({
        message: 'Message cancelled successfully',
      });
    } catch (error: any) {
      return res.status(400).json({
        error: error.message || 'Failed to cancel message',
      });
    }
  },

  async getMessageHistory(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await messageService.getMessages(req.user.id, page, limit);

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({
        error: error.message || 'Failed to get message history',
      });
    }
  },

  async validatePhoneNumber(req: AuthRequest, res: Response) {
    try {
      const { phone } = req.body;

      if (!phone) {
        return res.status(400).json({ error: 'Phone number is required' });
      }

      const validation = smsService.validatePhoneNumber(phone);

      return res.status(200).json(validation);
    } catch (error: any) {
      return res.status(500).json({
        error: error.message || 'Failed to validate phone number',
      });
    }
  },

  async getSMSUsageStats(req: AuthRequest, res: Response) {
    try {
      const { phone } = req.query;

      const stats = await smsService.getUsageStats(phone as string);

      return res.status(200).json(stats);
    } catch (error: any) {
      return res.status(500).json({
        error: error.message || 'Failed to get SMS usage statistics',
      });
    }
  },
};