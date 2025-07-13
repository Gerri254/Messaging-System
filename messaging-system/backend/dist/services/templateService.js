"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.templateService = void 0;
const database_1 = __importDefault(require("../config/database"));
class TemplateService {
    async createTemplate(userId, data) {
        const existingTemplate = await database_1.default.messageTemplate.findFirst({
            where: {
                userId,
                name: data.name,
            },
        });
        if (existingTemplate) {
            throw new Error('Template with this name already exists');
        }
        return database_1.default.messageTemplate.create({
            data: {
                ...data,
                userId,
                variables: data.variables || [],
            },
        });
    }
    async getTemplates(userId) {
        return database_1.default.messageTemplate.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getTemplateById(userId, templateId) {
        return database_1.default.messageTemplate.findFirst({
            where: {
                id: templateId,
                userId,
            },
        });
    }
    async updateTemplate(userId, templateId, data) {
        const template = await this.getTemplateById(userId, templateId);
        if (!template) {
            throw new Error('Template not found');
        }
        if (data.name && data.name !== template.name) {
            const existingTemplate = await database_1.default.messageTemplate.findFirst({
                where: {
                    userId,
                    name: data.name,
                    id: { not: templateId },
                },
            });
            if (existingTemplate) {
                throw new Error('Template with this name already exists');
            }
        }
        return database_1.default.messageTemplate.update({
            where: { id: templateId },
            data,
        });
    }
    async deleteTemplate(userId, templateId) {
        const template = await this.getTemplateById(userId, templateId);
        if (!template) {
            throw new Error('Template not found');
        }
        await database_1.default.messageTemplate.delete({
            where: { id: templateId },
        });
    }
    async incrementUsageCount(templateId) {
        await database_1.default.messageTemplate.update({
            where: { id: templateId },
            data: {
                usageCount: {
                    increment: 1,
                },
            },
        });
    }
    async getTemplatesByCategory(userId, category) {
        return database_1.default.messageTemplate.findMany({
            where: {
                userId,
                category,
                isActive: true,
            },
            orderBy: { usageCount: 'desc' },
        });
    }
    async searchTemplates(userId, query) {
        return database_1.default.messageTemplate.findMany({
            where: {
                userId,
                isActive: true,
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { content: { contains: query, mode: 'insensitive' } },
                    { category: { contains: query, mode: 'insensitive' } },
                ],
            },
            orderBy: { usageCount: 'desc' },
        });
    }
    async processTemplate(template, variables) {
        let processedContent = template.content;
        if (template.variables && Array.isArray(template.variables)) {
            for (const variable of template.variables) {
                const placeholder = `{{${variable}}}`;
                const value = variables[variable] || `[${variable}]`;
                processedContent = processedContent.replace(new RegExp(placeholder, 'g'), value);
            }
        }
        return processedContent;
    }
}
exports.templateService = new TemplateService();
//# sourceMappingURL=templateService.js.map