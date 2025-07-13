"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.smsService = void 0;
const twilio_1 = require("twilio");
const client_1 = require("@prisma/client");
const config_1 = __importDefault(require("../config"));
const database_1 = __importDefault(require("../config/database"));
const redis_1 = require("../config/redis");
const socketService_1 = require("./socketService");
class SMSService {
    constructor() {
        this.client = null;
        this.fromNumber = '';
        this.isConfigured = false;
        if (config_1.default.twilio.accountSid && config_1.default.twilio.authToken && config_1.default.twilio.phoneNumber) {
            this.client = new twilio_1.Twilio(config_1.default.twilio.accountSid, config_1.default.twilio.authToken);
            this.fromNumber = config_1.default.twilio.phoneNumber;
            this.isConfigured = true;
        }
        else {
            console.warn('Twilio not configured. SMS sending will be simulated.');
            this.isConfigured = false;
        }
    }
    async checkRateLimit(phone) {
        const key = `sms_rate_limit:${phone}`;
        const current = await redis_1.redis.get(key);
        if (!current) {
            await redis_1.redis.setex(key, 3600, '1');
            return { allowed: true };
        }
        const count = parseInt(current);
        const maxMessages = 10;
        if (count >= maxMessages) {
            const ttl = await redis_1.redis.ttl(key);
            return {
                allowed: false,
                resetTime: Date.now() + (ttl * 1000)
            };
        }
        await redis_1.redis.incr(key);
        return { allowed: true };
    }
    formatPhoneNumber(phone) {
        let cleaned = phone.replace(/[^\d+]/g, '');
        if (!cleaned.startsWith('+')) {
            if (cleaned.length === 10) {
                cleaned = '+1' + cleaned;
            }
            else if (cleaned.length === 11 && cleaned.startsWith('1')) {
                cleaned = '+' + cleaned;
            }
        }
        return cleaned;
    }
    calculateCost(phoneNumber, messageLength) {
        const basePrice = 0.0075;
        const segments = Math.ceil(messageLength / 160);
        const isInternational = !phoneNumber.startsWith('+1');
        const multiplier = isInternational ? 2.5 : 1;
        return basePrice * segments * multiplier;
    }
    async sendSMS(to, message, messageId) {
        try {
            const formattedPhone = this.formatPhoneNumber(to);
            const rateCheck = await this.checkRateLimit(formattedPhone);
            if (!rateCheck.allowed) {
                return {
                    success: false,
                    error: `Rate limit exceeded. Try again after ${new Date(rateCheck.resetTime).toLocaleString()}`,
                };
            }
            const estimatedCost = this.calculateCost(formattedPhone, message.length);
            if (!this.isConfigured) {
                console.log(`[SIMULATED SMS] To: ${formattedPhone}, Message: ${message}`);
                const success = Math.random() > 0.1;
                if (success) {
                    if (messageId) {
                        await this.updateRecipientStatus(messageId, formattedPhone, client_1.MessageRecipientStatus.DELIVERED);
                    }
                    return {
                        success: true,
                        messageId: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        cost: estimatedCost,
                    };
                }
                else {
                    if (messageId) {
                        await this.updateRecipientStatus(messageId, formattedPhone, client_1.MessageRecipientStatus.FAILED, 'Simulated delivery failure');
                    }
                    return {
                        success: false,
                        error: 'Simulated delivery failure',
                    };
                }
            }
            if (!this.client) {
                throw new Error('Twilio client not initialized');
            }
            const result = await this.client.messages.create({
                body: message,
                from: this.fromNumber,
                to: formattedPhone,
            });
            if (messageId) {
                await this.updateRecipientStatus(messageId, formattedPhone, client_1.MessageRecipientStatus.SENT);
            }
            return {
                success: true,
                messageId: result.sid,
                cost: estimatedCost,
            };
        }
        catch (error) {
            console.error('SMS sending error:', error);
            if (messageId) {
                await this.updateRecipientStatus(messageId, to, client_1.MessageRecipientStatus.FAILED, error.message || 'Failed to send SMS');
            }
            return {
                success: false,
                error: error.message || 'Failed to send SMS',
            };
        }
    }
    async sendBulkSMS(recipients, message, batchSize = 10) {
        const results = [];
        let totalCost = 0;
        let totalSent = 0;
        let totalFailed = 0;
        for (let i = 0; i < recipients.length; i += batchSize) {
            const batch = recipients.slice(i, i + batchSize);
            const batchPromises = batch.map(async (recipient) => {
                const result = await this.sendSMS(recipient.phone, message, recipient.messageId);
                if (result.success) {
                    totalSent++;
                    totalCost += result.cost || 0;
                }
                else {
                    totalFailed++;
                }
                return {
                    phone: recipient.phone,
                    success: result.success,
                    messageId: result.messageId,
                    error: result.error,
                };
            });
            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);
            if (i + batchSize < recipients.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        return {
            totalSent,
            totalFailed,
            results,
            totalCost,
        };
    }
    async updateRecipientStatus(messageId, phoneNumber, status, errorMessage) {
        try {
            const message = await database_1.default.message.findUnique({
                where: { id: messageId },
                select: { userId: true },
            });
            if (!message) {
                console.error('Message not found for status update');
                return;
            }
            const updatedRecipients = await database_1.default.messageRecipient.updateMany({
                where: {
                    messageId,
                    phone: phoneNumber,
                },
                data: {
                    status,
                    deliveredAt: status === client_1.MessageRecipientStatus.DELIVERED ? new Date() : undefined,
                    sentAt: status === client_1.MessageRecipientStatus.SENT ? new Date() : undefined,
                    errorMessage: errorMessage || undefined,
                },
            });
            const recipient = await database_1.default.messageRecipient.findFirst({
                where: {
                    messageId,
                    phone: phoneNumber,
                },
            });
            if (recipient) {
                await socketService_1.socketService.broadcastRecipientUpdate(message.userId, {
                    messageId,
                    recipientId: recipient.id,
                    phone: phoneNumber,
                    status,
                    errorMessage,
                });
            }
        }
        catch (error) {
            console.error('Failed to update recipient status:', error);
        }
    }
    async getDeliveryStatus(twilioSid) {
        if (!this.isConfigured || !this.client) {
            return { status: 'delivered' };
        }
        try {
            const message = await this.client.messages(twilioSid).fetch();
            return {
                status: message.status,
                errorCode: message.errorCode?.toString() || undefined,
            };
        }
        catch (error) {
            console.error('Failed to get delivery status:', error);
            return { status: 'unknown', errorCode: error.message };
        }
    }
    validatePhoneNumber(phone) {
        try {
            const formatted = this.formatPhoneNumber(phone);
            if (formatted.length < 10) {
                return { valid: false, error: 'Phone number too short' };
            }
            if (formatted.length > 15) {
                return { valid: false, error: 'Phone number too long' };
            }
            if (!formatted.startsWith('+')) {
                return { valid: false, error: 'Phone number must include country code' };
            }
            return { valid: true, formatted };
        }
        catch (error) {
            return { valid: false, error: error.message };
        }
    }
    async getUsageStats(phoneNumber) {
        const key = phoneNumber ? `sms_rate_limit:${phoneNumber}` : 'sms_global_rate_limit';
        const current = await redis_1.redis.get(key);
        const ttl = await redis_1.redis.ttl(key);
        const messagesThisHour = current ? parseInt(current) : 0;
        const maxMessages = phoneNumber ? 10 : 1000;
        return {
            messagesThisHour,
            remainingMessages: Math.max(0, maxMessages - messagesThisHour),
            resetTime: new Date(Date.now() + (ttl * 1000)),
        };
    }
}
exports.smsService = new SMSService();
//# sourceMappingURL=smsService.js.map