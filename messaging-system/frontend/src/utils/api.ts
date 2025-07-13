import axios, { AxiosResponse } from 'axios';
import { 
  User, 
  Contact, 
  ContactGroup, 
  Message, 
  MessageTemplate,
  AuthResponse,
  ContactsResponse,
  LoginRequest,
  RegisterRequest,
  SendMessageRequest,
  BulkSendMessageRequest,
  CreateContactRequest,
  CreateContactGroupRequest,
  CreateTemplateRequest,
  DashboardStats,
  ApiResponse 
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (data: LoginRequest): Promise<AxiosResponse<AuthResponse>> =>
    api.post('/auth/login', data),
    
  register: (data: RegisterRequest): Promise<AxiosResponse<ApiResponse<{ user: User }>>> =>
    api.post('/auth/register', data),
    
  logout: (): Promise<AxiosResponse<ApiResponse>> =>
    api.post('/auth/logout'),
    
  getProfile: (): Promise<AxiosResponse<{ user: User }>> =>
    api.get('/auth/profile'),
    
  updateProfile: (data: Partial<User>): Promise<AxiosResponse<ApiResponse<{ user: User }>>> =>
    api.put('/auth/profile', data),
    
  forgotPassword: (email: string): Promise<AxiosResponse<ApiResponse>> =>
    api.post('/auth/forgot-password', { email }),
    
  resetPassword: (token: string, password: string): Promise<AxiosResponse<ApiResponse>> =>
    api.post('/auth/reset-password', { token, password }),
    
  verifyEmail: (token: string): Promise<AxiosResponse<ApiResponse>> =>
    api.get(`/auth/verify-email?token=${token}`),
    
  resendVerification: (email: string): Promise<AxiosResponse<ApiResponse>> =>
    api.post('/auth/resend-verification', { email }),
};

// Contacts API
export const contactsApi = {
  getContacts: (params?: { 
    page?: number; 
    limit?: number; 
    search?: string; 
  }): Promise<AxiosResponse<ContactsResponse>> =>
    api.get('/contacts', { params }),
    
  getContact: (id: string): Promise<AxiosResponse<{ contact: Contact }>> =>
    api.get(`/contacts/${id}`),
    
  createContact: (data: CreateContactRequest): Promise<AxiosResponse<ApiResponse<{ contact: Contact }>>> =>
    api.post('/contacts', data),
    
  updateContact: (id: string, data: Partial<CreateContactRequest>): Promise<AxiosResponse<ApiResponse<{ contact: Contact }>>> =>
    api.put(`/contacts/${id}`, data),
    
  deleteContact: (id: string): Promise<AxiosResponse<ApiResponse>> =>
    api.delete(`/contacts/${id}`),
    
  bulkCreateContacts: (contacts: CreateContactRequest[]): Promise<AxiosResponse<ApiResponse<{ result: any }>>> =>
    api.post('/contacts/bulk-upload', { contacts }),
    
  // Contact Groups
  getContactGroups: (): Promise<AxiosResponse<{ groups: ContactGroup[] }>> =>
    api.get('/contacts/groups'),
    
  getContactGroup: (id: string): Promise<AxiosResponse<{ group: ContactGroup }>> =>
    api.get(`/contacts/groups/${id}`),
    
  createContactGroup: (data: CreateContactGroupRequest): Promise<AxiosResponse<ApiResponse<{ group: ContactGroup }>>> =>
    api.post('/contacts/groups', data),
    
  updateContactGroup: (id: string, data: Partial<CreateContactGroupRequest>): Promise<AxiosResponse<ApiResponse<{ group: ContactGroup }>>> =>
    api.put(`/contacts/groups/${id}`, data),
    
  deleteContactGroup: (id: string): Promise<AxiosResponse<ApiResponse>> =>
    api.delete(`/contacts/groups/${id}`),
    
  addContactsToGroup: (groupId: string, contactIds: string[]): Promise<AxiosResponse<ApiResponse>> =>
    api.post(`/contacts/groups/${groupId}/contacts`, { contactIds }),
    
  removeContactsFromGroup: (groupId: string, contactIds: string[]): Promise<AxiosResponse<ApiResponse>> =>
    api.delete(`/contacts/groups/${groupId}/contacts`, { data: { contactIds } }),
};

// Messages API
export const messagesApi = {
  getMessages: (params?: { 
    page?: number; 
    limit?: number; 
    status?: string; 
  }): Promise<AxiosResponse<{ messages: Message[]; total: number; pages: number }>> =>
    api.get('/messages', { params }),
    
  getMessage: (id: string): Promise<AxiosResponse<{ message: Message }>> =>
    api.get(`/messages/${id}`),
    
  sendMessage: (data: SendMessageRequest): Promise<AxiosResponse<ApiResponse<{ message: Message }>>> =>
    api.post('/messages/send', data),
    
  bulkSendMessage: (data: BulkSendMessageRequest): Promise<AxiosResponse<ApiResponse<{ message: Message }>>> =>
    api.post('/messages/bulk-send', data),
    
  scheduleMessage: (data: SendMessageRequest | BulkSendMessageRequest): Promise<AxiosResponse<ApiResponse<{ message: Message }>>> =>
    api.post('/messages/schedule', data),
    
  getMessageStatus: (id: string): Promise<AxiosResponse<{ message: Message; recipients: any[] }>> =>
    api.get(`/messages/${id}/status`),
    
  cancelMessage: (id: string): Promise<AxiosResponse<ApiResponse>> =>
    api.delete(`/messages/${id}`),
    
  getMessageHistory: (params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<AxiosResponse<{ messages: Message[]; total: number; pages: number }>> =>
    api.get('/messages/history', { params }),
};

// Templates API
export const templatesApi = {
  getTemplates: (): Promise<AxiosResponse<{ templates: MessageTemplate[] }>> =>
    api.get('/templates'),
    
  getTemplate: (id: string): Promise<AxiosResponse<{ template: MessageTemplate }>> =>
    api.get(`/templates/${id}`),
    
  createTemplate: (data: CreateTemplateRequest): Promise<AxiosResponse<ApiResponse<{ template: MessageTemplate }>>> =>
    api.post('/templates', data),
    
  updateTemplate: (id: string, data: Partial<CreateTemplateRequest>): Promise<AxiosResponse<ApiResponse<{ template: MessageTemplate }>>> =>
    api.put(`/templates/${id}`, data),
    
  deleteTemplate: (id: string): Promise<AxiosResponse<ApiResponse>> =>
    api.delete(`/templates/${id}`),
};

// Analytics API
export const analyticsApi = {
  getDashboardStats: (): Promise<AxiosResponse<DashboardStats>> =>
    api.get('/analytics/dashboard'),
    
  getMessageReports: (params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
  }): Promise<AxiosResponse<any>> =>
    api.get('/analytics/message-reports', { params }),
    
  getUsageStats: (): Promise<AxiosResponse<any>> =>
    api.get('/analytics/usage-stats'),
    
  exportData: (type: 'contacts' | 'messages' | 'analytics'): Promise<AxiosResponse<Blob>> =>
    api.get(`/analytics/export-data?type=${type}`, { responseType: 'blob' }),
};

export default api;