import { motion } from 'framer-motion';
import { Users, Plus, Search, Filter, Upload, Download } from 'lucide-react';

import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const ContactsPage = () => {
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
          <Button leftIcon={<Plus className="w-4 h-4" />}>
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
            <div className="flex-1 max-w-lg">
              <Input
                placeholder="Search contacts..."
                leftIcon={<Search className="w-4 h-4" />}
              />
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

      {/* Content Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact Management</h3>
          <p className="text-gray-600 mb-6">
            This page will contain the full contact management interface with advanced search, filtering, and bulk operations.
          </p>
          <Button>Get Started</Button>
        </Card>
      </motion.div>
    </div>
  );
};

export default ContactsPage;