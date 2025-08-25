import { randomUUID } from 'crypto';
import type { 
  InsertNotification, 
  Notification,
  InsertAuditLog,
  AuditLog 
} from '@shared/schema';
import { getWebSocketManager } from './websocket';

export interface NotificationService {
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string, limit?: number): Promise<Notification[]>;
  markAsRead(notificationId: string): Promise<boolean>;
  markAllAsRead(userId: string): Promise<boolean>;
  deleteNotification(notificationId: string): Promise<boolean>;
  sendRealTimeNotification(userId: string, notification: Notification): void;
  broadcastToRole(role: string, notification: Notification): void;
}

export class MemNotificationService implements NotificationService {
  private notifications: Map<string, Notification> = new Map();

  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const notification: Notification = {
      id: randomUUID(),
      ...notificationData,
      isRead: false,
      priority: notificationData.priority || 'normal',
      createdAt: new Date()
    };

    this.notifications.set(notification.id, notification);

    // Send real-time notification if user is connected
    if (notification.userId) {
      this.sendRealTimeNotification(notification.userId, notification);
    }

    return notification;
  }

  async getUserNotifications(userId: string, limit: number = 50): Promise<Notification[]> {
    const userNotifications = Array.from(this.notifications.values())
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);

    return userNotifications;
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.isRead = true;
      this.notifications.set(notificationId, notification);
      return true;
    }
    return false;
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    let updated = false;
    this.notifications.forEach(notification => {
      if (notification.userId === userId && !notification.isRead) {
        notification.isRead = true;
        this.notifications.set(notification.id, notification);
        updated = true;
      }
    });
    return updated;
  }

  async deleteNotification(notificationId: string): Promise<boolean> {
    return this.notifications.delete(notificationId);
  }

  sendRealTimeNotification(userId: string, notification: Notification): void {
    const wsManager = getWebSocketManager();
    if (wsManager) {
      wsManager.sendToUser(userId, {
        type: 'notification',
        data: notification
      });
    }
  }

  broadcastToRole(role: string, notification: Notification): void {
    const wsManager = getWebSocketManager();
    if (wsManager) {
      wsManager.sendToRole(role, {
        type: 'notification',
        data: notification
      });
    }
  }
}

// Notification templates and helpers
export class NotificationTemplates {
  static lowStock(productId: string, productName: string, currentStock: number): InsertNotification {
    return {
      userId: null, // Will be set when sending to specific users
      type: 'low_stock',
      title: 'Low Stock Alert',
      message: `${productName} is running low with only ${currentStock} units remaining.`,
      data: JSON.stringify({
        productId,
        productName,
        currentStock,
        threshold: 10
      }),
      priority: 'high'
    };
  }

  static newOrder(customerId: string, customerName: string, orderTotal: string): InsertNotification {
    return {
      userId: null,
      type: 'new_order',
      title: 'New Order Received',
      message: `New order from ${customerName} for $${orderTotal}`,
      data: JSON.stringify({
        customerId,
        customerName,
        orderTotal
      }),
      priority: 'normal'
    };
  }

  static loyaltyMilestone(customerId: string, customerName: string, points: number): InsertNotification {
    return {
      userId: customerId,
      type: 'loyalty_milestone',
      title: 'Loyalty Milestone Reached!',
      message: `Congratulations! You've reached ${points} loyalty points.`,
      data: JSON.stringify({
        points,
        milestone: points
      }),
      priority: 'normal'
    };
  }

  static systemAlert(title: string, message: string, severity: 'low' | 'normal' | 'high' | 'urgent' = 'normal'): InsertNotification {
    return {
      userId: null,
      type: 'system_alert',
      title,
      message,
      data: JSON.stringify({
        severity,
        timestamp: new Date().toISOString()
      }),
      priority: severity
    };
  }

  static vendorPaymentDue(vendorId: string, vendorName: string, amount: string, dueDate: string): InsertNotification {
    return {
      userId: null,
      type: 'vendor_payment',
      title: 'Vendor Payment Due',
      message: `Payment of $${amount} is due to ${vendorName} by ${dueDate}`,
      data: JSON.stringify({
        vendorId,
        vendorName,
        amount,
        dueDate
      }),
      priority: 'high'
    };
  }
}

// Audit logging service
export interface AuditService {
  logAction(log: InsertAuditLog): Promise<AuditLog>;
  getUserActions(userId: string, limit?: number): Promise<AuditLog[]>;
  getResourceActions(resource: string, resourceId?: string, limit?: number): Promise<AuditLog[]>;
  getRecentActions(limit?: number): Promise<AuditLog[]>;
}

export class MemAuditService implements AuditService {
  private auditLogs: Map<string, AuditLog> = new Map();

  async logAction(logData: InsertAuditLog): Promise<AuditLog> {
    const log: AuditLog = {
      id: randomUUID(),
      ...logData,
      createdAt: new Date()
    };

    this.auditLogs.set(log.id, log);
    console.log(`Audit: ${log.action} on ${log.resource} by user ${log.userId}`);

    return log;
  }

  async getUserActions(userId: string, limit: number = 50): Promise<AuditLog[]> {
    return Array.from(this.auditLogs.values())
      .filter(log => log.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async getResourceActions(resource: string, resourceId?: string, limit: number = 50): Promise<AuditLog[]> {
    return Array.from(this.auditLogs.values())
      .filter(log => {
        if (resourceId) {
          return log.resource === resource && log.resourceId === resourceId;
        }
        return log.resource === resource;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async getRecentActions(limit: number = 100): Promise<AuditLog[]> {
    return Array.from(this.auditLogs.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
}

// Singleton instances
export const notificationService = new MemNotificationService();
export const auditService = new MemAuditService();