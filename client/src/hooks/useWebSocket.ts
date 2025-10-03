import { useEffect, useRef, useState } from 'react';
import { useAppSelector } from '../store/hooks';

interface WebSocketMessage {
  type: string;
  data: any;
}

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onNotification?: (notification: any) => void;
  onDataUpdate?: (update: any) => void;
  onSystemAlert?: (alert: any) => void;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const { token } = useAppSelector((state) => state.auth);
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 0; // Disable reconnection loops

  const connect = () => {
    if (!token) return;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws?token=${token}`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          // Handle different message types
          switch (message.type) {
            case 'connected':
              console.log('WebSocket connection confirmed');
              break;
            case 'notification':
              options.onNotification?.(message.data);
              break;
            case 'data_update':
              options.onDataUpdate?.(message.data);
              break;
            case 'system_alert':
              options.onSystemAlert?.(message.data);
              break;
            case 'stock_alert':
              options.onNotification?.({
                id: `stock-${message.data.productId}`,
                title: 'Low Stock Alert',
                message: message.data.message,
                type: 'warning',
                timestamp: new Date().toISOString(),
                actionUrl: '/inventory'
              });
              break;
            case 'new_order':
              options.onNotification?.({
                id: `order-${message.data.orderId}`,
                title: 'New Order',
                message: message.data.message,
                type: 'info',
                timestamp: new Date().toISOString(),
                actionUrl: '/orders'
              });
              break;
            case 'vendor_update':
              options.onNotification?.({
                id: `vendor-${message.data.vendorId}`,
                title: 'Vendor Update',
                message: message.data.message,
                type: 'info',
                timestamp: new Date().toISOString(),
                actionUrl: '/vendors'
              });
              break;
            default:
              options.onMessage?.(message);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        
        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})`);
            connect();
          }, delay);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          setConnectionError('Failed to reconnect after multiple attempts');
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionError('WebSocket connection error');
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      setConnectionError('Failed to create WebSocket connection');
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected');
      wsRef.current = null;
    }
    
    setIsConnected(false);
  };

  const sendMessage = (message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  };

  const ping = () => {
    sendMessage({ type: 'ping' });
  };

  useEffect(() => {
    if (token) {
      // Temporarily disabled to prevent WebSocket auth spam
      // connect();
    }

    return () => {
      disconnect();
    };
  }, [token]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected,
    connectionError,
    sendMessage,
    ping,
    reconnect: connect
  };
};
