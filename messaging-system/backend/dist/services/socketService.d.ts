import { Server, Socket } from 'socket.io';
import { JwtPayload } from '../utils/jwt';
import { MessageStatus, MessageRecipientStatus } from '@prisma/client';
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
declare class SocketService {
    private io;
    private connectedUsers;
    initialize(io: Server): void;
    private setupMiddleware;
    private setupConnectionHandlers;
    private addUserConnection;
    private removeUserConnection;
    isUserOnline(userId: string): boolean;
    getOnlineUsersCount(): number;
    broadcastMessageUpdate(userId: string, updateData: MessageUpdateData): Promise<void>;
    broadcastRecipientUpdate(userId: string, updateData: RecipientUpdateData): Promise<void>;
    sendNotificationToUser(userId: string, notification: NotificationData): Promise<void>;
    broadcastSystemNotification(notification: Omit<NotificationData, 'id' | 'timestamp'>): Promise<void>;
    broadcastAnalyticsUpdate(userId: string, updateData: AnalyticsUpdateData): Promise<void>;
    broadcastGlobalAnalytics(updateData: AnalyticsUpdateData): Promise<void>;
    private markNotificationAsRead;
    joinUserToRoom(userId: string, roomId: string): Promise<void>;
    removeUserFromRoom(userId: string, roomId: string): Promise<void>;
    getConnectionStats(): {
        totalConnections: number;
        uniqueUsers: number;
        userConnections: {
            userId: string;
            socketCount: number;
        }[];
    };
    pingAllClients(): Promise<void>;
}
export declare const socketService: SocketService;
export {};
//# sourceMappingURL=socketService.d.ts.map