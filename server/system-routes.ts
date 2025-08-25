import express from 'express';
import { auditMiddleware, requirePermission, requireRole } from './middleware';
import { notificationService, auditService, NotificationTemplates } from './notifications';
import { getWebSocketManager } from './websocket';

const router = express.Router();

// Audit Logs Routes
router.get('/audit-logs', requirePermission('system:view'), async (req, res) => {
  try {
    const { limit = 50, userId, resource, resourceId } = req.query;
    let logs;

    if (userId) {
      logs = await auditService.getUserActions(userId as string, parseInt(limit as string));
    } else if (resource) {
      logs = await auditService.getResourceActions(
        resource as string, 
        resourceId as string, 
        parseInt(limit as string)
      );
    } else {
      logs = await auditService.getRecentActions(parseInt(limit as string));
    }

    res.json(logs);
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// Notifications Routes
router.get('/notifications', requirePermission('dashboard:view'), async (req, res) => {
  try {
    const userId = req.user?.id;
    const { limit = 20 } = req.query;

    const notifications = await notificationService.getUserNotifications(
      userId, 
      parseInt(limit as string)
    );

    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

router.patch('/notifications/:id/read', requirePermission('dashboard:view'), async (req, res) => {
  try {
    const { id } = req.params;
    const success = await notificationService.markAsRead(id);
    
    if (success) {
      res.json({ message: 'Notification marked as read' });
    } else {
      res.status(404).json({ error: 'Notification not found' });
    }
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

router.patch('/notifications/mark-all-read', requirePermission('dashboard:view'), async (req, res) => {
  try {
    const userId = req.user?.id;
    const success = await notificationService.markAllAsRead(userId);
    
    res.json({ message: 'All notifications marked as read', success });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

router.delete('/notifications/:id', requirePermission('dashboard:view'), async (req, res) => {
  try {
    const { id } = req.params;
    const success = await notificationService.deleteNotification(id);
    
    if (success) {
      res.json({ message: 'Notification deleted' });
    } else {
      res.status(404).json({ error: 'Notification not found' });
    }
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// System Settings Routes
router.get('/settings', requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    // Mock system settings - in real implementation, fetch from database
    const settings = [
      {
        id: '1',
        key: 'low_stock_threshold',
        value: '10',
        type: 'number',
        description: 'Threshold for low stock alerts',
        category: 'inventory',
        isEditable: true
      },
      {
        id: '2',
        key: 'notification_email_enabled',
        value: 'true',
        type: 'boolean',
        description: 'Enable email notifications',
        category: 'notifications',
        isEditable: true
      },
      {
        id: '3',
        key: 'app_name',
        value: 'ShopifyApp',
        type: 'string',
        description: 'Application name',
        category: 'general',
        isEditable: true
      },
      {
        id: '4',
        key: 'max_failed_login_attempts',
        value: '5',
        type: 'number',
        description: 'Maximum failed login attempts before lockout',
        category: 'security',
        isEditable: true
      }
    ];

    res.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch system settings' });
  }
});

router.put('/settings/:id', 
  requireRole('admin', 'superadmin'),
  auditMiddleware('system_settings', 'update'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { value } = req.body;

      // Mock update - in real implementation, update database
      req.auditData = {
        resourceId: id,
        newValues: { value }
      };

      res.json({ 
        id, 
        value,
        message: 'Setting updated successfully',
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Update setting error:', error);
      res.status(500).json({ error: 'Failed to update setting' });
    }
  }
);

// Permissions Management Routes
router.get('/permissions', requireRole('superadmin'), async (req, res) => {
  try {
    // Mock permissions data
    const permissions = [
      { name: 'dashboard:view', category: 'dashboard', operation: 'view', description: 'View dashboard' },
      { name: 'inventory:view', category: 'inventory', operation: 'view', description: 'View inventory' },
      { name: 'inventory:create', category: 'inventory', operation: 'create', description: 'Create inventory items' },
      { name: 'inventory:edit', category: 'inventory', operation: 'edit', description: 'Edit inventory items' },
      { name: 'inventory:delete', category: 'inventory', operation: 'delete', description: 'Delete inventory items' },
      { name: 'customers:view', category: 'customers', operation: 'view', description: 'View customers' },
      { name: 'customers:create', category: 'customers', operation: 'create', description: 'Create customers' },
      { name: 'customers:edit', category: 'customers', operation: 'edit', description: 'Edit customers' },
      { name: 'customers:delete', category: 'customers', operation: 'delete', description: 'Delete customers' },
      { name: 'orders:view', category: 'orders', operation: 'view', description: 'View orders' },
      { name: 'orders:create', category: 'orders', operation: 'create', description: 'Create orders' },
      { name: 'orders:edit', category: 'orders', operation: 'edit', description: 'Edit orders' },
      { name: 'orders:delete', category: 'orders', operation: 'delete', description: 'Delete orders' },
      { name: 'reports:view', category: 'reports', operation: 'view', description: 'View reports' },
      { name: 'reports:export', category: 'reports', operation: 'export', description: 'Export reports' },
      { name: 'users:view', category: 'users', operation: 'view', description: 'View users' },
      { name: 'users:create', category: 'users', operation: 'create', description: 'Create users' },
      { name: 'users:edit', category: 'users', operation: 'edit', description: 'Edit users' },
      { name: 'users:delete', category: 'users', operation: 'delete', description: 'Delete users' },
      { name: 'vendors:view', category: 'vendors', operation: 'view', description: 'View vendors' },
      { name: 'vendors:create', category: 'vendors', operation: 'create', description: 'Create vendors' },
      { name: 'vendors:edit', category: 'vendors', operation: 'edit', description: 'Edit vendors' },
      { name: 'vendors:delete', category: 'vendors', operation: 'delete', description: 'Delete vendors' },
      { name: 'subscriptions:view', category: 'subscriptions', operation: 'view', description: 'View subscriptions' },
      { name: 'subscriptions:create', category: 'subscriptions', operation: 'create', description: 'Create subscriptions' },
      { name: 'subscriptions:edit', category: 'subscriptions', operation: 'edit', description: 'Edit subscriptions' },
      { name: 'subscriptions:delete', category: 'subscriptions', operation: 'delete', description: 'Delete subscriptions' },
      { name: 'system:view', category: 'system', operation: 'view', description: 'View system settings' },
      { name: 'system:edit', category: 'system', operation: 'edit', description: 'Edit system settings' },
      { name: 'integrations:view', category: 'integrations', operation: 'view', description: 'View integrations' },
      { name: 'integrations:edit', category: 'integrations', operation: 'edit', description: 'Configure integrations' }
    ];

    res.json(permissions);
  } catch (error) {
    console.error('Get permissions error:', error);
    res.status(500).json({ error: 'Failed to fetch permissions' });
  }
});

router.get('/roles/:role/permissions', requireRole('superadmin'), async (req, res) => {
  try {
    const { role } = req.params;
    
    // Mock role permissions
    const rolePermissions: Record<string, Record<string, boolean>> = {
      admin: {
        'dashboard:view': true,
        'inventory:view': true,
        'inventory:create': true,
        'inventory:edit': true,
        'inventory:delete': true,
        'customers:view': true,
        'customers:create': true,
        'customers:edit': true,
        'customers:delete': true,
        'orders:view': true,
        'orders:create': true,
        'orders:edit': true,
        'orders:delete': true,
        'reports:view': true,
        'reports:export': true,
        'users:view': true,
        'vendors:view': true,
        'vendors:create': true,
        'vendors:edit': true,
        'vendors:delete': true,
        'subscriptions:view': true,
        'subscriptions:create': true,
        'subscriptions:edit': true,
        'subscriptions:delete': true,
        'system:view': true,
        'integrations:view': true,
        'integrations:edit': true
      },
      staff: {
        'dashboard:view': true,
        'inventory:view': true,
        'inventory:edit': true,
        'customers:view': true,
        'customers:edit': true,
        'orders:view': true,
        'orders:edit': true,
        'reports:view': true,
        'vendors:view': true,
        'subscriptions:view': true,
        'subscriptions:edit': true
      },
      customer: {
        'dashboard:view': true
      }
    };

    res.json(rolePermissions[role] || {});
  } catch (error) {
    console.error('Get role permissions error:', error);
    res.status(500).json({ error: 'Failed to fetch role permissions' });
  }
});

router.put('/roles/:role/permissions', 
  requireRole('superadmin'),
  auditMiddleware('role_permissions', 'update'),
  async (req, res) => {
    try {
      const { role } = req.params;
      const { permissions } = req.body;

      if (role === 'superadmin') {
        return res.status(400).json({ error: 'Cannot modify super admin permissions' });
      }

      // Mock update - in real implementation, update database
      req.auditData = {
        resourceId: role,
        newValues: permissions
      };

      res.json({ 
        message: `Permissions updated for role: ${role}`,
        role,
        permissions,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Update role permissions error:', error);
      res.status(500).json({ error: 'Failed to update role permissions' });
    }
  }
);

// WebSocket Test Routes (for testing real-time features)
router.post('/test-notification', requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const { type = 'test', title, message, userId } = req.body;

    const notification = await notificationService.createNotification({
      userId: userId || req.user?.id,
      type,
      title: title || 'Test Notification',
      message: message || 'This is a test notification from the system.',
      data: JSON.stringify({ test: true }),
      priority: 'normal'
    });

    res.json({ message: 'Test notification sent', notification });
  } catch (error) {
    console.error('Send test notification error:', error);
    res.status(500).json({ error: 'Failed to send test notification' });
  }
});

router.post('/broadcast-alert', requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const { title, message, role = 'all' } = req.body;
    
    const wsManager = getWebSocketManager();
    if (wsManager) {
      const alertMessage = {
        type: 'system_alert',
        data: {
          title: title || 'System Alert',
          message: message || 'This is a system-wide alert.',
          timestamp: new Date().toISOString()
        }
      };

      if (role === 'all') {
        wsManager.sendToAll(alertMessage, req.user?.id);
      } else {
        wsManager.sendToRole(role, alertMessage, req.user?.id);
      }
    }

    res.json({ message: 'Alert broadcast successfully' });
  } catch (error) {
    console.error('Broadcast alert error:', error);
    res.status(500).json({ error: 'Failed to broadcast alert' });
  }
});

export default router;