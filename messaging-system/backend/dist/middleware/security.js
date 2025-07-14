"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionSecurity = exports.validatePasswordStrength = exports.corsOptions = exports.ipWhitelist = exports.requestSizeLimit = exports.securityLogger = exports.sanitizeInput = exports.securityHeaders = exports.smsRateLimit = exports.apiRateLimit = exports.authRateLimit = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const config_1 = require("../config");
exports.authRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        error: 'Too many authentication attempts, please try again later',
        retryAfter: '15 minutes',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        return process.env.NODE_ENV === 'test';
    },
});
exports.apiRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        error: 'Too many API requests, please try again later',
        retryAfter: '15 minutes',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        return process.env.NODE_ENV === 'test';
    },
});
exports.smsRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    max: 50,
    message: {
        error: 'SMS rate limit exceeded, please try again later',
        retryAfter: '1 hour',
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.user?.id || req.ip || 'unknown';
    },
    skip: (req) => {
        return process.env.NODE_ENV === 'test';
    },
});
exports.securityHeaders = (0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'", "wss:", "https://api.twilio.com"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
        },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
    },
});
const sanitizeInput = (req, res, next) => {
    const sanitizeString = (str) => {
        if (typeof str !== 'string')
            return str;
        return str
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .trim();
    };
    const sanitizeObject = (obj) => {
        if (typeof obj === 'string') {
            return sanitizeString(obj);
        }
        if (Array.isArray(obj)) {
            return obj.map(sanitizeObject);
        }
        if (obj && typeof obj === 'object') {
            const sanitized = {};
            for (const [key, value] of Object.entries(obj)) {
                sanitized[key] = sanitizeObject(value);
            }
            return sanitized;
        }
        return obj;
    };
    if (req.body) {
        req.body = sanitizeObject(req.body);
    }
    if (req.query) {
        const sanitizedQuery = sanitizeObject(req.query);
        Object.keys(req.query).forEach(key => {
            delete req.query[key];
        });
        Object.assign(req.query, sanitizedQuery);
    }
    if (req.params) {
        req.params = sanitizeObject(req.params);
    }
    next();
};
exports.sanitizeInput = sanitizeInput;
const securityLogger = (req, res, next) => {
    const startTime = Date.now();
    const suspiciousPatterns = [
        /\.\.\//g,
        /<script/gi,
        /union\s+select/gi,
        /base64_decode/gi,
        /eval\s*\(/gi,
    ];
    const requestData = JSON.stringify({
        body: req.body,
        query: req.query,
        params: req.params,
    });
    const hasSuspiciousContent = suspiciousPatterns.some(pattern => pattern.test(requestData) || pattern.test(req.url));
    if (hasSuspiciousContent) {
        console.warn('🚨 Suspicious request detected:', {
            ip: req.ip,
            method: req.method,
            url: req.url,
            userAgent: req.get('User-Agent'),
            timestamp: new Date().toISOString(),
            userId: req.user?.id,
        });
    }
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        if (duration > 5000) {
            console.warn('🐌 Slow request detected:', {
                ip: req.ip,
                method: req.method,
                url: req.url,
                duration: `${duration}ms`,
                status: res.statusCode,
                userId: req.user?.id,
            });
        }
    });
    next();
};
exports.securityLogger = securityLogger;
const requestSizeLimit = (req, res, next) => {
    const maxSize = 10 * 1024 * 1024;
    const contentLength = parseInt(req.get('Content-Length') || '0', 10);
    if (contentLength > maxSize) {
        return res.status(413).json({
            error: 'Request too large',
            maxSize: '10MB',
        });
    }
    return next();
};
exports.requestSizeLimit = requestSizeLimit;
const ipWhitelist = (allowedIPs) => {
    return (req, res, next) => {
        const clientIP = req.ip;
        if (process.env.NODE_ENV === 'development' || (clientIP && allowedIPs.includes(clientIP))) {
            return next();
        }
        if (!clientIP) {
            return next();
        }
        console.warn('🚫 Unauthorized IP access attempt:', {
            ip: clientIP,
            url: req.url,
            timestamp: new Date().toISOString(),
        });
        return res.status(403).json({
            error: 'Access denied: IP not whitelisted',
        });
    };
};
exports.ipWhitelist = ipWhitelist;
exports.corsOptions = {
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        const allowedOrigins = config_1.config.cors.allowedOrigins;
        if (config_1.config.nodeEnv === 'development') {
            console.log('🌐 CORS request from origin:', origin);
            console.log('🔍 Allowed origins:', allowedOrigins);
        }
        const isAllowed = allowedOrigins.some(allowedOrigin => {
            if (allowedOrigin === origin)
                return true;
            if (config_1.config.nodeEnv === 'development' && allowedOrigin.includes('localhost')) {
                return origin.includes('localhost');
            }
            if (origin.includes('vercel.app') && allowedOrigins.some(ao => ao.includes('vercel.app'))) {
                return true;
            }
            if (origin.includes('railway.app') && allowedOrigins.some(ao => ao.includes('railway.app'))) {
                return true;
            }
            return false;
        });
        if (isAllowed) {
            callback(null, true);
        }
        else {
            console.warn('🚫 CORS blocked request from origin:', origin);
            console.warn('🔍 Allowed origins:', allowedOrigins);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'Cache-Control',
        'X-File-Name'
    ],
    exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-Total-Count'],
    maxAge: 86400,
    preflightContinue: false,
    optionsSuccessStatus: 204
};
const validatePasswordStrength = (password) => {
    const errors = [];
    let score = 0;
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    else if (password.length >= 12) {
        score += 2;
    }
    else {
        score += 1;
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    else {
        score += 1;
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    else {
        score += 1;
    }
    if (!/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    else {
        score += 1;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }
    else {
        score += 1;
    }
    const commonPatterns = [
        /123456/,
        /password/i,
        /qwerty/i,
        /admin/i,
        /letmein/i,
    ];
    if (commonPatterns.some(pattern => pattern.test(password))) {
        errors.push('Password contains common patterns and is not secure');
        score = Math.max(0, score - 2);
    }
    return {
        isValid: errors.length === 0 && score >= 4,
        errors,
        score,
    };
};
exports.validatePasswordStrength = validatePasswordStrength;
exports.sessionSecurity = {
    name: 'sessionId',
    secret: config_1.config.session.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'strict',
    },
};
//# sourceMappingURL=security.js.map