// WebSocket Service for Real-time Communication
class WebSocketService {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;

  constructor(private url: string = 'ws://localhost:8081') {
    this.connect();
  }

  private connect() {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isConnecting = true;
    
    try {
      // For demo purposes, we'll simulate WebSocket connection
      this.simulateWebSocket();
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.handleReconnect();
    }
  }

  private simulateWebSocket() {
    // Simulate WebSocket for demo since we don't have a real WebSocket server
    const mockWS = {
      readyState: 1, // OPEN
      send: (data: string) => {
        // Mock WebSocket sending data
        // Simulate server response
        setTimeout(() => {
          // Create a real MessageEvent for type safety
          const event = new MessageEvent('message', {
            data: JSON.stringify({
              type: 'echo',
              payload: JSON.parse(data),
              timestamp: Date.now(),
              userId: 'demo-user'
            })
          });
          this.handleMessage(event);
        }, 100);
      },
      close: () => {},
      addEventListener: () => {},
      removeEventListener: () => {}
    };

    this.ws = mockWS as any;
    this.isConnecting = false;
    this.reconnectAttempts = 0;

    // Simulate connection events
    this.emit('connected', { userId: 'demo-user', timestamp: Date.now() });

    // Simulate periodic real-time updates
    this.startSimulatedUpdates();
  }

  private startSimulatedUpdates() {
    // Simulate real-time analytics updates
    setInterval(() => {
      this.emit('analytics_update', {
        apiCalls: Math.floor(Math.random() * 100) + 50,
        activeUsers: Math.floor(Math.random() * 10) + 1,
        errors: Math.floor(Math.random() * 5),
        responseTime: Math.floor(Math.random() * 500) + 100
      });
    }, 3000);

    // Simulate real-time collaboration updates
    setInterval(() => {
      if (Math.random() > 0.7) {
        this.emit('user_cursor', {
          userId: 'collaborator-' + Math.floor(Math.random() * 3),
          position: {
            x: Math.floor(Math.random() * 800),
            y: Math.floor(Math.random() * 600)
          },
          timestamp: Date.now()
        });
      }
    }, 1000);

    // Simulate component updates from other users
    setInterval(() => {
      if (Math.random() > 0.8) {
        this.emit('component_update', {
          componentId: 'demo-component-' + Math.floor(Math.random() * 5),
          userId: 'collaborator-' + Math.floor(Math.random() * 3),
          action: 'update',
          changes: {
            content: 'Updated by collaborator',
            timestamp: Date.now()
          }
        });
      }
    }, 5000);
  }

  private handleMessage(event: MessageEvent) {
    try {
      const message = JSON.parse(event.data);
      this.emit(message.type, message.payload);
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      setTimeout(() => {
        // Attempting to reconnect
        this.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('connection_failed', { attempts: this.reconnectAttempts });
    }
  }

  public send(type: string, payload: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ type, payload, timestamp: Date.now() });
      this.ws.send(message);
    } else {
      console.warn('WebSocket not connected, queuing message:', { type, payload });
    }
  }

  public on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(callback);
        if (eventListeners.size === 0) {
          this.listeners.delete(event);
        }
      }
    };
  }

  public off(event: string, callback?: Function) {
    if (callback) {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(callback);
      }
    } else {
      this.listeners.delete(event);
    }
  }

  private emit(event: string, payload: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(payload);
        } catch (error) {
          console.error(`Error in WebSocket event listener for ${event}:`, error);
        }
      });
    }
  }

  public getConnectionState(): 'connecting' | 'connected' | 'disconnected' | 'failed' {
    if (this.isConnecting) return 'connecting';
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return 'connected';
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return 'failed';
    return 'disconnected';
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
    this.reconnectAttempts = 0;
  }
}

// Real-time Events Interface
export interface RealtimeEvent {
  type: string;
  payload: any;
  timestamp: number;
  userId?: string;
}

// Singleton instance
let wsService: WebSocketService | null = null;

export const getWebSocketService = (): WebSocketService => {
  if (!wsService) {
    wsService = new WebSocketService();
  }
  return wsService;
};

export { WebSocketService };
