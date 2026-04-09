// platform/frontend-mui/src/store/middleware/websocketMiddleware.ts
import { Middleware } from '@reduxjs/toolkit';
import { 
  wsConnecting, 
  wsConnected, 
  wsDisconnected, 
  wsError, 
  wsMessage,
  wsClearMessages 
} from '../slices/websocketSlice';

// WebSocket subscription action
export const websocketSubscribe = (channel: string, scope: string) => ({
  type: 'websocket/subscribe',
  payload: { channel, scope }
});

// WebSocket unsubscribe action
export const websocketUnsubscribe = (channel: string) => ({
  type: 'websocket/unsubscribe',
  payload: { channel }
});

// WebSocket connect action
export const websocketConnect = (url: string) => ({
  type: 'websocket/connect',
  payload: { url }
});

// WebSocket disconnect action
export const websocketDisconnect = () => ({
  type: 'websocket/disconnect'
});

// WebSocket send message action
export const websocketSend = (message: any) => ({
  type: 'websocket/send',
  payload: message
});

interface WebSocketMiddlewareOptions {
  url?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

// WebSocket middleware factory
export const createWebSocketMiddleware = (options: WebSocketMiddlewareOptions = {}): Middleware => {
  let socket: WebSocket | null = null;
  let reconnectAttempts = 0;
  let reconnectTimer: NodeJS.Timeout | null = null;
  
  const {
    // 🔥 FIXED: Use production WebSocket URL with secure protocol
    url = import.meta.env.VITE_WEBSOCKET_URL || 'wss://breksolindo.opuschamber.com/ws',
    reconnectInterval = 5000,
    maxReconnectAttempts = 10
  } = options;

  const connect = (store: any, wsUrl: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      return;
    }

    console.log('🔌 WebSocket Middleware connecting to:', wsUrl);
    store.dispatch(wsConnecting());

    try {
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log('✅ WebSocket Middleware connected');
        store.dispatch(wsConnected());
        reconnectAttempts = 0;
        
        // Clear any existing reconnect timer
        if (reconnectTimer) {
          clearTimeout(reconnectTimer);
          reconnectTimer = null;
        }
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          store.dispatch(wsMessage(message));
        } catch (error) {
          console.error('❌ Failed to parse WebSocket message:', error);
        }
      };

      socket.onclose = (event) => {
        console.log('❌ WebSocket Middleware disconnected:', event.code, event.reason);
        store.dispatch(wsDisconnected());
        
        // Attempt to reconnect if not manually closed
        if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
          reconnectTimer = setTimeout(() => {
            reconnectAttempts++;
            console.log(`🔄 WebSocket Middleware attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts})`);
            connect(store, wsUrl);
          }, reconnectInterval);
        }
      };

      socket.onerror = (error) => {
        console.error('❌ WebSocket Middleware error:', error);
        store.dispatch(wsError('WebSocket connection failed'));
      };

    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error);
      store.dispatch(wsError('Failed to create WebSocket connection'));
    }
  };

  const disconnect = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    
    if (socket) {
      socket.close(1000, 'Manual disconnect');
      socket = null;
    }
  };

  const sendMessage = (message: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      try {
        socket.send(JSON.stringify(message));
      } catch (error) {
        console.error('❌ Failed to send WebSocket message:', error);
      }
    } else {
      console.warn('⚠️ WebSocket is not connected. Cannot send message:', message);
    }
  };

  return store => next => action => {
    switch (action.type) {
      case 'websocket/connect':
        connect(store, action.payload.url || url);
        break;
        
      case 'websocket/disconnect':
        disconnect();
        break;
        
      case 'websocket/send':
        sendMessage(action.payload);
        break;
        
      case 'websocket/subscribe':
        sendMessage({
          type: 'subscribe',
          channel: action.payload.channel,
          scope: action.payload.scope
        });
        break;
        
      case 'websocket/unsubscribe':
        sendMessage({
          type: 'unsubscribe',
          channel: action.payload.channel
        });
        break;
        
      // Auto-connect when user logs in
      case 'auth/login/fulfilled':
      case 'auth/refreshToken/fulfilled':
        if (!socket || socket.readyState !== WebSocket.OPEN) {
          connect(store, url);
        }
        break;
        
      // Disconnect when user logs out
      case 'auth/logout':
      case 'auth/clearAuth':
        disconnect();
        store.dispatch(wsClearMessages());
        break;
        
      default:
        break;
    }

    return next(action);
  };
};

// Default WebSocket middleware instance
const websocketMiddleware = createWebSocketMiddleware();

export default websocketMiddleware;