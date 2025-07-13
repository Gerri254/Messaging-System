import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  PaperAirplaneIcon,
  ClockIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  TagIcon,
  CalendarIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';
import { useMessageStore } from '../../store/messageStore';
import { useSmsService } from '../../hooks/useSmsService';
import RichTextEditor from '../ui/RichTextEditor';
import ContactBadge from '../ui/ContactBadge';
import Toast from '../ui/Toast';

interface MessageComposerProps {
  selectedContacts: any[];
  selectedTemplate?: any;
  onContactsChange: (contacts: any[]) => void;
  onTemplateChange: (template: any) => void;
}

const MessageComposer: React.FC<MessageComposerProps> = ({
  selectedContacts,
  selectedTemplate,
  onContactsChange,
  onTemplateChange,
}) => {
  const [message, setMessage] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const { sendMessage, sendBulkMessage } = useMessageStore();
  const { validatePhoneNumber, calculateCost } = useSmsService();

  // Character count and cost estimation
  const characterCount = message.length;
  const maxCharacters = 1600;
  const segmentCount = Math.ceil(characterCount / 160) || 1;
  const estimatedCost = selectedContacts.length * segmentCount * 0.0075; // $0.0075 per segment

  // Apply template when selected
  useEffect(() => {
    if (selectedTemplate) {
      setMessage(selectedTemplate.content);
    }
  }, [selectedTemplate]);

  // Process template variables
  const processMessageWithVariables = useCallback((content: string, contact: any) => {
    let processedContent = content;
    
    // Common variables
    const variables = {
      '{{name}}': contact.name || '',
      '{{firstName}}': contact.name?.split(' ')[0] || '',
      '{{lastName}}': contact.name?.split(' ').slice(1).join(' ') || '',
      '{{phone}}': contact.phone || '',
      '{{email}}': contact.email || '',
    };

    // Custom fields
    if (contact.customFields) {
      Object.entries(contact.customFields).forEach(([key, value]) => {
        const variableKey = `{{${key}}}` as keyof typeof variables;
        (variables as any)[variableKey] = String(value);
      });
    }

    // Replace variables
    Object.entries(variables).forEach(([variable, value]) => {
      processedContent = processedContent.replace(new RegExp(variable, 'g'), value);
    });

    return processedContent;
  }, []);

  // Validate form
  const canSend = () => {
    return (
      message.trim().length > 0 &&
      selectedContacts.length > 0 &&
      (!isScheduled || (scheduledDate && scheduledTime))
    );
  };

  // Handle send message
  const handleSend = async () => {
    if (!canSend()) return;

    setSending(true);
    try {
      const scheduledAt = isScheduled 
        ? new Date(`${scheduledDate}T${scheduledTime}`)
        : undefined;

      if (selectedContacts.length === 1) {
        // Single message
        const contact = selectedContacts[0];
        const processedMessage = processMessageWithVariables(message, contact);
        
        await sendMessage({
          content: processedMessage,
          recipients: [{
            phone: contact.phone,
            name: contact.name,
          }],
          scheduledAt,
        });
      } else {
        // Bulk message
        await sendBulkMessage({
          content: message,
          contactIds: selectedContacts.map(c => c.id),
          scheduledAt,
        });
      }

      setToast({
        type: 'success',
        message: isScheduled 
          ? 'Message scheduled successfully!'
          : 'Message sent successfully!',
      });

      // Reset form
      setMessage('');
      setScheduledDate('');
      setScheduledTime('');
      setIsScheduled(false);
      onContactsChange([]);
      onTemplateChange(null);

    } catch (error: any) {
      setToast({
        type: 'error',
        message: error.message || 'Failed to send message',
      });
    } finally {
      setSending(false);
    }
  };

  const removeContact = (contactId: string) => {
    onContactsChange(selectedContacts.filter(c => c.id !== contactId));
  };

  const clearTemplate = () => {
    onTemplateChange(null);
    setMessage('');
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <PaperAirplaneIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                {isScheduled ? 'Schedule Message' : 'Compose Message'}
              </h2>
              <p className="text-indigo-100 text-sm">
                {selectedContacts.length} recipient{selectedContacts.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsScheduled(!isScheduled)}
              className={`
                p-2 rounded-lg transition-colors
                ${isScheduled 
                  ? 'bg-white/20 text-white' 
                  : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }
              `}
            >
              <ClockIcon className="h-5 w-5" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPreview(!showPreview)}
              className="p-2 bg-white/10 rounded-lg text-white/70 hover:bg-white/20 hover:text-white transition-colors"
            >
              <DocumentTextIcon className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Selected Template */}
        {selectedTemplate && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-blue-50 border border-blue-200 rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-blue-900">
                    Using Template: {selectedTemplate.name}
                  </h3>
                  <p className="text-sm text-blue-600">
                    {selectedTemplate.category && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                        {selectedTemplate.category}
                      </span>
                    )}
                    Variables will be automatically replaced
                  </p>
                </div>
              </div>
              <button
                onClick={clearTemplate}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Clear
              </button>
            </div>
          </motion.div>
        )}

        {/* Recipients */}
        {selectedContacts.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Recipients ({selectedContacts.length})
            </label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {selectedContacts.map((contact) => (
                <ContactBadge
                  key={contact.id}
                  contact={contact}
                  onRemove={() => removeContact(contact.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Message Editor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Message Content
          </label>
          <RichTextEditor
            value={message}
            onChange={setMessage}
            placeholder="Type your message here..."
            maxLength={maxCharacters}
            enableVariables={true}
            variables={[
              '{{name}}',
              '{{firstName}}',
              '{{lastName}}',
              '{{phone}}',
              '{{email}}',
            ]}
          />
          
          {/* Character count and stats */}
          <div className="mt-3 flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span className={`
                ${characterCount > maxCharacters 
                  ? 'text-red-600' 
                  : characterCount > maxCharacters * 0.9 
                    ? 'text-yellow-600' 
                    : 'text-gray-500'
                }
              `}>
                {characterCount}/{maxCharacters} characters
              </span>
              <span className="text-gray-500">
                {segmentCount} SMS segment{segmentCount !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center space-x-1 text-gray-500">
              <CurrencyDollarIcon className="h-4 w-4" />
              <span>~${estimatedCost.toFixed(4)}</span>
            </div>
          </div>
        </div>

        {/* Scheduling */}
        {isScheduled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-3 mb-4">
              <CalendarIcon className="h-5 w-5 text-indigo-600" />
              <h3 className="text-lg font-medium text-gray-900">Schedule Delivery</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time
                </label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Preview */}
        {showPreview && message && selectedContacts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 rounded-xl p-4"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-3">Message Preview</h3>
            <div className="space-y-3">
              {selectedContacts.slice(0, 3).map((contact) => (
                <div key={contact.id} className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">To: {contact.name}</div>
                  <div className="text-gray-900">
                    {processMessageWithVariables(message, contact)}
                  </div>
                </div>
              ))}
              {selectedContacts.length > 3 && (
                <div className="text-sm text-gray-500 text-center">
                  +{selectedContacts.length - 3} more recipients
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Validation Messages */}
        {characterCount > maxCharacters && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg"
          >
            <ExclamationTriangleIcon className="h-5 w-5" />
            <span className="text-sm">
              Message exceeds maximum length. Please shorten your message.
            </span>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <UserGroupIcon className="h-4 w-4" />
              <span>{selectedContacts.length} recipients</span>
            </div>
            <div className="flex items-center space-x-1">
              <CurrencyDollarIcon className="h-4 w-4" />
              <span>${estimatedCost.toFixed(4)} estimated</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setMessage('');
                setScheduledDate('');
                setScheduledTime('');
                setIsScheduled(false);
                onContactsChange([]);
                onTemplateChange(null);
              }}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear All
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSend}
              disabled={!canSend() || sending}
              className={`
                flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-colors
                ${canSend() && !sending
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  {isScheduled ? (
                    <ClockIcon className="h-4 w-4" />
                  ) : (
                    <PaperAirplaneIcon className="h-4 w-4" />
                  )}
                  <span>{isScheduled ? 'Schedule' : 'Send'} Message</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          id="message-composer-toast"
          type={toast.type}
          title={toast.type === 'success' ? 'Success' : 'Error'}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default MessageComposer;