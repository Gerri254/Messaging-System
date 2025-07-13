import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDaysIcon,
  ClockIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  PauseIcon,
  PlayIcon,
  StopIcon,
} from '@heroicons/react/24/outline';
import { useMessageStore } from '../../store/messageStore';
import LoadingSpinner from '../ui/LoadingSpinner';

interface MessageSchedulerProps {
  isOpen: boolean;
  onClose: () => void;
  messageData?: {
    content: string;
    recipients: Array<{ phone: string; name?: string; }>;
  };
  onSchedule?: (scheduledDate: Date) => void;
}

interface ScheduledMessage {
  id: string;
  content: string;
  recipientCount: number;
  scheduledAt: Date;
  status: 'SCHEDULED' | 'SENDING' | 'SENT' | 'FAILED' | 'CANCELLED';
  createdAt: Date;
}

const MessageScheduler: React.FC<MessageSchedulerProps> = ({
  isOpen,
  onClose,
  messageData,
  onSchedule,
}) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [activeTab, setActiveTab] = useState<'schedule' | 'manage'>('schedule');
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { fetchMessages, cancelMessage } = useMessageStore();

  // Initialize with current date/time + 1 hour
  useEffect(() => {
    if (isOpen && !selectedDate) {
      const now = new Date();
      now.setHours(now.getHours() + 1);
      
      setSelectedDate(now.toISOString().split('T')[0]);
      setSelectedTime(now.toTimeString().slice(0, 5));
    }
  }, [isOpen]);

  // Load scheduled messages
  useEffect(() => {
    if (isOpen && activeTab === 'manage') {
      loadScheduledMessages();
    }
  }, [isOpen, activeTab]);

  const loadScheduledMessages = async () => {
    setIsLoading(true);
    try {
      // This would typically fetch from the API
      // For now, we'll simulate with dummy data
      const mockMessages: ScheduledMessage[] = [
        {
          id: '1',
          content: 'Hello {{name}}, this is a scheduled reminder about your appointment.',
          recipientCount: 150,
          scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
          status: 'SCHEDULED',
          createdAt: new Date(),
        },
        {
          id: '2',
          content: 'Special offer ending soon! Get 20% off your next purchase.',
          recipientCount: 500,
          scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
          status: 'SCHEDULED',
          createdAt: new Date(Date.now() - 60 * 60 * 1000),
        },
      ];
      
      setScheduledMessages(mockMessages);
    } catch (error) {
      console.error('Failed to load scheduled messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate scheduled datetime
  const scheduledDateTime = useMemo(() => {
    if (!selectedDate || !selectedTime) return null;
    
    const dateTime = new Date(`${selectedDate}T${selectedTime}`);
    return isNaN(dateTime.getTime()) ? null : dateTime;
  }, [selectedDate, selectedTime]);

  // Validate scheduling
  const validation = useMemo(() => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!scheduledDateTime) {
      errors.push('Please select a valid date and time');
      return { errors, warnings, isValid: false };
    }
    
    const now = new Date();
    const minScheduleTime = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes from now
    const maxScheduleTime = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year from now
    
    if (scheduledDateTime <= now) {
      errors.push('Scheduled time must be in the future');
    } else if (scheduledDateTime < minScheduleTime) {
      warnings.push('Messages scheduled less than 15 minutes in advance may not be processed in time');
    }
    
    if (scheduledDateTime > maxScheduleTime) {
      errors.push('Cannot schedule messages more than 1 year in advance');
    }
    
    // Check for weekend/holiday scheduling
    const day = scheduledDateTime.getDay();
    const hour = scheduledDateTime.getHours();
    
    if (day === 0 || day === 6) {
      warnings.push('Scheduled for weekend - consider business hours for better engagement');
    }
    
    if (hour < 8 || hour > 20) {
      warnings.push('Scheduled outside typical business hours (8 AM - 8 PM)');
    }
    
    return {
      errors,
      warnings,
      isValid: errors.length === 0,
    };
  }, [scheduledDateTime]);

  // Handle scheduling
  const handleSchedule = () => {
    if (!validation.isValid || !scheduledDateTime) return;
    
    if (onSchedule) {
      onSchedule(scheduledDateTime);
    }
    onClose();
  };

  // Handle message cancellation
  const handleCancelMessage = async (messageId: string) => {
    if (confirm('Are you sure you want to cancel this scheduled message?')) {
      try {
        await cancelMessage(messageId);
        setScheduledMessages(prev => 
          prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, status: 'CANCELLED' as const }
              : msg
          )
        );
      } catch (error) {
        console.error('Failed to cancel message:', error);
      }
    }
  };

  // Format datetime for display
  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    }).format(date);
  };

  // Format relative time
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    if (diff < 0) return 'Past due';
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `in ${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `in ${hours} hour${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `in ${minutes} minute${minutes > 1 ? 's' : ''}`;
    return 'very soon';
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'text-blue-600 bg-blue-100';
      case 'SENDING': return 'text-yellow-600 bg-yellow-100';
      case 'SENT': return 'text-green-600 bg-green-100';
      case 'FAILED': return 'text-red-600 bg-red-100';
      case 'CANCELLED': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Message Scheduler</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Schedule messages for future delivery or manage existing scheduled messages
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('schedule')}
                className={`
                  flex-1 px-6 py-3 text-sm font-medium transition-colors
                  ${activeTab === 'schedule'
                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                    : 'text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                <CalendarDaysIcon className="h-5 w-5 inline mr-2" />
                Schedule New Message
              </button>
              <button
                onClick={() => setActiveTab('manage')}
                className={`
                  flex-1 px-6 py-3 text-sm font-medium transition-colors
                  ${activeTab === 'manage'
                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                    : 'text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                <ClockIcon className="h-5 w-5 inline mr-2" />
                Manage Scheduled Messages
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
              {activeTab === 'schedule' && (
                <div className="p-6 space-y-6">
                  {/* Message Preview */}
                  {messageData && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Message to Schedule</h3>
                      <div className="bg-white rounded-lg p-3 mb-3">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {messageData.content}
                        </p>
                      </div>
                      <p className="text-xs text-gray-600">
                        Will be sent to {messageData.recipients.length} recipient{messageData.recipients.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  )}

                  {/* Schedule Form */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Date & Time Selection */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">Select Date & Time</h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date
                        </label>
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Time
                        </label>
                        <input
                          type="time"
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Timezone
                        </label>
                        <select
                          value={timezone}
                          onChange={(e) => setTimezone(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="America/New_York">Eastern Time (ET)</option>
                          <option value="America/Chicago">Central Time (CT)</option>
                          <option value="America/Denver">Mountain Time (MT)</option>
                          <option value="America/Los_Angeles">Pacific Time (PT)</option>
                          <option value="UTC">UTC</option>
                        </select>
                      </div>
                    </div>

                    {/* Schedule Summary */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">Schedule Summary</h3>
                      
                      {scheduledDateTime && (
                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                          <div className="flex items-center space-x-3 mb-3">
                            <CalendarDaysIcon className="h-5 w-5 text-indigo-600" />
                            <span className="font-medium text-gray-900">
                              {formatDateTime(scheduledDateTime)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Message will be sent {formatRelativeTime(scheduledDateTime)}
                          </p>
                        </div>
                      )}

                      {/* Validation Messages */}
                      {validation.errors.length > 0 && (
                        <div className="space-y-2">
                          {validation.errors.map((error, index) => (
                            <div key={index} className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-red-800">{error}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {validation.warnings.length > 0 && (
                        <div className="space-y-2">
                          {validation.warnings.map((warning, index) => (
                            <div key={index} className="flex items-start space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                              <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-amber-800">{warning}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {validation.isValid && validation.warnings.length === 0 && scheduledDateTime && (
                        <div className="flex items-start space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-green-800">
                            Schedule looks good! Message will be delivered at the optimal time.
                          </p>
                        </div>
                      )}

                      {/* Best Practices */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start space-x-2">
                          <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="text-sm font-medium text-blue-900 mb-2">
                              Best Practices for Scheduling
                            </h4>
                            <ul className="text-xs text-blue-800 space-y-1">
                              <li>• Schedule during business hours (8 AM - 8 PM) for better engagement</li>
                              <li>• Avoid weekends unless appropriate for your audience</li>
                              <li>• Allow at least 15 minutes for processing</li>
                              <li>• Consider your recipients' time zones</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      {messageData && `Ready to schedule message for ${messageData.recipients.length} recipients`}
                    </div>
                    <div className="flex items-center space-x-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSchedule}
                        disabled={!validation.isValid}
                        className="flex items-center space-x-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <CalendarDaysIcon className="h-4 w-4" />
                        <span>Schedule Message</span>
                      </motion.button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'manage' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900">
                      Scheduled Messages ({scheduledMessages.length})
                    </h3>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={loadScheduledMessages}
                      className="flex items-center space-x-2 px-4 py-2 text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      <ArrowPathIcon className="h-4 w-4" />
                      <span>Refresh</span>
                    </motion.button>
                  </div>

                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <LoadingSpinner size="lg" />
                    </div>
                  ) : scheduledMessages.length > 0 ? (
                    <div className="space-y-4">
                      {scheduledMessages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                                  {message.status}
                                </span>
                                <span className="text-sm text-gray-600">
                                  {message.recipientCount} recipients
                                </span>
                                <span className="text-sm text-gray-600">
                                  {formatRelativeTime(message.scheduledAt)}
                                </span>
                              </div>
                              
                              <p className="text-sm text-gray-900 mb-2 line-clamp-2">
                                {message.content}
                              </p>
                              
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span>Scheduled: {formatDateTime(message.scheduledAt)}</span>
                                <span>Created: {formatDateTime(message.createdAt)}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 ml-4">
                              {message.status === 'SCHEDULED' && (
                                <>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Edit"
                                  >
                                    <PauseIcon className="h-4 w-4" />
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleCancelMessage(message.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Cancel"
                                  >
                                    <StopIcon className="h-4 w-4" />
                                  </motion.button>
                                </>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">No scheduled messages</p>
                      <p className="text-sm text-gray-500">
                        Schedule messages from the compose interface to see them here
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MessageScheduler;