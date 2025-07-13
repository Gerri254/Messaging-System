import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PaperAirplaneIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ClockIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  TagIcon,
  BookmarkIcon,
} from '@heroicons/react/24/outline';
import { useMessageStore } from '../../store/messageStore';
import { useContactStore } from '../../store/contactStore';
import { useTemplateStore } from '../../store/templateStore';
import MessageComposer from '../../components/messaging/MessageComposer';
import ContactSelector from '../../components/messaging/ContactSelector';
import TemplateLibrary from '../../components/messaging/TemplateLibrary';
import MessageHistory from '../../components/messaging/MessageHistory';
import MessageScheduler from '../../components/messaging/MessageScheduler';
import MessageAnalytics from '../../components/messaging/MessageAnalytics';

type TabType = 'compose' | 'history' | 'templates' | 'scheduled' | 'analytics';

const MessagingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('compose');
  const [showContactSelector, setShowContactSelector] = useState(false);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const { messages, isLoading: messagesLoading, fetchMessages } = useMessageStore();
  const { contacts, groups, fetchContacts, fetchGroups } = useContactStore();
  const { templates, fetchTemplates } = useTemplateStore();

  useEffect(() => {
    fetchMessages();
    fetchContacts();
    fetchGroups();
    fetchTemplates();
  }, []);

  const tabs = [
    {
      id: 'compose',
      name: 'Compose',
      icon: PaperAirplaneIcon,
      count: null,
    },
    {
      id: 'history',
      name: 'History',
      icon: DocumentTextIcon,
      count: messages?.length || 0,
    },
    {
      id: 'templates',
      name: 'Templates',
      icon: BookmarkIcon,
      count: templates?.length || 0,
    },
    {
      id: 'scheduled',
      name: 'Scheduled',
      icon: ClockIcon,
      count: messages?.filter(m => m.status === 'SCHEDULED')?.length || 0,
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: ChartBarIcon,
      count: null,
    },
  ];

  const handleContactSelect = (contacts: any[]) => {
    setSelectedContacts(contacts);
    setShowContactSelector(false);
  };

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
    setShowTemplateLibrary(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Messaging Center
              </h1>
              <p className="mt-2 text-gray-600">
                Send SMS messages, manage templates, and track delivery status
              </p>
            </div>
            
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowContactSelector(true)}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
              >
                <UserGroupIcon className="h-5 w-5 mr-2" />
                Select Contacts
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowTemplateLibrary(true)}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <BookmarkIcon className="h-5 w-5 mr-2" />
                Use Template
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 bg-white rounded-xl shadow-sm overflow-hidden">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`
                      whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors
                      ${isActive
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <tab.icon className="h-5 w-5" />
                    <span>{tab.name}</span>
                    {tab.count !== null && (
                      <span className={`
                        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${isActive 
                          ? 'bg-indigo-100 text-indigo-800' 
                          : 'bg-gray-100 text-gray-800'
                        }
                      `}>
                        {tab.count}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'compose' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Message Composer */}
              <div className="lg:col-span-2">
                <MessageComposer
                  selectedContacts={selectedContacts}
                  selectedTemplate={selectedTemplate}
                  onContactsChange={setSelectedContacts}
                  onTemplateChange={setSelectedTemplate}
                />
              </div>
              
              {/* Sidebar */}
              <div className="space-y-6">
                {/* Selected Contacts Summary */}
                {selectedContacts.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
                  >
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Selected Recipients
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Total Recipients:</span>
                        <span className="font-medium text-gray-900">
                          {selectedContacts.length}
                        </span>
                      </div>
                      <div className="max-h-32 overflow-y-auto">
                        {selectedContacts.slice(0, 5).map((contact, index) => (
                          <div key={contact.id} className="flex items-center space-x-2 py-1">
                            <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-indigo-600">
                                {contact.name?.[0] || '?'}
                              </span>
                            </div>
                            <span className="text-sm text-gray-600 truncate">
                              {contact.name}
                            </span>
                          </div>
                        ))}
                        {selectedContacts.length > 5 && (
                          <div className="text-xs text-gray-500 pt-2">
                            +{selectedContacts.length - 5} more recipients
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Quick Actions */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowContactSelector(true)}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                    >
                      <UserGroupIcon className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-700">Select Recipients</span>
                    </button>
                    
                    <button
                      onClick={() => setShowTemplateLibrary(true)}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                    >
                      <BookmarkIcon className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-700">Choose Template</span>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('scheduled')}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                    >
                      <ClockIcon className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-700">Schedule Message</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <MessageHistory />
          )}

          {activeTab === 'templates' && (
            <TemplateLibrary onTemplateSelect={handleTemplateSelect} />
          )}

          {activeTab === 'scheduled' && (
            <MessageScheduler 
              isOpen={true}
              onClose={() => setActiveTab('compose')}
            />
          )}

          {activeTab === 'analytics' && (
            <MessageAnalytics />
          )}
        </motion.div>
      </div>

      {/* Modals */}
      {showContactSelector && (
        <ContactSelector
          isOpen={showContactSelector}
          onClose={() => setShowContactSelector(false)}
          onSelect={handleContactSelect}
          selectedContacts={selectedContacts}
        />
      )}

      {showTemplateLibrary && (
        <TemplateLibrary
          isOpen={showTemplateLibrary}
          onClose={() => setShowTemplateLibrary(false)}
          onSelect={handleTemplateSelect}
        />
      )}
    </div>
  );
};

export default MessagingPage;