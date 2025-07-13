import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';

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
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTemplateData {
  name: string;
  subject?: string;
  content: string;
  variables?: string[];
  category?: string;
}

export interface UpdateTemplateData {
  name?: string;
  subject?: string;
  content?: string;
  variables?: string[];
  category?: string;
  isActive?: boolean;
}

interface TemplateStore {
  templates: MessageTemplate[] | null;
  currentTemplate: MessageTemplate | null;
  categories: string[] | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchTemplates: () => Promise<void>;
  
  fetchTemplate: (id: string) => Promise<void>;
  
  createTemplate: (data: CreateTemplateData) => Promise<MessageTemplate>;
  
  updateTemplate: (id: string, data: UpdateTemplateData) => Promise<MessageTemplate>;
  
  deleteTemplate: (id: string) => Promise<void>;
  
  searchTemplates: (params: {
    query?: string;
    category?: string;
  }) => Promise<MessageTemplate[]>;
  
  getTemplatesByCategory: (category: string) => Promise<MessageTemplate[]>;
  
  getCategories: () => Promise<void>;
  
  duplicateTemplate: (id: string) => Promise<MessageTemplate>;
  
  clearError: () => void;
  reset: () => void;
}

export const useTemplateStore = create<TemplateStore>()(
  persist(
    (set, get) => ({
      templates: null,
      currentTemplate: null,
      categories: null,
      isLoading: false,
      error: null,

      fetchTemplates: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get('/templates');
          set({ 
            templates: response.data.templates,
            isLoading: false 
          });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.error || 'Failed to fetch templates',
            isLoading: false 
          });
        }
      },

      fetchTemplate: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get(`/templates/${id}`);
          set({ 
            currentTemplate: response.data.template,
            isLoading: false 
          });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.error || 'Failed to fetch template',
            isLoading: false 
          });
        }
      },

      createTemplate: async (data: CreateTemplateData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/templates', data);
          const newTemplate = response.data.data.template;
          
          // Update templates list
          const { templates } = get();
          if (templates) {
            set({ 
              templates: [newTemplate, ...templates],
              isLoading: false 
            });
          } else {
            set({ isLoading: false });
          }
          
          return newTemplate;
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || 'Failed to create template';
          set({ 
            error: errorMessage,
            isLoading: false 
          });
          throw new Error(errorMessage);
        }
      },

      updateTemplate: async (id: string, data: UpdateTemplateData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.put(`/templates/${id}`, data);
          const updatedTemplate = response.data.data.template;
          
          // Update templates list
          const { templates } = get();
          if (templates) {
            set({ 
              templates: templates.map(template =>
                template.id === id ? updatedTemplate : template
              ),
              isLoading: false 
            });
          }
          
          // Update current template if it's the one being updated
          const { currentTemplate } = get();
          if (currentTemplate?.id === id) {
            set({ currentTemplate: updatedTemplate });
          }
          
          return updatedTemplate;
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || 'Failed to update template';
          set({ 
            error: errorMessage,
            isLoading: false 
          });
          throw new Error(errorMessage);
        }
      },

      deleteTemplate: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await api.delete(`/templates/${id}`);
          
          // Update templates list
          const { templates } = get();
          if (templates) {
            set({ 
              templates: templates.filter(template => template.id !== id),
              isLoading: false 
            });
          } else {
            set({ isLoading: false });
          }
          
          // Clear current template if it's the one being deleted
          const { currentTemplate } = get();
          if (currentTemplate?.id === id) {
            set({ currentTemplate: null });
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || 'Failed to delete template';
          set({ 
            error: errorMessage,
            isLoading: false 
          });
          throw new Error(errorMessage);
        }
      },

      searchTemplates: async (params: { query?: string; category?: string }) => {
        try {
          const queryParams = new URLSearchParams();
          if (params.query) queryParams.append('q', params.query);
          if (params.category) queryParams.append('category', params.category);

          const response = await api.get(`/templates/search?${queryParams.toString()}`);
          return response.data.templates;
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || 'Failed to search templates';
          set({ error: errorMessage });
          throw new Error(errorMessage);
        }
      },

      getTemplatesByCategory: async (category: string) => {
        try {
          const response = await api.get(`/templates/search?category=${encodeURIComponent(category)}`);
          return response.data.templates;
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || 'Failed to get templates by category';
          set({ error: errorMessage });
          throw new Error(errorMessage);
        }
      },

      getCategories: async () => {
        try {
          const { templates } = get();
          if (!templates) {
            await get().fetchTemplates();
          }
          
          const templatesData = get().templates;
          if (templatesData) {
            const categoriesSet = new Set<string>();
            templatesData.forEach(template => {
              if (template.category) {
                categoriesSet.add(template.category);
              }
            });
            set({ categories: Array.from(categoriesSet).sort() });
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || 'Failed to get categories';
          set({ error: errorMessage });
        }
      },

      duplicateTemplate: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const { templates } = get();
          const originalTemplate = templates?.find(t => t.id === id);
          
          if (!originalTemplate) {
            throw new Error('Template not found');
          }
          
          const duplicateData: CreateTemplateData = {
            name: `${originalTemplate.name} (Copy)`,
            subject: originalTemplate.subject,
            content: originalTemplate.content,
            variables: originalTemplate.variables,
            category: originalTemplate.category,
          };
          
          const newTemplate = await get().createTemplate(duplicateData);
          set({ isLoading: false });
          return newTemplate;
        } catch (error: any) {
          const errorMessage = error.response?.data?.error || 'Failed to duplicate template';
          set({ 
            error: errorMessage,
            isLoading: false 
          });
          throw new Error(errorMessage);
        }
      },

      clearError: () => set({ error: null }),
      
      reset: () => set({
        templates: null,
        currentTemplate: null,
        categories: null,
        isLoading: false,
        error: null,
      }),
    }),
    {
      name: 'template-store',
      partialize: (state) => ({
        // Only persist templates and categories, not loading states
        templates: state.templates,
        categories: state.categories,
      }),
    }
  )
);