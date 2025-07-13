import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  EyeIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { useMessageStore, Message } from '../../store/messageStore';
import LoadingSpinner from '../ui/LoadingSpinner';

interface MessageHistoryProps {
  className?: string;
  limit?: number;
}

const MessageHistory: React.FC<MessageHistoryProps> = ({
  className = '',
  limit = 50,
}) => {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  const { 
    messages, 
    isLoading, 
    fetchMessages, 
    fetchMessage,
    getMessageStatus 
  } = useMessageStore();

  useEffect(() => {
    fetchMessages({ limit });
  }, [limit]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SENT':
      case 'DELIVERED':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'FAILED':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      case 'SENDING':
        return <ArrowPathIcon className="h-5 w-5 text-yellow-600 animate-spin" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT':
      case 'DELIVERED':
        return 'text-green-600 bg-green-100';
      case 'FAILED':
        return 'text-red-600 bg-red-100';
      case 'SENDING':
        return 'text-yellow-600 bg-yellow-100';
      case 'SCHEDULED':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const filteredMessages = messages?.filter(message => 
    !statusFilter || message.status === statusFilter
  ) || [];

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with Filters */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Message History ({filteredMessages.length})
        </h3>
        <div className="flex items-center space-x-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="SENT">Sent</option>
            <option value="DELIVERED">Delivered</option>
            <option value="FAILED">Failed</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="SENDING">Sending</option>
          </select>
        </div>
      </div>

      {/* Messages List */}
      {filteredMessages.length > 0 ? (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredMessages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedMessage(message)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Message Header */}
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                        {message.status}
                      </span>
                      <span className="text-sm text-gray-600 flex items-center">
                        <UserIcon className="h-4 w-4 mr-1" />
                        {message.totalRecipients} recipients
                      </span>
                      <span className="text-sm text-gray-600 flex items-center">
                        <CalendarDaysIcon className="h-4 w-4 mr-1" />
                        {formatDate(message.createdAt)}
                      </span>
                    </div>

                    {/* Message Content */}
                    <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                      {message.content}
                    </p>

                    {/* Message Stats */}
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      {message.successCount > 0 && (
                        <span className="flex items-center text-green-600">
                          <CheckCircleIcon className="h-3 w-3 mr-1" />
                          {message.successCount} delivered
                        </span>
                      )}
                      {message.failedCount > 0 && (
                        <span className="flex items-center text-red-600">
                          <XCircleIcon className="h-3 w-3 mr-1" />
                          {message.failedCount} failed
                        </span>
                      )}
                      {message.cost && (
                        <span>
                          Cost: ${message.cost.toFixed(4)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Icon */}
                  <div className="flex items-center space-x-2 ml-4">
                    {getStatusIcon(message.status)}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                      title="View Details"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-8">
          <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No messages found</p>
          <p className="text-sm text-gray-500">
            {statusFilter ? 'Try adjusting your filter' : 'Send your first message to see history here'}
          </p>
        </div>
      )}

      {/* Message Detail Modal */}
      <AnimatePresence>
        {selectedMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedMessage(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Message Details
                  </h3>
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Message Info */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedMessage.status)}`}>
                      {selectedMessage.status}
                    </span>
                    <span className="text-sm text-gray-600">
                      {formatDate(selectedMessage.createdAt)}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Content</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {selectedMessage.content}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Recipients</h4>
                      <p className="text-2xl font-bold text-gray-900">
                        {selectedMessage.totalRecipients}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Success Rate</h4>
                      <p className="text-2xl font-bold text-green-600">
                        {selectedMessage.totalRecipients > 0 
                          ? Math.round((selectedMessage.successCount / selectedMessage.totalRecipients) * 100)
                          : 0
                        }%
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-600">Delivered</p>
                      <p className="text-lg font-semibold text-green-600">
                        {selectedMessage.successCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Failed</p>
                      <p className="text-lg font-semibold text-red-600">
                        {selectedMessage.failedCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Cost</p>
                      <p className="text-lg font-semibold text-gray-900">
                        ${selectedMessage.cost?.toFixed(4) || '0.0000'}
                      </p>
                    </div>
                  </div>

                  {selectedMessage.scheduledAt && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-1">Scheduled For</h4>
                      <p className="text-blue-800">
                        {formatDate(selectedMessage.scheduledAt)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MessageHistory;