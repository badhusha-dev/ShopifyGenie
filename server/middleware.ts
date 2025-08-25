import { Request, Response, NextFunction } from 'express';
import { auditService } from './notifications';
import type { InsertAuditLog } from '@shared/schema';

// Extended Request interface for audit logging
export interface AuditRequest extends Request {
  user?: any;
  auditData?: {
    resource?: string;
    resourceId?: string;
    action?: string;
    oldValues?: any;
    newValues?: any;
  };
}

// Audit logging middleware
export function auditMiddleware(resource: string, action?: string) {
  return async (req: AuditRequest, res: Response, next: NextFunction) => {
    // Skip audit for read operations unless specifically requested
    if (req.method === 'GET' && !action) {
      return next();
    }

    const originalSend = res.json;
    
    res.json = function(body: any) {
      // Log the action after the response is sent
      setImmediate(async () => {
        try {
          if (req.user && res.statusCode < 400) {
            const auditLog: InsertAuditLog = {
              userId: req.user.id,
              action: action || getActionFromMethod(req.method),
              resource,
              resourceId: req.auditData?.resourceId || req.params.id || null,
              oldValues: req.auditData?.oldValues ? JSON.stringify(req.auditData.oldValues) : null,
              newValues: req.auditData?.newValues ? JSON.stringify(req.auditData.newValues) : JSON.stringify(req.body),
              ipAddress: req.ip || req.connection.remoteAddress || null,
              userAgent: req.get('User-Agent') || null,
              metadata: JSON.stringify({
                method: req.method,
                url: req.originalUrl,
                statusCode: res.statusCode,
                timestamp: new Date().toISOString()
              })
            };

            await auditService.logAction(auditLog);
          }
        } catch (error) {
          console.error('Audit logging failed:', error);
        }
      });

      return originalSend.call(this, body);
    };

    next();
  };
}

// Permission-based authorization middleware
export function requirePermission(permission: string) {
  return async (req: AuditRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Super admin has all permissions
    if (req.user.role === 'superadmin') {
      return next();
    }

    // Check if user has the required permission
    // This would integrate with your storage/permission system
    try {
      const hasPermission = await checkUserPermission(req.user.id, req.user.role, permission);
      if (!hasPermission) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      next();
    } catch (error) {
      console.error('Permission check failed:', error);
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
}

// Role-based authorization middleware
export function requireRole(...allowedRoles: string[]) {
  return (req: AuditRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Access denied',
        required: allowedRoles,
        current: req.user.role
      });
    }

    next();
  };
}

// Rate limiting middleware
export function rateLimiter(maxRequests: number = 100, windowMs: number = 60000) {
  const clients = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    // Skip rate limiting in development mode for better development experience
    if (process.env.NODE_ENV === 'development') {
      return next();
    }

    const clientId = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    const client = clients.get(clientId);
    
    if (!client || now > client.resetTime) {
      clients.set(clientId, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }
    
    if (client.count >= maxRequests) {
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.ceil((client.resetTime - now) / 1000)
      });
    }
    
    client.count++;
    clients.set(clientId, client);
    next();
  };
}

// Input validation middleware
export function validateJsonBody(req: Request, res: Response, next: NextFunction) {
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.is('application/json')) {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'Request body is required' });
    }
  }
  next();
}

// CORS middleware for WebSocket and API
export function corsMiddleware(req: Request, res: Response, next: NextFunction) {
  res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
}

// Helper functions
function getActionFromMethod(method: string): string {
  switch (method) {
    case 'POST': return 'create';
    case 'PUT':
    case 'PATCH': return 'update';
    case 'DELETE': return 'delete';
    case 'GET': return 'view';
    default: return 'unknown';
  }
}

async function checkUserPermission(userId: string, role: string, permission: string): Promise<boolean> {
  // This would integrate with your existing permission system
  // For now, return basic role-based permissions
  const rolePermissions: Record<string, string[]> = {
    superadmin: ['*'], // All permissions
    admin: [
      'dashboard:view', 'inventory:*', 'customers:*', 'orders:*', 
      'reports:*', 'users:view', 'vendors:*', 'subscriptions:*',
      'system:view', 'integrations:*'
    ],
    staff: [
      'dashboard:view', 'inventory:view', 'inventory:edit', 
      'customers:view', 'customers:edit', 'orders:view', 'orders:edit',
      'reports:view', 'subscriptions:view', 'subscriptions:edit'
    ],
    customer: ['dashboard:view']
  };

  const permissions = rolePermissions[role] || [];
  return permissions.includes('*') || permissions.includes(permission) || 
         permissions.some(p => p.endsWith(':*') && permission.startsWith(p.replace(':*', ':')));
}

// System settings middleware
export function systemSettingsMiddleware(req: Request, res: Response, next: NextFunction) {
  // Add system settings to request context if needed
  // This could cache common settings to avoid database queries
  next();
}