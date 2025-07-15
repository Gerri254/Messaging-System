import { User } from '@prisma/client';
import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken, generatePasswordResetToken } from '../utils/jwt';
import { emailService } from './emailService';
import redis from '../config/redis';

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password' | 'passwordResetToken' | 'passwordResetExpires'>;
  token: string;
}

class AuthService {
  async register(data: RegisterData): Promise<{ user: Omit<User, 'password' | 'passwordResetToken' | 'passwordResetExpires'>; message: string }> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await hashPassword(data.password);
    
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        isVerified: true,
        emailVerifiedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const verificationToken = generateToken({ userId: user.id, email: user.email });
    
    try {
      await emailService.sendVerificationEmail(user.email, verificationToken, user.firstName);
    } catch (error) {
      console.error('Failed to send verification email:', error);
    }

    return {
      user,
      message: 'User registered successfully. Please check your email for verification.',
    };
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await comparePassword(data.password, user.password);
    
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Skip email verification in development mode
    if (!user.isVerified && process.env.NODE_ENV === 'production') {
      throw new Error('Please verify your email address before logging in');
    }

    const token = generateToken({ userId: user.id, email: user.email });

    await prisma.userSession.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    const { password, passwordResetToken, passwordResetExpires, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    try {
      const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()) as { userId: string };
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        throw new Error('Invalid verification token');
      }

      if (user.isVerified) {
        return { message: 'Email already verified' };
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          isVerified: true,
          emailVerifiedAt: new Date(),
        },
      });

      return { message: 'Email verified successfully' };
    } catch (error) {
      throw new Error('Invalid or expired verification token');
    }
  }

  async resendVerification(email: string): Promise<{ message: string }> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.isVerified) {
      throw new Error('Email already verified');
    }

    const verificationToken = generateToken({ userId: user.id, email: user.email });
    
    await emailService.sendVerificationEmail(user.email, verificationToken, user.firstName);

    return { message: 'Verification email sent successfully' };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return { message: 'If an account with that email exists, a password reset link has been sent.' };
    }

    const resetToken = generatePasswordResetToken();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      },
    });

    try {
      await emailService.sendPasswordResetEmail(user.email, resetToken, user.firstName);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
    }

    return { message: 'If an account with that email exists, a password reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    await prisma.userSession.deleteMany({
      where: { userId: user.id },
    });

    return { message: 'Password reset successfully' };
  }

  async logout(token: string): Promise<{ message: string }> {
    await prisma.userSession.delete({
      where: { token },
    }).catch(() => {});

    return { message: 'Logged out successfully' };
  }

  async updateProfile(userId: string, data: Partial<Pick<User, 'firstName' | 'lastName' | 'phone'>>): Promise<Omit<User, 'password' | 'passwordResetToken' | 'passwordResetExpires'>> {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        isVerified: true,
        emailVerifiedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }
}

export const authService = new AuthService();