import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../../src/app';
import {
  createTestUser,
  createTestContact,
  createTestMessage,
  generateTestToken,
  expectValidationError,
  expectSuccessResponse,
  expectAuthenticationError,
} from '../utils/testHelpers';

const prisma = new PrismaClient();

// Mock Twilio
const mockTwilioCreate = jest.fn();
jest.mock('twilio', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    messages: {
      create: mockTwilioCreate,
    },
  })),
}));

describe('Messages Endpoints', () => {
  const authToken = generateTestToken();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default Twilio mock response
    mockTwilioCreate.mockResolvedValue({
      sid: 'test-message-sid',
      status: 'sent',
      to: '+1234567890',
      from: '+0987654321',
      body: 'Test message',
    });
  });

  describe('GET /api/messages', () => {
    it('should get messages for authenticated user', async () => {
      const mockMessages = [createTestMessage];

      (prisma.message.findMany as jest.Mock).mockResolvedValue(mockMessages);

      const response = await request(app)
        .get('/api/messages')
        .set('Authorization', `Bearer ${authToken}`);

      expectSuccessResponse(response);
      expect(response.body.data.messages).toHaveLength(1);
      expect(response.body.data.messages[0].id).toBe(createTestMessage.id);
    });

    it('should support filtering by status', async () => {
      const mockMessages = [createTestMessage];

      (prisma.message.findMany as jest.Mock).mockResolvedValue(mockMessages);

      const response = await request(app)
        .get('/api/messages?status=SENT')
        .set('Authorization', `Bearer ${authToken}`);

      expectSuccessResponse(response);
      expect(prisma.message.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'SENT',
          }),
        })
      );
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/messages');

      expectAuthenticationError(response);
    });
  });

  describe('POST /api/messages/send', () => {
    it('should send SMS message successfully', async () => {
      const messageData = {
        content: 'Test message content',
        recipients: [
          { phone: '+1234567890', name: 'John Doe' }
        ],
      };

      // Mock Prisma operations
      (prisma.message.create as jest.Mock).mockResolvedValue(createTestMessage);
      (prisma.messageRecipient.create as jest.Mock).mockResolvedValue({
        id: 'recipient-id',
        messageId: createTestMessage.id,
        phone: '+1234567890',
        status: 'SENT',
      });

      const response = await request(app)
        .post('/api/messages/send')
        .set('Authorization', `Bearer ${authToken}`)
        .send(messageData);

      expectSuccessResponse(response, 201);
      expect(response.body.data.message).toBeDefined();
      expect(mockTwilioCreate).toHaveBeenCalledWith({
        body: messageData.content,
        to: '+1234567890',
        from: expect.any(String),
      });
    });

    it('should handle multiple recipients', async () => {
      const messageData = {
        content: 'Test bulk message',
        recipients: [
          { phone: '+1111111111', name: 'Person 1' },
          { phone: '+2222222222', name: 'Person 2' },
        ],
      };

      (prisma.message.create as jest.Mock).mockResolvedValue({
        ...createTestMessage,
        totalRecipients: 2,
      });
      (prisma.messageRecipient.create as jest.Mock).mockResolvedValue({
        id: 'recipient-id',
        status: 'SENT',
      });

      const response = await request(app)
        .post('/api/messages/send')
        .set('Authorization', `Bearer ${authToken}`)
        .send(messageData);

      expectSuccessResponse(response, 201);
      expect(mockTwilioCreate).toHaveBeenCalledTimes(2);
    });

    it('should validate message content', async () => {
      const messageData = {
        content: '', // Empty content
        recipients: [{ phone: '+1234567890' }],
      };

      const response = await request(app)
        .post('/api/messages/send')
        .set('Authorization', `Bearer ${authToken}`)
        .send(messageData);

      expectValidationError(response, 'content');
    });

    it('should validate recipients', async () => {
      const messageData = {
        content: 'Test message',
        recipients: [], // Empty recipients
      };

      const response = await request(app)
        .post('/api/messages/send')
        .set('Authorization', `Bearer ${authToken}`)
        .send(messageData);

      expectValidationError(response, 'recipients');
    });

    it('should validate phone numbers', async () => {
      const messageData = {
        content: 'Test message',
        recipients: [{ phone: 'invalid-phone' }],
      };

      const response = await request(app)
        .post('/api/messages/send')
        .set('Authorization', `Bearer ${authToken}`)
        .send(messageData);

      expectValidationError(response, 'recipients');
    });

    it('should handle Twilio errors gracefully', async () => {
      const messageData = {
        content: 'Test message',
        recipients: [{ phone: '+1234567890' }],
      };

      // Mock Twilio error
      mockTwilioCreate.mockRejectedValue(new Error('Twilio API error'));

      (prisma.message.create as jest.Mock).mockResolvedValue(createTestMessage);
      (prisma.messageRecipient.create as jest.Mock).mockResolvedValue({
        id: 'recipient-id',
        status: 'FAILED',
        errorMessage: 'Twilio API error',
      });

      const response = await request(app)
        .post('/api/messages/send')
        .set('Authorization', `Bearer ${authToken}`)
        .send(messageData);

      expectSuccessResponse(response, 201);
      expect(response.body.data.message.failedCount).toBe(1);
    });

    it('should schedule messages for future delivery', async () => {
      const messageData = {
        content: 'Scheduled message',
        recipients: [{ phone: '+1234567890' }],
        scheduledAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      };

      (prisma.message.create as jest.Mock).mockResolvedValue({
        ...createTestMessage,
        status: 'SCHEDULED',
        scheduledAt: new Date(messageData.scheduledAt),
      });

      const response = await request(app)
        .post('/api/messages/send')
        .set('Authorization', `Bearer ${authToken}`)
        .send(messageData);

      expectSuccessResponse(response, 201);
      expect(response.body.data.message.status).toBe('SCHEDULED');
      expect(mockTwilioCreate).not.toHaveBeenCalled(); // Should not send immediately
    });
  });

  describe('POST /api/messages/bulk-send', () => {
    it('should send bulk messages to contacts', async () => {
      const bulkData = {
        content: 'Bulk message content',
        contactIds: ['contact-1', 'contact-2'],
      };

      const mockContacts = [
        { ...createTestContact, id: 'contact-1', phone: '+1111111111' },
        { ...createTestContact, id: 'contact-2', phone: '+2222222222' },
      ];

      (prisma.contact.findMany as jest.Mock).mockResolvedValue(mockContacts);
      (prisma.message.create as jest.Mock).mockResolvedValue({
        ...createTestMessage,
        totalRecipients: 2,
      });
      (prisma.messageRecipient.createMany as jest.Mock).mockResolvedValue({ count: 2 });

      const response = await request(app)
        .post('/api/messages/bulk-send')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bulkData);

      expectSuccessResponse(response, 201);
      expect(response.body.data.message.totalRecipients).toBe(2);
      expect(mockTwilioCreate).toHaveBeenCalledTimes(2);
    });

    it('should send bulk messages to contact groups', async () => {
      const bulkData = {
        content: 'Group message',
        groupIds: ['group-1'],
      };

      const mockContacts = [
        { ...createTestContact, id: 'contact-1', phone: '+1111111111' },
      ];

      (prisma.contactGroup.findMany as jest.Mock).mockResolvedValue([
        { id: 'group-1', contacts: mockContacts },
      ]);
      (prisma.message.create as jest.Mock).mockResolvedValue(createTestMessage);

      const response = await request(app)
        .post('/api/messages/bulk-send')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bulkData);

      expectSuccessResponse(response, 201);
      expect(mockTwilioCreate).toHaveBeenCalled();
    });

    it('should validate bulk send data', async () => {
      const invalidData = {
        content: 'Test message',
        // Missing contactIds or groupIds
      };

      const response = await request(app)
        .post('/api/messages/bulk-send')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expectValidationError(response, 'contactIds');
    });
  });

  describe('GET /api/messages/:id', () => {
    it('should get message by id', async () => {
      (prisma.message.findUnique as jest.Mock).mockResolvedValue({
        ...createTestMessage,
        recipients: [],
      });

      const response = await request(app)
        .get(`/api/messages/${createTestMessage.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expectSuccessResponse(response);
      expect(response.body.data.message.id).toBe(createTestMessage.id);
    });

    it('should return 404 for non-existent message', async () => {
      (prisma.message.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/messages/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/messages/:id', () => {
    it('should cancel scheduled message', async () => {
      const scheduledMessage = {
        ...createTestMessage,
        status: 'SCHEDULED',
      };

      (prisma.message.findUnique as jest.Mock).mockResolvedValue(scheduledMessage);
      (prisma.message.update as jest.Mock).mockResolvedValue({
        ...scheduledMessage,
        status: 'CANCELLED',
      });

      const response = await request(app)
        .delete(`/api/messages/${scheduledMessage.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expectSuccessResponse(response);
      expect(response.body.message).toContain('cancelled');
    });

    it('should not cancel already sent messages', async () => {
      const sentMessage = {
        ...createTestMessage,
        status: 'SENT',
      };

      (prisma.message.findUnique as jest.Mock).mockResolvedValue(sentMessage);

      const response = await request(app)
        .delete(`/api/messages/${sentMessage.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('cannot be cancelled');
    });
  });

  describe('POST /api/messages/validate-phone', () => {
    it('should validate phone number', async () => {
      const phoneData = {
        phone: '+1234567890',
      };

      const response = await request(app)
        .post('/api/messages/validate-phone')
        .set('Authorization', `Bearer ${authToken}`)
        .send(phoneData);

      expectSuccessResponse(response);
      expect(response.body.data.valid).toBe(true);
      expect(response.body.data.formatted).toBe('+1234567890');
    });

    it('should reject invalid phone numbers', async () => {
      const phoneData = {
        phone: 'invalid-phone',
      };

      const response = await request(app)
        .post('/api/messages/validate-phone')
        .set('Authorization', `Bearer ${authToken}`)
        .send(phoneData);

      expectSuccessResponse(response);
      expect(response.body.data.valid).toBe(false);
      expect(response.body.data.error).toBeDefined();
    });
  });

  describe('GET /api/messages/sms/usage-stats', () => {
    it('should return SMS usage statistics', async () => {
      // Mock Redis calls for rate limiting stats
      const mockRedisGet = jest.fn().mockResolvedValue('5');
      
      const response = await request(app)
        .get('/api/messages/sms/usage-stats')
        .set('Authorization', `Bearer ${authToken}`);

      expectSuccessResponse(response);
      expect(response.body.data.messagesThisHour).toBeDefined();
      expect(response.body.data.remainingMessages).toBeDefined();
      expect(response.body.data.resetTime).toBeDefined();
    });
  });
});