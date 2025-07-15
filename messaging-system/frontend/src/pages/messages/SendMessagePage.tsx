import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Send, Users, MessageSquare, ArrowLeft, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';

import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { contactsApi, messagesApi } from '../../utils/api';
import { Contact } from '../../types';

const SendMessagePage = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async (search?: string) => {
    try {
      setContactsLoading(true);
      const params = search ? { search, limit: 100 } : { limit: 100 };
      const response = await contactsApi.getContacts(params);
      setContacts(response.data.contacts);
    } catch (err: any) {
      toast.error('Failed to load contacts');
    } finally {
      setContactsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchContacts(searchTerm.trim() || undefined);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const filteredContacts = contacts;

  const handleContactToggle = (contactId: string) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSelectAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredContacts.map(contact => contact.id));
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    if (selectedContacts.length === 0) {
      setError('Please select at least one contact');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Send to contacts
      if (selectedContacts.length === 1) {
        const contact = contacts.find(c => c.id === selectedContacts[0]);
        await messagesApi.sendMessage({
          content: message.trim(),
          recipients: [{
            phone: contact!.phone,
            name: contact!.name
          }]
        });
      } else {
        await messagesApi.bulkSendMessage({
          content: message.trim(),
          contactIds: selectedContacts
        });
      }

      toast.success(`Message sent to ${selectedContacts.length} contact${selectedContacts.length > 1 ? 's' : ''}!`);
      navigate('/messages');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send message');
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const selectedContactsData = contacts.filter(contact => 
    selectedContacts.includes(contact.id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/messages')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Send Message</h1>
            <p className="text-gray-600 mt-1">Compose and send SMS to your contacts.</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Selection */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Select Recipients</h3>
              <span className="text-sm text-gray-500">
                {selectedContacts.length} selected
              </span>
            </div>

            {/* Search */}
            <div className="mb-4">
              <Input
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={contactsLoading ? 
                  <div className="animate-spin w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full" /> : 
                  <Users className="w-4 h-4" />
                }
              />
            </div>

            {/* Select All */}
            {filteredContacts.length > 0 && (
              <div className="mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  className="text-primary-600"
                >
                  {selectedContacts.length === filteredContacts.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
            )}

            {/* Contact List */}
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {contactsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Loading contacts...</p>
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">
                    {searchTerm ? 'No contacts found' : 'No contacts available'}
                  </p>
                  {!searchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/contacts')}
                      leftIcon={<Plus className="w-3 h-3" />}
                      className="mt-2"
                    >
                      Add Contacts
                    </Button>
                  )}
                </div>
              ) : (
                filteredContacts.map(contact => (
                  <div
                    key={contact.id}
                    onClick={() => handleContactToggle(contact.id)}
                    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedContacts.includes(contact.id)
                        ? 'bg-primary-50 border border-primary-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedContacts.includes(contact.id)}
                      onChange={() => {}}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {contact.name}
                      </p>
                      <p className="text-sm text-gray-600">{contact.phone}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </motion.div>

        {/* Message Composition */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          {/* Selected Recipients */}
          {selectedContactsData.length > 0 && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Recipients</h3>
              <div className="flex flex-wrap gap-2">
                {selectedContactsData.map(contact => (
                  <span
                    key={contact.id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                  >
                    {contact.name}
                    <button
                      onClick={() => handleContactToggle(contact.id)}
                      className="ml-2 text-primary-600 hover:text-primary-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* Message Composition */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Message</h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message Content
                </label>
                <textarea
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Type your message here..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-gray-500">
                    {message.length}/160 characters
                  </p>
                  {message.length > 160 && (
                    <p className="text-sm text-orange-600">
                      This message will be sent as {Math.ceil(message.length / 160)} SMS
                    </p>
                  )}
                </div>
              </div>

              {/* Send Button */}
              <Button
                onClick={handleSendMessage}
                loading={loading}
                disabled={!message.trim() || selectedContacts.length === 0}
                leftIcon={<Send className="w-4 h-4" />}
                className="w-full"
              >
                Send Message to {selectedContacts.length} Contact{selectedContacts.length !== 1 ? 's' : ''}
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default SendMessagePage;