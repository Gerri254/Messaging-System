import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

import config from './config';
import './config/database';
import './config/redis';
import authRoutes from './routes/authRoutes';
import contactRoutes from './routes/contactRoutes';
import messageRoutes from './routes/messageRoutes';
import templateRoutes from './routes/templateRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import socketRoutes from './routes/socketRoutes';
import { socketService } from './services/socketService';
import { gracefulShutdown } from './middleware/performance';
import { prisma } from './config/database';

// Import security and performance middleware
import {
  securityHeaders,
  corsOptions,
  sanitizeInput,
  securityLogger,
  requestSizeLimit,
  authRateLimit,
  apiRateLimit,
  smsRateLimit,
} from './middleware/security';

import {
  requestTiming,
  responseCompression,
  memoryMonitor,
  requestDeduplication,
  healthCheck,
} from './middleware/performance';

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: config.frontendUrl,
    credentials: true,
  },
});

// Security middleware
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(requestSizeLimit);
app.use(sanitizeInput);
app.use(securityLogger);

// Performance middleware
app.use(requestTiming);
app.use(responseCompression);
app.use(memoryMonitor);
app.use(requestDeduplication);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', healthCheck);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Messaging System Backend',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      api: '/api',
      auth: '/api/auth',
      messages: '/api/messages',
      contacts: '/api/contacts',
      templates: '/api/templates',
      analytics: '/api/analytics'
    }
  });
});

// Apply rate limiting with different limits for different endpoints
app.use('/api/auth', authRateLimit);
app.use('/api/messages/send', smsRateLimit);
app.use('/api', apiRateLimit);


app.get('/api', (req, res) => {
  res.json({
    message: 'Messaging System API',
    version: '1.0.0',
    status: 'running',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/socket', socketRoutes);

// Initialize Socket.io service
socketService.initialize(io);

app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', error);
  
  const statusCode = error.statusCode || 500;
  const message = config.nodeEnv === 'production' ? 'Internal server error' : error.message;
  
  res.status(statusCode).json({
    error: message,
    ...(config.nodeEnv !== 'production' && { stack: error.stack }),
  });
});

const PORT = config.port;

// Store prisma instance for health check
app.locals.prisma = prisma;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  
  // Set up graceful shutdown
  // gracefulShutdown(server, prisma);
});

server.on('error', (error: any) => {
  console.error('Server error:', error);
  process.exit(1);
});

export { app, io };
export default server;