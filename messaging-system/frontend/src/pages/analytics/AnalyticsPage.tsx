import { motion } from 'framer-motion';
import { BarChart3, Download, Calendar } from 'lucide-react';

import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const AnalyticsPage = () => {
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
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Track delivery rates, engagement, and performance metrics.</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="secondary" leftIcon={<Calendar className="w-4 h-4" />}>
            Date Range
          </Button>
          <Button variant="secondary" leftIcon={<Download className="w-4 h-4" />}>
            Export Report
          </Button>
        </div>
      </motion.div>

      {/* Content Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Dashboard</h3>
          <p className="text-gray-600 mb-6">
            This page will contain interactive charts, delivery reports, cost analysis, and performance metrics.
          </p>
          <Button>View Reports</Button>
        </Card>
      </motion.div>
    </div>
  );
};

export default AnalyticsPage;