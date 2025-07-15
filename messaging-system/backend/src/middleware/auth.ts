import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { User } from '@prisma/client';
import prisma from '../config/database';

export interface AuthRequest extends Request {
  user?: User;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Access denied. No token provided.',
      });
    }
    
    const token = authHeader.substring(7);
    
    if (!token) {
      return res.status(401).json({
        error: 'Access denied. No token provided.',
      });
    }
    
    const decoded = verifyToken(token) as JwtPayload;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    
    if (!user) {
      return res.status(401).json({
        error: 'Invalid token. User not found.',
      });
    }
    
    // Skip email verification in development mode
    if (!user.isVerified && process.env.NODE_ENV === 'production') {
      return res.status(401).json({
        error: 'Please verify your email address to continue.',
      });
    }
    
    req.user = user;
    return next();
  } catch (error: any) {
    return res.status(401).json({
      error: error.message || 'Invalid token.',
    });
  }
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    
    const token = authHeader.substring(7);
    
    if (!token) {
      return next();
    }
    
    const decoded = verifyToken(token) as JwtPayload;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    
    if (user && user.isVerified) {
      req.user = user;
    }
    
    return next();
  } catch (error) {
    return next();
  }
};