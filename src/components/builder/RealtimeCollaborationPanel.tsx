import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useRealtimeCollaboration } from "@/hooks/use-realtime-collaboration";
import { useRealtimeAnalytics } from "@/hooks/use-realtime-analytics";
import { 
  Users, 
  Wifi, 
  WifiOff, 
  Activity, 
  MousePointer2,
  Eye,
  Zap,
  Clock,
  Circle,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from "lucide-react";

interface RealtimeCollaborationPanelProps {
  onComponentUpdate?: (componentId: string, updates: any) => void;
  onComponentAdd?: (component: any) => void;
  currentUser?: string;
}

export const RealtimeCollaborationPanel = ({
  onComponentUpdate,
  onComponentAdd,
  currentUser = 'You'
}: RealtimeCollaborationPanelProps) => {
  const [showCursors, setShowCursors] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const {
    isConnected,
    connectionState,
    collaborators,
    activeUsers,
    realtimeUpdates,
    sendCursorPosition,
    sendComponentUpdate,
    sendComponentAdd,
    clearUpdates,
    getUpdatesByType
  } = useRealtimeCollaboration();

  const {
    analytics,
    apiLogs,
    isSubscribed,
    simulateAPICall,
    getAnalyticsSummary
  } = useRealtimeAnalytics();

  // Track mouse movement for cursor sharing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const newPosition = { x: e.clientX, y: e.clientY };
      setMousePosition(newPosition);
      
      if (isConnected && showCursors) {
        // Throttle cursor updates
        const now = Date.now();
        if (!handleMouseMove.lastSent || now - handleMouseMove.lastSent > 100) {
          sendCursorPosition(newPosition);
          handleMouseMove.lastSent = now;
        }
      }
    };

    // Add property to function for throttling
    (handleMouseMove as any).lastSent = 0;

    if (showCursors) {
      document.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isConnected, showCursors, sendCursorPosition]);

  // Handle real-time updates
  useEffect(() => {
    const componentUpdates = getUpdatesByType('component_update');
    componentUpdates.forEach(update => {
      if (onComponentUpdate && update.data.componentId) {
        onComponentUpdate(update.data.componentId, update.data.updates);
      }
    });

    const componentAdds = getUpdatesByType('component_add');
    componentAdds.forEach(update => {
      if (onComponentAdd) {
        onComponentAdd(update.data);
      }
    });
  }, [realtimeUpdates, onComponentUpdate, onComponentAdd, getUpdatesByType]);

  const getConnectionIcon = () => {
    switch (connectionState) {
      case 'connected':
        return <Wifi className="w-4 h-4 text-green-500" />;
      case 'connecting':
        return <RefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <WifiOff className="w-4 h-4 text-gray-400" />;
    }
  };

  const getConnectionStatus = () => {
    switch (connectionState) {
      case 'connected':
        return { text: 'Connected', color: 'text-green-600' };
      case 'connecting':
        return { text: 'Connecting...', color: 'text-yellow-600' };
      case 'failed':
        return { text: 'Connection failed', color: 'text-red-600' };
      default:
        return { text: 'Disconnected', color: 'text-gray-500' };
    }
  };

  const status = getConnectionStatus();
  const summary = getAnalyticsSummary();

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Real-time Collaboration
          </div>
          <div className="flex items-center gap-2">
            {getConnectionIcon()}
            <span className={`text-xs ${status.color}`}>
              {status.text}
            </span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4 p-4">
        {/* Active Users */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Active Users ({activeUsers + 1})
            </h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowCursors(!showCursors)}
            >
              <MousePointer2 className="w-3 h-3 mr-1" />
              {showCursors ? 'Hide' : 'Show'} Cursors
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {currentUser.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-medium">{currentUser}</div>
              <div className="text-xs text-muted-foreground">Owner</div>
            </div>
            <Badge variant="default" className="ml-auto">
              <Circle className="w-2 h-2 mr-1 fill-current" />
              Online
            </Badge>
          </div>

          {collaborators.map((collaborator, index) => (
            <div key={collaborator.userId} className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback 
                  className="text-xs text-white"
                  style={{ backgroundColor: collaborator.color }}
                >
                  {collaborator.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm font-medium">{collaborator.name}</div>
                <div className="text-xs text-muted-foreground">
                  Last seen: {Math.floor((Date.now() - collaborator.timestamp) / 1000)}s ago
                </div>
              </div>
              <Badge variant="secondary" className="ml-auto">
                <Circle className="w-2 h-2 mr-1 fill-current" style={{ color: collaborator.color }} />
                Active
              </Badge>
            </div>
          ))}
        </div>

        <Separator />

        {/* Real-time Activity */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Live Activity
            </h3>
            <Button size="sm" variant="outline" onClick={clearUpdates}>
              Clear
            </Button>
          </div>

          <ScrollArea className="h-32">
            <div className="space-y-2">
              {realtimeUpdates.slice(-10).reverse().map((update, index) => (
                <div key={index} className="flex items-start gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                  <div className="flex-1">
                    <div className="font-medium">
                      {update.userId === 'current-user' ? 'You' : update.userId}
                    </div>
                    <div className="text-muted-foreground">
                      {update.type.replace('_', ' ')} - {new Date(update.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              
              {realtimeUpdates.length === 0 && (
                <div className="text-center text-muted-foreground py-4">
                  <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No recent activity</p>
                  <p className="text-xs">Start collaborating to see updates here</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <Separator />

        {/* Live Analytics */}
        <div className="space-y-3">
          <h3 className="font-medium flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Live Analytics
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-green-600">
                {summary.totalRequests}
              </div>
              <div className="text-xs text-muted-foreground">API Calls</div>
            </div>

            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-blue-600">
                {summary.successRate}%
              </div>
              <div className="text-xs text-muted-foreground">Success Rate</div>
            </div>

            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-purple-600">
                {summary.averageResponseTime}ms
              </div>
              <div className="text-xs text-muted-foreground">Avg Response</div>
            </div>

            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-orange-600">
                {analytics.buildCount}
              </div>
              <div className="text-xs text-muted-foreground">Builds</div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Recent API Calls */}
        <div className="space-y-3">
          <h3 className="font-medium flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Recent API Calls
          </h3>

          <ScrollArea className="h-24">
            <div className="space-y-1">
              {apiLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center gap-2 text-xs">
                  {log.status === 'success' ? (
                    <CheckCircle className="w-3 h-3 text-green-500" />
                  ) : (
                    <AlertCircle className="w-3 h-3 text-red-500" />
                  )}
                  <span className="font-mono text-xs">
                    {log.method} {log.endpoint}
                  </span>
                  <span className="text-muted-foreground ml-auto">
                    {log.duration}ms
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Connection Actions */}
        <div className="mt-auto pt-4 border-t">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => simulateAPICall('/api/test', 'GET')}
            >
              Test API
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => sendComponentUpdate('demo', { timestamp: Date.now() })}
            >
              Send Update
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Render collaborator cursors */}
      {showCursors && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {collaborators.map((collaborator) => (
            <div
              key={collaborator.userId}
              className="absolute transition-all duration-100 ease-out"
              style={{
                left: `${collaborator.position.x}px`,
                top: `${collaborator.position.y}px`,
                transform: 'translate(-2px, -2px)'
              }}
            >
              <div className="flex items-center gap-1">
                <MousePointer2 
                  className="w-4 h-4" 
                  style={{ color: collaborator.color }}
                />
                <div 
                  className="text-xs text-white px-2 py-1 rounded shadow-lg"
                  style={{ backgroundColor: collaborator.color }}
                >
                  {collaborator.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
