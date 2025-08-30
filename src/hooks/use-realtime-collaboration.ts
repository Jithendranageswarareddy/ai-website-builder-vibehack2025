import { useState, useEffect, useCallback, useRef } from 'react';
import { getWebSocketService } from '@/lib/websocket';

export interface CollaboratorCursor {
  userId: string;
  position: { x: number; y: number };
  timestamp: number;
  color: string;
  name: string;
}

export interface RealtimeUpdate {
  type: 'component_add' | 'component_update' | 'component_delete' | 'cursor_move';
  userId: string;
  timestamp: number;
  data: any;
}

export const useRealtimeCollaboration = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [collaborators, setCollaborators] = useState<CollaboratorCursor[]>([]);
  const [realtimeUpdates, setRealtimeUpdates] = useState<RealtimeUpdate[]>([]);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  
  const wsService = useRef(getWebSocketService());
  const userColors = useRef(new Map<string, string>());

  const generateUserColor = useCallback((userId: string): string => {
    if (userColors.current.has(userId)) {
      return userColors.current.get(userId)!;
    }
    
    const colors = [
      '#ef4444', '#f97316', '#eab308', '#22c55e', 
      '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
    ];
    const color = colors[Math.abs(userId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % colors.length];
    userColors.current.set(userId, color);
    return color;
  }, []);

  const generateUserName = useCallback((userId: string): string => {
    const adjectives = ['Quick', 'Bright', 'Creative', 'Smart', 'Fast', 'Cool', 'Sharp', 'Bold'];
    const nouns = ['Builder', 'Designer', 'Creator', 'Developer', 'Artist', 'Maker', 'Coder', 'Expert'];
    
    const hash = userId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const adj = adjectives[hash % adjectives.length];
    const noun = nouns[Math.floor(hash / adjectives.length) % nouns.length];
    
    return `${adj} ${noun}`;
  }, []);

  // Send real-time updates
  const sendUpdate = useCallback((type: RealtimeUpdate['type'], data: any) => {
    const update: RealtimeUpdate = {
      type,
      userId: 'current-user',
      timestamp: Date.now(),
      data
    };
    
    wsService.current.send('realtime_update', update);
    
    // Add to local updates for immediate feedback
    setRealtimeUpdates(prev => [...prev.slice(-50), update]);
  }, []);

  // Send cursor position
  const sendCursorPosition = useCallback((position: { x: number; y: number }) => {
    wsService.current.send('cursor_move', {
      userId: 'current-user',
      position,
      timestamp: Date.now()
    });
  }, []);

  // Component operations
  const sendComponentAdd = useCallback((component: any) => {
    sendUpdate('component_add', component);
  }, [sendUpdate]);

  const sendComponentUpdate = useCallback((componentId: string, updates: any) => {
    sendUpdate('component_update', { componentId, updates });
  }, [sendUpdate]);

  const sendComponentDelete = useCallback((componentId: string) => {
    sendUpdate('component_delete', { componentId });
  }, [sendUpdate]);

  useEffect(() => {
    const ws = wsService.current;

    // Connection status
    const handleConnected = () => {
      setIsConnected(true);
    };

    const handleDisconnected = () => {
      setIsConnected(false);
      setCollaborators([]);
      setActiveUsers([]);
    };

    // User cursor updates
    const handleUserCursor = (data: any) => {
      setCollaborators(prev => {
        const filtered = prev.filter(c => c.userId !== data.userId);
        return [
          ...filtered,
          {
            userId: data.userId,
            position: data.position,
            timestamp: data.timestamp,
            color: generateUserColor(data.userId),
            name: generateUserName(data.userId)
          }
        ];
      });

      // Update active users
      setActiveUsers(prev => {
        const users = new Set([...prev, data.userId]);
        return Array.from(users);
      });

      // Remove old cursors (older than 30 seconds)
      setTimeout(() => {
        setCollaborators(prev => 
          prev.filter(c => Date.now() - c.timestamp < 30000)
        );
      }, 1000);
    };

    // Component updates from other users
    const handleComponentUpdate = (data: any) => {
      const update: RealtimeUpdate = {
        type: 'component_update',
        userId: data.userId,
        timestamp: data.timestamp || Date.now(),
        data: data.changes
      };

      setRealtimeUpdates(prev => [...prev.slice(-50), update]);
    };

    // Real-time updates
    const handleRealtimeUpdate = (data: RealtimeUpdate) => {
      if (data.userId !== 'current-user') {
        setRealtimeUpdates(prev => [...prev.slice(-50), data]);
      }
    };

    // Subscribe to events
    const unsubscribers = [
      ws.on('connected', handleConnected),
      ws.on('disconnected', handleDisconnected),
      ws.on('user_cursor', handleUserCursor),
      ws.on('component_update', handleComponentUpdate),
      ws.on('realtime_update', handleRealtimeUpdate)
    ];

    // Cleanup old cursors periodically
    const cleanupInterval = setInterval(() => {
      setCollaborators(prev => 
        prev.filter(c => Date.now() - c.timestamp < 30000)
      );
      
      setActiveUsers(prev => {
        const activeCursors = collaborators
          .filter(c => Date.now() - c.timestamp < 30000)
          .map(c => c.userId);
        return prev.filter(userId => activeCursors.includes(userId));
      });
    }, 5000);

    return () => {
      unsubscribers.forEach(unsub => unsub());
      clearInterval(cleanupInterval);
    };
  }, [generateUserColor, generateUserName, collaborators]);

  return {
    // Connection state
    isConnected,
    connectionState: wsService.current.getConnectionState(),
    
    // Collaboration data
    collaborators,
    activeUsers: activeUsers.length,
    realtimeUpdates,
    
    // Actions
    sendCursorPosition,
    sendComponentAdd,
    sendComponentUpdate,
    sendComponentDelete,
    sendUpdate,
    
    // Utilities
    clearUpdates: () => setRealtimeUpdates([]),
    getLastUpdate: () => realtimeUpdates[realtimeUpdates.length - 1],
    getUpdatesByType: (type: RealtimeUpdate['type']) => 
      realtimeUpdates.filter(update => update.type === type)
  };
};
