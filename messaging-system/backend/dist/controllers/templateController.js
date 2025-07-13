"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.templateController = void 0;
const templateService_1 = require("../services/templateService");
exports.templateController = {
    async createTemplate(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            const { name, subject, content, variables, category } = req.body;
            const template = await templateService_1.templateService.createTemplate(req.user.id, {
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
        }
        catch (error) {
            return res.status(400).json({
                error: error.message || 'Failed to create template',
            });
        }
    },
    async getTemplates(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            const templates = await templateService_1.templateService.getTemplates(req.user.id);
            return res.status(200).json({ templates });
        }
        catch (error) {
            return res.status(500).json({
                error: error.message || 'Failed to get templates',
            });
        }
    },
    async getTemplateById(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            const { id } = req.params;
            const template = await templateService_1.templateService.getTemplateById(req.user.id, id);
            if (!template) {
                return res.status(404).json({
                    error: 'Template not found',
                });
            }
            return res.status(200).json({ template });
        }
        catch (error) {
            return res.status(500).json({
                error: error.message || 'Failed to get template',
            });
        }
    },
    async updateTemplate(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            const { id } = req.params;
            const { name, subject, content, variables, category, isActive } = req.body;
            const template = await templateService_1.templateService.updateTemplate(req.user.id, id, {
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
        }
        catch (error) {
            return res.status(400).json({
                error: error.message || 'Failed to update template',
            });
        }
    },
    async deleteTemplate(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            const { id } = req.params;
            await templateService_1.templateService.deleteTemplate(req.user.id, id);
            return res.status(200).json({
                message: 'Template deleted successfully',
            });
        }
        catch (error) {
            return res.status(400).json({
                error: error.message || 'Failed to delete template',
            });
        }
    },
    async searchTemplates(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            const { q: query, category } = req.query;
            let templates;
            if (category) {
                templates = await templateService_1.templateService.getTemplatesByCategory(req.user.id, category);
            }
            else if (query) {
                templates = await templateService_1.templateService.searchTemplates(req.user.id, query);
            }
            else {
                templates = await templateService_1.templateService.getTemplates(req.user.id);
            }
            return res.status(200).json({ templates });
        }
        catch (error) {
            return res.status(500).json({
                error: error.message || 'Failed to search templates',
            });
        }
    },
};
//# sourceMappingURL=templateController.js.map