import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  PhoneIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { useMessageStore } from '../../store/messageStore';
import LoadingSpinner from '../ui/LoadingSpinner';

interface AnalyticsData {
  totalMessages: number;
  totalRecipients: number;
  deliveryRate: number;
  failureRate: number;
  avgDeliveryTime: number;
  totalCost: number;
  timeSeriesData: Array<{
    date: string;
    sent: number;
    delivered: number;
    failed: number;
  }>;
  statusBreakdown: {
    sent: number;
    delivered: number;
    failed: number;
    pending: number;
  };
  costBreakdown: {
    totalCost: number;
    averageCostPerMessage: number;
    costByMonth: Array<{ month: string; cost: number; }>;
  };
  performanceMetrics: {
    bestDeliveryTime: string;
    worstDeliveryTime: string;
    avgResponseTime: number;
    peakHours: string[];
  };
}

interface MessageAnalyticsProps {
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

const MessageAnalytics: React.FC<MessageAnalyticsProps> = ({
  isOpen = true,
  onClose,
  className = '',
}) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7days');
  const [selectedMetric, setSelectedMetric] = useState('delivery');
  const [showFilters, setShowFilters] = useState(false);

  const { getMessageHistory } = useMessageStore();

  // Load analytics data
  useEffect(() => {
    if (isOpen) {
      loadAnalyticsData();
    }
  }, [isOpen, dateRange]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // This would typically fetch from a dedicated analytics API
      // For now, we'll simulate with mock data
      const mockData: AnalyticsData = {
        totalMessages: 1250,
        totalRecipients: 8500,
        deliveryRate: 94.2,
        failureRate: 5.8,
        avgDeliveryTime: 2.3,
        totalCost: 63.75,
        timeSeriesData: [
          { date: '2024-01-07', sent: 150, delivered: 142, failed: 8 },
          { date: '2024-01-08', sent: 200, delivered: 189, failed: 11 },
          { date: '2024-01-09', sent: 180, delivered: 171, failed: 9 },
          { date: '2024-01-10', sent: 220, delivered: 208, failed: 12 },
          { date: '2024-01-11', sent: 190, delivered: 179, failed: 11 },
          { date: '2024-01-12', sent: 160, delivered: 152, failed: 8 },
          { date: '2024-01-13', sent: 150, delivered: 143, failed: 7 },
        ],
        statusBreakdown: {
          sent: 1250,
          delivered: 1177,
          failed: 73,
          pending: 12,
        },
        costBreakdown: {
          totalCost: 63.75,
          averageCostPerMessage: 0.0075,
          costByMonth: [
            { month: 'Oct', cost: 45.20 },
            { month: 'Nov', cost: 52.10 },
            { month: 'Dec', cost: 63.75 },
          ],
        },
        performanceMetrics: {
          bestDeliveryTime: '2.1 seconds',
          worstDeliveryTime: '15.3 seconds',
          avgResponseTime: 4.2,
          peakHours: ['10:00 AM', '2:00 PM', '7:00 PM'],
        },
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate trends
  const trends = useMemo(() => {
    if (!analyticsData?.timeSeriesData.length) return null;
    
    const data = analyticsData.timeSeriesData;
    const recent = data.slice(-3);
    const previous = data.slice(-6, -3);
    
    const recentAvg = recent.reduce((sum, d) => sum + d.delivered, 0) / recent.length;
    const previousAvg = previous.reduce((sum, d) => sum + d.delivered, 0) / previous.length;
    
    const deliveryTrend = ((recentAvg - previousAvg) / previousAvg) * 100;
    
    return {
      delivery: {
        value: deliveryTrend,
        isPositive: deliveryTrend > 0,
      },
      cost: {
        value: -2.3, // Mock trend
        isPositive: false,
      },
      volume: {
        value: 15.7, // Mock trend
        isPositive: true,
      },
    };
  }, [analyticsData]);

  // Export data
  const handleExport = (format: 'csv' | 'pdf') => {
    console.log(`Exporting analytics data as ${format.toUpperCase()}`);
    // Implementation would depend on the chosen export library
  };

  // Refresh data
  const handleRefresh = () => {
    loadAnalyticsData();
  };

  if (!isOpen && onClose) {
    return null;
  }

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Message Analytics</h2>
          <p className="text-gray-600 mt-1">
            Track performance and insights for your messaging campaigns
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="24hours">Last 24 hours</option>
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
          </select>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowFilters(!showFilters)}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors
              ${showFilters
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            <FunnelIcon className="h-4 w-4" />
            <span>Filters</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRefresh}
            className="flex items-center space-x-2 px-4 py-2 text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <ArrowPathIcon className="h-4 w-4" />
            <span>Refresh</span>
          </motion.button>
          
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              <span>Export</span>
            </motion.button>
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircleIcon className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 rounded-xl p-4 border border-gray-200"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message Type
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option>All Types</option>
                  <option>SMS</option>
                  <option>Email</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option>All Statuses</option>
                  <option>Delivered</option>
                  <option>Failed</option>
                  <option>Pending</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option>All Templates</option>
                  <option>Welcome Message</option>
                  <option>Reminder</option>
                  <option>Promotion</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Group
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option>All Groups</option>
                  <option>VIP Customers</option>
                  <option>New Leads</option>
                  <option>Regular Customers</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : analyticsData ? (
        <>
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Messages</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {analyticsData.totalMessages.toLocaleString()}
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <PhoneIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              {trends && (
                <div className="flex items-center mt-3">
                  {trends.volume.isPositive ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-600 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    trends.volume.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {Math.abs(trends.volume.value).toFixed(1)}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs last period</span>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Delivery Rate</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {analyticsData.deliveryRate}%
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
              {trends && (
                <div className="flex items-center mt-3">
                  {trends.delivery.isPositive ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-600 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    trends.delivery.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {Math.abs(trends.delivery.value).toFixed(1)}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs last period</span>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Delivery Time</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {analyticsData.avgDeliveryTime}s
                  </p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <ClockIcon className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="flex items-center mt-3">
                <span className="text-sm text-gray-500">
                  Best: {analyticsData.performanceMetrics.bestDeliveryTime}
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Cost</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    ${analyticsData.totalCost.toFixed(2)}
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <ChartBarIcon className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              {trends && (
                <div className="flex items-center mt-3">
                  {trends.cost.isPositive ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 text-red-600 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 text-green-600 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    trends.cost.isPositive ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {Math.abs(trends.cost.value).toFixed(1)}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs last period</span>
                </div>
              )}
            </motion.div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Time Series Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Message Volume</h3>
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="delivery">Delivery</option>
                  <option value="volume">Volume</option>
                  <option value="cost">Cost</option>
                </select>
              </div>
              
              {/* Simple Bar Chart Representation */}
              <div className="space-y-3">
                {analyticsData.timeSeriesData.map((data, index) => (
                  <div key={data.date} className="flex items-center space-x-3">
                    <div className="w-16 text-xs text-gray-600">
                      {new Date(data.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-3 relative">
                      <div 
                        className="bg-indigo-600 h-3 rounded-full"
                        style={{ 
                          width: `${(data.delivered / Math.max(...analyticsData.timeSeriesData.map(d => d.sent))) * 100}%` 
                        }}
                      />
                      {data.failed > 0 && (
                        <div 
                          className="bg-red-500 h-3 rounded-full absolute top-0"
                          style={{ 
                            left: `${(data.delivered / Math.max(...analyticsData.timeSeriesData.map(d => d.sent))) * 100}%`,
                            width: `${(data.failed / Math.max(...analyticsData.timeSeriesData.map(d => d.sent))) * 100}%` 
                          }}
                        />
                      )}
                    </div>
                    <div className="w-12 text-xs text-gray-600 text-right">
                      {data.sent}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-center space-x-6 mt-4 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-indigo-600 rounded-full" />
                  <span className="text-gray-600">Delivered</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="text-gray-600">Failed</span>
                </div>
              </div>
            </motion.div>

            {/* Status Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Status Breakdown</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-green-500 rounded-full" />
                    <span className="text-sm font-medium text-gray-700">Delivered</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {analyticsData.statusBreakdown.delivered.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {((analyticsData.statusBreakdown.delivered / analyticsData.totalMessages) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-red-500 rounded-full" />
                    <span className="text-sm font-medium text-gray-700">Failed</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {analyticsData.statusBreakdown.failed.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {((analyticsData.statusBreakdown.failed / analyticsData.totalMessages) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full" />
                    <span className="text-sm font-medium text-gray-700">Pending</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {analyticsData.statusBreakdown.pending.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {((analyticsData.statusBreakdown.pending / analyticsData.totalMessages) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Donut Chart Representation */}
              <div className="mt-6 flex items-center justify-center">
                <div className="relative w-32 h-32 rounded-full border-8 border-green-500" 
                     style={{
                       borderWidth: '8px',
                       borderColor: `conic-gradient(
                         #10B981 0deg ${(analyticsData.statusBreakdown.delivered / analyticsData.totalMessages) * 360}deg,
                         #EF4444 ${(analyticsData.statusBreakdown.delivered / analyticsData.totalMessages) * 360}deg ${((analyticsData.statusBreakdown.delivered + analyticsData.statusBreakdown.failed) / analyticsData.totalMessages) * 360}deg,
                         #F59E0B ${((analyticsData.statusBreakdown.delivered + analyticsData.statusBreakdown.failed) / analyticsData.totalMessages) * 360}deg 360deg
                       )`,
                       background: 'conic-gradient(#10B981 0deg 70%, #EF4444 70% 80%, #F59E0B 80% 100%)'
                     }}>
                  <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900">
                        {analyticsData.deliveryRate}%
                      </div>
                      <div className="text-xs text-gray-500">Success</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Performance Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Insights</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Peak Hours</h4>
                <div className="space-y-2">
                  {analyticsData.performanceMetrics.peakHours.map((hour, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{hour}</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        Peak
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Response Times</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Best:</span>
                    <span className="font-medium">{analyticsData.performanceMetrics.bestDeliveryTime}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Worst:</span>
                    <span className="font-medium">{analyticsData.performanceMetrics.worstDeliveryTime}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Average:</span>
                    <span className="font-medium">{analyticsData.avgDeliveryTime}s</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Cost Analysis</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Per Message:</span>
                    <span className="font-medium">${analyticsData.costBreakdown.averageCostPerMessage.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">This Period:</span>
                    <span className="font-medium">${analyticsData.totalCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Efficiency:</span>
                    <span className="font-medium text-green-600">94.2%</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      ) : (
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load analytics data</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={loadAnalyticsData}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </motion.button>
        </div>
      )}
    </div>
  );

  if (onClose) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-7xl max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6">
            {content}
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-200 p-6 ${className}`}>
      {content}
    </div>
  );
};

export default MessageAnalytics;