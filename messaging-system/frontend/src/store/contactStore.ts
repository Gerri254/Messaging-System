import { create } from 'zustand';
import { Contact, ContactGroup, CreateContactRequest, CreateContactGroupRequest } from '../types';
import { contactsApi } from '../utils/api';

interface ContactState {
  contacts: Contact[];
  contactGroups: ContactGroup[];
  groups: ContactGroup[];
  tags: string[];
  selectedContacts: string[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalContacts: number;
  };
  searchQuery: string;
  
  // Actions
  fetchContacts: (page?: number, search?: string) => Promise<void>;
  fetchContactGroups: () => Promise<void>;
  fetchGroups: () => Promise<void>;
  fetchTags: () => Promise<void>;
  searchContacts: (params: any) => Promise<Contact[]>;
  createContact: (data: CreateContactRequest) => Promise<Contact>;
  updateContact: (id: string, data: Partial<CreateContactRequest>) => Promise<Contact>;
  deleteContact: (id: string) => Promise<void>;
  bulkCreateContacts: (contacts: CreateContactRequest[]) => Promise<any>;
  
  // Contact Groups
  createContactGroup: (data: CreateContactGroupRequest) => Promise<ContactGroup>;
  updateContactGroup: (id: string, data: Partial<CreateContactGroupRequest>) => Promise<ContactGroup>;
  deleteContactGroup: (id: string) => Promise<void>;
  addContactsToGroup: (groupId: string, contactIds: string[]) => Promise<void>;
  removeContactsFromGroup: (groupId: string, contactIds: string[]) => Promise<void>;
  
  // UI Actions
  setSelectedContacts: (contactIds: string[]) => void;
  toggleContactSelection: (contactId: string) => void;
  clearSelectedContacts: () => void;
  setSearchQuery: (query: string) => void;
  clearError: () => void;
}

export const useContactStore = create<ContactState>((set, get) => ({
  contacts: [],
  contactGroups: [],
  groups: [],
  tags: [],
  selectedContacts: [],
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalContacts: 0,
  },
  searchQuery: '',

  fetchContacts: async (page = 1, search) => {
    set({ isLoading: true, error: null });
    try {
      const response = await contactsApi.getContacts({
        page,
        limit: 20,
        search: search || get().searchQuery,
      });
      
      const { contacts, total, pages } = response.data;
      
      set({
        contacts,
        pagination: {
          currentPage: page,
          totalPages: pages,
          totalContacts: total,
        },
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch contacts',
        isLoading: false,
      });
    }
  },

  fetchContactGroups: async () => {
    try {
      const response = await contactsApi.getContactGroups();
      set({ contactGroups: response.data.groups, groups: response.data.groups });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to fetch contact groups' });
    }
  },

  fetchGroups: async () => {
    return get().fetchContactGroups();
  },

  fetchTags: async () => {
    try {
      // Extract unique tags from contacts
      const contacts = get().contacts;
      const tagsSet = new Set<string>();
      
      contacts.forEach(contact => {
        if (contact.tags && Array.isArray(contact.tags)) {
          contact.tags.forEach(tag => tagsSet.add(tag));
        }
      });
      
      set({ tags: Array.from(tagsSet) });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to fetch tags' });
    }
  },

  searchContacts: async (params) => {
    try {
      const response = await contactsApi.getContacts(params);
      return response.data.contacts;
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to search contacts' });
      throw error;
    }
  },

  createContact: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await contactsApi.createContact(data);
      const newContact = response.data.data?.contact;
      
      if (newContact) {
        set((state) => ({
          contacts: [newContact, ...state.contacts],
          isLoading: false,
        }));
      }
      
      return newContact!;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to create contact';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  updateContact: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await contactsApi.updateContact(id, data);
      const updatedContact = response.data.data?.contact;
      
      if (updatedContact) {
        set((state) => ({
          contacts: state.contacts.map((contact) =>
            contact.id === id ? updatedContact : contact
          ),
          isLoading: false,
        }));
      }
      
      return updatedContact!;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update contact';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  deleteContact: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await contactsApi.deleteContact(id);
      set((state) => ({
        contacts: state.contacts.filter((contact) => contact.id !== id),
        selectedContacts: state.selectedContacts.filter((contactId) => contactId !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to delete contact';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  bulkCreateContacts: async (contacts) => {
    set({ isLoading: true, error: null });
    try {
      const response = await contactsApi.bulkCreateContacts(contacts);
      
      // Refresh contacts list
      await get().fetchContacts();
      
      set({ isLoading: false });
      return response.data.data?.result;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to create contacts';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  createContactGroup: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await contactsApi.createContactGroup(data);
      const newGroup = response.data.data?.group;
      
      if (newGroup) {
        set((state) => ({
          contactGroups: [newGroup, ...state.contactGroups],
          isLoading: false,
        }));
      }
      
      return newGroup!;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to create contact group';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  updateContactGroup: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await contactsApi.updateContactGroup(id, data);
      const updatedGroup = response.data.data?.group;
      
      if (updatedGroup) {
        set((state) => ({
          contactGroups: state.contactGroups.map((group) =>
            group.id === id ? updatedGroup : group
          ),
          isLoading: false,
        }));
      }
      
      return updatedGroup!;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update contact group';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  deleteContactGroup: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await contactsApi.deleteContactGroup(id);
      set((state) => ({
        contactGroups: state.contactGroups.filter((group) => group.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to delete contact group';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  addContactsToGroup: async (groupId, contactIds) => {
    set({ isLoading: true, error: null });
    try {
      await contactsApi.addContactsToGroup(groupId, contactIds);
      set({ isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to add contacts to group';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  removeContactsFromGroup: async (groupId, contactIds) => {
    set({ isLoading: true, error: null });
    try {
      await contactsApi.removeContactsFromGroup(groupId, contactIds);
      set({ isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to remove contacts from group';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  setSelectedContacts: (contactIds) => set({ selectedContacts: contactIds }),
  
  toggleContactSelection: (contactId) => {
    set((state) => ({
      selectedContacts: state.selectedContacts.includes(contactId)
        ? state.selectedContacts.filter((id) => id !== contactId)
        : [...state.selectedContacts, contactId],
    }));
  },
  
  clearSelectedContacts: () => set({ selectedContacts: [] }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  clearError: () => set({ error: null }),
}));