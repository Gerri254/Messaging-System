import Joi from 'joi';

export const authValidation = {
  register: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
    password: Joi.string().min(8).required().messages({
      'string.min': 'Password must be at least 8 characters long',
      'any.required': 'Password is required',
    }),
    firstName: Joi.string().min(2).max(50).required().messages({
      'string.min': 'First name must be at least 2 characters long',
      'string.max': 'First name cannot exceed 50 characters',
      'any.required': 'First name is required',
    }),
    lastName: Joi.string().min(2).max(50).required().messages({
      'string.min': 'Last name must be at least 2 characters long',
      'string.max': 'Last name cannot exceed 50 characters',
      'any.required': 'Last name is required',
    }),
    phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional().messages({
      'string.pattern.base': 'Please provide a valid phone number',
    }),
  }),

  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required',
    }),
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  }),

  resetPassword: Joi.object({
    token: Joi.string().required().messages({
      'any.required': 'Reset token is required',
    }),
    password: Joi.string().min(8).required().messages({
      'string.min': 'Password must be at least 8 characters long',
      'any.required': 'Password is required',
    }),
  }),

  updateProfile: Joi.object({
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
    phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional(),
  }),
};

export const contactValidation = {
  create: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).required(),
    email: Joi.string().email().optional(),
    notes: Joi.string().max(500).optional(),
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional(),
    email: Joi.string().email().optional(),
    notes: Joi.string().max(500).optional(),
  }),
};

export const messageValidation = {
  send: Joi.object({
    content: Joi.string().min(1).max(1600).required(),
    recipients: Joi.array().items(
      Joi.object({
        phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).required(),
        name: Joi.string().optional(),
      })
    ).min(1).required(),
    scheduledAt: Joi.date().min('now').optional(),
  }),

  bulkSend: Joi.object({
    content: Joi.string().min(1).max(1600).required(),
    contactIds: Joi.array().items(Joi.string()).min(1).optional(),
    groupIds: Joi.array().items(Joi.string()).min(1).optional(),
    scheduledAt: Joi.date().min('now').optional(),
  }).or('contactIds', 'groupIds'),

  validatePhone: Joi.object({
    phone: Joi.string().required(),
  }),
};

export const templateValidation = {
  create: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    subject: Joi.string().max(200).optional(),
    content: Joi.string().min(1).max(1600).required(),
    variables: Joi.array().items(Joi.string()).optional(),
    category: Joi.string().max(50).optional(),
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    subject: Joi.string().max(200).optional(),
    content: Joi.string().min(1).max(1600).optional(),
    variables: Joi.array().items(Joi.string()).optional(),
    category: Joi.string().max(50).optional(),
    isActive: Joi.boolean().optional(),
  }),
};