import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { AuthRequest } from '../middleware/auth';
import { validatePasswordStrength } from '../utils/password';

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const { email, password, firstName, lastName, phone } = req.body;

      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          error: 'Password does not meet requirements',
          details: passwordValidation.errors,
        });
      }

      const result = await authService.register({
        email,
        password,
        firstName,
        lastName,
        phone,
      });

      return res.status(201).json({
        message: result.message,
        user: result.user,
      });
    } catch (error: any) {
      return res.status(400).json({
        error: error.message || 'Registration failed',
      });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const result = await authService.login({ email, password });

      return res.status(200).json({
        message: 'Login successful',
        user: result.user,
        token: result.token,
      });
    } catch (error: any) {
      return res.status(401).json({
        error: error.message || 'Login failed',
      });
    }
  },

  async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.query;

      if (!token || typeof token !== 'string') {
        return res.status(400).json({
          error: 'Verification token is required',
        });
      }

      const result = await authService.verifyEmail(token);

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({
        error: error.message || 'Email verification failed',
      });
    }
  },

  async resendVerification(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          error: 'Email is required',
        });
      }

      const result = await authService.resendVerification(email);

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({
        error: error.message || 'Failed to resend verification email',
      });
    }
  },

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      const result = await authService.forgotPassword(email);

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({
        error: error.message || 'Password reset request failed',
      });
    }
  },

  async resetPassword(req: Request, res: Response) {
    try {
      const { token, password } = req.body;

      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          error: 'Password does not meet requirements',
          details: passwordValidation.errors,
        });
      }

      const result = await authService.resetPassword(token, password);

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({
        error: error.message || 'Password reset failed',
      });
    }
  },

  async logout(req: AuthRequest, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.substring(7);

      if (token) {
        await authService.logout(token);
      }

      return res.status(200).json({
        message: 'Logged out successfully',
      });
    } catch (error: any) {
      return res.status(200).json({
        message: 'Logged out successfully',
      });
    }
  },

  async getProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
        });
      }

      const { password, passwordResetToken, passwordResetExpires, ...userWithoutSensitiveData } = req.user;
      
      return res.status(200).json({
        user: userWithoutSensitiveData,
      });
    } catch (error: any) {
      return res.status(500).json({
        error: error.message || 'Failed to get profile',
      });
    }
  },

  async updateProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
        });
      }

      const { firstName, lastName, phone } = req.body;

      const updatedUser = await authService.updateProfile(req.user.id, {
        firstName,
        lastName,
        phone,
      });

      return res.status(200).json({
        message: 'Profile updated successfully',
        user: updatedUser,
      });
    } catch (error: any) {
      return res.status(400).json({
        error: error.message || 'Profile update failed',
      });
    }
  },
};