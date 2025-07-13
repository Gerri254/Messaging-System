import { Twilio } from 'twilio';
import { MessageStatus, MessageRecipientStatus } from '@prisma/client';
import config from '../config';
import prisma from '../config/database';
import { redis } from '../config/redis';
import { socketService } from './socketService';

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

class SMSService {
  private client: Twilio | null = null;
  private fromNumber: string = '';
  private isConfigured: boolean = false;

  constructor() {
    if (config.twilio.accountSid && config.twilio.authToken && config.twilio.phoneNumber) {
      this.client = new Twilio(config.twilio.accountSid, config.twilio.authToken);
      this.fromNumber = config.twilio.phoneNumber;
      this.isConfigured = true;
    } else {
      console.warn('Twilio not configured. SMS sending will be simulated.');
      this.isConfigured = false;
    }
  }

  /**
   * Check if we can send SMS to a phone number (rate limiting)
   */
  private async checkRateLimit(phone: string): Promise<{ allowed: boolean; resetTime?: number }> {
    const key = `sms_rate_limit:${phone}`;
    const current = await redis.get(key);
    
    if (!current) {
      // First message, set rate limit
      await redis.setex(key, 3600, '1'); // 1 message per hour limit
      return { allowed: true };
    }

    const count = parseInt(current);
    const maxMessages = 10; // Max 10 messages per hour per phone number
    
    if (count >= maxMessages) {
      const ttl = await redis.ttl(key);
      return { 
        allowed: false, 
        resetTime: Date.now() + (ttl * 1000) 
      };
    }

    await redis.incr(key);
    return { allowed: true };
  }

  /**
   * Validate and format phone number
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters except +
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    // If it doesn't start with +, assume it's a US number
    if (!cleaned.startsWith('+')) {
      if (cleaned.length === 10) {
        cleaned = '+1' + cleaned;
      } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
        cleaned = '+' + cleaned;
      }
    }
    
    return cleaned;
  }

  /**
   * Calculate estimated cost for SMS
   */
  private calculateCost(phoneNumber: string, messageLength: number): number {
    // Basic cost calculation (simplified)
    const basePrice = 0.0075; // $0.0075 per SMS segment
    const segments = Math.ceil(messageLength / 160);
    
    // International numbers cost more
    const isInternational = !phoneNumber.startsWith('+1');
    const multiplier = isInternational ? 2.5 : 1;
    
    return basePrice * segments * multiplier;
  }

  /**
   * Send a single SMS
   */
  async sendSMS(to: string, message: string, messageId?: string): Promise<SMSResult> {
    try {
      const formattedPhone = this.formatPhoneNumber(to);
      
      // Check rate limiting
      const rateCheck = await this.checkRateLimit(formattedPhone);
      if (!rateCheck.allowed) {
        return {
          success: false,
          error: `Rate limit exceeded. Try again after ${new Date(rateCheck.resetTime!).toLocaleString()}`,
        };
      }

      const estimatedCost = this.calculateCost(formattedPhone, message.length);

      if (!this.isConfigured) {
        // Simulate SMS sending for development
        console.log(`[SIMULATED SMS] To: ${formattedPhone}, Message: ${message}`);
        
        // Simulate random failures (10% failure rate)
        const success = Math.random() > 0.1;
        
        if (success) {
          // Update message recipient status in database
          if (messageId) {
            await this.updateRecipientStatus(messageId, formattedPhone, MessageRecipientStatus.DELIVERED);
          }
          
          return {
            success: true,
            messageId: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            cost: estimatedCost,
          };
        } else {
          if (messageId) {
            await this.updateRecipientStatus(messageId, formattedPhone, MessageRecipientStatus.FAILED, 'Simulated delivery failure');
          }
          
          return {
            success: false,
            error: 'Simulated delivery failure',
          };
        }
      }

      // Send actual SMS via Twilio
      if (!this.client) {
        throw new Error('Twilio client not initialized');
      }
      
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: formattedPhone,
      });

      // Update message recipient status
      if (messageId) {
        await this.updateRecipientStatus(messageId, formattedPhone, MessageRecipientStatus.SENT);
      }

      return {
        success: true,
        messageId: result.sid,
        cost: estimatedCost,
      };

    } catch (error: any) {
      console.error('SMS sending error:', error);
      
      // Update message recipient status to failed
      if (messageId) {
        await this.updateRecipientStatus(messageId, to, MessageRecipientStatus.FAILED, error.message || 'Failed to send SMS');
      }

      return {
        success: false,
        error: error.message || 'Failed to send SMS',
      };
    }
  }

  /**
   * Send bulk SMS to multiple recipients
   */
  async sendBulkSMS(recipients: SMSRecipient[], message: string, batchSize: number = 10): Promise<BulkSMSResult> {
    const results: BulkSMSResult['results'] = [];
    let totalCost = 0;
    let totalSent = 0;
    let totalFailed = 0;

    // Process recipients in batches to avoid overwhelming the API
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      // Process batch concurrently
      const batchPromises = batch.map(async (recipient) => {
        const result = await this.sendSMS(recipient.phone, message, recipient.messageId);
        
        if (result.success) {
          totalSent++;
          totalCost += result.cost || 0;
        } else {
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

      // Add delay between batches to respect rate limits
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

  /**
   * Update message recipient status in database
   */
  private async updateRecipientStatus(messageId: string, phoneNumber: string, status: MessageRecipientStatus, errorMessage?: string): Promise<void> {
    try {
      // Get the message to access userId for real-time updates
      const message = await prisma.message.findUnique({
        where: { id: messageId },
        select: { userId: true },
      });

      if (!message) {
        console.error('Message not found for status update');
        return;
      }

      // Update recipient status
      const updatedRecipients = await prisma.messageRecipient.updateMany({
        where: {
          messageId,
          phone: phoneNumber,
        },
        data: {
          status,
          deliveredAt: status === MessageRecipientStatus.DELIVERED ? new Date() : undefined,
          sentAt: status === MessageRecipientStatus.SENT ? new Date() : undefined,
          errorMessage: errorMessage || undefined,
        },
      });

      // Get the updated recipient for broadcasting
      const recipient = await prisma.messageRecipient.findFirst({
        where: {
          messageId,
          phone: phoneNumber,
        },
      });

      if (recipient) {
        // Broadcast recipient status update
        await socketService.broadcastRecipientUpdate(message.userId, {
          messageId,
          recipientId: recipient.id,
          phone: phoneNumber,
          status,
          errorMessage,
        });
      }
    } catch (error) {
      console.error('Failed to update recipient status:', error);
    }
  }

  /**
   * Get SMS delivery status from Twilio
   */
  async getDeliveryStatus(twilioSid: string): Promise<{ status: string; errorCode?: string }> {
    if (!this.isConfigured || !this.client) {
      return { status: 'delivered' };
    }

    try {
      const message = await this.client.messages(twilioSid).fetch();
      return {
        status: message.status,
        errorCode: message.errorCode?.toString() || undefined,
      };
    } catch (error: any) {
      console.error('Failed to get delivery status:', error);
      return { status: 'unknown', errorCode: error.message };
    }
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phone: string): { valid: boolean; formatted?: string; error?: string } {
    try {
      const formatted = this.formatPhoneNumber(phone);
      
      // Basic validation
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
    } catch (error: any) {
      return { valid: false, error: error.message };
    }
  }

  /**
   * Get SMS usage statistics for rate limiting info
   */
  async getUsageStats(phoneNumber?: string): Promise<{
    messagesThisHour: number;
    remainingMessages: number;
    resetTime: Date;
  }> {
    const key = phoneNumber ? `sms_rate_limit:${phoneNumber}` : 'sms_global_rate_limit';
    const current = await redis.get(key);
    const ttl = await redis.ttl(key);
    
    const messagesThisHour = current ? parseInt(current) : 0;
    const maxMessages = phoneNumber ? 10 : 1000; // Global limit vs per-phone limit
    
    return {
      messagesThisHour,
      remainingMessages: Math.max(0, maxMessages - messagesThisHour),
      resetTime: new Date(Date.now() + (ttl * 1000)),
    };
  }
}

export const smsService = new SMSService();