import { MessageStatus, MessageRecipientStatus } from '@prisma/client';
import prisma from '../config/database';
import { socketService } from './socketService';

export interface DashboardStats {
  totalContacts: number;
  totalMessages: number;
  messagesSentToday: number;
  deliveryRate: number;
  totalCost: number;
  recentMessages: any[];
  contactGrowth: Array<{
    date: string;
    count: number;
  }>;
  messageStats: Array<{
    date: string;
    sent: number;
    delivered: number;
    failed: number;
  }>;
}

class AnalyticsService {
  async getDashboardStats(userId: string, broadcastUpdate = false): Promise<DashboardStats> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get basic counts
    const [
      totalContacts,
      totalMessages,
      messagesSentToday,
      recentMessages,
      deliveryStats,
      totalCostResult
    ] = await Promise.all([
      // Total contacts
      prisma.contact.count({
        where: { userId }
      }),

      // Total messages
      prisma.message.count({
        where: { userId }
      }),

      // Messages sent today
      prisma.message.count({
        where: {
          userId,
          sentAt: {
            gte: startOfDay
          }
        }
      }),

      // Recent messages
      prisma.message.findMany({
        where: { userId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          content: true,
          status: true,
          totalRecipients: true,
          sentAt: true,
          createdAt: true,
        }
      }),

      // Delivery statistics
      prisma.messageRecipient.groupBy({
        by: ['status'],
        where: {
          message: { userId },
          createdAt: {
            gte: last30Days
          }
        },
        _count: {
          status: true
        }
      }),

      // Total cost (sum of all message costs)
      prisma.message.aggregate({
        where: { userId },
        _sum: {
          cost: true
        }
      })
    ]);

    // Calculate delivery rate
    const totalDelivered = deliveryStats.find(stat => stat.status === MessageRecipientStatus.DELIVERED)?._count?.status || 0;
    const totalSent = deliveryStats.reduce((sum, stat) => sum + stat._count.status, 0);
    const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;

    // Get contact growth over last 30 days
    const contactGrowth = await this.getContactGrowth(userId, last30Days);

    // Get message statistics over last 30 days
    const messageStats = await this.getMessageStats(userId, last30Days);

    const dashboardStats = {
      totalContacts,
      totalMessages,
      messagesSentToday,
      deliveryRate: Math.round(deliveryRate * 100) / 100,
      totalCost: totalCostResult._sum.cost || 0,
      recentMessages,
      contactGrowth,
      messageStats,
    };

    // Broadcast analytics update if requested
    if (broadcastUpdate) {
      await socketService.broadcastAnalyticsUpdate(userId, {
        type: 'dashboard_stats',
        data: dashboardStats,
      });
    }

    return dashboardStats;
  }

  private async getContactGrowth(userId: string, since: Date): Promise<Array<{ date: string; count: number }>> {
    const contacts = await prisma.contact.findMany({
      where: {
        userId,
        createdAt: {
          gte: since
        }
      },
      select: {
        createdAt: true
      }
    });

    // Group by date
    const growthMap = new Map<string, number>();
    
    contacts.forEach(contact => {
      const date = contact.createdAt.toISOString().split('T')[0];
      growthMap.set(date, (growthMap.get(date) || 0) + 1);
    });

    // Convert to array and sort
    return Array.from(growthMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private async getMessageStats(userId: string, since: Date): Promise<Array<{ date: string; sent: number; delivered: number; failed: number }>> {
    const messages = await prisma.message.findMany({
      where: {
        userId,
        createdAt: {
          gte: since
        }
      },
      select: {
        createdAt: true,
        status: true,
        successCount: true,
        failedCount: true,
      }
    });

    // Group by date
    const statsMap = new Map<string, { sent: number; delivered: number; failed: number }>();
    
    messages.forEach(message => {
      const date = message.createdAt.toISOString().split('T')[0];
      const current = statsMap.get(date) || { sent: 0, delivered: 0, failed: 0 };
      
      if (message.status === MessageStatus.SENT || message.status === MessageStatus.DELIVERED) {
        current.sent += message.successCount || 0;
        current.delivered += message.successCount || 0;
        current.failed += message.failedCount || 0;
      }
      
      statsMap.set(date, current);
    });

    // Convert to array and sort
    return Array.from(statsMap.entries())
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async getMessageReports(userId: string, startDate?: Date, endDate?: Date, groupBy: 'day' | 'week' | 'month' = 'day') {
    const where = {
      userId,
      ...(startDate && endDate && {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      })
    };

    const messages = await prisma.message.findMany({
      where,
      include: {
        recipients: true,
        _count: {
          select: {
            recipients: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return {
      messages: messages.map(message => ({
        id: message.id,
        content: message.content.substring(0, 100) + (message.content.length > 100 ? '...' : ''),
        status: message.status,
        totalRecipients: message.totalRecipients,
        successCount: message.successCount,
        failedCount: message.failedCount,
        cost: message.cost,
        sentAt: message.sentAt,
        createdAt: message.createdAt,
      })),
      summary: {
        totalMessages: messages.length,
        totalRecipients: messages.reduce((sum, msg) => sum + msg.totalRecipients, 0),
        totalSuccess: messages.reduce((sum, msg) => sum + (msg.successCount || 0), 0),
        totalFailed: messages.reduce((sum, msg) => sum + (msg.failedCount || 0), 0),
        totalCost: messages.reduce((sum, msg) => sum + (msg.cost || 0), 0),
      }
    };
  }

  async getUsageStats(userId: string) {
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    
    const [
      monthlyMessages,
      monthlyContacts,
      monthlySpend,
      topTemplates
    ] = await Promise.all([
      prisma.message.count({
        where: {
          userId,
          createdAt: {
            gte: startOfMonth
          }
        }
      }),

      prisma.contact.count({
        where: {
          userId,
          createdAt: {
            gte: startOfMonth
          }
        }
      }),

      prisma.message.aggregate({
        where: {
          userId,
          createdAt: {
            gte: startOfMonth
          }
        },
        _sum: {
          cost: true
        }
      }),

      prisma.messageTemplate.findMany({
        where: { userId },
        orderBy: { usageCount: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          usageCount: true,
          category: true,
        }
      })
    ]);

    return {
      monthlyMessages,
      monthlyContacts,
      monthlySpend: monthlySpend._sum.cost || 0,
      topTemplates,
    };
  }
}

export const analyticsService = new AnalyticsService();