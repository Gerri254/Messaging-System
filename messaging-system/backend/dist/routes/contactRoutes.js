"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const contactController_1 = require("../controllers/contactController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const validation_2 = require("../utils/validation");
const joi_1 = __importDefault(require("joi"));
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
const contactGroupValidation = {
    create: joi_1.default.object({
        name: joi_1.default.string().min(2).max(100).required(),
        description: joi_1.default.string().max(500).optional(),
        color: joi_1.default.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
    }),
    update: joi_1.default.object({
        name: joi_1.default.string().min(2).max(100).optional(),
        description: joi_1.default.string().max(500).optional(),
        color: joi_1.default.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
    }),
    addContacts: joi_1.default.object({
        contactIds: joi_1.default.array().items(joi_1.default.string()).min(1).required(),
    }),
};
const bulkOperationValidation = joi_1.default.object({
    operation: joi_1.default.string().valid('delete', 'add_to_group', 'remove_from_group', 'add_tags', 'remove_tags', 'update_field').required(),
    contactIds: joi_1.default.array().items(joi_1.default.string()).min(1).required(),
    data: joi_1.default.object().optional(),
});
const importValidation = joi_1.default.object({
    contacts: joi_1.default.array().items(joi_1.default.object({
        name: joi_1.default.string().required(),
        phone: joi_1.default.string().required(),
        email: joi_1.default.string().email().optional(),
        notes: joi_1.default.string().optional(),
        tags: joi_1.default.array().items(joi_1.default.string()).optional(),
        customFields: joi_1.default.object().optional(),
    })).min(1).required(),
    updateExisting: joi_1.default.boolean().optional(),
});
const mergeDuplicatesValidation = joi_1.default.object({
    primaryContactId: joi_1.default.string().required(),
    duplicateContactIds: joi_1.default.array().items(joi_1.default.string()).min(1).required(),
});
router.get('/', contactController_1.contactController.getContacts);
router.post('/', (0, validation_1.validate)(validation_2.contactValidation.create), contactController_1.contactController.createContact);
router.post('/bulk-upload', contactController_1.contactController.bulkCreateContacts);
router.get('/search', contactController_1.contactController.searchContacts);
router.get('/tags', contactController_1.contactController.getAllTags);
router.get('/stats', contactController_1.contactController.getContactStats);
router.post('/bulk-operation', (0, validation_1.validate)(bulkOperationValidation), contactController_1.contactController.performBulkOperation);
router.post('/import', (0, validation_1.validate)(importValidation), contactController_1.contactController.importContacts);
router.get('/export', contactController_1.contactController.exportContacts);
router.get('/duplicates', contactController_1.contactController.findDuplicates);
router.post('/merge-duplicates', (0, validation_1.validate)(mergeDuplicatesValidation), contactController_1.contactController.mergeDuplicates);
router.get('/groups', contactController_1.contactController.getContactGroups);
router.post('/groups', (0, validation_1.validate)(contactGroupValidation.create), contactController_1.contactController.createContactGroup);
router.get('/groups/:id', contactController_1.contactController.getContactGroupById);
router.put('/groups/:id', (0, validation_1.validate)(contactGroupValidation.update), contactController_1.contactController.updateContactGroup);
router.delete('/groups/:id', contactController_1.contactController.deleteContactGroup);
router.post('/groups/:id/contacts', (0, validation_1.validate)(contactGroupValidation.addContacts), contactController_1.contactController.addContactsToGroup);
router.delete('/groups/:id/contacts', (0, validation_1.validate)(contactGroupValidation.addContacts), contactController_1.contactController.removeContactsFromGroup);
router.get('/:id', contactController_1.contactController.getContactById);
router.put('/:id', (0, validation_1.validate)(validation_2.contactValidation.update), contactController_1.contactController.updateContact);
router.delete('/:id', contactController_1.contactController.deleteContact);
exports.default = router;
//# sourceMappingURL=contactRoutes.js.map