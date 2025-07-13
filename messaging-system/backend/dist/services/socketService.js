"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketService = void 0;
const jwt_1 = require("../utils/jwt");
const client_1 = require("@prisma/client");
class SocketService {
    constructor() {
        this.io = null;
        this.connectedUsers = new Map();
    }
    initialize(io) {
        this.io = io;
        this.setupMiddleware();
        this.setupConnectionHandlers();
        console.log('Socket.io service initialized');
    }
    setupMiddleware() {
        if (!this.io)
            return;
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
                if (!token) {
                    return next(new Error('Authentication token required'));
                }
                const decoded = (0, jwt_1.verifyToken)(token);
                socket.userId = decoded.userId;
                socket.user = decoded;
                next();
            }
            catch (error) {
                next(new Error('Invalid authentication token'));
            }
        });
    }
    setupConnectionHandlers() {
        if (!this.io)
            return;
        this.io.on('connection', (socket) => {
            console.log(`User ${socket.userId} connected: ${socket.id}`);
            if (socket.userId) {
                this.addUserConnection(socket.userId, socket.id);
                socket.join(`user_${socket.userId}`);
                this.sendNotificationToUser(socket.userId, {
                    id: `welcome_${Date.now()}`,
                    type: 'system',
                    title: 'Connected',
                    message: 'Real-time updates are now active',
                    timestamp: new Date(),
                    read: false,
                });
            }
            socket.on('join_room', (roomId) => {
                socket.join(roomId);
                console.log(`Socket ${socket.id} joined room: ${roomId}`);
            });
            socket.on('leave_room', (roomId) => {
                socket.leave(roomId);
                console.log(`Socket ${socket.id} left room: ${roomId}`);
            });
            socket.on('mark_notification_read', async (notificationId) => {
                if (socket.userId) {
                    await this.markNotificationAsRead(socket.userId, notificationId);
                }
            });
            socket.on('subscribe_analytics', () => {
                if (socket.userId) {
                    socket.join(`analytics_${socket.userId}`);
                    console.log(`User ${socket.userId} subscribed to analytics updates`);
                }
            });
            socket.on('unsubscribe_analytics', () => {
                if (socket.userId) {
                    socket.leave(`analytics_${socket.userId}`);
                    console.log(`User ${socket.userId} unsubscribed from analytics updates`);
                }
            });
            socket.on('track_message', (messageId) => {
                if (socket.userId) {
                    socket.join(`message_${messageId}`);
                    console.log(`User ${socket.userId} tracking message: ${messageId}`);
                }
            });
            socket.on('untrack_message', (messageId) => {
                if (socket.userId) {
                    socket.leave(`message_${messageId}`);
                    console.log(`User ${socket.userId} stopped tracking message: ${messageId}`);
                }
            });
            socket.on('disconnect', () => {
                console.log(`User ${socket.userId} disconnected: ${socket.id}`);
                if (socket.userId) {
                    this.removeUserConnection(socket.userId, socket.id);
                }
            });
        });
    }
    addUserConnection(userId, socketId) {
        if (!this.connectedUsers.has(userId)) {
            this.connectedUsers.set(userId, []);
        }
        this.connectedUsers.get(userId).push(socketId);
    }
    removeUserConnection(userId, socketId) {
        const userSockets = this.connectedUsers.get(userId);
        if (userSockets) {
            const index = userSockets.indexOf(socketId);
            if (index > -1) {
                userSockets.splice(index, 1);
            }
            if (userSockets.length === 0) {
                this.connectedUsers.delete(userId);
            }
        }
    }
    isUserOnline(userId) {
        return this.connectedUsers.has(userId) && this.connectedUsers.get(userId).length > 0;
    }
    getOnlineUsersCount() {
        return this.connectedUsers.size;
    }
    async broadcastMessageUpdate(userId, updateData) {
        if (!this.io)
            return;
        const notification = {
            id: `msg_update_${updateData.messageId}_${Date.now()}`,
            type: updateData.status === client_1.MessageStatus.FAILED ? 'message_failed' : 'message_sent',
            title: 'Message Update',
            message: `Message ${updateData.status.toLowerCase()}`,
            data: updateData,
            timestamp: new Date(),
            read: false,
        };
        this.io.to(`user_${userId}`).emit('message_update', updateData);
        this.io.to(`message_${updateData.messageId}`).emit('message_update', updateData);
        this.sendNotificationToUser(userId, notification);
    }
    async broadcastRecipientUpdate(userId, updateData) {
        if (!this.io)
            return;
        this.io.to(`user_${userId}`).emit('recipient_update', updateData);
        this.io.to(`message_${updateData.messageId}`).emit('recipient_update', updateData);
        if (updateData.status === client_1.MessageRecipientStatus.DELIVERED || updateData.status === client_1.MessageRecipientStatus.FAILED) {
            const notification = {
                id: `delivery_${updateData.recipientId}_${Date.now()}`,
                type: 'delivery_update',
                title: 'Delivery Update',
                message: `Message to ${updateData.phone} ${updateData.status.toLowerCase()}`,
                data: updateData,
                timestamp: new Date(),
                read: false,
            };
            this.sendNotificationToUser(userId, notification);
        }
    }
    async sendNotificationToUser(userId, notification) {
        if (!this.io)
            return;
        try {
            this.io.to(`user_${userId}`).emit('notification', notification);
            console.log(`Notification sent to user ${userId}: ${notification.title}`);
        }
        catch (error) {
            console.error('Failed to send notification:', error);
        }
    }
    async broadcastSystemNotification(notification) {
        if (!this.io)
            return;
        const fullNotification = {
            ...notification,
            id: `system_${Date.now()}`,
            timestamp: new Date(),
        };
        this.io.emit('notification', fullNotification);
        console.log(`System notification broadcasted: ${notification.title}`);
    }
    async broadcastAnalyticsUpdate(userId, updateData) {
        if (!this.io)
            return;
        this.io.to(`analytics_${userId}`).emit('analytics_update', updateData);
        console.log(`Analytics update sent to user ${userId}: ${updateData.type}`);
    }
    async broadcastGlobalAnalytics(updateData) {
        if (!this.io)
            return;
        this.io.emit('global_analytics_update', updateData);
    }
    async markNotificationAsRead(userId, notificationId) {
        console.log(`Notification ${notificationId} marked as read by user ${userId}`);
    }
    async joinUserToRoom(userId, roomId) {
        if (!this.io)
            return;
        const userSockets = this.connectedUsers.get(userId);
        if (userSockets) {
            userSockets.forEach(socketId => {
                const socket = this.io.sockets.sockets.get(socketId);
                if (socket) {
                    socket.join(roomId);
                }
            });
        }
    }
    async removeUserFromRoom(userId, roomId) {
        if (!this.io)
            return;
        const userSockets = this.connectedUsers.get(userId);
        if (userSockets) {
            userSockets.forEach(socketId => {
                const socket = this.io.sockets.sockets.get(socketId);
                if (socket) {
                    socket.leave(roomId);
                }
            });
        }
    }
    getConnectionStats() {
        return {
            totalConnections: this.io?.sockets.sockets.size || 0,
            uniqueUsers: this.connectedUsers.size,
            userConnections: Array.from(this.connectedUsers.entries()).map(([userId, sockets]) => ({
                userId,
                socketCount: sockets.length,
            })),
        };
    }
    async pingAllClients() {
        if (!this.io)
            return;
        this.io.emit('ping', { timestamp: new Date().toISOString() });
    }
}
exports.socketService = new SocketService();
//# sourceMappingURL=socketService.js.map