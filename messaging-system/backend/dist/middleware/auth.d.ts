import { Request, Response, NextFunction } from 'express';
import { User } from '@prisma/client';
import '../types/express';
export interface AuthRequest extends Request {
    user?: User;
}
export declare const authenticate: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare const optionalAuth: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map