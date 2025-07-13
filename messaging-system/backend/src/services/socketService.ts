import { Server, Socket } from 'socket.io';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { MessageStatus, MessageRecipientStatus } from '@prisma/client';
import prisma from '../config/database';

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: JwtPayload;
}

export interface MessageUpdateData {
  messageId: string;
  status: MessageStatus;
  successCount?: number;
  failedCount?: number;
  cost?: number;
}

export interface RecipientUpdateData {
  messageId: string;
  recipientId: string;
  phone: string;
  status: MessageRecipientStatus;
  errorMessage?: string;
}

export interface NotificationData {
  id: string;
  type: 'message_sent' | 'message_failed' | 'delivery_update' | 'system' | 'warning';
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
  read: boolean;
}

export interface AnalyticsUpdateData {
  type: 'dashboard_stats' | 'message_stats' | 'usage_stats';
  data: any;
}

class SocketService {
  private io: Server | null = null;
  private connectedUsers = new Map<string, string[]>(); // userId -> socketIds[]

  initialize(io: Server) {
    this.io = io;
    this.setupMiddleware();
    this.setupConnectionHandlers();
    console.log('Socket.io service initialized');
  }

  private setupMiddleware() {
    if (!this.io) return;

    // Authentication middleware
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = verifyToken(token);
        socket.userId = decoded.userId;
        socket.user = decoded;
        
        next();
      } catch (error) {
        next(new Error('Invalid authentication token'));
      }
    });
  }

  private setupConnectionHandlers() {
    if (!this.io) return;

    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`User ${socket.userId} connected: ${socket.id}`);
      
      if (socket.userId) {
        this.addUserConnection(socket.userId, socket.id);
        
        // Join user to their personal room
        socket.join(`user_${socket.userId}`);
        
        // Send welcome notification
        this.sendNotificationToUser(socket.userId, {
          id: `welcome_${Date.now()}`,
          type: 'system',
          title: 'Connected',
          message: 'Real-time updates are now active',
          timestamp: new Date(),
          read: false,
        });
      }

      // Handle joining specific rooms
      socket.on('join_room', (roomId: string) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room: ${roomId}`);
      });

      // Handle leaving rooms
      socket.on('leave_room', (roomId: string) => {
        socket.leave(roomId);
        console.log(`Socket ${socket.id} left room: ${roomId}`);
      });

      // Handle marking notifications as read
      socket.on('mark_notification_read', async (notificationId: string) => {
        if (socket.userId) {
          await this.markNotificationAsRead(socket.userId, notificationId);
        }
      });

      // Handle requesting real-time analytics
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

      // Handle real-time message tracking
      socket.on('track_message', (messageId: string) => {
        if (socket.userId) {
          socket.join(`message_${messageId}`);
          console.log(`User ${socket.userId} tracking message: ${messageId}`);
        }
      });

      socket.on('untrack_message', (messageId: string) => {
        if (socket.userId) {
          socket.leave(`message_${messageId}`);
          console.log(`User ${socket.userId} stopped tracking message: ${messageId}`);
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`User ${socket.userId} disconnected: ${socket.id}`);
        if (socket.userId) {
          this.removeUserConnection(socket.userId, socket.id);
        }
      });
    });
  }

  // User connection management
  private addUserConnection(userId: string, socketId: string) {
    if (!this.connectedUsers.has(userId)) {
      this.connectedUsers.set(userId, []);
    }
    this.connectedUsers.get(userId)!.push(socketId);
  }

  private removeUserConnection(userId: string, socketId: string) {
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

  // Check if user is online
  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId) && this.connectedUsers.get(userId)!.length > 0;
  }

  // Get online users count
  getOnlineUsersCount(): number {
    return this.connectedUsers.size;
  }

  // Message status updates
  async broadcastMessageUpdate(userId: string, updateData: MessageUpdateData) {
    if (!this.io) return;

    const notification: NotificationData = {
      id: `msg_update_${updateData.messageId}_${Date.now()}`,
      type: updateData.status === MessageStatus.FAILED ? 'message_failed' : 'message_sent',
      title: 'Message Update',
      message: `Message ${updateData.status.toLowerCase()}`,
      data: updateData,
      timestamp: new Date(),
      read: false,
    };

    // Send to user's personal room
    this.io.to(`user_${userId}`).emit('message_update', updateData);
    
    // Send to message tracking room
    this.io.to(`message_${updateData.messageId}`).emit('message_update', updateData);
    
    // Send notification
    this.sendNotificationToUser(userId, notification);
  }

  async broadcastRecipientUpdate(userId: string, updateData: RecipientUpdateData) {
    if (!this.io) return;

    // Send to user's personal room
    this.io.to(`user_${userId}`).emit('recipient_update', updateData);
    
    // Send to message tracking room
    this.io.to(`message_${updateData.messageId}`).emit('recipient_update', updateData);

    // Send delivery notification for important status changes
    if (updateData.status === MessageRecipientStatus.DELIVERED || updateData.status === MessageRecipientStatus.FAILED) {
      const notification: NotificationData = {
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

  // Notifications
  async sendNotificationToUser(userId: string, notification: NotificationData) {
    if (!this.io) return;

    // Store notification in database (optional - for persistence)
    try {
      // For now, just send real-time notification
      // Later you could store in a notifications table
      
      this.io.to(`user_${userId}`).emit('notification', notification);
      console.log(`Notification sent to user ${userId}: ${notification.title}`);
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  async broadcastSystemNotification(notification: Omit<NotificationData, 'id' | 'timestamp'>) {
    if (!this.io) return;

    const fullNotification: NotificationData = {
      ...notification,
      id: `system_${Date.now()}`,
      timestamp: new Date(),
    };

    this.io.emit('notification', fullNotification);
    console.log(`System notification broadcasted: ${notification.title}`);
  }

  // Analytics updates
  async broadcastAnalyticsUpdate(userId: string, updateData: AnalyticsUpdateData) {
    if (!this.io) return;

    this.io.to(`analytics_${userId}`).emit('analytics_update', updateData);
    console.log(`Analytics update sent to user ${userId}: ${updateData.type}`);
  }

  async broadcastGlobalAnalytics(updateData: AnalyticsUpdateData) {
    if (!this.io) return;

    this.io.emit('global_analytics_update', updateData);
  }

  // Utility methods
  private async markNotificationAsRead(userId: string, notificationId: string) {
    // This would update the notification in the database
    // For now, just acknowledge the read status
    console.log(`Notification ${notificationId} marked as read by user ${userId}`);
  }

  // Room management
  async joinUserToRoom(userId: string, roomId: string) {
    if (!this.io) return;

    const userSockets = this.connectedUsers.get(userId);
    if (userSockets) {
      userSockets.forEach(socketId => {
        const socket = this.io!.sockets.sockets.get(socketId);
        if (socket) {
          socket.join(roomId);
        }
      });
    }
  }

  async removeUserFromRoom(userId: string, roomId: string) {
    if (!this.io) return;

    const userSockets = this.connectedUsers.get(userId);
    if (userSockets) {
      userSockets.forEach(socketId => {
        const socket = this.io!.sockets.sockets.get(socketId);
        if (socket) {
          socket.leave(roomId);
        }
      });
    }
  }

  // Health check and stats
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

  // Send ping to all connected clients for health check
  async pingAllClients() {
    if (!this.io) return;

    this.io.emit('ping', { timestamp: new Date().toISOString() });
  }
}

export const socketService = new SocketService();