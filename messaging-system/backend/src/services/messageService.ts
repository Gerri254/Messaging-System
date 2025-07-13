import { Message, MessageStatus, MessageRecipientStatus } from '@prisma/client';
import prisma from '../config/database';
import { smsService, SMSRecipient } from './smsService';
import { socketService } from './socketService';
import { analyticsService } from './analyticsService';

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

class MessageService {
  async sendMessage(userId: string, data: SendMessageData): Promise<Message> {
    const message = await prisma.message.create({
      data: {
        userId,
        content: data.content,
        messageType: 'SMS',
        status: data.scheduledAt ? MessageStatus.SCHEDULED : MessageStatus.DRAFT,
        scheduledAt: data.scheduledAt,
        totalRecipients: data.recipients.length,
      },
    });

    // Create message recipients
    const recipients = data.recipients.map(recipient => ({
      messageId: message.id,
      phone: recipient.phone,
      name: recipient.name,
      status: MessageRecipientStatus.PENDING,
    }));

    await prisma.messageRecipient.createMany({
      data: recipients,
    });

    // TODO: Integration with Twilio for actual SMS sending
    // For now, just mark as sent for demo purposes
    if (!data.scheduledAt) {
      await this.processMessage(message.id);
    }

    return message;
  }

  async bulkSendMessage(userId: string, data: BulkSendMessageData): Promise<Message> {
    let recipients: Array<{ phone: string; name?: string; contactId?: string }> = [];

    // Get recipients from contact IDs
    if (data.contactIds?.length) {
      const contacts = await prisma.contact.findMany({
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

    // Get recipients from group IDs
    if (data.groupIds?.length) {
      const groupContacts = await prisma.contactGroupContact.findMany({
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

    // Remove duplicates based on phone number
    const uniqueRecipients = recipients.filter((recipient, index, self) =>
      index === self.findIndex(r => r.phone === recipient.phone)
    );

    const message = await prisma.message.create({
      data: {
        userId,
        content: data.content,
        messageType: 'SMS',
        status: data.scheduledAt ? MessageStatus.SCHEDULED : MessageStatus.DRAFT,
        scheduledAt: data.scheduledAt,
        totalRecipients: uniqueRecipients.length,
      },
    });

    // Create message recipients
    const messageRecipients = uniqueRecipients.map(recipient => ({
      messageId: message.id,
      contactId: recipient.contactId,
      phone: recipient.phone,
      name: recipient.name,
      status: MessageRecipientStatus.PENDING,
    }));

    await prisma.messageRecipient.createMany({
      data: messageRecipients,
    });

    // TODO: Integration with Twilio for actual SMS sending
    if (!data.scheduledAt) {
      await this.processMessage(message.id);
    }

    return message;
  }

  async processMessage(messageId: string): Promise<void> {
    // Get message to access userId for real-time updates
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { recipients: true },
    });

    if (!message) {
      throw new Error('Message not found');
    }

    // Update message status to sending
    await prisma.message.update({
      where: { id: messageId },
      data: { status: MessageStatus.SENDING },
    });

    // Broadcast message status update
    await socketService.broadcastMessageUpdate(message.userId, {
      messageId,
      status: MessageStatus.SENDING,
    });

    // Get message and recipients for SMS sending
    const messageWithRecipients = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        recipients: true,
      },
    });

    if (!messageWithRecipients) {
      throw new Error('Message not found');
    }

    // Prepare recipients for bulk SMS
    const smsRecipients: SMSRecipient[] = messageWithRecipients.recipients.map(recipient => ({
      phone: recipient.phone,
      name: recipient.name || undefined,
      messageId: messageId,
    }));

    // Send bulk SMS via SMS service
    const bulkResult = await smsService.sendBulkSMS(smsRecipients, messageWithRecipients.content);

    let successCount = bulkResult.totalSent;
    let failedCount = bulkResult.totalFailed;
    let totalCost = bulkResult.totalCost;

    const finalStatus = failedCount === 0 ? MessageStatus.SENT : MessageStatus.FAILED;

    // Update message with final status and cost
    await prisma.message.update({
      where: { id: messageId },
      data: {
        status: finalStatus,
        sentAt: new Date(),
        successCount,
        failedCount,
        cost: totalCost,
      },
    });

    // Broadcast final message status update
    await socketService.broadcastMessageUpdate(message.userId, {
      messageId,
      status: finalStatus,
      successCount,
      failedCount,
      cost: totalCost,
    });

    // Update analytics for real-time dashboard
    await analyticsService.getDashboardStats(message.userId, true);
  }

  async getMessages(userId: string, page = 1, limit = 20, status?: MessageStatus): Promise<{
    messages: Message[];
    total: number;
    pages: number;
  }> {
    const skip = (page - 1) * limit;
    
    const where = {
      userId,
      ...(status && { status }),
    };

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
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
      prisma.message.count({ where }),
    ]);

    return {
      messages,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  async getMessageById(userId: string, messageId: string): Promise<Message | null> {
    return prisma.message.findFirst({
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

  async cancelMessage(userId: string, messageId: string): Promise<void> {
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        userId,
        status: MessageStatus.SCHEDULED,
      },
    });

    if (!message) {
      throw new Error('Message not found or cannot be cancelled');
    }

    await prisma.message.update({
      where: { id: messageId },
      data: { status: MessageStatus.CANCELLED },
    });
  }
}

export const messageService = new MessageService();