import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Search, Filter, Upload, Download, Edit, Trash2, Phone, Mail, X } from 'lucide-react';

import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import AddContactModal from '../../components/forms/AddContactModal';
import { contactsApi } from '../../utils/api';
import { Contact } from '../../types';

const ContactsPage = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchContacts();
    loadSearchHistory();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchHistory(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        fetchContacts(searchTerm);
      } else {
        fetchContacts();
      }
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const loadSearchHistory = () => {
    const history = localStorage.getItem('contact-search-history');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  };

  const saveSearchTerm = (term: string) => {
    if (!term.trim()) return;
    
    const newHistory = [term, ...searchHistory.filter(item => item !== term)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('contact-search-history', JSON.stringify(newHistory));
  };

  const fetchContacts = async (search?: string) => {
    try {
      if (search) {
        setSearchLoading(true);
      } else {
        setLoading(true);
      }
      
      const params = search ? { search, limit: 50 } : { limit: 50 };
      const response = await contactsApi.getContacts(params);
      setContacts(response.data.contacts);
      setError(null);
      
      if (search) {
        saveSearchTerm(search);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch contacts');
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (!value.trim()) {
      setShowSearchHistory(false);
    }
  };

  const handleSearchFocus = () => {
    if (searchHistory.length > 0 && !searchTerm.trim()) {
      setShowSearchHistory(true);
    }
  };

  const handleSearchHistorySelect = (term: string) => {
    setSearchTerm(term);
    setShowSearchHistory(false);
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('contact-search-history');
    setShowSearchHistory(false);
  };

  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? <mark key={index} className="bg-yellow-200 text-yellow-900 px-1 rounded">{part}</mark> : part
    );
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-600 mt-1">Manage your contact lists and groups.</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="secondary" leftIcon={<Upload className="w-4 h-4" />}>
            Import
          </Button>
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>
            Add Contact
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-lg relative" ref={searchContainerRef}>
              <Input
                placeholder="Search contacts by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={handleSearchFocus}
                leftIcon={searchLoading ? 
                  <div className="animate-spin w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full" /> : 
                  <Search className="w-4 h-4" />
                }
              />
              
              {/* Search History Dropdown */}
              {showSearchHistory && searchHistory.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  <div className="p-2 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Recent Searches</span>
                    <button
                      onClick={clearSearchHistory}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      Clear
                    </button>
                  </div>
                  {searchHistory.map((term, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearchHistorySelect(term)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Search className="w-3 h-3 text-gray-400" />
                      <span>{term}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex space-x-3">
              <Button variant="secondary" leftIcon={<Filter className="w-4 h-4" />}>
                Filter
              </Button>
              <Button variant="secondary" leftIcon={<Download className="w-4 h-4" />}>
                Export
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading contacts...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Contacts</h3>
              <p className="text-red-600 mb-6">{error}</p>
              <Button onClick={fetchContacts}>Retry</Button>
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No contacts found' : 'No contacts yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? `No contacts match "${searchTerm}". Try a different search term.`
                  : 'Start by adding your first contact to begin messaging.'
                }
              </p>
              {!searchTerm && <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>Add First Contact</Button>}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
                  {searchTerm && ` matching "${searchTerm}"`}
                  {searchLoading && <span className="text-sm text-gray-500 ml-2">(searching...)</span>}
                </h3>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
                  >
                    <span>Clear search</span>
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="grid gap-4">
                {contacts.map((contact, index) => (
                  <motion.div
                    key={contact.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-semibold">
                            {contact.name.charAt(0)}{contact.name.split(' ')[1]?.charAt(0) || ''}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {highlightSearchTerm(contact.name, searchTerm)}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Phone className="w-3 h-3" />
                              <span>{highlightSearchTerm(contact.phone, searchTerm)}</span>
                            </div>
                            {contact.email && (
                              <div className="flex items-center space-x-1">
                                <Mail className="w-3 h-3" />
                                <span>{highlightSearchTerm(contact.email, searchTerm)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" leftIcon={<Edit className="w-3 h-3" />}>
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" leftIcon={<Trash2 className="w-3 h-3" />}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Add Contact Modal */}
      <AddContactModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onContactAdded={fetchContacts}
      />
    </div>
  );
};

export default ContactsPage;