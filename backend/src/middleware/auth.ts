import { Request, Response, NextFunction } from 'express';
import jwt, { Secret, SignOptions, JwtPayload } from 'jsonwebtoken';
import { AppError } from './errorHandler';
import config from '@/config/environment';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        email: string;
        userId: string;
      };
    }
  }
}

// JWT payload interface
interface JWTPayload {
  email: string;
  userId: string;
  iat: number;
  exp: number;
}

// Generate JWT token
export const generateToken = (email: string, userId: string): string => {
  const payload: JwtPayload = { email, userId } as unknown as JwtPayload;
  const secret: Secret = config.jwtSecret as Secret;
  const options: SignOptions = { expiresIn: config.jwtExpiresIn } as SignOptions;
  return jwt.sign(payload, secret, options);
};

// Verify JWT token
export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, config.jwtSecret as Secret) as JWTPayload;
  } catch (error) {
    throw new AppError('Invalid or expired token', 401);
  }
};

// Authentication middleware
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Access token required', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = verifyToken(token);
    
    req.user = {
      email: decoded.email,
      userId: decoded.userId
    };
    
    next();
  } catch (error) {
    next(error);
  }
};

// Optional authentication middleware (doesn't throw error if no token)
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      
      req.user = {
        email: decoded.email,
        userId: decoded.userId
      };
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Admin authentication middleware
export const authenticateAdmin = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Admin access token required', 401);
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    // Check if user is admin (you can implement your own admin logic)
    // For now, we'll check if the email contains 'admin' or is in a specific list
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    
    if (!adminEmails.includes(decoded.email) && !decoded.email.includes('admin')) {
      throw new AppError('Admin access required', 403);
    }
    
    req.user = {
      email: decoded.email,
      userId: decoded.userId
    };
    
    next();
  } catch (error) {
    next(error);
  }
};
