import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  DocumentTextIcon,
  TagIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  FunnelIcon,
  BookmarkIcon,
  EyeIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { useTemplateStore } from '../../store/templateStore';
import Modal from '../ui/Modal';
import TemplateEditor from './TemplateEditor';
import TemplatePreview from './TemplatePreview';

interface TemplateLibraryProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSelect?: (template: any) => void;
  onTemplateSelect?: (template: any) => void;
  mode?: 'selector' | 'manager';
}

const TemplateLibrary: React.FC<TemplateLibraryProps> = ({
  isOpen = false,
  onClose,
  onSelect,
  onTemplateSelect,
  mode = 'selector',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  const {
    templates,
    categories,
    isLoading,
    fetchTemplates,
    getCategories,
    deleteTemplate,
    duplicateTemplate,
    searchTemplates,
  } = useTemplateStore();

  useEffect(() => {
    if (isOpen || mode === 'manager') {
      fetchTemplates();
      getCategories();
    }
  }, [isOpen, mode]);

  // Filter templates based on search and category
  const filteredTemplates = useMemo(() => {
    if (!templates) return [];

    let filtered = [...templates];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(query) ||
        template.content.toLowerCase().includes(query) ||
        template.category?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Sort by usage count and date
    filtered.sort((a, b) => {
      if (a.usageCount !== b.usageCount) {
        return b.usageCount - a.usageCount;
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return filtered;
  }, [templates, searchQuery, selectedCategory]);

  // Group templates by category
  const templatesByCategory = useMemo(() => {
    const grouped: { [key: string]: any[] } = {};
    
    filteredTemplates.forEach(template => {
      const category = template.category || 'Uncategorized';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(template);
    });

    return grouped;
  }, [filteredTemplates]);

  const handleSelectTemplate = (template: any) => {
    if (mode === 'selector') {
      setSelectedTemplateId(template.id);
      if (onSelect) onSelect(template);
      if (onTemplateSelect) onTemplateSelect(template);
      if (onClose) onClose();
    }
  };

  const handleEditTemplate = (template: any) => {
    setEditingTemplate(template);
    setShowEditor(true);
  };

  const handlePreviewTemplate = (template: any) => {
    setPreviewTemplate(template);
    setShowPreview(true);
  };

  const handleDeleteTemplate = async (template: any) => {
    if (confirm(`Are you sure you want to delete "${template.name}"?`)) {
      try {
        await deleteTemplate(template.id);
      } catch (error) {
        console.error('Failed to delete template:', error);
      }
    }
  };

  const handleDuplicateTemplate = async (template: any) => {
    try {
      await duplicateTemplate(template.id);
    } catch (error) {
      console.error('Failed to duplicate template:', error);
    }
  };

  const handleCreateNew = () => {
    setEditingTemplate(null);
    setShowEditor(true);
  };

  const renderTemplateCard = (template: any) => (
    <motion.div
      key={template.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`
        relative bg-white rounded-xl border-2 p-4 cursor-pointer transition-all
        ${mode === 'selector' && selectedTemplateId === template.id
          ? 'border-indigo-500 bg-indigo-50'
          : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
        }
      `}
      onClick={() => mode === 'selector' && handleSelectTemplate(template)}
    >
      {/* Template Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
            {template.name}
          </h3>
          {template.category && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              <TagIcon className="h-3 w-3 mr-1" />
              {template.category}
            </span>
          )}
        </div>
        
        {mode === 'manager' && (
          <div className="flex items-center space-x-1 ml-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                handlePreviewTemplate(template);
              }}
              className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
              title="Preview"
            >
              <EyeIcon className="h-4 w-4" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                handleEditTemplate(template);
              }}
              className="p-1 text-gray-400 hover:text-green-600 transition-colors"
              title="Edit"
            >
              <PencilIcon className="h-4 w-4" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                handleDuplicateTemplate(template);
              }}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="Duplicate"
            >
              <DocumentDuplicateIcon className="h-4 w-4" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteTemplate(template);
              }}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="Delete"
            >
              <TrashIcon className="h-4 w-4" />
            </motion.button>
          </div>
        )}
      </div>

      {/* Template Content Preview */}
      <div className="mb-3">
        <p className="text-sm text-gray-600 line-clamp-3">
          {template.content}
        </p>
      </div>

      {/* Template Variables */}
      {template.variables && template.variables.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {template.variables.slice(0, 3).map((variable: string) => (
              <span
                key={variable}
                className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
              >
                {variable}
              </span>
            ))}
            {template.variables.length > 3 && (
              <span className="text-xs text-gray-500">
                +{template.variables.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Template Stats */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Used {template.usageCount} times</span>
        <span>{new Date(template.updatedAt).toLocaleDateString()}</span>
      </div>

      {/* Selection Indicator */}
      {mode === 'selector' && selectedTemplateId === template.id && (
        <div className="absolute top-2 right-2">
          <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
            <CheckIcon className="h-4 w-4 text-white" />
          </div>
        </div>
      )}
    </motion.div>
  );

  const content = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'selector' ? 'Choose Template' : 'Template Library'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} available
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {mode === 'manager' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreateNew}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              <span>New Template</span>
            </motion.button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-6 border-b border-gray-200 space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
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
            <FunnelIcon className="h-5 w-5" />
            <span>Filters</span>
          </motion.button>
        </div>

        {/* Category Filter */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Category
              </label>
              <div className="flex flex-wrap gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedCategory('')}
                  className={`
                    px-3 py-1 rounded-full text-sm transition-colors
                    ${!selectedCategory
                      ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                      : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                    }
                  `}
                >
                  All Categories
                </motion.button>
                {categories?.map(category => (
                  <motion.button
                    key={category}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedCategory(category)}
                    className={`
                      px-3 py-1 rounded-full text-sm transition-colors
                      ${selectedCategory === category
                        ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                      }
                    `}
                  >
                    {category}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Templates Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {Object.keys(templatesByCategory).length > 0 ? (
          <div className="space-y-8">
            {Object.entries(templatesByCategory).map(([category, categoryTemplates]) => (
              <div key={category}>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <BookmarkIcon className="h-5 w-5 mr-2 text-indigo-600" />
                  {category}
                  <span className="ml-2 text-sm text-gray-500 font-normal">
                    ({categoryTemplates.length})
                  </span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryTemplates.map(renderTemplateCard)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">
              {searchQuery || selectedCategory ? 'No templates found' : 'No templates yet'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {searchQuery || selectedCategory 
                ? 'Try adjusting your search or filters'
                : 'Create your first template to get started'
              }
            </p>
            {mode === 'manager' && !searchQuery && !selectedCategory && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreateNew}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors mx-auto"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Create Template</span>
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* Footer for selector mode */}
      {mode === 'selector' && (
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedTemplateId ? 'Template selected' : 'Select a template to continue'}
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
          </div>
        </div>
      )}
    </div>
  );

  if (mode === 'manager') {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 h-full">
        {content}
        
        {/* Modals */}
        {showEditor && (
          <TemplateEditor
            isOpen={showEditor}
            onClose={() => {
              setShowEditor(false);
              setEditingTemplate(null);
            }}
            template={editingTemplate}
          />
        )}
        
        {showPreview && previewTemplate && (
          <TemplatePreview
            isOpen={showPreview}
            onClose={() => {
              setShowPreview(false);
              setPreviewTemplate(null);
            }}
            template={previewTemplate}
          />
        )}
      </div>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose || (() => {})} size="xl">
      {content}
      
      {/* Modals */}
      {showEditor && (
        <TemplateEditor
          isOpen={showEditor}
          onClose={() => {
            setShowEditor(false);
            setEditingTemplate(null);
          }}
          template={editingTemplate}
        />
      )}
      
      {showPreview && previewTemplate && (
        <TemplatePreview
          isOpen={showPreview}
          onClose={() => {
            setShowPreview(false);
            setPreviewTemplate(null);
          }}
          template={previewTemplate}
        />
      )}
    </Modal>
  );
};

export default TemplateLibrary;