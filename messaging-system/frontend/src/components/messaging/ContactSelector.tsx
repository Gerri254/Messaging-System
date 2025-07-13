import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  UserIcon,
  TagIcon,
  FunnelIcon,
  CheckIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useContactStore } from '../../store/contactStore';
import ContactBadge from '../ui/ContactBadge';
import Modal from '../ui/Modal';

interface ContactSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (contacts: any[]) => void;
  selectedContacts: any[];
  maxSelection?: number;
}

const ContactSelector: React.FC<ContactSelectorProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedContacts,
  maxSelection = 1000,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'contacts' | 'groups'>('contacts');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [tempSelectedContacts, setTempSelectedContacts] = useState<any[]>(selectedContacts);
  const [showFilters, setShowFilters] = useState(false);

  const {
    contacts,
    groups,
    tags,
    isLoading,
    fetchContacts,
    fetchGroups,
    fetchTags,
    searchContacts,
  } = useContactStore();

  useEffect(() => {
    if (isOpen) {
      fetchContacts();
      fetchGroups();
      fetchTags();
      setTempSelectedContacts(selectedContacts);
    }
  }, [isOpen, selectedContacts]);

  // Filter contacts based on search and filters
  const filteredContacts = useMemo(() => {
    if (!contacts) return [];

    let filtered = [...contacts];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(contact =>
        contact.name?.toLowerCase().includes(query) ||
        contact.phone?.includes(query) ||
        contact.email?.toLowerCase().includes(query)
      );
    }

    // Tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(contact =>
        contact.tags && 
        selectedTags.some(tag => (contact.tags as string[]).includes(tag))
      );
    }

    // Group filter
    if (selectedGroups.length > 0) {
      filtered = filtered.filter(contact =>
        contact.groups && 
        contact.groups.some((g: any) => selectedGroups.includes(g.contactGroup.id))
      );
    }

    return filtered;
  }, [contacts, searchQuery, selectedTags, selectedGroups]);

  // Check if contact is selected
  const isContactSelected = (contactId: string) => {
    return tempSelectedContacts.some(c => c.id === contactId);
  };

  // Toggle contact selection
  const toggleContact = (contact: any) => {
    if (isContactSelected(contact.id)) {
      setTempSelectedContacts(prev => prev.filter(c => c.id !== contact.id));
    } else {
      if (tempSelectedContacts.length < maxSelection) {
        setTempSelectedContacts(prev => [...prev, contact]);
      }
    }
  };

  // Select all filtered contacts
  const selectAllFiltered = () => {
    const availableContacts = filteredContacts.filter(
      contact => !isContactSelected(contact.id)
    );
    const remainingSlots = maxSelection - tempSelectedContacts.length;
    const contactsToAdd = availableContacts.slice(0, remainingSlots);
    
    setTempSelectedContacts(prev => [...prev, ...contactsToAdd]);
  };

  // Select contacts from group
  const selectGroup = (group: any) => {
    const groupContacts = contacts?.filter(contact =>
      contact.groups?.some((g: any) => g.contactGroup.id === group.id)
    ) || [];

    const availableContacts = groupContacts.filter(
      contact => !isContactSelected(contact.id)
    );
    const remainingSlots = maxSelection - tempSelectedContacts.length;
    const contactsToAdd = availableContacts.slice(0, remainingSlots);
    
    setTempSelectedContacts(prev => [...prev, ...contactsToAdd]);
  };

  // Clear all selections
  const clearAll = () => {
    setTempSelectedContacts([]);
  };

  // Apply selection
  const handleApply = () => {
    onSelect(tempSelectedContacts);
    onClose();
  };

  // Toggle tag filter
  const toggleTagFilter = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // Toggle group filter
  const toggleGroupFilter = (groupId: string) => {
    setSelectedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(g => g !== groupId)
        : [...prev, groupId]
    );
  };

  const tabs = [
    {
      id: 'contacts',
      name: 'Contacts',
      icon: UserIcon,
      count: filteredContacts.length,
    },
    {
      id: 'groups',
      name: 'Groups',
      icon: UserGroupIcon,
      count: groups?.length || 0,
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="flex flex-col h-[70vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Select Recipients
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {tempSelectedContacts.length} of {maxSelection} selected
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
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
                placeholder="Search contacts..."
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

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                {/* Tags Filter */}
                {tags && tags.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Filter by Tags
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {tags.map(tag => (
                        <motion.button
                          key={tag}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => toggleTagFilter(tag)}
                          className={`
                            inline-flex items-center px-3 py-1 rounded-full text-sm transition-colors
                            ${selectedTags.includes(tag)
                              ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                              : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                            }
                          `}
                        >
                          <TagIcon className="h-3 w-3 mr-1" />
                          {tag}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Groups Filter */}
                {groups && groups.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Filter by Groups
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {groups.map(group => (
                        <motion.button
                          key={group.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => toggleGroupFilter(group.id)}
                          className={`
                            inline-flex items-center px-3 py-1 rounded-full text-sm transition-colors
                            ${selectedGroups.includes(group.id)
                              ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                              : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                            }
                          `}
                        >
                          <UserGroupIcon className="h-3 w-3 mr-1" />
                          {group.name}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Selected Contacts */}
        {tempSelectedContacts.length > 0 && (
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900">
                Selected ({tempSelectedContacts.length})
              </h3>
              <button
                onClick={clearAll}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Clear All
              </button>
            </div>
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
              {tempSelectedContacts.map(contact => (
                <ContactBadge
                  key={contact.id}
                  contact={contact}
                  onRemove={() => toggleContact(contact)}
                  size="sm"
                />
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {tabs.map(tab => (
            <motion.button
              key={tab.id}
              whileHover={{ backgroundColor: '#f9fafb' }}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`
                flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-sm font-medium transition-colors
                ${selectedTab === tab.id
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.name}</span>
              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                {tab.count}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {selectedTab === 'contacts' && (
            <div className="p-4">
              {/* Bulk Actions */}
              {filteredContacts.length > 0 && (
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-600">
                    {filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''} found
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={selectAllFiltered}
                    disabled={tempSelectedContacts.length >= maxSelection}
                    className="text-sm text-indigo-600 hover:text-indigo-800 disabled:text-gray-400"
                  >
                    Select All Visible
                  </motion.button>
                </div>
              )}

              {/* Contacts List */}
              <div className="space-y-2">
                {filteredContacts.map(contact => {
                  const selected = isContactSelected(contact.id);
                  return (
                    <motion.div
                      key={contact.id}
                      whileHover={{ backgroundColor: '#f9fafb' }}
                      onClick={() => toggleContact(contact)}
                      className={`
                        flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors
                        ${selected
                          ? 'bg-indigo-50 border-indigo-300'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                          ${selected
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-gray-100 text-gray-600'
                          }
                        `}>
                          {contact.name?.[0] || '?'}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {contact.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {contact.phone}
                          </p>
                          {contact.email && (
                            <p className="text-xs text-gray-500">
                              {contact.email}
                            </p>
                          )}
                          {contact.tags && contact.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {(contact.tags as string[]).slice(0, 3).map(tag => (
                                <span
                                  key={tag}
                                  className="inline-block px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                              {contact.tags.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{contact.tags.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className={`
                        w-5 h-5 rounded border-2 flex items-center justify-center
                        ${selected
                          ? 'bg-indigo-600 border-indigo-600'
                          : 'border-gray-300'
                        }
                      `}>
                        {selected && (
                          <CheckIcon className="h-3 w-3 text-white" />
                        )}
                      </div>
                    </motion.div>
                  );
                })}

                {filteredContacts.length === 0 && !isLoading && (
                  <div className="text-center py-8">
                    <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No contacts found</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Try adjusting your search or filters
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedTab === 'groups' && (
            <div className="p-4">
              <div className="space-y-3">
                {groups?.map(group => (
                  <motion.div
                    key={group.id}
                    whileHover={{ backgroundColor: '#f9fafb' }}
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: group.color || '#6b7280' }}
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {group.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {group._count?.contacts || 0} contacts
                        </p>
                        {group.description && (
                          <p className="text-xs text-gray-500 mt-1">
                            {group.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => selectGroup(group)}
                      disabled={tempSelectedContacts.length >= maxSelection}
                      className="flex items-center space-x-1 px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800 disabled:text-gray-400 transition-colors"
                    >
                      <PlusIcon className="h-4 w-4" />
                      <span>Add All</span>
                    </motion.button>
                  </motion.div>
                ))}

                {(!groups || groups.length === 0) && !isLoading && (
                  <div className="text-center py-8">
                    <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No groups found</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {tempSelectedContacts.length} of {maxSelection} recipients selected
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
              onClick={handleApply}
              disabled={tempSelectedContacts.length === 0}
              className={`
                px-4 py-2 rounded-lg font-medium transition-colors
                ${tempSelectedContacts.length > 0
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              Select {tempSelectedContacts.length} Contact{tempSelectedContacts.length !== 1 ? 's' : ''}
            </motion.button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ContactSelector;