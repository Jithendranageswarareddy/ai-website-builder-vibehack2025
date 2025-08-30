import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import JSZip from "jszip";
import { 
  Palette, 
  Code2, 
  Database, 
  Layers, 
  Plus, 
  Eye, 
  Download,
  Sparkles,
  MessageSquare,
  Play,
  Settings,
  Zap,
  Shield,
  Server,
  Key,
  Package,
  Cloud,
  FolderOpen,
  History,
  Users,
  Undo2,
  Redo2
} from "lucide-react";
import { SchemaDesigner, DatabaseTable } from "./builder/SchemaDesigner";
import { APIGenerator } from "./builder/APIGenerator";
import { AuthGenerator } from "./builder/AuthGenerator";
import { CanvasBuilder, CanvasBlock } from "./builder/CanvasBuilder";
import { PropertiesPanel as CanvasPropertiesPanel } from "./builder/CanvasPropertiesPanel";
import { LivePreview } from "./builder/LivePreview";
import { AIChatAssistant } from "./builder/AIChatAssistant";
import { SmartComponentSuggestions } from "./builder/SmartComponentSuggestions";
import { CodeOptimization } from "./builder/CodeOptimization";
import { CodeExport } from "./builder/CodeExport";
import { ProjectExport } from "./builder/ProjectExport";
import { VercelDeployment } from "./builder/VercelDeployment";
import { EnvironmentVariablesPanel } from "./builder/EnvironmentVariablesPanel";
import { ProjectManager } from "./builder/ProjectManager";
import { CanvasHistoryPanel, SchemaHistoryPanel } from "./builder/HistoryPanel";
import { CollaborationPanel } from "./builder/CollaborationPanel";
import { useCanvasHistory, useSchemaHistory } from "../hooks/use-undo-redo";
import { generateBackendCode, BackendConfig } from "./builder/BackendGenerator";

export const BuilderInterface = () => {
  const [activeTab, setActiveTab] = useState("frontend");
  const [tables, setTables] = useState<DatabaseTable[]>([]);
  const [endpoints, setEndpoints] = useState<any[]>([]);
  const [authConfig, setAuthConfig] = useState({
    enableRegistration: true,
    enableLogin: true,
    enablePasswordReset: false,
    jwtSecret: 'your-secret-key',
    sessionExpiry: '7d',
    passwordMinLength: 8
  });

  // Phase 5: Enhanced state management with history
  const canvasHistory = useCanvasHistory([]);
  const schemaHistory = useSchemaHistory([]);
  
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [builderMode, setBuilderMode] = useState<'canvas' | 'preview' | 'code'>('canvas');
  const [aiMode, setAiMode] = useState<'chat' | 'suggestions' | 'optimize'>('chat');
  
  // Phase 4: Deployment & ZIP state
  const [environmentVariables, setEnvironmentVariables] = useState<Record<string, string>>({
    NODE_ENV: 'production',
    PORT: '3001',
    VITE_API_URL: 'https://your-api.vercel.app'
  });
  const [deploymentMode, setDeploymentMode] = useState<'export' | 'deploy' | 'env'>('export');
  
  // Phase 5: Collaboration & Project Management state
  const [projectMode, setProjectMode] = useState<'manage' | 'history' | 'collaborate'>('manage');
  const [currentUser] = useState({
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'owner' as const,
    status: 'online' as const,
    lastSeen: new Date(),
    permissions: {
      canEdit: true,
      canDelete: true,
      canInvite: true,
      canExport: true
    }
  });

  const selectedBlock = canvasHistory.blocks.find(block => block.id === selectedBlockId) || null;

  const updateBlock = (blockId: string, updates: Partial<CanvasBlock>) => {
    const updatedBlocks = canvasHistory.blocks.map(block => 
      block.id === blockId 
        ? { ...block, ...updates, properties: { ...block.properties, ...updates.properties } }
        : block
    );
    canvasHistory.updateBlocks(updatedBlocks, `Updated ${updates.type || 'block'}`);
  };

  const addBlock = (block: CanvasBlock) => {
    canvasHistory.addBlock(block);
  };

  const loadProject = (projectSchema: any) => {
    // Load canvas blocks with history
    canvasHistory.updateBlocks(projectSchema.canvasBlocks || [], 'Loaded project');
    
    // Load other project data
    setTables(projectSchema.tables || []);
    schemaHistory.updateTables(projectSchema.tables || [], 'Loaded project schema');
    setEndpoints(projectSchema.endpoints || []);
    setAuthConfig(projectSchema.authConfig || authConfig);
    setEnvironmentVariables(projectSchema.environmentVariables || environmentVariables);
  };

  const handleProjectUpdate = () => {
    // This would typically sync with backend or update project state
  };

  const handleExportCode = () => {
    if (activeTab === "backend") {
      const backendConfig: BackendConfig = {
        tables: schemaHistory.tables,
        relations: [],
        endpoints: endpoints,
        authConfig: authConfig,
        projectName: "My App"
      };

      const files = generateBackendCode(backendConfig);
      
      // Create ZIP file
      const zip = new JSZip();
      Object.entries(files).forEach(([path, content]) => {
        zip.file(path, content);
      });

      zip.generateAsync({ type: "blob" }).then((content) => {
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'backend-code.zip';
        a.click();
        URL.revokeObjectURL(url);
      });
    }
  };
  return (
    <section className="py-20 bg-background">
      <div className="container px-4 md:px-6">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Experience the 
            <span className="bg-gradient-ai bg-clip-text text-transparent"> Builder Interface</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See how easy it is to build professional applications with our intuitive drag-and-drop builder.
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          <Card className="overflow-hidden border-2 border-primary/10">
            <CardHeader className="bg-builder-panel text-builder-text">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Project Dashboard
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-primary/20 text-primary">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Active
                  </Badge>
                  
                  {/* Quick Undo/Redo Controls */}
                  {(activeTab === 'frontend' || activeTab === 'database') && (
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          if (activeTab === 'frontend') {
                            canvasHistory.undo();
                          } else if (activeTab === 'database') {
                            const newTables = schemaHistory.undo();
                            setTables(newTables);
                          }
                        }}
                        disabled={
                          activeTab === 'frontend' 
                            ? !canvasHistory.getHistoryInfo().canUndo
                            : !schemaHistory.getHistoryInfo().canUndo
                        }
                      >
                        <Undo2 className="w-3 h-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          if (activeTab === 'frontend') {
                            canvasHistory.redo();
                          } else if (activeTab === 'database') {
                            const newTables = schemaHistory.redo();
                            setTables(newTables);
                          }
                        }}
                        disabled={
                          activeTab === 'frontend' 
                            ? !canvasHistory.getHistoryInfo().canRedo
                            : !schemaHistory.getHistoryInfo().canRedo
                        }
                      >
                        <Redo2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                  
                  <Button size="sm" className="btn-ai">
                    <Play className="w-3 h-3 mr-1" />
                    Preview
                  </Button>
                </div>
              </div>
              
              {/* Phase Navigation */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
                <TabsList className="grid w-full grid-cols-8">
                  <TabsTrigger value="frontend" className="text-xs">
                    <Palette className="w-3 h-3 mr-1" />
                    Frontend
                  </TabsTrigger>
                  <TabsTrigger value="ai" className="text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Assistant
                  </TabsTrigger>
                  <TabsTrigger value="database" className="text-xs">
                    <Database className="w-3 h-3 mr-1" />
                    Database
                  </TabsTrigger>
                  <TabsTrigger value="api" className="text-xs">
                    <Server className="w-3 h-3 mr-1" />
                    API
                  </TabsTrigger>
                  <TabsTrigger value="auth" className="text-xs">
                    <Shield className="w-3 h-3 mr-1" />
                    Auth
                  </TabsTrigger>
                  <TabsTrigger value="deploy" className="text-xs">
                    <Cloud className="w-3 h-3 mr-1" />
                    Deploy
                  </TabsTrigger>
                  <TabsTrigger value="project" className="text-xs">
                    <FolderOpen className="w-3 h-3 mr-1" />
                    Projects
                  </TabsTrigger>
                  <TabsTrigger value="export" className="text-xs">
                    <Download className="w-3 h-3 mr-1" />
                    Export
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Frontend Builder Mode Toggle */}
              {activeTab === 'frontend' && (
                <Tabs value={builderMode} onValueChange={(value) => setBuilderMode(value as any)} className="w-full mt-2">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="canvas" className="flex items-center gap-2">
                      <Layers className="w-3 h-3" />
                      Canvas
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="flex items-center gap-2">
                      <Eye className="w-3 h-3" />
                      Preview
                    </TabsTrigger>
                    <TabsTrigger value="code" className="flex items-center gap-2">
                      <Code2 className="w-3 h-3" />
                      Code
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              )}

              {/* Deployment Mode Toggle */}
              {activeTab === 'deploy' && (
                <Tabs value={deploymentMode} onValueChange={(value) => setDeploymentMode(value as any)} className="w-full mt-2">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="export" className="flex items-center gap-2">
                      <Package className="w-3 h-3" />
                      Export ZIP
                    </TabsTrigger>
                    <TabsTrigger value="deploy" className="flex items-center gap-2">
                      <Cloud className="w-3 h-3" />
                      Deploy
                    </TabsTrigger>
                    <TabsTrigger value="env" className="flex items-center gap-2">
                      <Key className="w-3 h-3" />
                      Environment
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              )}

              {/* Project Management Mode Toggle */}
              {activeTab === 'project' && (
                <Tabs value={projectMode} onValueChange={(value) => setProjectMode(value as any)} className="w-full mt-2">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="manage" className="flex items-center gap-2">
                      <FolderOpen className="w-3 h-3" />
                      Manage
                    </TabsTrigger>
                    <TabsTrigger value="history" className="flex items-center gap-2">
                      <History className="w-3 h-3" />
                      History
                    </TabsTrigger>
                    <TabsTrigger value="collaborate" className="flex items-center gap-2">
                      <Users className="w-3 h-3" />
                      Collaborate
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
            </CardHeader>

            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsContent value="frontend" className="m-0">
                  {/* Enhanced Frontend Builder with Canvas */}
                  {builderMode === 'canvas' && (
                    <div className="grid grid-cols-5 h-[600px]">
                      <div className="col-span-3">
                        <CanvasBuilder
                          blocks={canvasHistory.blocks}
                          setBlocks={(blocks) => canvasHistory.updateBlocks(blocks, 'Canvas updated')}
                          selectedBlockId={selectedBlockId}
                          setSelectedBlockId={setSelectedBlockId}
                        />
                      </div>
                      <div className="col-span-2">
                        <CanvasPropertiesPanel
                          selectedBlock={selectedBlock}
                          updateBlock={updateBlock}
                        />
                      </div>
                    </div>
                  )}

                  {builderMode === 'preview' && (
                    <div className="h-[600px]">
                      <LivePreview
                        blocks={canvasHistory.blocks}
                        projectName="My App"
                      />
                    </div>
                  )}

                  {builderMode === 'code' && (
                    <div className="h-[600px]">
                      <CodeExport
                        blocks={canvasHistory.blocks}
                        tables={schemaHistory.tables}
                        endpoints={endpoints}
                        authConfig={authConfig}
                        projectName="My App"
                      />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="ai" className="m-0">
                  {/* AI Features Tab */}
                  <div className="p-4">
                    <div className="flex gap-2 mb-4">
                      <Button
                        variant={aiMode === 'chat' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setAiMode('chat')}
                      >
                        <MessageSquare className="w-3 h-3 mr-1" />
                        AI Chat
                      </Button>
                      <Button
                        variant={aiMode === 'suggestions' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setAiMode('suggestions')}
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        Smart Suggestions
                      </Button>
                      <Button
                        variant={aiMode === 'optimize' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setAiMode('optimize')}
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        Code Optimization
                      </Button>
                    </div>

                    {aiMode === 'chat' && (
                      <AIChatAssistant
                        blocks={canvasHistory.blocks}
                        setBlocks={(blocks) => canvasHistory.updateBlocks(blocks, 'AI assistant changes')}
                        selectedBlockId={selectedBlockId}
                        onUpdateBlock={updateBlock}
                        onAddBlock={addBlock}
                        projectContext={{
                          tables: schemaHistory.tables,
                          endpoints,
                          authConfig
                        }}
                      />
                    )}

                    {aiMode === 'suggestions' && (
                      <SmartComponentSuggestions
                        blocks={canvasHistory.blocks}
                        onAddBlock={addBlock}
                        onUpdateBlocks={(blocks) => canvasHistory.updateBlocks(blocks, 'Smart suggestions applied')}
                        projectContext={{
                          tables: schemaHistory.tables,
                          endpoints,
                          authConfig
                        }}
                      />
                    )}

                    {aiMode === 'optimize' && (
                      <CodeOptimization
                        blocks={canvasHistory.blocks}
                        projectContext={{
                          tables: schemaHistory.tables,
                          endpoints,
                          authConfig
                        }}
                      />
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="database" className="m-0">
                  <div className="h-[600px]">
                    <SchemaDesigner 
                      tables={schemaHistory.tables} 
                      setTables={(tables) => {
                        setTables(tables);
                        schemaHistory.updateTables(tables, 'Schema updated');
                      }}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="api" className="m-0">
                  <div className="h-[600px]">
                    <APIGenerator 
                      tables={schemaHistory.tables}
                      endpoints={endpoints}
                      setEndpoints={setEndpoints}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="auth" className="m-0">
                  <div className="h-[600px]">
                    <AuthGenerator 
                      authConfig={authConfig}
                      setAuthConfig={setAuthConfig}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="deploy" className="m-0">
                  {/* Phase 4: Deployment & ZIP Features */}
                  {deploymentMode === 'export' && (
                    <div className="h-[600px]">
                      <ProjectExport
                        blocks={canvasHistory.blocks}
                        tables={schemaHistory.tables}
                        endpoints={endpoints}
                        authConfig={authConfig}
                        environmentVariables={environmentVariables}
                        projectName="My App"
                      />
                    </div>
                  )}

                  {deploymentMode === 'deploy' && (
                    <div className="h-[600px]">
                      <VercelDeployment
                        blocks={canvasHistory.blocks}
                        tables={schemaHistory.tables}
                        endpoints={endpoints}
                        authConfig={authConfig}
                        environmentVariables={environmentVariables}
                        projectName="My App"
                      />
                    </div>
                  )}

                  {deploymentMode === 'env' && (
                    <div className="h-[600px]">
                      <EnvironmentVariablesPanel
                        environmentVariables={environmentVariables}
                        onVariablesChange={setEnvironmentVariables}
                      />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="project" className="m-0">
                  {/* Phase 5: Collaboration & Project Management Features */}
                  {projectMode === 'manage' && (
                    <div className="h-[600px]">
                      <ProjectManager
                        currentProject={{
                          canvasBlocks: canvasHistory.blocks,
                          tables: schemaHistory.tables,
                          endpoints: endpoints,
                          authConfig: authConfig,
                          environmentVariables: environmentVariables
                        }}
                        onLoadProject={loadProject}
                        onProjectUpdate={handleProjectUpdate}
                      />
                    </div>
                  )}

                  {projectMode === 'history' && (
                    <div className="grid grid-cols-2 gap-4 h-[600px] p-4">
                      <CanvasHistoryPanel
                        canvasHistory={canvasHistory}
                        onUndo={() => canvasHistory.undo()}
                        onRedo={() => canvasHistory.redo()}
                        onGoToState={(index) => {
                          const newBlocks = canvasHistory.getFullHistory()[index]?.data || [];
                          canvasHistory.updateBlocks(newBlocks, 'Navigated to history state');
                        }}
                        onClearHistory={() => canvasHistory.clearHistory()}
                      />
                      <SchemaHistoryPanel
                        schemaHistory={schemaHistory}
                        onUndo={() => {
                          const newTables = schemaHistory.undo();
                          setTables(newTables);
                        }}
                        onRedo={() => {
                          const newTables = schemaHistory.redo();
                          setTables(newTables);
                        }}
                        onGoToState={(index) => {
                          const newTables = schemaHistory.getFullHistory()[index]?.data || [];
                          setTables(newTables);
                        }}
                        onClearHistory={() => {
                          schemaHistory.clearHistory();
                          setTables([]);
                        }}
                      />
                    </div>
                  )}

                  {projectMode === 'collaborate' && (
                    <div className="h-[600px]">
                      <CollaborationPanel
                        projectId="current-project"
                        currentUser={currentUser}
                        onInviteUser={(email, role) => {
                          // Invite user
                        }}
                        onUpdatePermissions={(userId, permissions) => {
                          // Update permissions
                        }}
                      />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="export" className="m-0">
                  <div className="h-[600px]">
                    <CodeExport
                      blocks={canvasHistory.blocks}
                      tables={schemaHistory.tables}
                      endpoints={endpoints}
                      authConfig={authConfig}
                      projectName="My App"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* AI Assistant Chat */}
          <Card className="mt-8 max-w-md mx-auto">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="w-8 h-8 bg-gradient-ai rounded-full flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                AI Assistant
                <div className="ml-auto">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm">
                  <strong>AI:</strong> I've added a hero section to your page. Would you like me to customize the colors to match your brand?
                </p>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg ml-6">
                <p className="text-sm">
                  <strong>You:</strong> Yes, make it purple and blue gradient
                </p>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm">
                  <strong>AI:</strong> Perfect! I've applied a purple-blue gradient. The hero section now matches your brand colors. ✨
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};