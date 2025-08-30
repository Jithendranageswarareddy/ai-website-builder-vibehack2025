import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRealtimeAnalytics } from "@/hooks/use-realtime-analytics";
import { 
  Activity, 
  BarChart3, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Zap,
  Eye,
  Download,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  Server,
  Database,
  Globe,
  Timer,
  Filter,
  Circle,
  Shield
} from "lucide-react";

export const AnalyticsLogs = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [filterType, setFilterType] = useState<string>('all');
  
  // Use real-time analytics hook
  const {
    analytics,
    apiLogs,
    isSubscribed,
    getAnalyticsSummary,
    clearLogs,
    getLogsByStatus,
    simulateAPICall
  } = useRealtimeAnalytics();

  const summary = getAnalyticsSummary();
  
  const filteredLogs = apiLogs.filter(log => 
    filterType === 'all' || log.status === filterType || 
    (filterType === 'api' && log.endpoint) ||
    (filterType === 'build' && log.endpoint?.includes('build')) ||
    (filterType === 'deploy' && log.endpoint?.includes('deploy'))
  );

  const exportLogs = () => {
    const dataStr = JSON.stringify(apiLogs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Analytics & Logs
          <Badge variant="secondary" className="text-xs">
            {apiLogs.length} entries
          </Badge>
          {isSubscribed && (
            <Badge variant="outline" className="text-xs">
              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
              Live
            </Badge>
          )}
        </CardTitle>
        
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={isSubscribed ? "default" : "outline"}
              onClick={() => simulateAPICall('/api/test', 'GET')}
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Test API
            </Button>
            <Button size="sm" variant="outline" onClick={exportLogs}>
              <Download className="w-3 h-3 mr-1" />
              Export
            </Button>
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs border rounded px-2 py-1"
          >
            <option value="all">All Events</option>
            <option value="success">Success Only</option>
            <option value="error">Errors Only</option>
            <option value="build">Builds</option>
            <option value="deploy">Deployments</option>
          </select>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mx-4">
            <TabsTrigger value="overview" className="text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="logs" className="text-xs">
              <Activity className="w-3 h-3 mr-1" />
              Live Logs
            </TabsTrigger>
            <TabsTrigger value="metrics" className="text-xs">
              <BarChart3 className="w-3 h-3 mr-1" />
              Metrics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="flex-1 m-0">
            <div className="p-4 space-y-4">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {summary.totalRequests}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Requests</div>
                </Card>
                
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {apiLogs.length > 0 ? 
                      Math.round((apiLogs.filter(log => log.status === 'success').length / apiLogs.length) * 100) 
                      : 0}%
                  </div>
                  <div className="text-xs text-muted-foreground">Success Rate</div>
                </Card>
                
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {summary.averageResponseTime}ms
                  </div>
                  <div className="text-xs text-muted-foreground">Avg Response</div>
                </Card>
                
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {summary.errorCount}
                  </div>
                  <div className="text-xs text-muted-foreground">Errors</div>
                </Card>
              </div>

              {/* Recent Activity Summary */}
              <Card className="p-4">
                <h3 className="font-medium mb-3">Recent Activity</h3>
                <div className="space-y-2">
                  {apiLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {log.status === 'success' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span>{log.method} {log.endpoint}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-3 text-center">
                  <div className="text-lg font-bold text-orange-600">
                    {analytics.buildCount}
                  </div>
                  <div className="text-xs text-muted-foreground">Builds</div>
                </Card>
                
                <Card className="p-3 text-center">
                  <div className="text-lg font-bold text-cyan-600">
                    {analytics.deploymentCount}
                  </div>
                  <div className="text-xs text-muted-foreground">Deployments</div>
                </Card>
                
                <Card className="p-3 text-center">
                  <div className="text-lg font-bold text-indigo-600">
                    {analytics.activeUsers}
                  </div>
                  <div className="text-xs text-muted-foreground">Active Users</div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="logs" className="flex-1 m-0">
            <ScrollArea className="h-full px-4">
              <div className="space-y-2 py-4">
                {filteredLogs.map((log) => (
                  <Card key={log.id} className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="flex items-center gap-1 mt-0.5">
                          {log.status === 'success' ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {log.method} {log.endpoint}
                            </span>
                            <Badge 
                              variant={log.status === 'success' ? 'default' : 'destructive'} 
                              className="text-xs"
                            >
                              {log.statusCode}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Timer className="w-3 h-3" />
                              {log.duration}ms
                            </span>
                            {log.ip && (
                              <span>IP: {log.ip}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                
                {filteredLogs.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No logs match the current filter</p>
                    <p className="text-xs">Try adjusting the filter or wait for new events</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="metrics" className="flex-1 m-0">
            <div className="p-4 space-y-4">
              {/* Performance Metrics */}
              <Card className="p-4">
                <h3 className="font-medium mb-3">Performance Metrics</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Success Rate</span>
                      <span>
                        {apiLogs.length > 0 ? 
                          Math.round((apiLogs.filter(log => log.status === 'success').length / apiLogs.length) * 100) 
                          : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ 
                          width: `${apiLogs.length > 0 ? 
                            Math.round((apiLogs.filter(log => log.status === 'success').length / apiLogs.length) * 100) 
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Average Response Time</span>
                      <span>{summary.averageResponseTime}ms</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${Math.min(summary.averageResponseTime / 10, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
