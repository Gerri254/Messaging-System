export interface SMSRecipient {
    phone: string;
    name?: string;
    messageId?: string;
}
export interface SMSResult {
    success: boolean;
    messageId?: string;
    error?: string;
    cost?: number;
}
export interface BulkSMSResult {
    totalSent: number;
    totalFailed: number;
    results: Array<{
        phone: string;
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
    totalCost: number;
}
declare class SMSService {
    private client;
    private fromNumber;
    private isConfigured;
    constructor();
    private checkRateLimit;
    private formatPhoneNumber;
    private calculateCost;
    sendSMS(to: string, message: string, messageId?: string): Promise<SMSResult>;
    sendBulkSMS(recipients: SMSRecipient[], message: string, batchSize?: number): Promise<BulkSMSResult>;
    private updateRecipientStatus;
    getDeliveryStatus(twilioSid: string): Promise<{
        status: string;
        errorCode?: string;
    }>;
    validatePhoneNumber(phone: string): {
        valid: boolean;
        formatted?: string;
        error?: string;
    };
    getUsageStats(phoneNumber?: string): Promise<{
        messagesThisHour: number;
        remainingMessages: number;
        resetTime: Date;
    }>;
}
export declare const smsService: SMSService;
export {};
//# sourceMappingURL=smsService.d.ts.map