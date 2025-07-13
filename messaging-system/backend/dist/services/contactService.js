"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactService = void 0;
const database_1 = __importDefault(require("../config/database"));
class ContactService {
    async createContact(userId, data) {
        const existingContact = await database_1.default.contact.findFirst({
            where: {
                userId,
                phone: data.phone,
            },
        });
        if (existingContact) {
            throw new Error('Contact with this phone number already exists');
        }
        return database_1.default.contact.create({
            data: {
                ...data,
                userId,
            },
        });
    }
    async getContacts(userId, page = 1, limit = 20, filter = {}) {
        const skip = (page - 1) * limit;
        const where = {
            userId,
            ...(filter.search && {
                OR: [
                    { name: { contains: filter.search, mode: 'insensitive' } },
                    { phone: { contains: filter.search } },
                    { email: { contains: filter.search, mode: 'insensitive' } },
                    { notes: { contains: filter.search, mode: 'insensitive' } },
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
        const orderBy = {};
        if (filter.sortBy) {
            orderBy[filter.sortBy] = filter.sortOrder || 'asc';
        }
        else {
            orderBy.createdAt = 'desc';
        }
        const [contacts, total, stats] = await Promise.all([
            database_1.default.contact.findMany({
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
            database_1.default.contact.count({ where }),
            this.getContactStats(userId),
        ]);
        return {
            contacts: contacts,
            total,
            pages: Math.ceil(total / limit),
            stats,
        };
    }
    async getContactById(userId, contactId) {
        return database_1.default.contact.findFirst({
            where: {
                id: contactId,
                userId,
            },
        });
    }
    async updateContact(userId, contactId, data) {
        const contact = await this.getContactById(userId, contactId);
        if (!contact) {
            throw new Error('Contact not found');
        }
        if (data.phone && data.phone !== contact.phone) {
            const existingContact = await database_1.default.contact.findFirst({
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
        return database_1.default.contact.update({
            where: { id: contactId },
            data,
        });
    }
    async deleteContact(userId, contactId) {
        const contact = await this.getContactById(userId, contactId);
        if (!contact) {
            throw new Error('Contact not found');
        }
        await database_1.default.contact.delete({
            where: { id: contactId },
        });
    }
    async bulkCreateContacts(userId, contacts) {
        const results = {
            created: 0,
            skipped: 0,
            errors: [],
        };
        for (const contactData of contacts) {
            try {
                const existingContact = await database_1.default.contact.findFirst({
                    where: {
                        userId,
                        phone: contactData.phone,
                    },
                });
                if (existingContact) {
                    results.skipped++;
                    continue;
                }
                await database_1.default.contact.create({
                    data: {
                        ...contactData,
                        userId,
                    },
                });
                results.created++;
            }
            catch (error) {
                results.errors.push(`Failed to create contact ${contactData.name}: ${error.message}`);
            }
        }
        return results;
    }
    async createContactGroup(userId, data) {
        const existingGroup = await database_1.default.contactGroup.findFirst({
            where: {
                userId,
                name: data.name,
            },
        });
        if (existingGroup) {
            throw new Error('Contact group with this name already exists');
        }
        return database_1.default.contactGroup.create({
            data: {
                ...data,
                userId,
            },
        });
    }
    async getContactGroups(userId) {
        return database_1.default.contactGroup.findMany({
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
    async getContactGroupById(userId, groupId) {
        return database_1.default.contactGroup.findFirst({
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
    async updateContactGroup(userId, groupId, data) {
        const group = await database_1.default.contactGroup.findFirst({
            where: {
                id: groupId,
                userId,
            },
        });
        if (!group) {
            throw new Error('Contact group not found');
        }
        if (data.name && data.name !== group.name) {
            const existingGroup = await database_1.default.contactGroup.findFirst({
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
        return database_1.default.contactGroup.update({
            where: { id: groupId },
            data,
        });
    }
    async deleteContactGroup(userId, groupId) {
        const group = await database_1.default.contactGroup.findFirst({
            where: {
                id: groupId,
                userId,
            },
        });
        if (!group) {
            throw new Error('Contact group not found');
        }
        await database_1.default.contactGroup.delete({
            where: { id: groupId },
        });
    }
    async addContactsToGroup(userId, groupId, contactIds) {
        const group = await this.getContactGroupById(userId, groupId);
        if (!group) {
            throw new Error('Contact group not found');
        }
        const contacts = await database_1.default.contact.findMany({
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
        await database_1.default.contactGroupContact.createMany({
            data: contactGroupContacts,
            skipDuplicates: true,
        });
    }
    async removeContactsFromGroup(userId, groupId, contactIds) {
        const group = await this.getContactGroupById(userId, groupId);
        if (!group) {
            throw new Error('Contact group not found');
        }
        await database_1.default.contactGroupContact.deleteMany({
            where: {
                contactGroupId: groupId,
                contactId: { in: contactIds },
            },
        });
    }
    async getContactStats(userId) {
        const [totalContacts, withEmail, withNotes, inGroups] = await Promise.all([
            database_1.default.contact.count({ where: { userId } }),
            database_1.default.contact.count({ where: { userId, email: { not: null } } }),
            database_1.default.contact.count({ where: { userId, notes: { not: null } } }),
            database_1.default.contact.count({
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
    async searchContacts(userId, query, limit = 10) {
        return database_1.default.contact.findMany({
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
    async getAllTags(userId) {
        const contacts = await database_1.default.contact.findMany({
            where: { userId },
            select: { tags: true },
        });
        const allTags = new Set();
        contacts.forEach(contact => {
            if (contact.tags && Array.isArray(contact.tags)) {
                contact.tags.forEach(tag => allTags.add(tag));
            }
        });
        return Array.from(allTags).sort();
    }
    async performBulkOperation(userId, operation) {
        const result = {
            success: 0,
            failed: 0,
            errors: [],
        };
        const contacts = await database_1.default.contact.findMany({
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
                    await database_1.default.contact.deleteMany({
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
                    await database_1.default.contactGroupContact.createMany({
                        data: groupData,
                        skipDuplicates: true,
                    });
                    result.success = validContactIds.length;
                    break;
                case 'remove_from_group':
                    if (!operation.data?.groupId) {
                        throw new Error('Group ID required for remove_from_group operation');
                    }
                    await database_1.default.contactGroupContact.deleteMany({
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
                        const contact = await database_1.default.contact.findUnique({
                            where: { id: contactId },
                            select: { tags: true },
                        });
                        const existingTags = contact?.tags || [];
                        const newTags = [...new Set([...existingTags, ...operation.data.tags])];
                        await database_1.default.contact.update({
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
                        const contact = await database_1.default.contact.findUnique({
                            where: { id: contactId },
                            select: { tags: true },
                        });
                        const existingTags = contact?.tags || [];
                        const newTags = existingTags.filter(tag => !operation.data.tags.includes(tag));
                        await database_1.default.contact.update({
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
                    const updateData = {};
                    updateData[operation.data.field] = operation.data.value;
                    await database_1.default.contact.updateMany({
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
        }
        catch (error) {
            result.errors.push(error.message);
            result.failed += validContactIds.length;
            result.success = 0;
        }
        return result;
    }
    async importContacts(userId, csvData, updateExisting = false) {
        const result = {
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
                if (!row.name || !row.phone) {
                    result.errors.push({
                        row: rowNumber,
                        error: 'Name and phone are required',
                    });
                    result.skipped++;
                    continue;
                }
                const existingContact = await database_1.default.contact.findFirst({
                    where: {
                        userId,
                        phone: row.phone,
                    },
                });
                if (existingContact) {
                    if (updateExisting) {
                        await database_1.default.contact.update({
                            where: { id: existingContact.id },
                            data: {
                                name: row.name,
                                email: row.email || null,
                                notes: row.notes || null,
                                tags: row.tags ? (typeof row.tags === 'string' ? row.tags.split(',').map((t) => t.trim()) : row.tags) : [],
                                customFields: row.customFields || {},
                            },
                        });
                        result.updated++;
                    }
                    else {
                        result.skipped++;
                    }
                }
                else {
                    await database_1.default.contact.create({
                        data: {
                            userId,
                            name: row.name,
                            phone: row.phone,
                            email: row.email || null,
                            notes: row.notes || null,
                            tags: row.tags ? (typeof row.tags === 'string' ? row.tags.split(',').map((t) => t.trim()) : row.tags) : [],
                            customFields: row.customFields || {},
                        },
                    });
                    result.created++;
                }
            }
            catch (error) {
                result.errors.push({
                    row: rowNumber,
                    error: error.message,
                });
                result.skipped++;
            }
        }
        return result;
    }
    async exportContacts(userId, filter = {}, format = 'csv') {
        const { contacts } = await this.getContacts(userId, 1, 10000, filter);
        return contacts.map(contact => ({
            id: contact.id,
            name: contact.name,
            phone: contact.phone,
            email: contact.email || '',
            notes: contact.notes || '',
            tags: contact.tags ? contact.tags.join(', ') : '',
            customFields: contact.customFields ? JSON.stringify(contact.customFields) : '',
            groups: contact.groups ? contact.groups.map((g) => g.contactGroup.name).join(', ') : '',
            createdAt: contact.createdAt.toISOString(),
            updatedAt: contact.updatedAt.toISOString(),
        }));
    }
    async findDuplicates(userId) {
        const contacts = await database_1.default.contact.findMany({
            where: { userId },
            orderBy: { phone: 'asc' },
        });
        const duplicateGroups = {};
        contacts.forEach(contact => {
            const phone = contact.phone.replace(/\D/g, '');
            if (!duplicateGroups[phone]) {
                duplicateGroups[phone] = [];
            }
            duplicateGroups[phone].push(contact);
        });
        const duplicates = Object.entries(duplicateGroups)
            .filter(([_, contacts]) => contacts.length > 1)
            .map(([phone, contacts]) => ({
            phone,
            contacts,
            confidence: 'high',
        }));
        return duplicates;
    }
    async mergeDuplicates(userId, primaryContactId, duplicateContactIds) {
        const primaryContact = await this.getContactById(userId, primaryContactId);
        if (!primaryContact) {
            throw new Error('Primary contact not found');
        }
        const duplicateContacts = await database_1.default.contact.findMany({
            where: {
                id: { in: duplicateContactIds },
                userId,
            },
        });
        if (duplicateContacts.length !== duplicateContactIds.length) {
            throw new Error('Some duplicate contacts not found');
        }
        const mergedTags = new Set(primaryContact.tags || []);
        const mergedCustomFields = { ...(primaryContact.customFields || {}) };
        let mergedNotes = primaryContact.notes || '';
        duplicateContacts.forEach(contact => {
            if (contact.tags && Array.isArray(contact.tags)) {
                contact.tags.forEach(tag => mergedTags.add(tag));
            }
            if (contact.customFields && typeof contact.customFields === 'object') {
                Object.assign(mergedCustomFields, contact.customFields);
            }
            if (contact.notes && contact.notes !== primaryContact.notes) {
                mergedNotes += mergedNotes ? `\n\n--- Merged from ${contact.name} ---\n${contact.notes}` : contact.notes;
            }
            if (!primaryContact.email && contact.email) {
                primaryContact.email = contact.email;
            }
        });
        const updatedContact = await database_1.default.contact.update({
            where: { id: primaryContactId },
            data: {
                email: primaryContact.email,
                notes: mergedNotes,
                tags: Array.from(mergedTags),
                customFields: mergedCustomFields,
            },
        });
        const duplicateGroupMemberships = await database_1.default.contactGroupContact.findMany({
            where: {
                contactId: { in: duplicateContactIds },
            },
        });
        for (const membership of duplicateGroupMemberships) {
            try {
                await database_1.default.contactGroupContact.create({
                    data: {
                        contactId: primaryContactId,
                        contactGroupId: membership.contactGroupId,
                    },
                });
            }
            catch (error) {
            }
        }
        await database_1.default.contact.deleteMany({
            where: {
                id: { in: duplicateContactIds },
                userId,
            },
        });
        return updatedContact;
    }
}
exports.contactService = new ContactService();
//# sourceMappingURL=contactService.js.map