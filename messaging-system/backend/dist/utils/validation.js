"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.templateValidation = exports.messageValidation = exports.contactValidation = exports.authValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.authValidation = {
    register: joi_1.default.object({
        email: joi_1.default.string().email().required().messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required',
        }),
        password: joi_1.default.string().min(8).required().messages({
            'string.min': 'Password must be at least 8 characters long',
            'any.required': 'Password is required',
        }),
        firstName: joi_1.default.string().min(2).max(50).required().messages({
            'string.min': 'First name must be at least 2 characters long',
            'string.max': 'First name cannot exceed 50 characters',
            'any.required': 'First name is required',
        }),
        lastName: joi_1.default.string().min(2).max(50).required().messages({
            'string.min': 'Last name must be at least 2 characters long',
            'string.max': 'Last name cannot exceed 50 characters',
            'any.required': 'Last name is required',
        }),
        phone: joi_1.default.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional().messages({
            'string.pattern.base': 'Please provide a valid phone number',
        }),
    }),
    login: joi_1.default.object({
        email: joi_1.default.string().email().required().messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required',
        }),
        password: joi_1.default.string().required().messages({
            'any.required': 'Password is required',
        }),
    }),
    forgotPassword: joi_1.default.object({
        email: joi_1.default.string().email().required().messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required',
        }),
    }),
    resetPassword: joi_1.default.object({
        token: joi_1.default.string().required().messages({
            'any.required': 'Reset token is required',
        }),
        password: joi_1.default.string().min(8).required().messages({
            'string.min': 'Password must be at least 8 characters long',
            'any.required': 'Password is required',
        }),
    }),
    updateProfile: joi_1.default.object({
        firstName: joi_1.default.string().min(2).max(50).optional(),
        lastName: joi_1.default.string().min(2).max(50).optional(),
        phone: joi_1.default.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional(),
    }),
};
exports.contactValidation = {
    create: joi_1.default.object({
        name: joi_1.default.string().min(2).max(100).required(),
        phone: joi_1.default.string().pattern(/^\+?[\d\s\-\(\)]+$/).required(),
        email: joi_1.default.string().email().optional(),
        notes: joi_1.default.string().max(500).optional(),
    }),
    update: joi_1.default.object({
        name: joi_1.default.string().min(2).max(100).optional(),
        phone: joi_1.default.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional(),
        email: joi_1.default.string().email().optional(),
        notes: joi_1.default.string().max(500).optional(),
    }),
};
exports.messageValidation = {
    send: joi_1.default.object({
        content: joi_1.default.string().min(1).max(1600).required(),
        recipients: joi_1.default.array().items(joi_1.default.object({
            phone: joi_1.default.string().pattern(/^\+?[\d\s\-\(\)]+$/).required(),
            name: joi_1.default.string().optional(),
        })).min(1).required(),
        scheduledAt: joi_1.default.date().min('now').optional(),
    }),
    bulkSend: joi_1.default.object({
        content: joi_1.default.string().min(1).max(1600).required(),
        contactIds: joi_1.default.array().items(joi_1.default.string()).min(1).optional(),
        groupIds: joi_1.default.array().items(joi_1.default.string()).min(1).optional(),
        scheduledAt: joi_1.default.date().min('now').optional(),
    }).or('contactIds', 'groupIds'),
    validatePhone: joi_1.default.object({
        phone: joi_1.default.string().required(),
    }),
};
exports.templateValidation = {
    create: joi_1.default.object({
        name: joi_1.default.string().min(2).max(100).required(),
        subject: joi_1.default.string().max(200).optional(),
        content: joi_1.default.string().min(1).max(1600).required(),
        variables: joi_1.default.array().items(joi_1.default.string()).optional(),
        category: joi_1.default.string().max(50).optional(),
    }),
    update: joi_1.default.object({
        name: joi_1.default.string().min(2).max(100).optional(),
        subject: joi_1.default.string().max(200).optional(),
        content: joi_1.default.string().min(1).max(1600).optional(),
        variables: joi_1.default.array().items(joi_1.default.string()).optional(),
        category: joi_1.default.string().max(50).optional(),
        isActive: joi_1.default.boolean().optional(),
    }),
};
//# sourceMappingURL=validation.js.map