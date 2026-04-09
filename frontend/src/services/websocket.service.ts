// platform/frontend-mui/src/services/WebSocketService.ts
import { store } from '../store';
import { 
  wsConnected, 
  wsDisconnected, 
  wsError, 
  wsMessage 
} from '../store/slices/websocketSlice';
import { refreshToken } from '../features/auth/authThunks';

export class WebSocketService {
  private static instance: WebSocketService;
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private url: string;

  private constructor() {
    // 🔥 FIXED: Use correct environment variable and dynamically construct WebSocket URL
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    this.url = import.meta.env.VITE_WEBSOCKET_URL || `${wsProtocol}//${window.location.host}/ws`;
    console.log('🔧 WebSocket URL configured:', this.url);
  }

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  public connect(): void {
    if (this.socket) {
      return;
    }

    // Get token from Redux store
    const state = store.getState();
    const token = state.auth.token;

    if (!token) {
      store.dispatch(wsError('No authentication token available'));
      return;
    }

    try {
      // Add token to WebSocket URL
      const wsUrl = `${this.url}?token=${token}`;
      console.log('🔌 Connecting to WebSocket:', wsUrl);
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);

      // Start ping interval to keep connection alive
      this.pingInterval = setInterval(() => {
        this.sendPing();
      }, 30000); // 30 seconds
    } catch (error) {
      store.dispatch(wsError(`WebSocket connection error: ${error.message}`));
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.reconnectAttempts = 0;
  }

  public send(message: any): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      store.dispatch(wsError('WebSocket not connected'));
      return;
    }

    try {
      const messageString = typeof message === 'string' 
        ? message 
        : JSON.stringify(message);
      
      this.socket.send(messageString);
    } catch (error) {
      store.dispatch(wsError(`Failed to send message: ${error.message}`));
    }
  }

  private handleOpen(event: Event): void {
    console.log('✅ WebSocket connected');
    store.dispatch(wsConnected());
    this.reconnectAttempts = 0;
  }

  private handleClose(event: CloseEvent): void {
    console.log(`❌ WebSocket closed: ${event.code} ${event.reason}`);
    store.dispatch(wsDisconnected());

    // Clear intervals
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    // Attempt to reconnect if not a normal closure
    if (event.code !== 1000) {
      this.attemptReconnect();
    }
  }

  private handleError(event: Event): void {
    console.error('❌ WebSocket error:', event);
    store.dispatch(wsError('WebSocket error occurred'));
    
    // Socket will close after an error, which will trigger reconnect
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      store.dispatch(wsMessage(data));
    } catch (error) {
      console.error('❌ Error parsing WebSocket message:', error);
      store.dispatch(wsError(`Failed to parse message: ${error.message}`));
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('❌ Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`🔄 Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    this.reconnectTimeout = setTimeout(() => {
      // Check if token needs refresh before reconnecting
      const state = store.getState();
      if (state.auth.token) {
        this.connect();
      } else {
        // Try to refresh token first
        const refreshTokenValue = state.auth.refreshToken;
        if (refreshTokenValue) {
          store.dispatch(refreshToken(refreshTokenValue))
            .then(() => {
              this.connect();
            })
            .catch(() => {
              store.dispatch(wsError('Failed to refresh token for reconnection'));
            });
        } else {
          store.dispatch(wsError('No refresh token available for reconnection'));
        }
      }
    }, delay);
  }

  private sendPing(): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.send({ type: 'ping', timestamp: Date.now() });
    }
  }

  // Subscribe to dashboard updates
  public subscribeToDashboard(dashboardId: number): void {
    this.send({
      type: 'subscribe',
      entity: 'dashboard',
      id: dashboardId,
      timestamp: Date.now()
    });
  }

  // Unsubscribe from dashboard updates
  public unsubscribeFromDashboard(dashboardId: number): void {
    this.send({
      type: 'unsubscribe',
      entity: 'dashboard',
      id: dashboardId,
      timestamp: Date.now()
    });
  }

  // Subscribe to notifications
  public subscribeToNotifications(): void {
    this.send({
      type: 'subscribe',
      entity: 'notification',
      id: 'all',
      timestamp: Date.now()
    });
  }
}

// Export singleton instance
export const websocketService = WebSocketService.getInstance();