import { Contact, ContactGroup } from '@prisma/client';
export interface CreateContactData {
    name: string;
    phone: string;
    email?: string;
    notes?: string;
    tags?: string[];
    customFields?: Record<string, any>;
}
export interface ContactFilter {
    search?: string;
    tags?: string[];
    groups?: string[];
    hasEmail?: boolean;
    hasNotes?: boolean;
    createdAfter?: Date;
    createdBefore?: Date;
    lastMessageAfter?: Date;
    sortBy?: 'name' | 'phone' | 'email' | 'createdAt' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
}
export interface UpdateContactData {
    name?: string;
    phone?: string;
    email?: string;
    notes?: string;
    tags?: string[];
    customFields?: Record<string, any>;
}
export interface BulkOperation {
    operation: 'delete' | 'add_to_group' | 'remove_from_group' | 'add_tags' | 'remove_tags' | 'update_field';
    contactIds: string[];
    data?: any;
}
export interface ImportResult {
    total: number;
    created: number;
    updated: number;
    skipped: number;
    errors: Array<{
        row: number;
        error: string;
    }>;
}
export interface CreateContactGroupData {
    name: string;
    description?: string;
    color?: string;
}
declare class ContactService {
    createContact(userId: string, data: CreateContactData): Promise<Contact>;
    getContacts(userId: string, page?: number, limit?: number, filter?: ContactFilter): Promise<{
        contacts: Contact[];
        total: number;
        pages: number;
        stats: {
            totalContacts: number;
            withEmail: number;
            withNotes: number;
            inGroups: number;
        };
    }>;
    getContactById(userId: string, contactId: string): Promise<Contact | null>;
    updateContact(userId: string, contactId: string, data: UpdateContactData): Promise<Contact>;
    deleteContact(userId: string, contactId: string): Promise<void>;
    bulkCreateContacts(userId: string, contacts: CreateContactData[]): Promise<{
        created: number;
        skipped: number;
        errors: string[];
    }>;
    createContactGroup(userId: string, data: CreateContactGroupData): Promise<ContactGroup>;
    getContactGroups(userId: string): Promise<ContactGroup[]>;
    getContactGroupById(userId: string, groupId: string): Promise<ContactGroup | null>;
    updateContactGroup(userId: string, groupId: string, data: Partial<CreateContactGroupData>): Promise<ContactGroup>;
    deleteContactGroup(userId: string, groupId: string): Promise<void>;
    addContactsToGroup(userId: string, groupId: string, contactIds: string[]): Promise<void>;
    removeContactsFromGroup(userId: string, groupId: string, contactIds: string[]): Promise<void>;
    getContactStats(userId: string): Promise<{
        totalContacts: number;
        withEmail: number;
        withNotes: number;
        inGroups: number;
    }>;
    searchContacts(userId: string, query: string, limit?: number): Promise<Contact[]>;
    getAllTags(userId: string): Promise<string[]>;
    performBulkOperation(userId: string, operation: BulkOperation): Promise<{
        success: number;
        failed: number;
        errors: string[];
    }>;
    importContacts(userId: string, csvData: any[], updateExisting?: boolean): Promise<ImportResult>;
    exportContacts(userId: string, filter?: ContactFilter, format?: string): Promise<any[]>;
    findDuplicates(userId: string): Promise<Array<{
        phone: string;
        contacts: Contact[];
        confidence: 'high' | 'medium' | 'low';
    }>>;
    mergeDuplicates(userId: string, primaryContactId: string, duplicateContactIds: string[]): Promise<Contact>;
}
export declare const contactService: ContactService;
export {};
//# sourceMappingURL=contactService.d.ts.map