import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../../src/app';
import {
  createTestUser,
  createTestContact,
  generateTestToken,
  expectValidationError,
  expectSuccessResponse,
  expectAuthenticationError,
} from '../utils/testHelpers';

const prisma = new PrismaClient();

describe('Contacts Endpoints', () => {
  const authToken = generateTestToken();

  describe('GET /api/contacts', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should get contacts for authenticated user', async () => {
      const mockContacts = [createTestContact];

      (prisma.contact.findMany as jest.Mock).mockResolvedValue(mockContacts);
      (prisma.contact.count as jest.Mock).mockResolvedValue(1);

      const response = await request(app)
        .get('/api/contacts')
        .set('Authorization', `Bearer ${authToken}`);

      expectSuccessResponse(response);
      expect(response.body.data.contacts).toHaveLength(1);
      expect(response.body.data.total).toBe(1);
      expect(response.body.data.contacts[0].id).toBe(createTestContact.id);
    });

    it('should support pagination', async () => {
      const mockContacts = [createTestContact];

      (prisma.contact.findMany as jest.Mock).mockResolvedValue(mockContacts);
      (prisma.contact.count as jest.Mock).mockResolvedValue(10);

      const response = await request(app)
        .get('/api/contacts?page=2&limit=5')
        .set('Authorization', `Bearer ${authToken}`);

      expectSuccessResponse(response);
      expect(response.body.data.pages).toBe(2);
      expect(response.body.data.currentPage).toBe(2);
    });

    it('should support search', async () => {
      const mockContacts = [createTestContact];

      (prisma.contact.findMany as jest.Mock).mockResolvedValue(mockContacts);
      (prisma.contact.count as jest.Mock).mockResolvedValue(1);

      const response = await request(app)
        .get('/api/contacts?search=John')
        .set('Authorization', `Bearer ${authToken}`);

      expectSuccessResponse(response);
      expect(prisma.contact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              expect.objectContaining({
                OR: expect.any(Array),
              }),
            ]),
          }),
        })
      );
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/contacts');

      expectAuthenticationError(response);
    });
  });

  describe('POST /api/contacts', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should create a new contact', async () => {
      const contactData = {
        name: 'New Contact',
        phone: '+1987654321',
        email: 'new@example.com',
        notes: 'New contact notes',
      };

      (prisma.contact.create as jest.Mock).mockResolvedValue({
        ...createTestContact,
        ...contactData,
      });

      const response = await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(contactData);

      expectSuccessResponse(response, 201);
      expect(response.body.data.contact.name).toBe(contactData.name);
      expect(response.body.data.contact.phone).toBe(contactData.phone);
    });

    it('should validate required fields', async () => {
      const invalidData = {
        email: 'test@example.com',
        // Missing name and phone
      };

      const response = await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expectValidationError(response, 'name');
    });

    it('should validate phone number format', async () => {
      const invalidData = {
        name: 'Test Contact',
        phone: 'invalid-phone',
        email: 'test@example.com',
      };

      const response = await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expectValidationError(response, 'phone');
    });

    it('should validate email format', async () => {
      const invalidData = {
        name: 'Test Contact',
        phone: '+1234567890',
        email: 'invalid-email',
      };

      const response = await request(app)
        .post('/api/contacts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expectValidationError(response, 'email');
    });

    it('should require authentication', async () => {
      const contactData = {
        name: 'Test Contact',
        phone: '+1234567890',
      };

      const response = await request(app)
        .post('/api/contacts')
        .send(contactData);

      expectAuthenticationError(response);
    });
  });

  describe('GET /api/contacts/:id', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should get contact by id', async () => {
      (prisma.contact.findUnique as jest.Mock).mockResolvedValue(createTestContact);

      const response = await request(app)
        .get(`/api/contacts/${createTestContact.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expectSuccessResponse(response);
      expect(response.body.data.contact.id).toBe(createTestContact.id);
    });

    it('should return 404 for non-existent contact', async () => {
      (prisma.contact.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/contacts/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('not found');
    });

    it('should only return contacts owned by user', async () => {
      const otherUserContact = {
        ...createTestContact,
        userId: 'other-user-id',
      };

      (prisma.contact.findUnique as jest.Mock).mockResolvedValue(otherUserContact);

      const response = await request(app)
        .get(`/api/contacts/${createTestContact.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/contacts/:id', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should update contact', async () => {
      const updateData = {
        name: 'Updated Name',
        phone: '+1111111111',
      };

      (prisma.contact.findUnique as jest.Mock).mockResolvedValue(createTestContact);
      (prisma.contact.update as jest.Mock).mockResolvedValue({
        ...createTestContact,
        ...updateData,
      });

      const response = await request(app)
        .put(`/api/contacts/${createTestContact.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expectSuccessResponse(response);
      expect(response.body.data.contact.name).toBe(updateData.name);
    });

    it('should return 404 for non-existent contact', async () => {
      (prisma.contact.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .put('/api/contacts/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/contacts/:id', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should delete contact', async () => {
      (prisma.contact.findUnique as jest.Mock).mockResolvedValue(createTestContact);
      (prisma.contact.delete as jest.Mock).mockResolvedValue(createTestContact);

      const response = await request(app)
        .delete(`/api/contacts/${createTestContact.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expectSuccessResponse(response);
      expect(response.body.message).toContain('deleted');
    });

    it('should return 404 for non-existent contact', async () => {
      (prisma.contact.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/contacts/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/contacts/bulk', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should create multiple contacts', async () => {
      const contactsData = [
        { name: 'Contact 1', phone: '+1111111111' },
        { name: 'Contact 2', phone: '+2222222222' },
      ];

      (prisma.contact.createMany as jest.Mock).mockResolvedValue({ count: 2 });

      const response = await request(app)
        .post('/api/contacts/bulk')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ contacts: contactsData });

      expectSuccessResponse(response, 201);
      expect(response.body.data.result.created).toBe(2);
    });

    it('should validate bulk contact data', async () => {
      const invalidData = [
        { name: 'Valid Contact', phone: '+1111111111' },
        { name: '', phone: 'invalid' }, // Invalid contact
      ];

      const response = await request(app)
        .post('/api/contacts/bulk')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ contacts: invalidData });

      expectValidationError(response, 'contacts');
    });
  });

  describe('GET /api/contacts/export', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should export contacts as CSV', async () => {
      const mockContacts = [createTestContact];

      (prisma.contact.findMany as jest.Mock).mockResolvedValue(mockContacts);

      const response = await request(app)
        .get('/api/contacts/export?format=csv')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.text).toContain('name,phone,email');
    });

    it('should export contacts as JSON', async () => {
      const mockContacts = [createTestContact];

      (prisma.contact.findMany as jest.Mock).mockResolvedValue(mockContacts);

      const response = await request(app)
        .get('/api/contacts/export?format=json')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/json');
      expect(response.body).toEqual(mockContacts);
    });
  });
});