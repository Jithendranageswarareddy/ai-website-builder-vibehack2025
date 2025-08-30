import { useState, useEffect, useCallback, useRef } from 'react';
import { getWebSocketService } from '@/lib/websocket';

export interface RealtimeAnalytics {
  apiCalls: number;
  activeUsers: number;
  errors: number;
  responseTime: number;
  buildCount: number;
  deploymentCount: number;
  lastUpdated: number;
}

export interface APICallLog {
  id: string;
  timestamp: number;
  method: string;
  endpoint: string;
  status: 'success' | 'error' | 'pending';
  statusCode: number;
  duration: number;
  userId?: string;
  ip?: string;
}

export const useRealtimeAnalytics = () => {
  const [analytics, setAnalytics] = useState<RealtimeAnalytics>({
    apiCalls: 0,
    activeUsers: 1,
    errors: 0,
    responseTime: 0,
    buildCount: 0,
    deploymentCount: 0,
    lastUpdated: Date.now()
  });

  const [apiLogs, setApiLogs] = useState<APICallLog[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  const wsService = useRef(getWebSocketService());
  const logsBuffer = useRef<APICallLog[]>([]);

  // Generate realistic API logs
  const generateAPILog = useCallback((): APICallLog => {
    const endpoints = [
      { method: 'GET', path: '/api/projects', weight: 3 },
      { method: 'POST', path: '/api/projects', weight: 2 },
      { method: 'PUT', path: '/api/projects/:id', weight: 2 },
      { method: 'GET', path: '/api/auth/me', weight: 4 },
      { method: 'POST', path: '/api/auth/login', weight: 1 },
      { method: 'POST', path: '/api/build/generate', weight: 1 },
      { method: 'POST', path: '/api/deploy/vercel', weight: 0.5 },
      { method: 'GET', path: '/api/analytics', weight: 2 },
      { method: 'POST', path: '/api/export/zip', weight: 1 }
    ];

    // Weighted random selection
    const totalWeight = endpoints.reduce((sum, ep) => sum + ep.weight, 0);
    let random = Math.random() * totalWeight;
    
    let selectedEndpoint = endpoints[0];
    for (const endpoint of endpoints) {
      if (random <= endpoint.weight) {
        selectedEndpoint = endpoint;
        break;
      }
      random -= endpoint.weight;
    }

    const isError = Math.random() < 0.1; // 10% error rate
    const duration = isError 
      ? Math.floor(Math.random() * 2000) + 1000 // Slower for errors
      : Math.floor(Math.random() * 500) + 50;   // Faster for success

    return {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      method: selectedEndpoint.method,
      endpoint: selectedEndpoint.path,
      status: isError ? 'error' : 'success',
      statusCode: isError ? (Math.random() > 0.5 ? 500 : 400) : 200,
      duration,
      userId: `user-${Math.floor(Math.random() * 5) + 1}`,
      ip: `192.168.1.${Math.floor(Math.random() * 254) + 1}`
    };
  }, []);

  // Simulate API call
  const simulateAPICall = useCallback((endpoint: string, method: string = 'GET') => {
    const log: APICallLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      method,
      endpoint,
      status: 'pending',
      statusCode: 0,
      duration: 0,
      userId: 'current-user',
      ip: '192.168.1.100'
    };

    // Add pending log
    setApiLogs(prev => [log, ...prev.slice(0, 99)]);

    // Simulate API response
    setTimeout(() => {
      const isError = Math.random() < 0.05; // 5% error rate for user actions
      const duration = Math.floor(Math.random() * 300) + 100;
      
      const completedLog: APICallLog = {
        ...log,
        status: isError ? 'error' : 'success',
        statusCode: isError ? 500 : 200,
        duration
      };

      setApiLogs(prev => 
        prev.map(l => l.id === log.id ? completedLog : l)
      );

      // Update analytics
      setAnalytics(prev => ({
        ...prev,
        apiCalls: prev.apiCalls + 1,
        errors: prev.errors + (isError ? 1 : 0),
        responseTime: Math.round((prev.responseTime * 0.9) + (duration * 0.1)),
        lastUpdated: Date.now()
      }));

      // Send to WebSocket
      wsService.current.send('api_call', completedLog);
    }, Math.floor(Math.random() * 1000) + 200);

    return log.id;
  }, []);

  // Log different types of actions
  const logBuild = useCallback(() => {
    setAnalytics(prev => ({
      ...prev,
      buildCount: prev.buildCount + 1,
      lastUpdated: Date.now()
    }));
    return simulateAPICall('/api/build/generate', 'POST');
  }, [simulateAPICall]);

  const logDeployment = useCallback(() => {
    setAnalytics(prev => ({
      ...prev,
      deploymentCount: prev.deploymentCount + 1,
      lastUpdated: Date.now()
    }));
    return simulateAPICall('/api/deploy/vercel', 'POST');
  }, [simulateAPICall]);

  const logProjectSave = useCallback(() => {
    return simulateAPICall('/api/projects', 'POST');
  }, [simulateAPICall]);

  const logProjectLoad = useCallback(() => {
    return simulateAPICall('/api/projects', 'GET');
  }, [simulateAPICall]);

  const logAuthAction = useCallback((action: 'login' | 'register' | 'logout') => {
    return simulateAPICall(`/api/auth/${action}`, 'POST');
  }, [simulateAPICall]);

  // Get analytics summary
  const getAnalyticsSummary = useCallback(() => {
    const recentLogs = apiLogs.filter(log => 
      Date.now() - log.timestamp < 3600000 // Last hour
    );
    
    const successRate = recentLogs.length > 0 
      ? (recentLogs.filter(log => log.status === 'success').length / recentLogs.length) * 100
      : 0;

    const avgResponseTime = recentLogs.length > 0
      ? recentLogs.reduce((sum, log) => sum + log.duration, 0) / recentLogs.length
      : 0;

    return {
      totalRequests: recentLogs.length,
      successRate: Math.round(successRate * 10) / 10,
      averageResponseTime: Math.round(avgResponseTime),
      errorCount: recentLogs.filter(log => log.status === 'error').length,
      uniqueUsers: new Set(recentLogs.map(log => log.userId)).size
    };
  }, [apiLogs]);

  useEffect(() => {
    const ws = wsService.current;

    // Handle real-time analytics updates
    const handleAnalyticsUpdate = (data: Partial<RealtimeAnalytics>) => {
      setAnalytics(prev => ({
        ...prev,
        ...data,
        lastUpdated: Date.now()
      }));
    };

    // Handle incoming API calls from other users
    const handleAPICall = (data: APICallLog) => {
      if (data.userId !== 'current-user') {
        setApiLogs(prev => [data, ...prev.slice(0, 99)]);
      }
    };

    // Subscribe to real-time events
    const unsubscribers = [
      ws.on('analytics_update', handleAnalyticsUpdate),
      ws.on('api_call', handleAPICall)
    ];

    setIsSubscribed(true);

    // Generate background activity
    const activityInterval = setInterval(() => {
      if (Math.random() > 0.6) { // 40% chance every 2 seconds
        const log = generateAPILog();
        setApiLogs(prev => [log, ...prev.slice(0, 99)]);
        
        // Update analytics
        setAnalytics(prev => ({
          ...prev,
          apiCalls: prev.apiCalls + 1,
          errors: prev.errors + (log.status === 'error' ? 1 : 0),
          responseTime: Math.round((prev.responseTime * 0.95) + (log.duration * 0.05)),
          lastUpdated: Date.now()
        }));
      }
    }, 2000);

    return () => {
      unsubscribers.forEach(unsub => unsub());
      clearInterval(activityInterval);
      setIsSubscribed(false);
    };
  }, [generateAPILog]);

  return {
    // Current analytics
    analytics,
    apiLogs: apiLogs.slice(0, 100), // Limit to 100 recent logs
    isSubscribed,
    
    // Action loggers
    simulateAPICall,
    logBuild,
    logDeployment,
    logProjectSave,
    logProjectLoad,
    logAuthAction,
    
    // Analytics utilities
    getAnalyticsSummary,
    clearLogs: () => setApiLogs([]),
    getLogsByStatus: (status: APICallLog['status']) => 
      apiLogs.filter(log => log.status === status),
    getLogsByEndpoint: (endpoint: string) =>
      apiLogs.filter(log => log.endpoint.includes(endpoint)),
    getRecentLogs: (minutes: number = 10) =>
      apiLogs.filter(log => Date.now() - log.timestamp < minutes * 60000)
  };
};
