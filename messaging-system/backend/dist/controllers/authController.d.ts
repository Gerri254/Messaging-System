import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const authController: {
    register(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    login(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    verifyEmail(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    resendVerification(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    forgotPassword(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    resetPassword(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    logout(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    getProfile(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    updateProfile(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=authController.d.ts.map