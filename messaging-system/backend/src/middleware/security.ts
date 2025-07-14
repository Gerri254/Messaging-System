import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { config } from '../config';
import { User } from '@prisma/client';

// Extend Request interface for this file
interface RequestWithUser extends Request {
  user?: User;
}

// Enhanced rate limiting with different limits for different endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for auth endpoints
  message: {
    error: 'Too many authentication attempts, please try again later',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting in test environment
    return process.env.NODE_ENV === 'test';
  },
});

export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs for API endpoints
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

export const smsRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // limit each IP to 50 SMS requests per hour
  message: {
    error: 'SMS rate limit exceeded, please try again later',
    retryAfter: '1 hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: RequestWithUser) => {
    // Use user ID for authenticated users, IP for others
    return req.user?.id || req.ip || 'unknown';
  },
  skip: (req) => {
    return process.env.NODE_ENV === 'test';
  },
});

// Security headers configuration
export const securityHeaders = helmet({
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
  crossOriginEmbedderPolicy: false, // Disable for Socket.io compatibility
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
});

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeString = (str: string): string => {
    if (typeof str !== 'string') return str;
    
    // Remove potential XSS attempts
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  };

  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
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

// Request logging for security monitoring
export const securityLogger = (req: RequestWithUser, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Log suspicious patterns
  const suspiciousPatterns = [
    /\.\.\//g, // Directory traversal
    /<script/gi, // XSS attempts
    /union\s+select/gi, // SQL injection
    /base64_decode/gi, // Encoded payloads
    /eval\s*\(/gi, // Code execution
  ];

  const requestData = JSON.stringify({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  const hasSuspiciousContent = suspiciousPatterns.some(pattern => 
    pattern.test(requestData) || pattern.test(req.url)
  );

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
    
    // Log slow requests (potential DoS)
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

// Request size limit middleware
export const requestSizeLimit = (req: Request, res: Response, next: NextFunction) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const contentLength = parseInt(req.get('Content-Length') || '0', 10);

  if (contentLength > maxSize) {
    return res.status(413).json({
      error: 'Request too large',
      maxSize: '10MB',
    });
  }

  return next();
};

// IP whitelist middleware (for admin endpoints)
export const ipWhitelist = (allowedIPs: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip;
    
    if (process.env.NODE_ENV === 'development' || (clientIP && allowedIPs.includes(clientIP))) {
      return next();
    }
    
    if (!clientIP) {
      return next(); // Allow if IP cannot be determined
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

// Enhanced CORS configuration for production deployment
export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = config.cors.allowedOrigins;
    
    // Log CORS requests for debugging
    if (config.nodeEnv === 'development') {
      console.log('🌐 CORS request from origin:', origin);
      console.log('🔍 Allowed origins:', allowedOrigins);
    }
    
    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      // Exact match
      if (allowedOrigin === origin) return true;
      
      // Wildcard subdomain matching for development
      if (config.nodeEnv === 'development' && allowedOrigin.includes('localhost')) {
        return origin.includes('localhost');
      }
      
      // Support for deployment preview URLs (Vercel previews)
      if (origin.includes('vercel.app') && allowedOrigins.some(ao => ao.includes('vercel.app'))) {
        return true;
      }
      
      // Support for Railway deployment URLs
      if (origin.includes('railway.app') && allowedOrigins.some(ao => ao.includes('railway.app'))) {
        return true;
      }
      
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
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
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Password strength validation
export const validatePasswordStrength = (password: string): { 
  isValid: boolean; 
  errors: string[]; 
  score: number; 
} => {
  const errors: string[] = [];
  let score = 0;

  // Length check
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else if (password.length >= 12) {
    score += 2;
  } else {
    score += 1;
  }

  // Character variety checks
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    score += 1;
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  } else {
    score += 1;
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  } else {
    score += 1;
  }

  // Common patterns check
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

// Session security
export const sessionSecurity = {
  name: 'sessionId',
  secret: config.session.secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict' as const, // CSRF protection
  },
};