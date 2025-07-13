import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import '../types/express';
export declare const requestTiming: (req: Request, res: Response, next: NextFunction) => void;
export declare const responseCompression: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const optimizeDatabaseConnections: (prisma: PrismaClient) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const cacheControl: (maxAge?: number) => (req: Request, res: Response, next: NextFunction) => void;
export declare const memoryMonitor: (req: Request, res: Response, next: NextFunction) => void;
export declare const requestDeduplication: (req: Request, res: Response, next: NextFunction) => void;
export declare const addDatabaseOptimizations: (prisma: PrismaClient) => void;
export declare const staticFileOptimization: {
    maxAge: string;
    etag: boolean;
    lastModified: boolean;
    setHeaders: (res: Response, path: string) => void;
};
export declare const gracefulShutdown: (server: any, prisma: PrismaClient) => void;
export declare const healthCheck: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=performance.d.ts.map