import { Router } from 'express';
import { contactController } from '../controllers/contactController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { contactValidation } from '../utils/validation';
import Joi from 'joi';

const router = Router();

router.use(authenticate);

const contactGroupValidation = {
  create: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(500).optional(),
    color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    description: Joi.string().max(500).optional(),
    color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
  }),

  addContacts: Joi.object({
    contactIds: Joi.array().items(Joi.string()).min(1).required(),
  }),
};

const bulkOperationValidation = Joi.object({
  operation: Joi.string().valid('delete', 'add_to_group', 'remove_from_group', 'add_tags', 'remove_tags', 'update_field').required(),
  contactIds: Joi.array().items(Joi.string()).min(1).required(),
  data: Joi.object().optional(),
});

const importValidation = Joi.object({
  contacts: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    phone: Joi.string().required(),
    email: Joi.string().email().optional(),
    notes: Joi.string().optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    customFields: Joi.object().optional(),
  })).min(1).required(),
  updateExisting: Joi.boolean().optional(),
});

const mergeDuplicatesValidation = Joi.object({
  primaryContactId: Joi.string().required(),
  duplicateContactIds: Joi.array().items(Joi.string()).min(1).required(),
});

// Basic CRUD operations
router.get('/', contactController.getContacts);
router.post('/', validate(contactValidation.create), contactController.createContact);
router.post('/bulk-upload', contactController.bulkCreateContacts);

// Advanced features
router.get('/search', contactController.searchContacts);
router.get('/tags', contactController.getAllTags);
router.get('/stats', contactController.getContactStats);
router.post('/bulk-operation', validate(bulkOperationValidation), contactController.performBulkOperation);
router.post('/import', validate(importValidation), contactController.importContacts);
router.get('/export', contactController.exportContacts);
router.get('/duplicates', contactController.findDuplicates);
router.post('/merge-duplicates', validate(mergeDuplicatesValidation), contactController.mergeDuplicates);

// Contact groups
router.get('/groups', contactController.getContactGroups);
router.post('/groups', validate(contactGroupValidation.create), contactController.createContactGroup);
router.get('/groups/:id', contactController.getContactGroupById);
router.put('/groups/:id', validate(contactGroupValidation.update), contactController.updateContactGroup);
router.delete('/groups/:id', contactController.deleteContactGroup);
router.post('/groups/:id/contacts', validate(contactGroupValidation.addContacts), contactController.addContactsToGroup);
router.delete('/groups/:id/contacts', validate(contactGroupValidation.addContacts), contactController.removeContactsFromGroup);

// Individual contact operations (must be last to avoid conflicts)
router.get('/:id', contactController.getContactById);
router.put('/:id', validate(contactValidation.update), contactController.updateContact);
router.delete('/:id', contactController.deleteContact);

export default router;