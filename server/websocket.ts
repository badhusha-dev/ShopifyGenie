import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import jwt from 'jsonwebtoken';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  role?: string;
  shopDomain?: string;
}

export class WebSocketManager {
  private wss: WebSocketServer;
  private clients: Map<string, AuthenticatedWebSocket[]> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({
      server,
      path: '/ws',
      verifyClient: (info: any) => {
        // Basic origin validation
        return true; // In production, validate origin properly
      }
    });

    this.wss.on('connection', this.handleConnection.bind(this));
  }

  private async handleConnection(ws: AuthenticatedWebSocket, request: any) {
    console.log('WebSocket connection attempt');

    // Extract token from query params or headers
    const url = new URL(request.url, `http://${request.headers.host}`);
    const token = url.searchParams.get('token') || request.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      ws.close(1008, 'Authentication required');
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
      ws.userId = decoded.id;
      ws.role = decoded.role;
      ws.shopDomain = decoded.shopDomain;

      if (!ws.userId) {
        throw new Error('Invalid token: missing user ID');
      }

      // Add client to tracking
      const userClients = this.clients.get(ws.userId) || [];
      userClients.push(ws);
      this.clients.set(ws.userId, userClients);

      console.log(`WebSocket authenticated for user ${ws.userId} with role ${ws.role}`);

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connected',
        data: { message: 'WebSocket connected successfully' }
      }));

      // Handle incoming messages
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          console.error('Invalid WebSocket message:', error);
        }
      });

      // Handle disconnection
      ws.on('close', () => {
        this.removeClient(ws.userId!, ws);
        console.log(`WebSocket disconnected for user ${ws.userId}`);
      });

    } catch (error) {
      console.error('WebSocket authentication failed:', error);
      ws.close(1008, 'Authentication failed');
    }
  }

  private handleMessage(ws: AuthenticatedWebSocket, message: any) {
    switch (message.type) {
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong', data: { timestamp: Date.now() } }));
        break;
      case 'subscribe':
        // Handle subscription to specific channels
        this.handleSubscription(ws, message.data);
        break;
      default:
        console.log('Unknown WebSocket message type:', message.type);
    }
  }

  private handleSubscription(ws: AuthenticatedWebSocket, data: any) {
    // In a real implementation, you'd manage subscriptions to specific channels
    console.log(`User ${ws.userId} subscribed to:`, data);
  }

  private removeClient(userId: string | undefined, ws: AuthenticatedWebSocket) {
    if (!userId) return;
    const userClients = this.clients.get(userId) || [];
    const updatedClients = userClients.filter(client => client !== ws);
    
    if (updatedClients.length > 0) {
      this.clients.set(userId, updatedClients);
    } else {
      this.clients.delete(userId);
    }
  }

  // Public methods for sending notifications
  public sendToUser(userId: string, message: any) {
    const userClients = this.clients.get(userId) || [];
    userClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  public sendToRole(role: string, message: any, excludeUserId?: string) {
    this.clients.forEach((clients, userId) => {
      if (userId !== excludeUserId) {
        clients.forEach(client => {
          if (client.role === role && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
          }
        });
      }
    });
  }

  public sendToAll(message: any, excludeUserId?: string) {
    this.clients.forEach((clients, userId) => {
      if (userId !== excludeUserId) {
        clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
          }
        });
      }
    });
  }

  public broadcastStockAlert(product: any) {
    const message = {
      type: 'stock_alert',
      data: {
        productId: product.id,
        productName: product.name,
        currentStock: product.stock,
        message: `Low stock alert: ${product.name} has only ${product.stock} units left`
      }
    };

    // Send to admin and staff only
    this.sendToRole('admin', message);
    this.sendToRole('staff', message);
    this.sendToRole('superadmin', message);
  }

  public broadcastOrderUpdate(order: any) {
    const message = {
      type: 'new_order',
      data: {
        orderId: order.id,
        customerName: order.customerName || 'Unknown',
        total: order.total,
        message: `New order received: $${order.total}`
      }
    };

    // Send to admin and staff
    this.sendToRole('admin', message);
    this.sendToRole('staff', message);
    this.sendToRole('superadmin', message);
  }

  public broadcastVendorUpdate(vendor: any) {
    const message = {
      type: 'vendor_update',
      data: {
        vendorId: vendor.id,
        vendorName: vendor.name,
        message: `Vendor update: ${vendor.name}`
      }
    };

    this.sendToRole('admin', message);
    this.sendToRole('superadmin', message);
  }

  public broadcastNotification(notification: any) {
    const message = {
      type: 'notification',
      data: {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        timestamp: notification.timestamp,
        actionUrl: notification.actionUrl
      }
    };

    // Send to specific user if userId is provided
    if (notification.userId) {
      this.sendToUser(notification.userId, message);
    } else {
      // Send to all users
      this.sendToAll(message);
    }
  }

  public broadcastSystemAlert(alert: any) {
    const message = {
      type: 'system_alert',
      data: {
        id: alert.id,
        title: alert.title,
        message: alert.message,
        severity: alert.severity,
        timestamp: new Date().toISOString()
      }
    };

    // Send to admin and superadmin only
    this.sendToRole('admin', message);
    this.sendToRole('superadmin', message);
  }

  public broadcastDataUpdate(entity: string, action: string, data: any) {
    const message = {
      type: 'data_update',
      data: {
        entity,
        action,
        id: data.id,
        timestamp: new Date().toISOString(),
        changes: data.changes
      }
    };

    // Send to all users
    this.sendToAll(message);
  }
}

// Singleton instance
let wsManager: WebSocketManager | null = null;

export function initializeWebSocket(server: Server): WebSocketManager {
  if (!wsManager) {
    wsManager = new WebSocketManager(server);
  }
  return wsManager;
}

export function getWebSocketManager(): WebSocketManager | null {
  return wsManager;
}