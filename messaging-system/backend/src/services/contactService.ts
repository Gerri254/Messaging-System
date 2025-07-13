import { Contact, ContactGroup } from '@prisma/client';
import prisma from '../config/database';

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

class ContactService {
  async createContact(userId: string, data: CreateContactData): Promise<Contact> {
    const existingContact = await prisma.contact.findFirst({
      where: {
        userId,
        phone: data.phone,
      },
    });

    if (existingContact) {
      throw new Error('Contact with this phone number already exists');
    }

    return prisma.contact.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async getContacts(userId: string, page = 1, limit = 20, filter: ContactFilter = {}): Promise<{
    contacts: Contact[];
    total: number;
    pages: number;
    stats: {
      totalContacts: number;
      withEmail: number;
      withNotes: number;
      inGroups: number;
    };
  }> {
    const skip = (page - 1) * limit;
    
    // Build where clause based on filters
    const where: any = {
      userId,
      ...(filter.search && {
        OR: [
          { name: { contains: filter.search, mode: 'insensitive' as const } },
          { phone: { contains: filter.search } },
          { email: { contains: filter.search, mode: 'insensitive' as const } },
          { notes: { contains: filter.search, mode: 'insensitive' as const } },
        ],
      }),
      ...(filter.hasEmail !== undefined && {
        email: filter.hasEmail ? { not: null } : null,
      }),
      ...(filter.hasNotes !== undefined && {
        notes: filter.hasNotes ? { not: null } : null,
      }),
      ...(filter.createdAfter && {
        createdAt: { gte: filter.createdAfter },
      }),
      ...(filter.createdBefore && {
        createdAt: { lte: filter.createdBefore },
      }),
      ...(filter.tags && filter.tags.length > 0 && {
        tags: { hasSome: filter.tags },
      }),
      ...(filter.groups && filter.groups.length > 0 && {
        groups: {
          some: {
            contactGroupId: { in: filter.groups },
          },
        },
      }),
    };

    // Build orderBy clause
    const orderBy: any = {};
    if (filter.sortBy) {
      orderBy[filter.sortBy] = filter.sortOrder || 'asc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [contacts, total, stats] = await Promise.all([
      prisma.contact.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          groups: {
            include: {
              contactGroup: {
                select: {
                  id: true,
                  name: true,
                  color: true,
                },
              },
            },
          },
          _count: {
            select: {
              messageRecipients: true,
            },
          },
        },
      }),
      prisma.contact.count({ where }),
      this.getContactStats(userId),
    ]);

    return {
      contacts: contacts as any,
      total,
      pages: Math.ceil(total / limit),
      stats,
    };
  }

  async getContactById(userId: string, contactId: string): Promise<Contact | null> {
    return prisma.contact.findFirst({
      where: {
        id: contactId,
        userId,
      },
    });
  }

  async updateContact(userId: string, contactId: string, data: UpdateContactData): Promise<Contact> {
    const contact = await this.getContactById(userId, contactId);
    
    if (!contact) {
      throw new Error('Contact not found');
    }

    if (data.phone && data.phone !== contact.phone) {
      const existingContact = await prisma.contact.findFirst({
        where: {
          userId,
          phone: data.phone,
          id: { not: contactId },
        },
      });

      if (existingContact) {
        throw new Error('Contact with this phone number already exists');
      }
    }

    return prisma.contact.update({
      where: { id: contactId },
      data,
    });
  }

  async deleteContact(userId: string, contactId: string): Promise<void> {
    const contact = await this.getContactById(userId, contactId);
    
    if (!contact) {
      throw new Error('Contact not found');
    }

    await prisma.contact.delete({
      where: { id: contactId },
    });
  }

  async bulkCreateContacts(userId: string, contacts: CreateContactData[]): Promise<{
    created: number;
    skipped: number;
    errors: string[];
  }> {
    const results = {
      created: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const contactData of contacts) {
      try {
        const existingContact = await prisma.contact.findFirst({
          where: {
            userId,
            phone: contactData.phone,
          },
        });

        if (existingContact) {
          results.skipped++;
          continue;
        }

        await prisma.contact.create({
          data: {
            ...contactData,
            userId,
          },
        });

        results.created++;
      } catch (error: any) {
        results.errors.push(`Failed to create contact ${contactData.name}: ${error.message}`);
      }
    }

    return results;
  }

  async createContactGroup(userId: string, data: CreateContactGroupData): Promise<ContactGroup> {
    const existingGroup = await prisma.contactGroup.findFirst({
      where: {
        userId,
        name: data.name,
      },
    });

    if (existingGroup) {
      throw new Error('Contact group with this name already exists');
    }

    return prisma.contactGroup.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async getContactGroups(userId: string): Promise<ContactGroup[]> {
    return prisma.contactGroup.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            contacts: true,
          },
        },
      },
    });
  }

  async getContactGroupById(userId: string, groupId: string): Promise<ContactGroup | null> {
    return prisma.contactGroup.findFirst({
      where: {
        id: groupId,
        userId,
      },
      include: {
        contacts: {
          include: {
            contact: true,
          },
        },
      },
    });
  }

  async updateContactGroup(userId: string, groupId: string, data: Partial<CreateContactGroupData>): Promise<ContactGroup> {
    const group = await prisma.contactGroup.findFirst({
      where: {
        id: groupId,
        userId,
      },
    });

    if (!group) {
      throw new Error('Contact group not found');
    }

    if (data.name && data.name !== group.name) {
      const existingGroup = await prisma.contactGroup.findFirst({
        where: {
          userId,
          name: data.name,
          id: { not: groupId },
        },
      });

      if (existingGroup) {
        throw new Error('Contact group with this name already exists');
      }
    }

    return prisma.contactGroup.update({
      where: { id: groupId },
      data,
    });
  }

  async deleteContactGroup(userId: string, groupId: string): Promise<void> {
    const group = await prisma.contactGroup.findFirst({
      where: {
        id: groupId,
        userId,
      },
    });

    if (!group) {
      throw new Error('Contact group not found');
    }

    await prisma.contactGroup.delete({
      where: { id: groupId },
    });
  }

  async addContactsToGroup(userId: string, groupId: string, contactIds: string[]): Promise<void> {
    const group = await this.getContactGroupById(userId, groupId);
    
    if (!group) {
      throw new Error('Contact group not found');
    }

    const contacts = await prisma.contact.findMany({
      where: {
        id: { in: contactIds },
        userId,
      },
    });

    if (contacts.length !== contactIds.length) {
      throw new Error('Some contacts not found');
    }

    const contactGroupContacts = contactIds.map(contactId => ({
      contactId,
      contactGroupId: groupId,
    }));

    await prisma.contactGroupContact.createMany({
      data: contactGroupContacts,
      skipDuplicates: true,
    });
  }

  async removeContactsFromGroup(userId: string, groupId: string, contactIds: string[]): Promise<void> {
    const group = await this.getContactGroupById(userId, groupId);
    
    if (!group) {
      throw new Error('Contact group not found');
    }

    await prisma.contactGroupContact.deleteMany({
      where: {
        contactGroupId: groupId,
        contactId: { in: contactIds },
      },
    });
  }

  // Contact statistics
  async getContactStats(userId: string): Promise<{
    totalContacts: number;
    withEmail: number;
    withNotes: number;
    inGroups: number;
  }> {
    const [totalContacts, withEmail, withNotes, inGroups] = await Promise.all([
      prisma.contact.count({ where: { userId } }),
      prisma.contact.count({ where: { userId, email: { not: null } } }),
      prisma.contact.count({ where: { userId, notes: { not: null } } }),
      prisma.contact.count({
        where: {
          userId,
          groups: {
            some: {},
          },
        },
      }),
    ]);

    return {
      totalContacts,
      withEmail,
      withNotes,
      inGroups,
    };
  }

  // Advanced search with autocomplete
  async searchContacts(userId: string, query: string, limit = 10): Promise<Contact[]> {
    return prisma.contact.findMany({
      where: {
        userId,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      orderBy: [
        { name: 'asc' },
        { phone: 'asc' },
      ],
    });
  }

  // Get all unique tags
  async getAllTags(userId: string): Promise<string[]> {
    const contacts = await prisma.contact.findMany({
      where: { userId },
      select: { tags: true },
    });

    const allTags = new Set<string>();
    contacts.forEach(contact => {
      if (contact.tags && Array.isArray(contact.tags)) {
        (contact.tags as string[]).forEach(tag => allTags.add(tag));
      }
    });

    return Array.from(allTags).sort();
  }

  // Bulk operations
  async performBulkOperation(userId: string, operation: BulkOperation): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    const result = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Verify all contacts belong to the user
    const contacts = await prisma.contact.findMany({
      where: {
        id: { in: operation.contactIds },
        userId,
      },
    });

    if (contacts.length !== operation.contactIds.length) {
      result.errors.push('Some contacts not found or access denied');
      result.failed = operation.contactIds.length - contacts.length;
    }

    const validContactIds = contacts.map(c => c.id);

    try {
      switch (operation.operation) {
        case 'delete':
          await prisma.contact.deleteMany({
            where: {
              id: { in: validContactIds },
              userId,
            },
          });
          result.success = validContactIds.length;
          break;

        case 'add_to_group':
          if (!operation.data?.groupId) {
            throw new Error('Group ID required for add_to_group operation');
          }
          
          const groupData = validContactIds.map(contactId => ({
            contactId,
            contactGroupId: operation.data.groupId,
          }));

          await prisma.contactGroupContact.createMany({
            data: groupData,
            skipDuplicates: true,
          });
          result.success = validContactIds.length;
          break;

        case 'remove_from_group':
          if (!operation.data?.groupId) {
            throw new Error('Group ID required for remove_from_group operation');
          }

          await prisma.contactGroupContact.deleteMany({
            where: {
              contactId: { in: validContactIds },
              contactGroupId: operation.data.groupId,
            },
          });
          result.success = validContactIds.length;
          break;

        case 'add_tags':
          if (!operation.data?.tags || !Array.isArray(operation.data.tags)) {
            throw new Error('Tags array required for add_tags operation');
          }

          for (const contactId of validContactIds) {
            const contact = await prisma.contact.findUnique({
              where: { id: contactId },
              select: { tags: true },
            });

            const existingTags = (contact?.tags as string[]) || [];
            const newTags = [...new Set([...existingTags, ...operation.data.tags])];

            await prisma.contact.update({
              where: { id: contactId },
              data: { tags: newTags },
            });
          }
          result.success = validContactIds.length;
          break;

        case 'remove_tags':
          if (!operation.data?.tags || !Array.isArray(operation.data.tags)) {
            throw new Error('Tags array required for remove_tags operation');
          }

          for (const contactId of validContactIds) {
            const contact = await prisma.contact.findUnique({
              where: { id: contactId },
              select: { tags: true },
            });

            const existingTags = (contact?.tags as string[]) || [];
            const newTags = existingTags.filter(tag => !operation.data.tags.includes(tag));

            await prisma.contact.update({
              where: { id: contactId },
              data: { tags: newTags },
            });
          }
          result.success = validContactIds.length;
          break;

        case 'update_field':
          if (!operation.data?.field || operation.data?.value === undefined) {
            throw new Error('Field and value required for update_field operation');
          }

          const updateData: any = {};
          updateData[operation.data.field] = operation.data.value;

          await prisma.contact.updateMany({
            where: {
              id: { in: validContactIds },
              userId,
            },
            data: updateData,
          });
          result.success = validContactIds.length;
          break;

        default:
          throw new Error(`Unknown operation: ${operation.operation}`);
      }
    } catch (error: any) {
      result.errors.push(error.message);
      result.failed += validContactIds.length;
      result.success = 0;
    }

    return result;
  }

  // Import contacts from CSV data
  async importContacts(userId: string, csvData: any[], updateExisting = false): Promise<ImportResult> {
    const result: ImportResult = {
      total: csvData.length,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [],
    };

    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      const rowNumber = i + 1;

      try {
        // Validate required fields
        if (!row.name || !row.phone) {
          result.errors.push({
            row: rowNumber,
            error: 'Name and phone are required',
          });
          result.skipped++;
          continue;
        }

        // Check if contact exists
        const existingContact = await prisma.contact.findFirst({
          where: {
            userId,
            phone: row.phone,
          },
        });

        if (existingContact) {
          if (updateExisting) {
            await prisma.contact.update({
              where: { id: existingContact.id },
              data: {
                name: row.name,
                email: row.email || null,
                notes: row.notes || null,
                tags: row.tags ? (typeof row.tags === 'string' ? row.tags.split(',').map((t: string) => t.trim()) : row.tags) : [],
                customFields: row.customFields || {},
              },
            });
            result.updated++;
          } else {
            result.skipped++;
          }
        } else {
          await prisma.contact.create({
            data: {
              userId,
              name: row.name,
              phone: row.phone,
              email: row.email || null,
              notes: row.notes || null,
              tags: row.tags ? (typeof row.tags === 'string' ? row.tags.split(',').map((t: string) => t.trim()) : row.tags) : [],
              customFields: row.customFields || {},
            },
          });
          result.created++;
        }
      } catch (error: any) {
        result.errors.push({
          row: rowNumber,
          error: error.message,
        });
        result.skipped++;
      }
    }

    return result;
  }

  // Export contacts to CSV format
  async exportContacts(userId: string, filter: ContactFilter = {}, format = 'csv'): Promise<any[]> {
    const { contacts } = await this.getContacts(userId, 1, 10000, filter);

    return contacts.map(contact => ({
      id: contact.id,
      name: contact.name,
      phone: contact.phone,
      email: contact.email || '',
      notes: contact.notes || '',
      tags: contact.tags ? (contact.tags as string[]).join(', ') : '',
      customFields: contact.customFields ? JSON.stringify(contact.customFields) : '',
      groups: (contact as any).groups ? (contact as any).groups.map((g: any) => g.contactGroup.name).join(', ') : '',
      createdAt: contact.createdAt.toISOString(),
      updatedAt: contact.updatedAt.toISOString(),
    }));
  }

  // Duplicate detection and merging
  async findDuplicates(userId: string): Promise<Array<{
    phone: string;
    contacts: Contact[];
    confidence: 'high' | 'medium' | 'low';
  }>> {
    const contacts = await prisma.contact.findMany({
      where: { userId },
      orderBy: { phone: 'asc' },
    });

    const duplicateGroups: { [key: string]: Contact[] } = {};

    // Group by phone number
    contacts.forEach(contact => {
      const phone = contact.phone.replace(/\D/g, ''); // Remove non-digits
      if (!duplicateGroups[phone]) {
        duplicateGroups[phone] = [];
      }
      duplicateGroups[phone].push(contact);
    });

    // Filter out groups with only one contact
    const duplicates = Object.entries(duplicateGroups)
      .filter(([_, contacts]) => contacts.length > 1)
      .map(([phone, contacts]) => ({
        phone,
        contacts,
        confidence: 'high' as const, // Same phone number = high confidence
      }));

    return duplicates;
  }

  // Merge duplicate contacts
  async mergeDuplicates(userId: string, primaryContactId: string, duplicateContactIds: string[]): Promise<Contact> {
    const primaryContact = await this.getContactById(userId, primaryContactId);
    if (!primaryContact) {
      throw new Error('Primary contact not found');
    }

    const duplicateContacts = await prisma.contact.findMany({
      where: {
        id: { in: duplicateContactIds },
        userId,
      },
    });

    if (duplicateContacts.length !== duplicateContactIds.length) {
      throw new Error('Some duplicate contacts not found');
    }

    // Merge data from duplicates into primary contact
    const mergedTags = new Set(primaryContact.tags as string[] || []);
    const mergedCustomFields = { ...(primaryContact.customFields as object || {}) };
    let mergedNotes = primaryContact.notes || '';

    duplicateContacts.forEach(contact => {
      // Merge tags
      if (contact.tags && Array.isArray(contact.tags)) {
        (contact.tags as string[]).forEach(tag => mergedTags.add(tag));
      }

      // Merge custom fields
      if (contact.customFields && typeof contact.customFields === 'object') {
        Object.assign(mergedCustomFields, contact.customFields);
      }

      // Merge notes
      if (contact.notes && contact.notes !== primaryContact.notes) {
        mergedNotes += mergedNotes ? `\n\n--- Merged from ${contact.name} ---\n${contact.notes}` : contact.notes;
      }

      // Use email from duplicate if primary doesn't have one
      if (!primaryContact.email && contact.email) {
        primaryContact.email = contact.email;
      }
    });

    // Update primary contact with merged data
    const updatedContact = await prisma.contact.update({
      where: { id: primaryContactId },
      data: {
        email: primaryContact.email,
        notes: mergedNotes,
        tags: Array.from(mergedTags),
        customFields: mergedCustomFields,
      },
    });

    // Move group memberships from duplicates to primary
    const duplicateGroupMemberships = await prisma.contactGroupContact.findMany({
      where: {
        contactId: { in: duplicateContactIds },
      },
    });

    for (const membership of duplicateGroupMemberships) {
      try {
        await prisma.contactGroupContact.create({
          data: {
            contactId: primaryContactId,
            contactGroupId: membership.contactGroupId,
          },
        });
      } catch (error) {
        // Ignore duplicate membership errors
      }
    }

    // Delete duplicate contacts
    await prisma.contact.deleteMany({
      where: {
        id: { in: duplicateContactIds },
        userId,
      },
    });

    return updatedContact;
  }
}

export const contactService = new ContactService();