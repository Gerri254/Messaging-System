import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  DollarSign,
  Send,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const DashboardPage = () => {
  const navigate = useNavigate();

  // Mock data - will be replaced with real API data
  const stats = [
    {
      name: 'Total Contacts',
      value: '2,543',
      change: '+12%',
      changeType: 'positive' as const,
      icon: Users,
    },
    {
      name: 'Messages Sent',
      value: '18,492',
      change: '+8%',
      changeType: 'positive' as const,
      icon: MessageSquare,
    },
    {
      name: 'Delivery Rate',
      value: '98.2%',
      change: '+2.1%',
      changeType: 'positive' as const,
      icon: TrendingUp,
    },
    {
      name: 'Total Cost',
      value: '$284.50',
      change: '-5%',
      changeType: 'negative' as const,
      icon: DollarSign,
    },
  ];

  const recentMessages = [
    {
      id: '1',
      content: 'Welcome to our new product launch! Get 20% off with code NEW20',
      recipients: 1250,
      status: 'delivered',
      sentAt: '2 hours ago',
    },
    {
      id: '2',
      content: 'Reminder: Your appointment is scheduled for tomorrow at 2 PM',
      recipients: 45,
      status: 'sending',
      sentAt: '1 hour ago',
    },
    {
      id: '3',
      content: 'Thank you for your purchase! Your order will arrive in 2-3 days',
      recipients: 89,
      status: 'delivered',
      sentAt: '3 hours ago',
    },
  ];

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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your messaging overview.</p>
        </div>
        <Button leftIcon={<Send className="w-4 h-4" />} onClick={() => navigate('/messages/send')}>
          Send Message
        </Button>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
          >
            <Card variant="hover">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg">
                    <stat.icon className="w-6 h-6 text-primary-600" />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <span
                      className={`text-sm font-medium ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Messages */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Messages</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/messages')}>
                View all
              </Button>
            </div>
            <div className="space-y-4">
              {recentMessages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(message.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 line-clamp-2">
                      {message.content}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {message.recipients} recipients
                        </span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">{message.sentAt}</span>
                      </div>
                      {getStatusBadge(message.status)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
            <div className="space-y-4">
              <Button className="w-full justify-start" variant="secondary" onClick={() => navigate('/messages/send')}>
                <Send className="w-4 h-4 mr-3" />
                Send New Message
              </Button>
              <Button className="w-full justify-start" variant="secondary" onClick={() => navigate('/contacts')}>
                <Users className="w-4 h-4 mr-3" />
                Import Contacts
              </Button>
              <Button className="w-full justify-start" variant="secondary" onClick={() => navigate('/templates')}>
                <MessageSquare className="w-4 h-4 mr-3" />
                Create Template
              </Button>
              <Button className="w-full justify-start" variant="secondary" onClick={() => navigate('/analytics')}>
                <TrendingUp className="w-4 h-4 mr-3" />
                View Analytics
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Usage Chart Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Message Activity</h3>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm">7d</Button>
              <Button variant="ghost" size="sm">30d</Button>
              <Button variant="ghost" size="sm">90d</Button>
            </div>
          </div>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Chart will be rendered here</p>
              <p className="text-sm text-gray-400">Integration with chart library pending</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default DashboardPage;