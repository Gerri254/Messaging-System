import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';

export interface Message {
  id: string;
  userId: string;
  subject?: string;
  content: string;
  messageType: string;
  status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'CANCELLED';
  scheduledAt?: Date;
  sentAt?: Date;
  totalRecipients: number;
  successCount: number;
  failedCount: number;
  cost?: number;
  templateId?: string;
  templateVariables?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  recipients?: MessageRecipient[];
}

export interface MessageRecipient {
  id: string;
  messageId: string;
  contactId?: string;
  phone: string;
  email?: string;
  name?: string;
  status: 'PENDING' | 'SENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'BOUNCED';
  sentAt?: Date;
  deliveredAt?: Date;
  errorMessage?: string;
  twilioSid?: string;
  cost?: number;
}

export interface SendMessageData {
  content: string;
  recipients: Array<{
    phone: string;
    name?: string;
  }>;
  scheduledAt?: Date;
}

export interface BulkSendMessageData {
  content: string;
  contactIds?: string[];
  groupIds?: string[];
  scheduledAt?: Date;
}

interface MessageStore {
  messages: Message[] | null;
  currentMessage: Message | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchMessages: (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => Promise<void>;
  
  fetchMessage: (id: string) => Promise<void>;
  
  sendMessage: (data: SendMessageData) => Promise<Message>;
  
  sendBulkMessage: (data: BulkSendMessageData) => Promise<Message>;
  
  getMessageHistory: (params?: {
    page?: number;
    limit?: number;
  }) => Promise<any>;
  
  getMessageStatus: (id: string) => Promise<any>;
  
  cancelMessage: (id: string) => Promise<void>;
  
  validatePhoneNumber: (phone: string) => Promise<{
    valid: boolean;
    formatted?: string;
    error?: string;
  }>;
  
  getSMSUsageStats: (phone?: string) => Promise<any>;
  
  clearError: () => void;
  reset: () => void;
}

export const useMessageStore = create<MessageStore>()(
  persist(
    (set, get) => ({
      messages: null,
      currentMessage: null,
      isLoading: false,
      error: null,

      fetchMessages: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
          const queryParams = new URLSearchParams();
          if (params.page) queryParams.append('page', params.page.toString());
          if (params.limit) queryParams.append('limit', params.limit.toString());
          if (params.status) queryParams.append('status', params.status);

          const response = await api.get(`/messages?${queryParams.toString()}`);
          set({ 
            messages: response.data.messages,
            isLoading: false 
          });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.error || 'Failed to fetch messages',
            isLoading: false 
          });
        }
      },

      fetchMessage: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get(`/messages/${id}`);
          set({ 
            currentMessage: response.data.message,
            isLoading: false 
          });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.error || 'Failed to fetch message',
            isLoading: false 
          });
        }
      },

      sendMessage: async (data: SendMessageData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/messages/send', data);
          
          // Update messages list if it exists
          const { messages } = get();
          if (messages) {
            set({ 
              messages: [response.data.data.message, ...messages],
              isLoading: false 
            });
          } else {
            set({ isLoading: false });
          }
          
          return response.data.data.message;
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || 'Failed to send message';
          set({ 
            error: errorMessage,
            isLoading: false 
          });
          throw new Error(errorMessage);
        }
      },

      sendBulkMessage: async (data: BulkSendMessageData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/messages/bulk-send', data);
          
          // Update messages list if it exists
          const { messages } = get();
          if (messages) {
            set({ 
              messages: [response.data.data.message, ...messages],
              isLoading: false 
            });
          } else {
            set({ isLoading: false });
          }
          
          return response.data.data.message;
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || 'Failed to send bulk message';
          set({ 
            error: errorMessage,
            isLoading: false 
          });
          throw new Error(errorMessage);
        }
      },

      getMessageHistory: async (params = {}) => {
        try {
          const queryParams = new URLSearchParams();
          if (params.page) queryParams.append('page', params.page.toString());
          if (params.limit) queryParams.append('limit', params.limit.toString());

          const response = await api.get(`/messages/history?${queryParams.toString()}`);
          return response.data;
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || 'Failed to get message history';
          set({ error: errorMessage });
          throw new Error(errorMessage);
        }
      },

      getMessageStatus: async (id: string) => {
        try {
          const response = await api.get(`/messages/${id}/status`);
          return response.data;
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || 'Failed to get message status';
          set({ error: errorMessage });
          throw new Error(errorMessage);
        }
      },

      cancelMessage: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await api.delete(`/messages/${id}`);
          
          // Update messages list
          const { messages } = get();
          if (messages) {
            set({ 
              messages: messages.map(msg => 
                msg.id === id 
                  ? { ...msg, status: 'CANCELLED' as const }
                  : msg
              ),
              isLoading: false 
            });
          } else {
            set({ isLoading: false });
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || 'Failed to cancel message';
          set({ 
            error: errorMessage,
            isLoading: false 
          });
          throw new Error(errorMessage);
        }
      },

      validatePhoneNumber: async (phone: string) => {
        try {
          const response = await api.post('/messages/validate-phone', { phone });
          return response.data;
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || 'Failed to validate phone number';
          set({ error: errorMessage });
          throw new Error(errorMessage);
        }
      },

      getSMSUsageStats: async (phone?: string) => {
        try {
          const queryParams = phone ? `?phone=${encodeURIComponent(phone)}` : '';
          const response = await api.get(`/messages/sms/usage-stats${queryParams}`);
          return response.data;
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || 'Failed to get SMS usage stats';
          set({ error: errorMessage });
          throw new Error(errorMessage);
        }
      },

      clearError: () => set({ error: null }),
      
      reset: () => set({
        messages: null,
        currentMessage: null,
        isLoading: false,
        error: null,
      }),
    }),
    {
      name: 'message-store',
      partialize: (state) => ({
        // Only persist messages, not loading states
        messages: state.messages,
      }),
    }
  )
);