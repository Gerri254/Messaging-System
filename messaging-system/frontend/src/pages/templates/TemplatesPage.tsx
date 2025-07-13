import { motion } from 'framer-motion';
import { FileText, Plus, Search } from 'lucide-react';

import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const TemplatesPage = () => {
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
          <h1 className="text-3xl font-bold text-gray-900">Templates</h1>
          <p className="text-gray-600 mt-1">Create and manage reusable message templates.</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />}>
          Create Template
        </Button>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <div className="max-w-lg">
            <Input
              placeholder="Search templates..."
              leftIcon={<Search className="w-4 h-4" />}
            />
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
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Template Management</h3>
          <p className="text-gray-600 mb-6">
            This page will contain the template builder with variable insertion, categories, and usage analytics.
          </p>
          <Button>Create Template</Button>
        </Card>
      </motion.div>
    </div>
  );
};

export default TemplatesPage;