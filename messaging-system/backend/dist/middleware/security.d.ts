import { Request, Response, NextFunction } from 'express';
import '../types/express';
export declare const authRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const apiRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const smsRateLimit: import("express-rate-limit").RateLimitRequestHandler;
export declare const securityHeaders: (req: import("http").IncomingMessage, res: import("http").ServerResponse, next: (err?: unknown) => void) => void;
export declare const sanitizeInput: (req: Request, res: Response, next: NextFunction) => void;
export declare const securityLogger: (req: Request, res: Response, next: NextFunction) => void;
export declare const requestSizeLimit: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const ipWhitelist: (allowedIPs: string[]) => (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const corsOptions: {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void;
    credentials: boolean;
    methods: string[];
    allowedHeaders: string[];
    exposedHeaders: string[];
    maxAge: number;
};
export declare const validatePasswordStrength: (password: string) => {
    isValid: boolean;
    errors: string[];
    score: number;
};
export declare const sessionSecurity: {
    name: string;
    secret: string;
    resave: boolean;
    saveUninitialized: boolean;
    cookie: {
        secure: boolean;
        httpOnly: boolean;
        maxAge: number;
        sameSite: "strict";
    };
};
//# sourceMappingURL=security.d.ts.map