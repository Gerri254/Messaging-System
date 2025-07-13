"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageService = void 0;
const client_1 = require("@prisma/client");
const database_1 = __importDefault(require("../config/database"));
const smsService_1 = require("./smsService");
const socketService_1 = require("./socketService");
const analyticsService_1 = require("./analyticsService");
class MessageService {
    async sendMessage(userId, data) {
        const message = await database_1.default.message.create({
            data: {
                userId,
                content: data.content,
                messageType: 'SMS',
                status: data.scheduledAt ? client_1.MessageStatus.SCHEDULED : client_1.MessageStatus.DRAFT,
                scheduledAt: data.scheduledAt,
                totalRecipients: data.recipients.length,
            },
        });
        const recipients = data.recipients.map(recipient => ({
            messageId: message.id,
            phone: recipient.phone,
            name: recipient.name,
            status: client_1.MessageRecipientStatus.PENDING,
        }));
        await database_1.default.messageRecipient.createMany({
            data: recipients,
        });
        if (!data.scheduledAt) {
            await this.processMessage(message.id);
        }
        return message;
    }
    async bulkSendMessage(userId, data) {
        let recipients = [];
        if (data.contactIds?.length) {
            const contacts = await database_1.default.contact.findMany({
                where: {
                    id: { in: data.contactIds },
                    userId,
                },
                select: {
                    id: true,
                    name: true,
                    phone: true,
                },
            });
            recipients.push(...contacts.map(contact => ({
                phone: contact.phone,
                name: contact.name,
                contactId: contact.id,
            })));
        }
        if (data.groupIds?.length) {
            const groupContacts = await database_1.default.contactGroupContact.findMany({
                where: {
                    contactGroupId: { in: data.groupIds },
                    contactGroup: { userId },
                },
                include: {
                    contact: {
                        select: {
                            id: true,
                            name: true,
                            phone: true,
                        },
                    },
                },
            });
            recipients.push(...groupContacts.map(gc => ({
                phone: gc.contact.phone,
                name: gc.contact.name,
                contactId: gc.contact.id,
            })));
        }
        const uniqueRecipients = recipients.filter((recipient, index, self) => index === self.findIndex(r => r.phone === recipient.phone));
        const message = await database_1.default.message.create({
            data: {
                userId,
                content: data.content,
                messageType: 'SMS',
                status: data.scheduledAt ? client_1.MessageStatus.SCHEDULED : client_1.MessageStatus.DRAFT,
                scheduledAt: data.scheduledAt,
                totalRecipients: uniqueRecipients.length,
            },
        });
        const messageRecipients = uniqueRecipients.map(recipient => ({
            messageId: message.id,
            contactId: recipient.contactId,
            phone: recipient.phone,
            name: recipient.name,
            status: client_1.MessageRecipientStatus.PENDING,
        }));
        await database_1.default.messageRecipient.createMany({
            data: messageRecipients,
        });
        if (!data.scheduledAt) {
            await this.processMessage(message.id);
        }
        return message;
    }
    async processMessage(messageId) {
        const message = await database_1.default.message.findUnique({
            where: { id: messageId },
            include: { recipients: true },
        });
        if (!message) {
            throw new Error('Message not found');
        }
        await database_1.default.message.update({
            where: { id: messageId },
            data: { status: client_1.MessageStatus.SENDING },
        });
        await socketService_1.socketService.broadcastMessageUpdate(message.userId, {
            messageId,
            status: client_1.MessageStatus.SENDING,
        });
        const messageWithRecipients = await database_1.default.message.findUnique({
            where: { id: messageId },
            include: {
                recipients: true,
            },
        });
        if (!messageWithRecipients) {
            throw new Error('Message not found');
        }
        const smsRecipients = messageWithRecipients.recipients.map(recipient => ({
            phone: recipient.phone,
            name: recipient.name || undefined,
            messageId: messageId,
        }));
        const bulkResult = await smsService_1.smsService.sendBulkSMS(smsRecipients, messageWithRecipients.content);
        let successCount = bulkResult.totalSent;
        let failedCount = bulkResult.totalFailed;
        let totalCost = bulkResult.totalCost;
        const finalStatus = failedCount === 0 ? client_1.MessageStatus.SENT : client_1.MessageStatus.FAILED;
        await database_1.default.message.update({
            where: { id: messageId },
            data: {
                status: finalStatus,
                sentAt: new Date(),
                successCount,
                failedCount,
                cost: totalCost,
            },
        });
        await socketService_1.socketService.broadcastMessageUpdate(message.userId, {
            messageId,
            status: finalStatus,
            successCount,
            failedCount,
            cost: totalCost,
        });
        await analyticsService_1.analyticsService.getDashboardStats(message.userId, true);
    }
    async getMessages(userId, page = 1, limit = 20, status) {
        const skip = (page - 1) * limit;
        const where = {
            userId,
            ...(status && { status }),
        };
        const [messages, total] = await Promise.all([
            database_1.default.message.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: {
                            recipients: true,
                        },
                    },
                },
            }),
            database_1.default.message.count({ where }),
        ]);
        return {
            messages,
            total,
            pages: Math.ceil(total / limit),
        };
    }
    async getMessageById(userId, messageId) {
        return database_1.default.message.findFirst({
            where: {
                id: messageId,
                userId,
            },
            include: {
                recipients: true,
                template: true,
            },
        });
    }
    async cancelMessage(userId, messageId) {
        const message = await database_1.default.message.findFirst({
            where: {
                id: messageId,
                userId,
                status: client_1.MessageStatus.SCHEDULED,
            },
        });
        if (!message) {
            throw new Error('Message not found or cannot be cancelled');
        }
        await database_1.default.message.update({
            where: { id: messageId },
            data: { status: client_1.MessageStatus.CANCELLED },
        });
    }
}
exports.messageService = new MessageService();
//# sourceMappingURL=messageService.js.map