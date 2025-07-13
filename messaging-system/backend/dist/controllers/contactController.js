"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactController = void 0;
const contactService_1 = require("../services/contactService");
exports.contactController = {
    async createContact(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            const { name, phone, email, notes } = req.body;
            const contact = await contactService_1.contactService.createContact(req.user.id, {
                name,
                phone,
                email,
                notes,
            });
            return res.status(201).json({
                message: 'Contact created successfully',
                contact,
            });
        }
        catch (error) {
            return res.status(400).json({
                error: error.message || 'Failed to create contact',
            });
        }
    },
    async getContacts(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const filter = {};
            if (req.query.search)
                filter.search = req.query.search;
            if (req.query.tags)
                filter.tags = req.query.tags.split(',');
            if (req.query.groups)
                filter.groups = req.query.groups.split(',');
            if (req.query.hasEmail)
                filter.hasEmail = req.query.hasEmail === 'true';
            if (req.query.hasNotes)
                filter.hasNotes = req.query.hasNotes === 'true';
            if (req.query.createdAfter)
                filter.createdAfter = new Date(req.query.createdAfter);
            if (req.query.createdBefore)
                filter.createdBefore = new Date(req.query.createdBefore);
            if (req.query.sortBy)
                filter.sortBy = req.query.sortBy;
            if (req.query.sortOrder)
                filter.sortOrder = req.query.sortOrder;
            const result = await contactService_1.contactService.getContacts(req.user.id, page, limit, filter);
            return res.status(200).json(result);
        }
        catch (error) {
            return res.status(500).json({
                error: error.message || 'Failed to get contacts',
            });
        }
    },
    async getContactById(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            const { id } = req.params;
            const contact = await contactService_1.contactService.getContactById(req.user.id, id);
            if (!contact) {
                return res.status(404).json({
                    error: 'Contact not found',
                });
            }
            return res.status(200).json({ contact });
        }
        catch (error) {
            return res.status(500).json({
                error: error.message || 'Failed to get contact',
            });
        }
    },
    async updateContact(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            const { id } = req.params;
            const { name, phone, email, notes } = req.body;
            const contact = await contactService_1.contactService.updateContact(req.user.id, id, {
                name,
                phone,
                email,
                notes,
            });
            return res.status(200).json({
                message: 'Contact updated successfully',
                contact,
            });
        }
        catch (error) {
            return res.status(400).json({
                error: error.message || 'Failed to update contact',
            });
        }
    },
    async deleteContact(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            const { id } = req.params;
            await contactService_1.contactService.deleteContact(req.user.id, id);
            return res.status(200).json({
                message: 'Contact deleted successfully',
            });
        }
        catch (error) {
            return res.status(400).json({
                error: error.message || 'Failed to delete contact',
            });
        }
    },
    async bulkCreateContacts(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            const { contacts } = req.body;
            if (!Array.isArray(contacts) || contacts.length === 0) {
                return res.status(400).json({
                    error: 'Contacts array is required and must not be empty',
                });
            }
            const result = await contactService_1.contactService.bulkCreateContacts(req.user.id, contacts);
            return res.status(200).json({
                message: 'Bulk contact creation completed',
                result,
            });
        }
        catch (error) {
            return res.status(400).json({
                error: error.message || 'Failed to create contacts',
            });
        }
    },
    async createContactGroup(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            const { name, description, color } = req.body;
            const group = await contactService_1.contactService.createContactGroup(req.user.id, {
                name,
                description,
                color,
            });
            return res.status(201).json({
                message: 'Contact group created successfully',
                group,
            });
        }
        catch (error) {
            return res.status(400).json({
                error: error.message || 'Failed to create contact group',
            });
        }
    },
    async getContactGroups(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            const groups = await contactService_1.contactService.getContactGroups(req.user.id);
            return res.status(200).json({ groups });
        }
        catch (error) {
            return res.status(500).json({
                error: error.message || 'Failed to get contact groups',
            });
        }
    },
    async getContactGroupById(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            const { id } = req.params;
            const group = await contactService_1.contactService.getContactGroupById(req.user.id, id);
            if (!group) {
                return res.status(404).json({
                    error: 'Contact group not found',
                });
            }
            return res.status(200).json({ group });
        }
        catch (error) {
            return res.status(500).json({
                error: error.message || 'Failed to get contact group',
            });
        }
    },
    async updateContactGroup(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            const { id } = req.params;
            const { name, description, color } = req.body;
            const group = await contactService_1.contactService.updateContactGroup(req.user.id, id, {
                name,
                description,
                color,
            });
            return res.status(200).json({
                message: 'Contact group updated successfully',
                group,
            });
        }
        catch (error) {
            return res.status(400).json({
                error: error.message || 'Failed to update contact group',
            });
        }
    },
    async deleteContactGroup(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            const { id } = req.params;
            await contactService_1.contactService.deleteContactGroup(req.user.id, id);
            return res.status(200).json({
                message: 'Contact group deleted successfully',
            });
        }
        catch (error) {
            return res.status(400).json({
                error: error.message || 'Failed to delete contact group',
            });
        }
    },
    async addContactsToGroup(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            const { id } = req.params;
            const { contactIds } = req.body;
            if (!Array.isArray(contactIds) || contactIds.length === 0) {
                return res.status(400).json({
                    error: 'Contact IDs array is required and must not be empty',
                });
            }
            await contactService_1.contactService.addContactsToGroup(req.user.id, id, contactIds);
            return res.status(200).json({
                message: 'Contacts added to group successfully',
            });
        }
        catch (error) {
            return res.status(400).json({
                error: error.message || 'Failed to add contacts to group',
            });
        }
    },
    async removeContactsFromGroup(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            const { id } = req.params;
            const { contactIds } = req.body;
            if (!Array.isArray(contactIds) || contactIds.length === 0) {
                return res.status(400).json({
                    error: 'Contact IDs array is required and must not be empty',
                });
            }
            await contactService_1.contactService.removeContactsFromGroup(req.user.id, id, contactIds);
            return res.status(200).json({
                message: 'Contacts removed from group successfully',
            });
        }
        catch (error) {
            return res.status(400).json({
                error: error.message || 'Failed to remove contacts from group',
            });
        }
    },
    async searchContacts(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            const { q: query } = req.query;
            const limit = parseInt(req.query.limit) || 10;
            if (!query || typeof query !== 'string') {
                return res.status(400).json({ error: 'Query parameter "q" is required' });
            }
            const contacts = await contactService_1.contactService.searchContacts(req.user.id, query, limit);
            return res.status(200).json({ contacts });
        }
        catch (error) {
            return res.status(500).json({
                error: error.message || 'Failed to search contacts',
            });
        }
    },
    async getAllTags(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            const tags = await contactService_1.contactService.getAllTags(req.user.id);
            return res.status(200).json({ tags });
        }
        catch (error) {
            return res.status(500).json({
                error: error.message || 'Failed to get tags',
            });
        }
    },
    async getContactStats(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            const stats = await contactService_1.contactService.getContactStats(req.user.id);
            return res.status(200).json(stats);
        }
        catch (error) {
            return res.status(500).json({
                error: error.message || 'Failed to get contact statistics',
            });
        }
    },
    async performBulkOperation(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            const { operation, contactIds, data } = req.body;
            if (!operation || !contactIds || !Array.isArray(contactIds)) {
                return res.status(400).json({
                    error: 'Operation and contactIds array are required',
                });
            }
            const result = await contactService_1.contactService.performBulkOperation(req.user.id, {
                operation,
                contactIds,
                data,
            });
            return res.status(200).json(result);
        }
        catch (error) {
            return res.status(400).json({
                error: error.message || 'Failed to perform bulk operation',
            });
        }
    },
    async importContacts(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            const { contacts, updateExisting = false } = req.body;
            if (!contacts || !Array.isArray(contacts)) {
                return res.status(400).json({
                    error: 'Contacts array is required',
                });
            }
            const result = await contactService_1.contactService.importContacts(req.user.id, contacts, updateExisting);
            return res.status(200).json(result);
        }
        catch (error) {
            return res.status(400).json({
                error: error.message || 'Failed to import contacts',
            });
        }
    },
    async exportContacts(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            const format = req.query.format || 'csv';
            const filter = {};
            if (req.query.search)
                filter.search = req.query.search;
            if (req.query.tags)
                filter.tags = req.query.tags.split(',');
            if (req.query.groups)
                filter.groups = req.query.groups.split(',');
            if (req.query.hasEmail)
                filter.hasEmail = req.query.hasEmail === 'true';
            if (req.query.hasNotes)
                filter.hasNotes = req.query.hasNotes === 'true';
            const contacts = await contactService_1.contactService.exportContacts(req.user.id, filter, format);
            return res.status(200).json({
                contacts,
                total: contacts.length,
                format,
                exportedAt: new Date().toISOString(),
            });
        }
        catch (error) {
            return res.status(500).json({
                error: error.message || 'Failed to export contacts',
            });
        }
    },
    async findDuplicates(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            const duplicates = await contactService_1.contactService.findDuplicates(req.user.id);
            return res.status(200).json({
                duplicates,
                total: duplicates.length,
            });
        }
        catch (error) {
            return res.status(500).json({
                error: error.message || 'Failed to find duplicates',
            });
        }
    },
    async mergeDuplicates(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            const { primaryContactId, duplicateContactIds } = req.body;
            if (!primaryContactId || !duplicateContactIds || !Array.isArray(duplicateContactIds)) {
                return res.status(400).json({
                    error: 'Primary contact ID and duplicate contact IDs array are required',
                });
            }
            const mergedContact = await contactService_1.contactService.mergeDuplicates(req.user.id, primaryContactId, duplicateContactIds);
            return res.status(200).json({
                message: 'Contacts merged successfully',
                contact: mergedContact,
            });
        }
        catch (error) {
            return res.status(400).json({
                error: error.message || 'Failed to merge contacts',
            });
        }
    },
};
//# sourceMappingURL=contactController.js.map