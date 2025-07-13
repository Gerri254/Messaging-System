import request from 'supertest';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import app from '../../src/app';
import {
  createTestUser,
  generateTestToken,
  expectValidationError,
  expectSuccessResponse,
} from '../utils/testHelpers';

const prisma = new PrismaClient();

describe('Authentication Endpoints', () => {
  describe('POST /api/auth/register', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
      };

      // Mock Prisma responses
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue({
        ...createTestUser,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expectSuccessResponse(response, 201);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.passwordHash).toBeUndefined();
    });

    it('should return validation error for invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expectValidationError(response, 'email');
    });

    it('should return validation error for short password', async () => {
      const userData = {
        email: 'test@example.com',
        password: '123',
        firstName: 'Test',
        lastName: 'User',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expectValidationError(response, 'password');
    });

    it('should return error if email already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      // Mock existing user
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(createTestUser);

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should login user successfully', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      // Mock user with hashed password
      const userWithPassword = {
        ...createTestUser,
        passwordHash: bcrypt.hashSync('password123', 10),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(userWithPassword);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expectSuccessResponse(response);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.passwordHash).toBeUndefined();
    });

    it('should return error for invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Invalid credentials');
    });

    it('should return error for invalid password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const userWithPassword = {
        ...createTestUser,
        passwordHash: bcrypt.hashSync('password123', 10),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(userWithPassword);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Invalid credentials');
    });

    it('should return error for unverified user', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const unverifiedUser = {
        ...createTestUser,
        isVerified: false,
        passwordHash: bcrypt.hashSync('password123', 10),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(unverifiedUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('email not verified');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user', async () => {
      const token = generateTestToken();

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(createTestUser);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expectSuccessResponse(response);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.id).toBe(createTestUser.id);
      expect(response.body.data.user.passwordHash).toBeUndefined();
    });

    it('should return error without token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('authentication');
    });

    it('should return error with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Invalid token');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout user successfully', async () => {
      const token = generateTestToken();

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expectSuccessResponse(response);
      expect(response.body.message).toContain('logged out');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should send password reset email', async () => {
      const resetData = {
        email: 'test@example.com',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(createTestUser);

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send(resetData);

      expectSuccessResponse(response);
      expect(response.body.message).toContain('reset');
    });

    it('should return success even for non-existent email (security)', async () => {
      const resetData = {
        email: 'nonexistent@example.com',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send(resetData);

      expectSuccessResponse(response);
      expect(response.body.message).toContain('reset');
    });
  });

  describe('POST /api/auth/verify-email', () => {
    it('should verify email successfully', async () => {
      const verifyData = {
        token: 'valid-verification-token',
      };

      (prisma.user.findFirst as jest.Mock).mockResolvedValue({
        ...createTestUser,
        isVerified: false,
      });
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...createTestUser,
        isVerified: true,
      });

      const response = await request(app)
        .post('/api/auth/verify-email')
        .send(verifyData);

      expectSuccessResponse(response);
      expect(response.body.message).toContain('verified');
    });

    it('should return error for invalid token', async () => {
      const verifyData = {
        token: 'invalid-token',
      };

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/verify-email')
        .send(verifyData);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid');
    });
  });
});