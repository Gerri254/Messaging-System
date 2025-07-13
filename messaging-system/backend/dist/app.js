"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const config_1 = __importDefault(require("./config"));
require("./config/database");
require("./config/redis");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const contactRoutes_1 = __importDefault(require("./routes/contactRoutes"));
const messageRoutes_1 = __importDefault(require("./routes/messageRoutes"));
const templateRoutes_1 = __importDefault(require("./routes/templateRoutes"));
const analyticsRoutes_1 = __importDefault(require("./routes/analyticsRoutes"));
const socketRoutes_1 = __importDefault(require("./routes/socketRoutes"));
const socketService_1 = require("./services/socketService");
const performance_1 = require("./middleware/performance");
const database_1 = require("./config/database");
const security_1 = require("./middleware/security");
const performance_2 = require("./middleware/performance");
const app = (0, express_1.default)();
exports.app = app;
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: config_1.default.frontendUrl,
        credentials: true,
    },
});
exports.io = io;
app.use(security_1.securityHeaders);
app.use((0, cors_1.default)(security_1.corsOptions));
app.use(security_1.requestSizeLimit);
app.use(security_1.sanitizeInput);
app.use(security_1.securityLogger);
app.use(performance_2.requestTiming);
app.use(performance_2.responseCompression);
app.use(performance_2.memoryMonitor);
app.use(performance_2.requestDeduplication);
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.get('/health', performance_2.healthCheck);
app.use('/api/auth', security_1.authRateLimit);
app.use('/api/messages/send', security_1.smsRateLimit);
app.use('/api', security_1.apiRateLimit);
app.get('/api', (req, res) => {
    res.json({
        message: 'Messaging System API',
        version: '1.0.0',
        status: 'running',
    });
});
app.use('/api/auth', authRoutes_1.default);
app.use('/api/contacts', contactRoutes_1.default);
app.use('/api/messages', messageRoutes_1.default);
app.use('/api/templates', templateRoutes_1.default);
app.use('/api/analytics', analyticsRoutes_1.default);
app.use('/api/socket', socketRoutes_1.default);
socketService_1.socketService.initialize(io);
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`,
    });
});
app.use((error, req, res, next) => {
    console.error('Error:', error);
    const statusCode = error.statusCode || 500;
    const message = config_1.default.nodeEnv === 'production' ? 'Internal server error' : error.message;
    res.status(statusCode).json({
        error: message,
        ...(config_1.default.nodeEnv !== 'production' && { stack: error.stack }),
    });
});
const PORT = config_1.default.port;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${config_1.default.nodeEnv}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    (0, performance_1.gracefulShutdown)(server, database_1.prisma);
});
app.locals.prisma = database_1.prisma;
exports.default = server;
//# sourceMappingURL=app.js.map