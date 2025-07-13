import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const templateController: {
    createTemplate(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    getTemplates(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    getTemplateById(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    updateTemplate(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteTemplate(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    searchTemplates(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=templateController.d.ts.map