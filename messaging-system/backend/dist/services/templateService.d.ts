import { MessageTemplate } from '@prisma/client';
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
declare class TemplateService {
    createTemplate(userId: string, data: CreateTemplateData): Promise<MessageTemplate>;
    getTemplates(userId: string): Promise<MessageTemplate[]>;
    getTemplateById(userId: string, templateId: string): Promise<MessageTemplate | null>;
    updateTemplate(userId: string, templateId: string, data: UpdateTemplateData): Promise<MessageTemplate>;
    deleteTemplate(userId: string, templateId: string): Promise<void>;
    incrementUsageCount(templateId: string): Promise<void>;
    getTemplatesByCategory(userId: string, category: string): Promise<MessageTemplate[]>;
    searchTemplates(userId: string, query: string): Promise<MessageTemplate[]>;
    processTemplate(template: MessageTemplate, variables: Record<string, string>): Promise<string>;
}
export declare const templateService: TemplateService;
export {};
//# sourceMappingURL=templateService.d.ts.map