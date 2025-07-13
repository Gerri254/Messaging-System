export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isVerified: boolean;
  emailVerifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  tags?: string[];
  customFields?: Record<string, any>;
  groups?: ContactGroup[];
  createdAt: string;
  updatedAt: string;
}

export interface ContactGroup {
  id: string;
  userId: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    contacts: number;
  };
}

export interface Message {
  id: string;
  userId: string;
  subject?: string;
  content: string;
  messageType: 'SMS' | 'EMAIL';
  status: MessageStatus;
  scheduledAt?: string;
  sentAt?: string;
  totalRecipients: number;
  successCount: number;
  failedCount: number;
  cost?: number;
  templateId?: string;
  templateVariables?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export enum MessageStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  SENDING = 'SENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export interface MessageTemplate {
  id: string;
  userId: string;
  name: string;
  subject?: string;
  content: string;
  variables?: string[];
  category?: string;
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MessageRecipient {
  id: string;
  messageId: string;
  contactId?: string;
  phone: string;
  email?: string;
  name?: string;
  status: MessageRecipientStatus;
  sentAt?: string;
  deliveredAt?: string;
  errorMessage?: string;
  twilioSid?: string;
  cost?: number;
  createdAt: string;
  updatedAt: string;
}

export enum MessageRecipientStatus {
  PENDING = 'PENDING',
  SENDING = 'SENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  BOUNCED = 'BOUNCED',
}

export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  error?: string;
  details?: any[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  pages: number;
  currentPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

export interface ContactsResponse {
  contacts: Contact[];
  total: number;
  pages: number;
}

export interface SendMessageRequest {
  content: string;
  recipients: Array<{
    phone: string;
    name?: string;
  }>;
  scheduledAt?: string;
}

export interface BulkSendMessageRequest {
  content: string;
  contactIds?: string[];
  groupIds?: string[];
  scheduledAt?: string;
}

export interface CreateContactRequest {
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface CreateContactGroupRequest {
  name: string;
  description?: string;
  color?: string;
}

export interface CreateTemplateRequest {
  name: string;
  subject?: string;
  content: string;
  variables?: string[];
  category?: string;
}

export interface DashboardStats {
  totalContacts: number;
  totalMessages: number;
  messagesSentToday: number;
  deliveryRate: number;
  totalCost: number;
  recentMessages: Message[];
  contactGrowth: Array<{
    date: string;
    count: number;
  }>;
  messageStats: Array<{
    date: string;
    sent: number;
    delivered: number;
    failed: number;
  }>;
}

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  deliveryReports: boolean;
  failureAlerts: boolean;
  weeklyReports: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  notifications: NotificationSettings;
}

export interface SocketEvents {
  'message:status': {
    messageId: string;
    status: MessageStatus;
    recipientId?: string;
    recipientStatus?: MessageRecipientStatus;
  };
  'contact:created': Contact;
  'contact:updated': Contact;
  'contact:deleted': { id: string };
  'group:created': ContactGroup;
  'group:updated': ContactGroup;
  'group:deleted': { id: string };
}