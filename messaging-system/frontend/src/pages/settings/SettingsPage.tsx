import { motion } from 'framer-motion';
import { Settings, User, Bell, Shield, CreditCard } from 'lucide-react';

import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const SettingsPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account preferences and configuration.</p>
      </motion.div>

      {/* Settings Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <Card variant="hover">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg">
              <User className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
              <p className="text-gray-600">Update your personal information and preferences</p>
            </div>
          </div>
        </Card>

        <Card variant="hover">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg">
              <Bell className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <p className="text-gray-600">Configure email and SMS notification preferences</p>
            </div>
          </div>
        </Card>

        <Card variant="hover">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">Security</h3>
              <p className="text-gray-600">Password, two-factor authentication, and sessions</p>
            </div>
          </div>
        </Card>

        <Card variant="hover">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">Billing</h3>
              <p className="text-gray-600">Manage your subscription and payment methods</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Content Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="text-center py-12">
          <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Settings Interface</h3>
          <p className="text-gray-600 mb-6">
            This page will contain detailed settings forms for profile, notifications, security, and billing management.
          </p>
          <Button>Configure Settings</Button>
        </Card>
      </motion.div>
    </div>
  );
};

export default SettingsPage;