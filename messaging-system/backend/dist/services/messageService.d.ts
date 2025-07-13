import { Message, MessageStatus } from '@prisma/client';
export interface SendMessageData {
    content: string;
    recipients: Array<{
        phone: string;
        name?: string;
    }>;
    scheduledAt?: Date;
}
export interface BulkSendMessageData {
    content: string;
    contactIds?: string[];
    groupIds?: string[];
    scheduledAt?: Date;
}
declare class MessageService {
    sendMessage(userId: string, data: SendMessageData): Promise<Message>;
    bulkSendMessage(userId: string, data: BulkSendMessageData): Promise<Message>;
    processMessage(messageId: string): Promise<void>;
    getMessages(userId: string, page?: number, limit?: number, status?: MessageStatus): Promise<{
        messages: Message[];
        total: number;
        pages: number;
    }>;
    getMessageById(userId: string, messageId: string): Promise<Message | null>;
    cancelMessage(userId: string, messageId: string): Promise<void>;
}
export declare const messageService: MessageService;
export {};
//# sourceMappingURL=messageService.d.ts.map