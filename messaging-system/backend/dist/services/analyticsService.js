"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsService = void 0;
const client_1 = require("@prisma/client");
const database_1 = __importDefault(require("../config/database"));
const socketService_1 = require("./socketService");
class AnalyticsService {
    async getDashboardStats(userId, broadcastUpdate = false) {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        const [totalContacts, totalMessages, messagesSentToday, recentMessages, deliveryStats, totalCostResult] = await Promise.all([
            database_1.default.contact.count({
                where: { userId }
            }),
            database_1.default.message.count({
                where: { userId }
            }),
            database_1.default.message.count({
                where: {
                    userId,
                    sentAt: {
                        gte: startOfDay
                    }
                }
            }),
            database_1.default.message.findMany({
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
            database_1.default.messageRecipient.groupBy({
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
            database_1.default.message.aggregate({
                where: { userId },
                _sum: {
                    cost: true
                }
            })
        ]);
        const totalDelivered = deliveryStats.find(stat => stat.status === client_1.MessageRecipientStatus.DELIVERED)?._count?.status || 0;
        const totalSent = deliveryStats.reduce((sum, stat) => sum + stat._count.status, 0);
        const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
        const contactGrowth = await this.getContactGrowth(userId, last30Days);
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
        if (broadcastUpdate) {
            await socketService_1.socketService.broadcastAnalyticsUpdate(userId, {
                type: 'dashboard_stats',
                data: dashboardStats,
            });
        }
        return dashboardStats;
    }
    async getContactGrowth(userId, since) {
        const contacts = await database_1.default.contact.findMany({
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
        const growthMap = new Map();
        contacts.forEach(contact => {
            const date = contact.createdAt.toISOString().split('T')[0];
            growthMap.set(date, (growthMap.get(date) || 0) + 1);
        });
        return Array.from(growthMap.entries())
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }
    async getMessageStats(userId, since) {
        const messages = await database_1.default.message.findMany({
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
        const statsMap = new Map();
        messages.forEach(message => {
            const date = message.createdAt.toISOString().split('T')[0];
            const current = statsMap.get(date) || { sent: 0, delivered: 0, failed: 0 };
            if (message.status === client_1.MessageStatus.SENT || message.status === client_1.MessageStatus.DELIVERED) {
                current.sent += message.successCount || 0;
                current.delivered += message.successCount || 0;
                current.failed += message.failedCount || 0;
            }
            statsMap.set(date, current);
        });
        return Array.from(statsMap.entries())
            .map(([date, stats]) => ({ date, ...stats }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }
    async getMessageReports(userId, startDate, endDate, groupBy = 'day') {
        const where = {
            userId,
            ...(startDate && endDate && {
                createdAt: {
                    gte: startDate,
                    lte: endDate
                }
            })
        };
        const messages = await database_1.default.message.findMany({
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
    async getUsageStats(userId) {
        const currentMonth = new Date();
        const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const [monthlyMessages, monthlyContacts, monthlySpend, topTemplates] = await Promise.all([
            database_1.default.message.count({
                where: {
                    userId,
                    createdAt: {
                        gte: startOfMonth
                    }
                }
            }),
            database_1.default.contact.count({
                where: {
                    userId,
                    createdAt: {
                        gte: startOfMonth
                    }
                }
            }),
            database_1.default.message.aggregate({
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
            database_1.default.messageTemplate.findMany({
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
exports.analyticsService = new AnalyticsService();
//# sourceMappingURL=analyticsService.js.map