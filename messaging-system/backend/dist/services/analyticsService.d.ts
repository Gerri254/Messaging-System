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
declare class AnalyticsService {
    getDashboardStats(userId: string, broadcastUpdate?: boolean): Promise<DashboardStats>;
    private getContactGrowth;
    private getMessageStats;
    getMessageReports(userId: string, startDate?: Date, endDate?: Date, groupBy?: 'day' | 'week' | 'month'): Promise<{
        messages: {
            id: string;
            content: string;
            status: import(".prisma/client").$Enums.MessageStatus;
            totalRecipients: number;
            successCount: number;
            failedCount: number;
            cost: number | null;
            sentAt: Date | null;
            createdAt: Date;
        }[];
        summary: {
            totalMessages: number;
            totalRecipients: number;
            totalSuccess: number;
            totalFailed: number;
            totalCost: number;
        };
    }>;
    getUsageStats(userId: string): Promise<{
        monthlyMessages: number;
        monthlyContacts: number;
        monthlySpend: number;
        topTemplates: {
            name: string;
            id: string;
            category: string | null;
            usageCount: number;
        }[];
    }>;
}
export declare const analyticsService: AnalyticsService;
export {};
//# sourceMappingURL=analyticsService.d.ts.map