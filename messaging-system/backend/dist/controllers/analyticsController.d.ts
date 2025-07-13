import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const analyticsController: {
    getDashboardStats(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    getMessageReports(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    getUsageStats(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    exportData(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=analyticsController.d.ts.map