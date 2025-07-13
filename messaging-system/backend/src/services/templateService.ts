import { MessageTemplate } from '@prisma/client';
import prisma from '../config/database';

export interface CreateTemplateData {
  name: string;
  subject?: string;
  content: string;
  variables?: string[];
  category?: string;
}

export interface UpdateTemplateData {
  name?: string;
  subject?: string;
  content?: string;
  variables?: string[];
  category?: string;
  isActive?: boolean;
}

class TemplateService {
  async createTemplate(userId: string, data: CreateTemplateData): Promise<MessageTemplate> {
    const existingTemplate = await prisma.messageTemplate.findFirst({
      where: {
        userId,
        name: data.name,
      },
    });

    if (existingTemplate) {
      throw new Error('Template with this name already exists');
    }

    return prisma.messageTemplate.create({
      data: {
        ...data,
        userId,
        variables: data.variables || [],
      },
    });
  }

  async getTemplates(userId: string): Promise<MessageTemplate[]> {
    return prisma.messageTemplate.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTemplateById(userId: string, templateId: string): Promise<MessageTemplate | null> {
    return prisma.messageTemplate.findFirst({
      where: {
        id: templateId,
        userId,
      },
    });
  }

  async updateTemplate(userId: string, templateId: string, data: UpdateTemplateData): Promise<MessageTemplate> {
    const template = await this.getTemplateById(userId, templateId);
    
    if (!template) {
      throw new Error('Template not found');
    }

    if (data.name && data.name !== template.name) {
      const existingTemplate = await prisma.messageTemplate.findFirst({
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

    return prisma.messageTemplate.update({
      where: { id: templateId },
      data,
    });
  }

  async deleteTemplate(userId: string, templateId: string): Promise<void> {
    const template = await this.getTemplateById(userId, templateId);
    
    if (!template) {
      throw new Error('Template not found');
    }

    await prisma.messageTemplate.delete({
      where: { id: templateId },
    });
  }

  async incrementUsageCount(templateId: string): Promise<void> {
    await prisma.messageTemplate.update({
      where: { id: templateId },
      data: {
        usageCount: {
          increment: 1,
        },
      },
    });
  }

  async getTemplatesByCategory(userId: string, category: string): Promise<MessageTemplate[]> {
    return prisma.messageTemplate.findMany({
      where: {
        userId,
        category,
        isActive: true,
      },
      orderBy: { usageCount: 'desc' },
    });
  }

  async searchTemplates(userId: string, query: string): Promise<MessageTemplate[]> {
    return prisma.messageTemplate.findMany({
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

  async processTemplate(template: MessageTemplate, variables: Record<string, string>): Promise<string> {
    let processedContent = template.content;

    // Replace variables in the format {{variableName}}
    if (template.variables && Array.isArray(template.variables)) {
      for (const variable of template.variables as string[]) {
        const placeholder = `{{${variable}}}`;
        const value = variables[variable] || `[${variable}]`;
        processedContent = processedContent.replace(new RegExp(placeholder, 'g'), value);
      }
    }

    return processedContent;
  }
}

export const templateService = new TemplateService();