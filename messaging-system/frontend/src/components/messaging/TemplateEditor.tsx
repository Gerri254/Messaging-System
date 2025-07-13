import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  CheckIcon,
  EyeIcon,
  TagIcon,
  SparklesIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { useTemplateStore, MessageTemplate, CreateTemplateData, UpdateTemplateData } from '../../store/templateStore';
import Modal from '../ui/Modal';
import RichTextEditor from '../ui/RichTextEditor';
import LoadingSpinner from '../ui/LoadingSpinner';

interface TemplateEditorProps {
  isOpen: boolean;
  onClose: () => void;
  template?: MessageTemplate | null;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({
  isOpen,
  onClose,
  template,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    category: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);

  const {
    createTemplate,
    updateTemplate,
    categories,
    getCategories,
    isLoading,
    error,
    clearError,
  } = useTemplateStore();

  const isEditing = !!template;

  // Load template data when editing
  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        subject: template.subject || '',
        content: template.content,
        category: template.category || '',
      });
    } else {
      setFormData({
        name: '',
        subject: '',
        content: '',
        category: '',
      });
    }
    setErrors({});
    setShowCustomCategory(false);
    setCustomCategory('');
  }, [template, isOpen]);

  // Load categories
  useEffect(() => {
    if (isOpen) {
      getCategories();
    }
  }, [isOpen]);

  // Extract variables from content
  const variables = useMemo(() => {
    const matches = formData.content.match(/\{\{[^}]+\}\}/g);
    return matches ? Array.from(new Set(matches)) : [];
  }, [formData.content]);

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Template name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Template name must be at least 3 characters';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Template name must be less than 100 characters';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Template content is required';
    } else if (formData.content.length > 1600) {
      newErrors.content = 'Template content must be less than 1600 characters';
    }

    if (formData.subject && formData.subject.length > 200) {
      newErrors.subject = 'Subject must be less than 200 characters';
    }

    if (showCustomCategory && !customCategory.trim()) {
      newErrors.category = 'Custom category name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, showCustomCategory, customCategory]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    clearError();

    try {
      const finalCategory = showCustomCategory ? customCategory.trim() : formData.category;
      
      const templateData = {
        name: formData.name.trim(),
        subject: formData.subject.trim() || undefined,
        content: formData.content.trim(),
        category: finalCategory || undefined,
        variables,
      };

      if (isEditing && template) {
        await updateTemplate(template.id, templateData as UpdateTemplateData);
      } else {
        await createTemplate(templateData as CreateTemplateData);
      }

      onClose();
    } catch (error) {
      console.error('Failed to save template:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    if (category === 'custom') {
      setShowCustomCategory(true);
      setFormData(prev => ({ ...prev, category: '' }));
    } else {
      setShowCustomCategory(false);
      setCustomCategory('');
      setFormData(prev => ({ ...prev, category }));
    }
  };

  // Calculate character count and segments
  const characterCount = formData.content.length;
  const segments = Math.ceil(characterCount / 160) || 1;
  const remainingChars = 160 - (characterCount % 160);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="flex flex-col h-full max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Edit Template' : 'Create New Template'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {isEditing ? 'Update your message template' : 'Create a reusable message template'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center space-x-2 px-4 py-2 text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <EyeIcon className="h-4 w-4" />
              <span>{showPreview ? 'Hide' : 'Show'} Preview</span>
            </motion.button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-hidden">
          <div className={`grid ${showPreview ? 'grid-cols-2' : 'grid-cols-1'} h-full`}>
            {/* Form */}
            <div className="flex flex-col overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Template Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter template name..."
                    className={`
                      w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors
                      ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'}
                    `}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Subject (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    placeholder="Enter subject..."
                    className={`
                      w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors
                      ${errors.subject ? 'border-red-300 bg-red-50' : 'border-gray-300'}
                    `}
                  />
                  {errors.subject && (
                    <p className="text-sm text-red-600 mt-1">{errors.subject}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <div className="space-y-3">
                    <select
                      value={showCustomCategory ? 'custom' : formData.category}
                      onChange={(e) => handleCategorySelect(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">No Category</option>
                      {categories?.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                      <option value="custom">+ Create New Category</option>
                    </select>

                    {/* Custom Category Input */}
                    <AnimatePresence>
                      {showCustomCategory && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <input
                            type="text"
                            value={customCategory}
                            onChange={(e) => setCustomCategory(e.target.value)}
                            placeholder="Enter new category name..."
                            className={`
                              w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors
                              ${errors.category ? 'border-red-300 bg-red-50' : 'border-gray-300'}
                            `}
                          />
                          {errors.category && (
                            <p className="text-sm text-red-600 mt-1">{errors.category}</p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message Content *
                  </label>
                  <RichTextEditor
                    value={formData.content}
                    onChange={(value) => handleInputChange('content', value)}
                    placeholder="Type your message here..."
                    maxLength={1600}
                    showVariableHelper
                    className={errors.content ? 'border-red-300' : ''}
                  />
                  {errors.content && (
                    <p className="text-sm text-red-600 mt-1">{errors.content}</p>
                  )}
                  
                  {/* Character Count and Stats */}
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {characterCount}/1600 characters
                      {segments > 1 && ` • ${segments} SMS segments`}
                    </span>
                    {characterCount > 160 && (
                      <span className="text-amber-600">
                        {remainingChars} chars until next segment
                      </span>
                    )}
                  </div>
                </div>

                {/* Variables Preview */}
                {variables.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <SparklesIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-900 mb-2">
                          Template Variables ({variables.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {variables.map((variable) => (
                            <span
                              key={variable}
                              className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                            >
                              {variable}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-blue-700 mt-2">
                          These variables will be replaced with actual values when sending messages.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {isEditing ? 'Changes will be saved to this template' : 'Template will be available for future messages'}
                    </div>
                    <div className="flex items-center space-x-3">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isSaving || isLoading}
                        className="flex items-center space-x-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isSaving || isLoading ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <CheckIcon className="h-4 w-4" />
                        )}
                        <span>{isEditing ? 'Update Template' : 'Create Template'}</span>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Preview Panel */}
            <AnimatePresence>
              {showPreview && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="border-l border-gray-200 bg-gray-50 overflow-y-auto"
                >
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <DocumentTextIcon className="h-5 w-5 mr-2" />
                      Template Preview
                    </h3>

                    {/* Template Card Preview */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {formData.name || 'Untitled Template'}
                          </h4>
                          {(formData.category || customCategory) && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              <TagIcon className="h-3 w-3 mr-1" />
                              {showCustomCategory ? customCategory : formData.category}
                            </span>
                          )}
                        </div>
                      </div>

                      {formData.subject && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-600">
                            <strong>Subject:</strong> {formData.subject}
                          </p>
                        </div>
                      )}

                      <div className="mb-3">
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">
                          {formData.content || 'Your message content will appear here...'}
                        </p>
                      </div>

                      {variables.length > 0 && (
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-1">
                            {variables.slice(0, 3).map((variable) => (
                              <span
                                key={variable}
                                className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                              >
                                {variable}
                              </span>
                            ))}
                            {variables.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{variables.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>0 times used</span>
                        <span>Just now</span>
                      </div>
                    </div>

                    {/* SMS Preview */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <InformationCircleIcon className="h-4 w-4 mr-2" />
                        SMS Preview
                      </h4>
                      
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <div className="text-sm text-gray-800 whitespace-pre-wrap">
                          {formData.content.replace(/\{\{[^}]+\}\}/g, (match) => {
                            const variable = match.slice(2, -2);
                            return `[${variable.toUpperCase()}]`;
                          }) || 'Your message content...'}
                        </div>
                      </div>

                      <div className="space-y-2 text-xs text-gray-600">
                        <div className="flex justify-between">
                          <span>Characters:</span>
                          <span className={characterCount > 160 ? 'text-amber-600' : ''}>
                            {characterCount}/160
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>SMS Segments:</span>
                          <span className={segments > 1 ? 'text-amber-600' : ''}>
                            {segments}
                          </span>
                        </div>
                        {segments > 1 && (
                          <div className="flex justify-between">
                            <span>Est. Cost per message:</span>
                            <span>${(0.0075 * segments).toFixed(4)}</span>
                          </div>
                        )}
                      </div>

                      {formData.content.length > 160 && (
                        <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                          <p className="text-xs text-amber-800">
                            ⚠️ Message exceeds 160 characters and will be split into {segments} SMS segments.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default TemplateEditor;