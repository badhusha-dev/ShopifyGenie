
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Request, Response, NextFunction } from 'express';
import { User } from '@shared/schema';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SALT_ROUNDS = 10;

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'superadmin' | 'admin' | 'staff' | 'customer';
  permissions?: string; // JSON string of permissions
  shopDomain?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user?: User;
}

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  static async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static generateToken(user: Omit<User, 'password'>): string {
    return jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        shopDomain: user.shopDomain 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}

// Middleware for authentication
export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = AuthService.verifyToken(token);
    const { storage } = await import('./storage');
    const user = await storage.getUserById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Middleware for role-based access
export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Access denied. Required roles: ${roles.join(', ')}` });
    }

    next();
  };
};

// Admin only middleware
export const requireAdmin = requireRole(['admin']);

// Staff or Admin middleware
export const requireStaffOrAdmin = requireRole(['admin', 'staff']);

// Super Admin only middleware
export const requireSuperAdmin = requireRole(['superadmin']);

// Customer access middleware
export const requireCustomer = requireRole(['admin', 'staff', 'customer']);

// Permission-based middleware
export const requirePermission = (permission: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Super Admin has all permissions
    if (req.user.role === 'superadmin') {
      return next();
    }

    const { storage } = await import('./storage');
    const hasPermission = await storage.checkUserPermission(req.user.role, permission);
    
    if (!hasPermission) {
      return res.status(403).json({ 
        error: `Access denied. Required permission: ${permission}` 
      });
    }

    next();
  };
};


// Combined role and permission check
export const requireRoleAndPermission = (roles: string[], permission: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access denied. Required roles: ${roles.join(', ')}` 
      });
    }

    // Super Admin bypasses permission checks
    if (req.user.role === 'superadmin') {
      return next();
    }

    const { storage } = await import('./storage');
    const hasPermission = await storage.checkUserPermission(req.user.role, permission);
    
    if (!hasPermission) {
      return res.status(403).json({ 
        error: `Access denied. Required permission: ${permission}` 
      });
    }

    next();
  };
};
