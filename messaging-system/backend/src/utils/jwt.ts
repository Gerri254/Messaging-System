import jwt from 'jsonwebtoken';
import config from '../config';

export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export const generateToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
  const secret = config.jwt.secret;
  
  return jwt.sign(payload, secret, { expiresIn: config.jwt.expiresIn } as any);
};

export const verifyToken = (token: string): JwtPayload => {
  try {
    const secret = config.jwt.secret;
    return jwt.verify(token, secret) as JwtPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const generatePasswordResetToken = (): string => {
  const secret = config.jwt.secret;
  
  return jwt.sign({}, secret, { expiresIn: '1h' } as any);
};

export const verifyPasswordResetToken = (token: string): boolean => {
  try {
    const secret = config.jwt.secret;
    jwt.verify(token, secret);
    return true;
  } catch {
    return false;
  }
};