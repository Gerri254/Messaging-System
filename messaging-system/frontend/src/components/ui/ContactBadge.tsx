import React from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ContactBadgeProps {
  contact: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
  onRemove?: () => void;
  size?: 'sm' | 'md' | 'lg';
  showPhone?: boolean;
  className?: string;
}

const ContactBadge: React.FC<ContactBadgeProps> = ({
  contact,
  onRemove,
  size = 'md',
  showPhone = false,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const avatarSizes = {
    sm: 'w-5 h-5 text-xs',
    md: 'w-6 h-6 text-xs',
    lg: 'w-8 h-8 text-sm',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`
        inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-200 rounded-full
        ${sizeClasses[size]} ${className}
      `}
    >
      {/* Avatar */}
      <div className={`
        flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-medium
        ${avatarSizes[size]}
      `}>
        {contact.name?.[0]?.toUpperCase() || '?'}
      </div>

      {/* Name and optional phone */}
      <div className="flex flex-col min-w-0">
        <span className="font-medium text-gray-900 truncate">
          {contact.name}
        </span>
        {showPhone && contact.phone && (
          <span className="text-xs text-gray-500 truncate">
            {contact.phone}
          </span>
        )}
      </div>

      {/* Remove button */}
      {onRemove && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-200 rounded-full p-0.5 transition-colors"
        >
          <XMarkIcon className={iconSizes[size]} />
        </motion.button>
      )}
    </motion.div>
  );
};

export default ContactBadge;