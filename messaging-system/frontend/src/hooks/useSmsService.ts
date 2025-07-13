import { useState, useCallback } from 'react';
import api from '../lib/api';

interface PhoneValidationResult {
  valid: boolean;
  formatted?: string;
  error?: string;
}

interface SMSUsageStats {
  messagesThisHour: number;
  remainingMessages: number;
  resetTime: Date;
}

interface SMSCostEstimate {
  segments: number;
  costPerSegment: number;
  totalCost: number;
  isInternational: boolean;
}

export const useSmsService = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  // Validate phone number
  const validatePhoneNumber = useCallback(async (phone: string): Promise<PhoneValidationResult> => {
    if (!phone) {
      return { valid: false, error: 'Phone number is required' };
    }

    setIsValidating(true);
    try {
      const response = await api.post('/messages/validate-phone', { phone });
      return response.data;
    } catch (error: any) {
      return {
        valid: false,
        error: error.response?.data?.error || 'Failed to validate phone number',
      };
    } finally {
      setIsValidating(false);
    }
  }, []);

  // Get SMS usage statistics
  const getUsageStats = useCallback(async (phone?: string): Promise<SMSUsageStats> => {
    try {
      const queryParams = phone ? `?phone=${encodeURIComponent(phone)}` : '';
      const response = await api.get(`/messages/sms/usage-stats${queryParams}`);
      return {
        ...response.data,
        resetTime: new Date(response.data.resetTime),
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to get usage statistics');
    }
  }, []);

  // Calculate SMS cost
  const calculateCost = useCallback((message: string, recipients: number = 1): SMSCostEstimate => {
    // SMS segment calculation (160 characters per segment for standard SMS)
    const baseSegmentLength = 160;
    const extendedSegmentLength = 70; // For messages with special characters
    
    // Check if message contains special characters that reduce segment length
    const hasSpecialChars = /[^\x00-\x7F]/.test(message);
    const segmentLength = hasSpecialChars ? extendedSegmentLength : baseSegmentLength;
    
    const segments = Math.ceil(message.length / segmentLength) || 1;
    
    // Base cost per segment (this would typically come from configuration)
    const baseCostPerSegment = 0.0075; // $0.0075 per segment
    
    // International detection (simplified - would need more sophisticated logic)
    const isInternational = false; // Would check recipient phone numbers
    const internationalMultiplier = isInternational ? 2.5 : 1;
    
    const costPerSegment = baseCostPerSegment * internationalMultiplier;
    const totalCost = segments * costPerSegment * recipients;

    return {
      segments,
      costPerSegment,
      totalCost,
      isInternational,
    };
  }, []);

  // Format phone number for display
  const formatPhoneNumber = useCallback((phone: string): string => {
    // Remove all non-digit characters except +
    const cleaned = phone.replace(/[^\d+]/g, '');
    
    // US number formatting
    if (cleaned.startsWith('+1') && cleaned.length === 12) {
      const number = cleaned.slice(2);
      return `+1 (${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
    }
    
    // International number formatting (basic)
    if (cleaned.startsWith('+')) {
      return cleaned;
    }
    
    // US number without country code
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    
    // Return as-is if no specific format matches
    return phone;
  }, []);

  // Check if phone number looks international
  const isInternationalNumber = useCallback((phone: string): boolean => {
    const cleaned = phone.replace(/[^\d+]/g, '');
    return cleaned.startsWith('+') && !cleaned.startsWith('+1');
  }, []);

  // Estimate delivery time based on volume and rate limits
  const estimateDeliveryTime = useCallback((recipientCount: number): {
    estimatedMinutes: number;
    description: string;
  } => {
    // Typical SMS delivery rates
    const messagesPerMinute = 10; // Conservative estimate
    
    if (recipientCount <= 1) {
      return {
        estimatedMinutes: 0,
        description: 'Immediate delivery',
      };
    }
    
    if (recipientCount <= 10) {
      return {
        estimatedMinutes: 1,
        description: 'Within 1 minute',
      };
    }
    
    if (recipientCount <= 100) {
      const minutes = Math.ceil(recipientCount / messagesPerMinute);
      return {
        estimatedMinutes: minutes,
        description: `Within ${minutes} minutes`,
      };
    }
    
    const minutes = Math.ceil(recipientCount / messagesPerMinute);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) {
      return {
        estimatedMinutes: minutes,
        description: `Within ${minutes} minutes`,
      };
    }
    
    if (remainingMinutes === 0) {
      return {
        estimatedMinutes: minutes,
        description: `Within ${hours} hour${hours > 1 ? 's' : ''}`,
      };
    }
    
    return {
      estimatedMinutes: minutes,
      description: `Within ${hours}h ${remainingMinutes}m`,
    };
  }, []);

  // Validate message content
  const validateMessage = useCallback((message: string): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!message.trim()) {
      errors.push('Message content is required');
    }
    
    if (message.length > 1600) {
      errors.push('Message exceeds maximum length of 1600 characters');
    }
    
    if (message.length > 160) {
      const segments = Math.ceil(message.length / 160);
      warnings.push(`Message will be sent as ${segments} SMS segments`);
    }
    
    // Check for potential issues
    if (message.includes('{{') && message.includes('}}')) {
      const variables = message.match(/\{\{[^}]+\}\}/g);
      if (variables) {
        warnings.push(`Message contains ${variables.length} variable${variables.length > 1 ? 's' : ''}: ${variables.join(', ')}`);
      }
    }
    
    // Check for common issues
    if (message.toLowerCase().includes('click here') || message.toLowerCase().includes('www.')) {
      warnings.push('Messages with links may have lower delivery rates');
    }
    
    if (/[^\x00-\x7F]/.test(message)) {
      warnings.push('Message contains special characters which may reduce character limit per segment');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }, []);

  return {
    validatePhoneNumber,
    getUsageStats,
    calculateCost,
    formatPhoneNumber,
    isInternationalNumber,
    estimateDeliveryTime,
    validateMessage,
    isValidating,
    isCalculating,
  };
};