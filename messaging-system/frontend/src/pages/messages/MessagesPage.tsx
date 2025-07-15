import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Send, Clock, Calendar, CheckCircle, AlertCircle, Eye } from 'lucide-react';

import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { messagesApi } from '../../utils/api';
import { Message } from '../../types';

const MessagesPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await messagesApi.getMessages();
      setMessages(response.data.messages);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'sending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Badge variant="success">Delivered</Badge>;
      case 'sending':
        return <Badge variant="warning">Sending</Badge>;
      case 'failed':
        return <Badge variant="danger">Failed</Badge>;
      default:
        return <Badge variant="default">Unknown</Badge>;
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600 mt-1">Send and manage your SMS campaigns.</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="secondary" leftIcon={<Calendar className="w-4 h-4" />} onClick={() => navigate('/messages/schedule')}>
            Schedule
          </Button>
          <Button leftIcon={<Send className="w-4 h-4" />} onClick={() => navigate('/messages/send')}>
            Send Message
          </Button>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading messages...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Messages</h3>
              <p className="text-red-600 mb-6">{error}</p>
              <Button onClick={fetchMessages}>Retry</Button>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
              <p className="text-gray-600 mb-6">
                Start your first SMS campaign by sending a message to your contacts.
              </p>
              <Button leftIcon={<Send className="w-4 h-4" />} onClick={() => navigate('/messages/send')}>
                Send First Message
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {messages.length} message{messages.length !== 1 ? 's' : ''}
                </h3>
              </div>
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getStatusIcon(message.status)}
                          <span className="text-sm font-medium text-gray-900">
                            Message #{message.id.slice(-8)}
                          </span>
                          {getStatusBadge(message.status)}
                        </div>
                        <p className="text-gray-900 mb-2 line-clamp-2">{message.content}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Recipients: {message.recipientCount || 0}</span>
                          <span>•</span>
                          <span>Sent: {new Date(message.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          leftIcon={<Eye className="w-3 h-3" />}
                          onClick={() => navigate(`/messages/${message.id}`)}
                        >
                          View
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
    </div>
  );
};

export default MessagesPage;