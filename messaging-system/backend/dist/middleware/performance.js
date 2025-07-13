"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = exports.gracefulShutdown = exports.staticFileOptimization = exports.addDatabaseOptimizations = exports.requestDeduplication = exports.memoryMonitor = exports.cacheControl = exports.optimizeDatabaseConnections = exports.responseCompression = exports.requestTiming = void 0;
const compression_1 = __importDefault(require("compression"));
require("../types/express");
const requestTiming = (req, res, next) => {
    const startTime = process.hrtime.bigint();
    res.on('finish', () => {
        const endTime = process.hrtime.bigint();
        const duration = Number(endTime - startTime) / 1000000;
        res.set('X-Response-Time', `${duration.toFixed(2)}ms`);
        if (duration > 1000) {
            console.warn(`🐌 Slow request: ${req.method} ${req.url} took ${duration.toFixed(2)}ms`);
        }
    });
    next();
};
exports.requestTiming = requestTiming;
exports.responseCompression = (0, compression_1.default)({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression_1.default.filter(req, res);
    },
});
const optimizeDatabaseConnections = (prisma) => {
    return async (req, res, next) => {
        const startTime = Date.now();
        res.on('finish', () => {
            const duration = Date.now() - startTime;
            if (duration > 2000) {
                console.warn(`🗃️ Database-heavy request: ${req.method} ${req.url} took ${duration}ms`);
            }
        });
        next();
    };
};
exports.optimizeDatabaseConnections = optimizeDatabaseConnections;
const cacheControl = (maxAge = 300) => {
    return (req, res, next) => {
        if (req.method !== 'GET') {
            return next();
        }
        res.set({
            'Cache-Control': `public, max-age=${maxAge}`,
            'ETag': `"${Date.now()}"`,
            'Expires': new Date(Date.now() + maxAge * 1000).toUTCString(),
        });
        next();
    };
};
exports.cacheControl = cacheControl;
const memoryMonitor = (req, res, next) => {
    const memUsage = process.memoryUsage();
    const mbUsed = Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100;
    if (process.env.NODE_ENV === 'development') {
        res.set('X-Memory-Usage', `${mbUsed}MB`);
    }
    if (mbUsed > 500) {
        console.warn(`🔴 High memory usage: ${mbUsed}MB`);
    }
    next();
};
exports.memoryMonitor = memoryMonitor;
const pendingRequests = new Map();
const requestDeduplication = (req, res, next) => {
    if (req.method !== 'GET') {
        return next();
    }
    const key = `${req.method}:${req.url}:${req.user?.id || 'anonymous'}`;
    const existing = pendingRequests.get(key);
    if (existing && Date.now() - existing.timestamp < 1000) {
        existing.promise
            .then((data) => {
            res.json(data);
        })
            .catch((error) => {
            res.status(500).json({ error: 'Request failed' });
        });
        return;
    }
    let resolveRequest;
    let rejectRequest;
    const requestPromise = new Promise((resolve, reject) => {
        resolveRequest = resolve;
        rejectRequest = reject;
    });
    pendingRequests.set(key, {
        promise: requestPromise,
        timestamp: Date.now(),
    });
    const originalJson = res.json.bind(res);
    res.json = function (body) {
        resolveRequest(body);
        pendingRequests.delete(key);
        return originalJson(body);
    };
    res.on('error', (error) => {
        rejectRequest(error);
        pendingRequests.delete(key);
    });
    setTimeout(() => {
        pendingRequests.delete(key);
    }, 5000);
    next();
};
exports.requestDeduplication = requestDeduplication;
const addDatabaseOptimizations = (prisma) => {
    if (process.env.NODE_ENV === 'development') {
        prisma.$use(async (params, next) => {
            const before = Date.now();
            const result = await next(params);
            const after = Date.now();
            console.log(`🗃️ Query ${params.model}.${params.action} took ${after - before}ms`);
            return result;
        });
    }
    prisma.$use(async (params, next) => {
        const before = Date.now();
        const result = await next(params);
        const after = Date.now();
        if (after - before > 1000) {
            console.warn(`🐌 Slow query detected: ${params.model}.${params.action} took ${after - before}ms`);
        }
        return result;
    });
};
exports.addDatabaseOptimizations = addDatabaseOptimizations;
exports.staticFileOptimization = {
    maxAge: '1y',
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
            res.set('Cache-Control', 'public, max-age=0');
        }
        else if (path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
            res.set('Cache-Control', 'public, max-age=31536000');
        }
    },
};
const gracefulShutdown = (server, prisma) => {
    const shutdown = async (signal) => {
        console.log(`🛑 Received ${signal}, starting graceful shutdown...`);
        server.close(async () => {
            console.log('📴 HTTP server closed');
            try {
                await prisma.$disconnect();
                console.log('🗃️ Database connections closed');
                process.exit(0);
            }
            catch (error) {
                console.error('❌ Error during shutdown:', error);
                process.exit(1);
            }
        });
        setTimeout(() => {
            console.log('⏰ Forcing shutdown due to timeout');
            process.exit(1);
        }, 30000);
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('uncaughtException', (error) => {
        console.error('💥 Uncaught Exception:', error);
        shutdown('uncaughtException');
    });
    process.on('unhandledRejection', (reason, promise) => {
        console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
        shutdown('unhandledRejection');
    });
};
exports.gracefulShutdown = gracefulShutdown;
const healthCheck = async (req, res) => {
    const startTime = Date.now();
    try {
        await req.app.locals.prisma.$queryRaw `SELECT 1`;
        const memUsage = process.memoryUsage();
        const mbUsed = Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100;
        const uptime = process.uptime();
        const responseTime = Date.now() - startTime;
        res.status(200).json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: `${Math.floor(uptime / 60)} minutes`,
            memory: `${mbUsed}MB`,
            responseTime: `${responseTime}ms`,
            database: 'connected',
            environment: process.env.NODE_ENV,
        });
    }
    catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: 'Database connection failed',
        });
    }
};
exports.healthCheck = healthCheck;
//# sourceMappingURL=performance.js.map