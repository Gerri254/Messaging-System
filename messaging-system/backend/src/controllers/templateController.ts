import { Response } from 'express';
import { templateService } from '../services/templateService';
import { AuthRequest } from '../middleware/auth';

export const templateController = {
  async createTemplate(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { name, subject, content, variables, category } = req.body;

      const template = await templateService.createTemplate(req.user.id, {
        name,
        subject,
        content,
        variables,
        category,
      });

      return res.status(201).json({
        message: 'Template created successfully',
        data: { template },
      });
    } catch (error: any) {
      return res.status(400).json({
        error: error.message || 'Failed to create template',
      });
    }
  },

  async getTemplates(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const templates = await templateService.getTemplates(req.user.id);

      return res.status(200).json({ templates });
    } catch (error: any) {
      return res.status(500).json({
        error: error.message || 'Failed to get templates',
      });
    }
  },

  async getTemplateById(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { id } = req.params;

      const template = await templateService.getTemplateById(req.user.id, id);

      if (!template) {
        return res.status(404).json({
          error: 'Template not found',
        });
      }

      return res.status(200).json({ template });
    } catch (error: any) {
      return res.status(500).json({
        error: error.message || 'Failed to get template',
      });
    }
  },

  async updateTemplate(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { id } = req.params;
      const { name, subject, content, variables, category, isActive } = req.body;

      const template = await templateService.updateTemplate(req.user.id, id, {
        name,
        subject,
        content,
        variables,
        category,
        isActive,
      });

      return res.status(200).json({
        message: 'Template updated successfully',
        data: { template },
      });
    } catch (error: any) {
      return res.status(400).json({
        error: error.message || 'Failed to update template',
      });
    }
  },

  async deleteTemplate(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { id } = req.params;

      await templateService.deleteTemplate(req.user.id, id);

      return res.status(200).json({
        message: 'Template deleted successfully',
      });
    } catch (error: any) {
      return res.status(400).json({
        error: error.message || 'Failed to delete template',
      });
    }
  },

  async searchTemplates(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { q: query, category } = req.query;

      let templates;

      if (category) {
        templates = await templateService.getTemplatesByCategory(req.user.id, category as string);
      } else if (query) {
        templates = await templateService.searchTemplates(req.user.id, query as string);
      } else {
        templates = await templateService.getTemplates(req.user.id);
      }

      return res.status(200).json({ templates });
    } catch (error: any) {
      return res.status(500).json({
        error: error.message || 'Failed to search templates',
      });
    }
  },
};