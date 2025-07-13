import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../../src/config';

export const createTestUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  passwordHash: bcrypt.hashSync('password123', 10),
  isVerified: true,
  emailVerifiedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const createTestContact = {
  id: 'test-contact-id',
  userId: 'test-user-id',
  name: 'John Doe',
  phone: '+1234567890',
  email: 'john@example.com',
  notes: 'Test contact',
  tags: ['friend', 'important'],
  customFields: { company: 'Test Corp' },
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const createTestMessage = {
  id: 'test-message-id',
  userId: 'test-user-id',
  content: 'Test message content',
  messageType: 'SMS',
  status: 'SENT',
  totalRecipients: 1,
  successCount: 1,
  failedCount: 0,
  cost: 0.0075,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const createTestTemplate = {
  id: 'test-template-id',
  userId: 'test-user-id',
  name: 'Test Template',
  content: 'Hello {{name}}, this is a test message.',
  variables: ['{{name}}'],
  category: 'Testing',
  isActive: true,
  usageCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const generateTestToken = (userId: string = 'test-user-id'): string => {
  return jwt.sign(
    { 
      userId, 
      email: 'test@example.com',
      iat: Math.floor(Date.now() / 1000)
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

export const mockPrismaResponse = (data: any) => {
  return Promise.resolve(data);
};

export const mockPrismaError = (message: string) => {
  return Promise.reject(new Error(message));
};

export const createMockRequest = (overrides: any = {}) => {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    user: { id: 'test-user-id', email: 'test@example.com' },
    ...overrides,
  };
};

export const createMockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res;
};

export const createMockNext = () => {
  return jest.fn();
};

export const expectValidationError = (response: any, field: string) => {
  expect(response.status).toBe(400);
  expect(response.body.error).toContain('validation');
  expect(response.body.details).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        field,
        message: expect.any(String),
      }),
    ])
  );
};

export const expectAuthenticationError = (response: any) => {
  expect(response.status).toBe(401);
  expect(response.body.error).toContain('authentication');
};

export const expectAuthorizationError = (response: any) => {
  expect(response.status).toBe(403);
  expect(response.body.error).toContain('authorized');
};

export const expectSuccessResponse = (response: any, statusCode: number = 200) => {
  expect(response.status).toBe(statusCode);
  expect(response.body.message).toBeDefined();
  expect(response.body.data).toBeDefined();
};