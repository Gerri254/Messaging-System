import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  XMarkIcon,
  PencilIcon,
  DocumentDuplicateIcon,
  ShareIcon,
  ClockIcon,
  TagIcon,
  PhoneIcon,
  EnvelopeIcon,
  SparklesIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { MessageTemplate } from '../../store/templateStore';
import Modal from '../ui/Modal';
import { useSmsService } from '../../hooks/useSmsService';

interface TemplatePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  template: MessageTemplate;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onUse?: () => void;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  isOpen,
  onClose,
  template,
  onEdit,
  onDuplicate,
  onUse,
}) => {
  const [previewContact, setPreviewContact] = useState({
    name: 'John Doe',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1 (555) 123-4567',
    email: 'john.doe@example.com',
    company: 'Acme Corp',
  });

  const { calculateCost, validateMessage } = useSmsService();

  // Process template with sample data
  const processedContent = useMemo(() => {
    let content = template.content;
    
    // Replace common variables with sample data
    const replacements: Record<string, string> = {
      '{{name}}': previewContact.name,
      '{{firstName}}': previewContact.firstName,
      '{{lastName}}': previewContact.lastName,
      '{{phone}}': previewContact.phone,
      '{{email}}': previewContact.email,
      '{{company}}': previewContact.company,
    };

    Object.entries(replacements).forEach(([variable, value]) => {
      content = content.replace(new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), value);
    });

    // Highlight remaining variables
    content = content.replace(/\{\{[^}]+\}\}/g, (match) => {
      return `[${match.slice(2, -2).toUpperCase()}]`;
    });

    return content;
  }, [template.content, previewContact]);

  // Calculate SMS metrics
  const smsMetrics = useMemo(() => {
    const cost = calculateCost(processedContent);
    const validation = validateMessage(processedContent);
    
    return {
      ...cost,
      ...validation,
      characterCount: processedContent.length,
    };
  }, [processedContent, calculateCost, validateMessage]);

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="flex flex-col h-full max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              {template.name}
            </h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-1" />
                Created {formatDate(template.createdAt)}
              </span>
              <span>Used {template.usageCount} times</span>
              {template.category && (
                <span className="flex items-center">
                  <TagIcon className="h-4 w-4 mr-1" />
                  {template.category}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {onUse && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onUse}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <CheckCircleIcon className="h-4 w-4" />
                <span>Use Template</span>
              </motion.button>
            )}
            {onEdit && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onEdit}
                className="flex items-center space-x-2 px-4 py-2 text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
              >
                <PencilIcon className="h-4 w-4" />
                <span>Edit</span>
              </motion.button>
            )}
            {onDuplicate && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onDuplicate}
                className="flex items-center space-x-2 px-4 py-2 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <DocumentDuplicateIcon className="h-4 w-4" />
                <span>Duplicate</span>
              </motion.button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Template Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Template Details</h3>
            
            {template.subject && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <p className="text-gray-900 bg-gray-50 rounded-lg p-3">
                  {template.subject}
                </p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Original Content
              </label>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-900 whitespace-pre-wrap font-sans">
                  {template.content}
                </pre>
              </div>
            </div>

            {template.variables && template.variables.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Variables ({template.variables.length})
                </label>
                <div className="flex flex-wrap gap-2">
                  {template.variables.map((variable) => (
                    <span
                      key={variable}
                      className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full"
                    >
                      <SparklesIcon className="h-3 w-3 mr-1" />
                      {variable}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Live Preview */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Live Preview</h3>
              <button className="text-sm text-indigo-600 hover:text-indigo-700">
                Edit sample data
              </button>
            </div>

            {/* Sample Contact Data */}
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Sample Contact Data</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-blue-700">Name:</span> {previewContact.name}
                </div>
                <div>
                  <span className="text-blue-700">Phone:</span> {previewContact.phone}
                </div>
                <div>
                  <span className="text-blue-700">Email:</span> {previewContact.email}
                </div>
                <div>
                  <span className="text-blue-700">Company:</span> {previewContact.company}
                </div>
              </div>
            </div>

            {/* Message Preview */}
            <div className="space-y-4">
              {/* SMS Preview */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <PhoneIcon className="h-4 w-4 mr-2" />
                  SMS Preview
                </h4>
                <div className="bg-gray-900 text-white rounded-lg p-4 max-w-xs">
                  <div className="text-sm whitespace-pre-wrap">
                    {processedContent}
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    {formatDate(new Date())}
                  </div>
                </div>
              </div>

              {/* Email Preview (if subject exists) */}
              {template.subject && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <EnvelopeIcon className="h-4 w-4 mr-2" />
                    Email Preview
                  </h4>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                      <div className="text-sm">
                        <div className="font-medium">Subject: {template.subject}</div>
                        <div className="text-gray-600">From: Your Business</div>
                        <div className="text-gray-600">To: {previewContact.email}</div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="text-sm whitespace-pre-wrap">
                        {processedContent}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SMS Analytics */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <InformationCircleIcon className="h-5 w-5 mr-2" />
              SMS Analytics
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{smsMetrics.characterCount}</div>
                <div className="text-xs text-gray-600">Characters</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{smsMetrics.segments}</div>
                <div className="text-xs text-gray-600">SMS Segments</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">${smsMetrics.totalCost.toFixed(4)}</div>
                <div className="text-xs text-gray-600">Cost per message</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{template.usageCount}</div>
                <div className="text-xs text-gray-600">Times used</div>
              </div>
            </div>

            {/* Warnings */}
            {smsMetrics.warnings.length > 0 && (
              <div className="space-y-2">
                {smsMetrics.warnings.map((warning, index) => (
                  <div key={index} className="flex items-start space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-amber-800">{warning}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Errors */}
            {smsMetrics.errors.length > 0 && (
              <div className="space-y-2 mt-4">
                {smsMetrics.errors.map((error, index) => (
                  <div key={index} className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Success message */}
            {smsMetrics.isValid && smsMetrics.warnings.length === 0 && (
              <div className="flex items-start space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-green-800">
                  Template is ready to use with optimal SMS delivery settings.
                </p>
              </div>
            )}
          </div>

          {/* Template History */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Template History</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">Template created</p>
                  <p className="text-xs text-gray-600">{formatDate(template.createdAt)}</p>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  Created
                </span>
              </div>
              {template.updatedAt !== template.createdAt && (
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Last updated</p>
                    <p className="text-xs text-gray-600">{formatDate(template.updatedAt)}</p>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    Updated
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">Usage statistics</p>
                  <p className="text-xs text-gray-600">Used in {template.usageCount} messages</p>
                </div>
                <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
                  {template.usageCount} uses
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default TemplatePreview;