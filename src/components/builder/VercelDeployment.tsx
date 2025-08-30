import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Rocket, 
  Globe, 
  Github, 
  ExternalLink, 
  CheckCircle,
  AlertCircle,
  Clock,
  Copy,
  Settings,
  Monitor,
  Server,
  Database
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DeploymentStatus {
  id: string;
  type: 'frontend' | 'backend' | 'database';
  status: 'idle' | 'deploying' | 'success' | 'failed';
  url?: string;
  logs: string[];
  startTime?: Date;
  endTime?: Date;
}

interface VercelDeploymentProps {
  blocks?: any[];
  tables?: any[];
  endpoints?: any[];
  authConfig?: any;
  projectName: string;
  environmentVariables: Record<string, string>;
  onDeploymentComplete?: (urls: { frontend?: string; backend?: string }) => void;
}

export const VercelDeployment = ({
  blocks,
  tables,
  endpoints,
  authConfig,
  projectName,
  environmentVariables,
  onDeploymentComplete
}: VercelDeploymentProps) => {
  const [deployments, setDeployments] = useState<DeploymentStatus[]>([
    { id: 'frontend', type: 'frontend', status: 'idle', logs: [] },
    { id: 'backend', type: 'backend', status: 'idle', logs: [] },
    { id: 'database', type: 'database', status: 'idle', logs: [] }
  ]);
  
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentConfig, setDeploymentConfig] = useState({
    githubRepo: '',
    projectName: projectName.toLowerCase().replace(/\s+/g, '-'),
    domain: '',
    autoRedeploy: true
  });
  const [activeTab, setActiveTab] = useState('configure');
  const { toast } = useToast();

  const updateDeploymentStatus = (id: string, updates: Partial<DeploymentStatus>) => {
    setDeployments(prev => 
      prev.map(deployment => 
        deployment.id === id 
          ? { ...deployment, ...updates }
          : deployment
      )
    );
  };

  const addLog = (deploymentId: string, message: string) => {
    updateDeploymentStatus(deploymentId, {
      logs: [...deployments.find(d => d.id === deploymentId)?.logs || [], 
             `[${new Date().toLocaleTimeString()}] ${message}`]
    });
  };

  const simulateVercelAPI = async (type: 'frontend' | 'backend', config: any) => {
    // Simulate Vercel API calls (replace with real Vercel API in production)
    const steps = [
      'Connecting to GitHub repository...',
      'Building project...',
      'Optimizing assets...',
      'Deploying to Vercel...',
      'Configuring domain...',
      'Deployment complete!'
    ];

    for (let i = 0; i < steps.length; i++) {
      addLog(type, steps[i]);
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
      
      if (i === steps.length - 1) {
        // Generate mock deployment URL
        const subdomain = `${config.projectName}-${type}`;
        const deploymentUrl = `https://${subdomain}-${Math.random().toString(36).substr(2, 8)}.vercel.app`;
        
        updateDeploymentStatus(type, {
          status: 'success',
          url: deploymentUrl,
          endTime: new Date()
        });
        
        return deploymentUrl;
      }
    }
  };

  const deployToVercel = async () => {
    setIsDeploying(true);
    
    try {
      // Deploy Frontend
      updateDeploymentStatus('frontend', { 
        status: 'deploying', 
        startTime: new Date(),
        logs: [] 
      });
      
      addLog('frontend', 'Starting frontend deployment...');
      const frontendUrl = await simulateVercelAPI('frontend', {
        ...deploymentConfig,
        buildCommand: 'cd frontend && npm run build',
        outputDirectory: 'frontend/dist',
        environmentVariables: Object.entries(environmentVariables)
          .filter(([key]) => key.startsWith('VITE_'))
          .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
      });

      // Deploy Backend
      updateDeploymentStatus('backend', { 
        status: 'deploying', 
        startTime: new Date(),
        logs: [] 
      });
      
      addLog('backend', 'Starting backend deployment...');
      const backendUrl = await simulateVercelAPI('backend', {
        ...deploymentConfig,
        functions: true,
        environmentVariables: Object.entries(environmentVariables)
          .filter(([key]) => !key.startsWith('VITE_'))
          .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
      });

      // Setup Database (simulate)
      updateDeploymentStatus('database', { 
        status: 'deploying', 
        startTime: new Date(),
        logs: [] 
      });
      
      addLog('database', 'Configuring database connection...');
      addLog('database', 'Running database migrations...');
      addLog('database', 'Database setup complete!');
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      updateDeploymentStatus('database', {
        status: 'success',
        endTime: new Date()
      });

      // Notify completion
      onDeploymentComplete?.({
        frontend: frontendUrl,
        backend: backendUrl
      });

      toast({
        title: "Deployment Successful!",
        description: "Your application has been deployed to Vercel.",
      });

    } catch (error) {
      console.error('Deployment error:', error);
      
      // Update failed deployments
      deployments.forEach(deployment => {
        if (deployment.status === 'deploying') {
          updateDeploymentStatus(deployment.id, {
            status: 'failed',
            endTime: new Date()
          });
          addLog(deployment.id, `Deployment failed: ${error}`);
        }
      });

      toast({
        title: "Deployment Failed",
        description: "There was an error deploying your application.",
        variant: "destructive"
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "URL copied to clipboard!",
    });
  };

  const getStatusIcon = (status: DeploymentStatus['status']) => {
    switch (status) {
      case 'idle': return <Clock className="w-4 h-4 text-gray-400" />;
      case 'deploying': return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getTypeIcon = (type: DeploymentStatus['type']) => {
    switch (type) {
      case 'frontend': return <Monitor className="w-4 h-4" />;
      case 'backend': return <Server className="w-4 h-4" />;
      case 'database': return <Database className="w-4 h-4" />;
    }
  };

  const getDeploymentDuration = (deployment: DeploymentStatus) => {
    if (!deployment.startTime) return null;
    const end = deployment.endTime || new Date();
    const duration = Math.round((end.getTime() - deployment.startTime.getTime()) / 1000);
    return `${duration}s`;
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Rocket className="w-5 h-5 text-primary" />
          Vercel Deployment
          <Badge variant="secondary" className="text-xs">
            One-Click Deploy
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mx-4">
            <TabsTrigger value="configure" className="text-xs">
              <Settings className="w-3 h-3 mr-1" />
              Configure
            </TabsTrigger>
            <TabsTrigger value="deploy" className="text-xs">
              <Rocket className="w-3 h-3 mr-1" />
              Deploy
            </TabsTrigger>
            <TabsTrigger value="results" className="text-xs">
              <Globe className="w-3 h-3 mr-1" />
              Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="configure" className="flex-1 m-0">
            <ScrollArea className="h-full px-4">
              <div className="space-y-6 py-4">
                <div className="space-y-4">
                  <h3 className="font-medium">GitHub Repository</h3>
                  <div className="space-y-2">
                    <Label htmlFor="github-repo">Repository URL</Label>
                    <Input
                      id="github-repo"
                      placeholder="https://github.com/username/repository"
                      value={deploymentConfig.githubRepo}
                      onChange={(e) => setDeploymentConfig(prev => ({
                        ...prev,
                        githubRepo: e.target.value
                      }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Connect your GitHub repository for automatic deployments
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Project Configuration</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="project-name">Project Name</Label>
                      <Input
                        id="project-name"
                        value={deploymentConfig.projectName}
                        onChange={(e) => setDeploymentConfig(prev => ({
                          ...prev,
                          projectName: e.target.value
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="domain">Custom Domain (Optional)</Label>
                      <Input
                        id="domain"
                        placeholder="myapp.com"
                        value={deploymentConfig.domain}
                        onChange={(e) => setDeploymentConfig(prev => ({
                          ...prev,
                          domain: e.target.value
                        }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Environment Variables</h3>
                  <div className="bg-muted/50 rounded p-4 space-y-2">
                    {Object.entries(environmentVariables).length > 0 ? (
                      Object.entries(environmentVariables).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="font-mono">{key}</span>
                          <span className="text-muted-foreground">
                            {value.length > 20 ? `${value.substring(0, 20)}...` : value}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No environment variables configured
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Deployment Settings</h3>
                  <div className="bg-muted/50 rounded p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Auto-redeploy on push</p>
                        <p className="text-xs text-muted-foreground">
                          Automatically deploy when you push to main branch
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={deploymentConfig.autoRedeploy}
                        onChange={(e) => setDeploymentConfig(prev => ({
                          ...prev,
                          autoRedeploy: e.target.checked
                        }))}
                        className="rounded"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Deployment Plan</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Monitor className="w-4 h-4 text-blue-500" />
                      <span>Frontend → Vercel Static Hosting</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Server className="w-4 h-4 text-green-500" />
                      <span>Backend → Vercel Serverless Functions</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Database className="w-4 h-4 text-purple-500" />
                      <span>Database → Vercel Postgres</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="deploy" className="flex-1 m-0">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b">
                <Button
                  onClick={deployToVercel}
                  disabled={isDeploying || !deploymentConfig.githubRepo}
                  className="w-full"
                  size="lg"
                >
                  {isDeploying ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Deploying...
                    </>
                  ) : (
                    <>
                      <Rocket className="w-4 h-4 mr-2" />
                      Deploy to Vercel
                    </>
                  )}
                </Button>
                
                {!deploymentConfig.githubRepo && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Please configure GitHub repository first
                  </p>
                )}
              </div>
              
              <ScrollArea className="flex-1 px-4">
                <div className="space-y-4 py-4">
                  {deployments.map((deployment) => (
                    <Card key={deployment.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getTypeIcon(deployment.type)}
                            <div>
                              <h4 className="font-medium capitalize">
                                {deployment.type} Deployment
                              </h4>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(deployment.status)}
                                <span className="text-sm text-muted-foreground capitalize">
                                  {deployment.status}
                                </span>
                                {getDeploymentDuration(deployment) && (
                                  <span className="text-xs text-muted-foreground">
                                    ({getDeploymentDuration(deployment)})
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {deployment.url && (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyToClipboard(deployment.url!)}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(deployment.url, '_blank')}
                              >
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                        
                        {deployment.url && (
                          <div className="bg-green-50 border border-green-200 rounded p-2">
                            <p className="text-xs text-green-800 font-mono">
                              {deployment.url}
                            </p>
                          </div>
                        )}
                        
                        {deployment.logs.length > 0 && (
                          <div className="bg-black rounded p-3 max-h-32 overflow-y-auto">
                            {deployment.logs.map((log, index) => (
                              <div key={index} className="text-xs text-green-400 font-mono">
                                {log}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="results" className="flex-1 m-0">
            <ScrollArea className="h-full px-4">
              <div className="space-y-4 py-4">
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Deployment Complete!</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your application is now live on Vercel
                  </p>
                </div>

                <div className="space-y-3">
                  {deployments
                    .filter(d => d.status === 'success' && d.url)
                    .map((deployment) => (
                      <Card key={deployment.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getTypeIcon(deployment.type)}
                            <div>
                              <h4 className="font-medium capitalize">
                                {deployment.type}
                              </h4>
                              <p className="text-xs text-muted-foreground font-mono">
                                {deployment.url}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(deployment.url!)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => window.open(deployment.url, '_blank')}
                            >
                              <ExternalLink className="w-3 h-3" />
                              Visit
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Next Steps</h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Configure Custom Domain</p>
                        <p className="text-muted-foreground">
                          Add your custom domain in Vercel dashboard
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Set up Analytics</p>
                        <p className="text-muted-foreground">
                          Enable Vercel Analytics to track performance
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Configure Monitoring</p>
                        <p className="text-muted-foreground">
                          Set up error tracking and performance monitoring
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded p-4">
                  <div className="flex items-start gap-2">
                    <Globe className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">
                        Your app is now live!
                      </p>
                      <p className="text-xs text-blue-600">
                        Share your deployment URLs with others and start collecting feedback.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
