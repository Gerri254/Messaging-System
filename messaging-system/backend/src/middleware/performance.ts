import { Request, Response, NextFunction } from 'express';
import compression from 'compression';
import { PrismaClient } from '@prisma/client';
import '../types/express';

// Request timing middleware
export const requestTiming = (req: Request, res: Response, next: NextFunction) => {
  const startTime = process.hrtime.bigint();
  
  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    
    // Add timing header
    res.set('X-Response-Time', `${duration.toFixed(2)}ms`);
    
    // Log slow requests
    if (duration > 1000) {
      console.warn(`🐌 Slow request: ${req.method} ${req.url} took ${duration.toFixed(2)}ms`);
    }
  });
  
  next();
};

// Response compression with custom configuration
export const responseCompression = compression({
  level: 6, // Good balance between compression ratio and speed
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req, res) => {
    // Don't compress if client doesn't support it
    if (req.headers['x-no-compression']) {
      return false;
    }
    
    // Compress all responses by default
    return compression.filter(req, res);
  },
});

// Database connection pooling optimization
export const optimizeDatabaseConnections = (prisma: PrismaClient) => {
  // Connection pool settings are typically configured in the DATABASE_URL
  // But we can add middleware to monitor connection usage
  
  return async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      
      // Monitor database-heavy requests
      if (duration > 2000) {
        console.warn(`🗃️ Database-heavy request: ${req.method} ${req.url} took ${duration}ms`);
      }
    });
    
    next();
  };
};

// Response caching middleware
export const cacheControl = (maxAge: number = 300) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    // Set cache headers
    res.set({
      'Cache-Control': `public, max-age=${maxAge}`,
      'ETag': `"${Date.now()}"`, // Simple ETag based on timestamp
      'Expires': new Date(Date.now() + maxAge * 1000).toUTCString(),
    });
    
    next();
  };
};

// Memory usage monitoring
export const memoryMonitor = (req: Request, res: Response, next: NextFunction) => {
  const memUsage = process.memoryUsage();
  const mbUsed = Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100;
  
  // Add memory usage header in development
  if (process.env.NODE_ENV === 'development') {
    res.set('X-Memory-Usage', `${mbUsed}MB`);
  }
  
  // Warn if memory usage is high
  if (mbUsed > 500) {
    console.warn(`🔴 High memory usage: ${mbUsed}MB`);
  }
  
  next();
};

// Request deduplication middleware
interface PendingRequest {
  promise: Promise<any>;
  timestamp: number;
}

const pendingRequests = new Map<string, PendingRequest>();

export const requestDeduplication = (req: Request, res: Response, next: NextFunction) => {
  // Only deduplicate GET requests
  if (req.method !== 'GET') {
    return next();
  }
  
  const key = `${req.method}:${req.url}:${req.user?.id || 'anonymous'}`;
  const existing = pendingRequests.get(key);
  
  // If there's a pending request for the same resource
  if (existing && Date.now() - existing.timestamp < 1000) { // 1 second window
    existing.promise
      .then((data) => {
        res.json(data);
      })
      .catch((error) => {
        res.status(500).json({ error: 'Request failed' });
      });
    return;
  }
  
  // Create a promise that resolves when the response is sent
  let resolveRequest: (data: any) => void;
  let rejectRequest: (error: any) => void;
  
  const requestPromise = new Promise((resolve, reject) => {
    resolveRequest = resolve;
    rejectRequest = reject;
  });
  
  pendingRequests.set(key, {
    promise: requestPromise,
    timestamp: Date.now(),
  });
  
  // Override res.json to capture the response
  const originalJson = res.json.bind(res);
  res.json = function(body) {
    resolveRequest!(body);
    pendingRequests.delete(key);
    return originalJson(body);
  };
  
  // Handle errors
  res.on('error', (error) => {
    rejectRequest!(error);
    pendingRequests.delete(key);
  });
  
  // Cleanup after timeout
  setTimeout(() => {
    pendingRequests.delete(key);
  }, 5000);
  
  next();
};

// Database query optimization helpers
export const addDatabaseOptimizations = (prisma: PrismaClient) => {
  // Add query logging in development
  if (process.env.NODE_ENV === 'development') {
    prisma.$use(async (params, next) => {
      const before = Date.now();
      const result = await next(params);
      const after = Date.now();
      
      console.log(`🗃️ Query ${params.model}.${params.action} took ${after - before}ms`);
      
      return result;
    });
  }
  
  // Add slow query detection
  prisma.$use(async (params, next) => {
    const before = Date.now();
    const result = await next(params);
    const after = Date.now();
    
    // Log slow queries
    if (after - before > 1000) {
      console.warn(`🐌 Slow query detected: ${params.model}.${params.action} took ${after - before}ms`);
    }
    
    return result;
  });
};

// Static file optimization
export const staticFileOptimization = {
  maxAge: '1y', // Cache static files for 1 year
  etag: true,
  lastModified: true,
  setHeaders: (res: Response, path: string) => {
    // Set appropriate cache headers based on file type
    if (path.endsWith('.html')) {
      res.set('Cache-Control', 'public, max-age=0');
    } else if (path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
      res.set('Cache-Control', 'public, max-age=31536000'); // 1 year
    }
  },
};

// Graceful shutdown handler
export const gracefulShutdown = (server: any, prisma: PrismaClient) => {
  const shutdown = async (signal: string) => {
    console.log(`🛑 Received ${signal}, starting graceful shutdown...`);
    
    // Stop accepting new connections
    server.close(async () => {
      console.log('📴 HTTP server closed');
      
      try {
        // Close database connections
        await prisma.$disconnect();
        console.log('🗃️ Database connections closed');
        
        // Exit the process
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
      }
    });
    
    // Force exit after 30 seconds
    setTimeout(() => {
      console.log('⏰ Forcing shutdown due to timeout');
      process.exit(1);
    }, 30000);
  };
  
  // Handle shutdown signals
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    shutdown('uncaughtException');
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    shutdown('unhandledRejection');
  });
};

// Health check endpoint optimization
export const healthCheck = async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    // Check database connection
    await req.app.locals.prisma.$queryRaw`SELECT 1`;
    
    // Check memory usage
    const memUsage = process.memoryUsage();
    const mbUsed = Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100;
    
    // Check uptime
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
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed',
    });
  }
};