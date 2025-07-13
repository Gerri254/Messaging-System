import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const messageController: {
    sendMessage(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    bulkSendMessage(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    getMessages(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    getMessageById(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    getMessageStatus(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    cancelMessage(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    getMessageHistory(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    validatePhoneNumber(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    getSMSUsageStats(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=messageController.d.ts.map