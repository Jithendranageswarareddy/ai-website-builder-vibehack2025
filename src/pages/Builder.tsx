import { useState } from "react";
import { BuilderCanvas } from "@/components/builder/BuilderCanvas";
import { ComponentLibrary } from "@/components/builder/ComponentLibrary";
import { PropertiesPanel } from "@/components/builder/PropertiesPanel";
import { BuilderNavigation } from "@/components/builder/BuilderNavigation";
import { AIAssistant } from "@/components/builder/AIAssistant";
import { AuthFormIntegration } from "@/components/builder/AuthFormIntegration";
import { SchemaVisualizer } from "@/components/builder/SchemaVisualizer";
import { AnalyticsLogs } from "@/components/builder/AnalyticsLogs";
import { DeploymentDocumentation } from "@/components/builder/DeploymentDocumentation";
import { RealtimeCollaborationPanel } from "@/components/builder/RealtimeCollaborationPanel";
import { RealtimeLivePreview } from "@/components/builder/RealtimeLivePreview";
import { AIContentPanel } from "@/components/builder/AIContentPanel";
import { TemplateLibrary } from "@/components/builder/TemplateLibrary";
import { SEOPanel } from "@/components/builder/SEOPanel";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Code2, Download, Play, Shield, Database, BarChart3, FileText, Users, Zap, Sparkles, Palette, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeAnalytics } from "@/hooks/use-realtime-analytics";

export interface Component {
  id: string;
  type: string;
  content: string;
  style: Record<string, any>;
  position: { x: number; y: number };
}

const Builder = () => {
  const [components, setComponents] = useState<Component[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [authMode, setAuthMode] = useState<'signup' | 'login' | 'reset'>('login');
  const [activeView, setActiveView] = useState<'canvas' | 'preview' | 'collaboration' | 'ai-content' | 'templates' | 'seo'>('canvas');
  const { toast } = useToast();
  
  // Real-time analytics integration
  const { 
    logProjectSave, 
    logProjectLoad, 
    logBuild, 
    simulateAPICall 
  } = useRealtimeAnalytics();

  const addComponent = (type: string) => {
    const newComponent: Component = {
      id: `${type}-${Date.now()}`,
      type,
      content: getDefaultContent(type),
      style: getDefaultStyle(type),
      position: { x: 50, y: 50 + components.length * 80 }
    };
    
    setComponents([...components, newComponent]);
    setSelectedComponent(newComponent);
    
    // Log real-time activity
    simulateAPICall('/api/components/add', 'POST');
    
    toast({
      title: "Component added",
      description: `${type} component has been added to your canvas.`
    });
  };

  const updateComponent = (id: string, updates: Partial<Component>) => {
    setComponents(components.map(comp => 
      comp.id === id ? { ...comp, ...updates } : comp
    ));
    if (selectedComponent?.id === id) {
      setSelectedComponent({ ...selectedComponent, ...updates });
    }
    
    // Log real-time activity
    simulateAPICall('/api/components/update', 'PUT');
  };

  const deleteComponent = (id: string) => {
    setComponents(components.filter(comp => comp.id !== id));
    if (selectedComponent?.id === id) {
      setSelectedComponent(null);
    }
  };

  const exportCode = () => {
    const code = generateReactCode(components);
    navigator.clipboard.writeText(code);
    
    // Log real-time activity
    logBuild();
    
    toast({
      title: "Code copied!",
      description: "React component code has been copied to your clipboard."
    });
  };

  const previewApp = () => {
    setIsPreviewMode(!isPreviewMode);
    toast({
      title: isPreviewMode ? "Edit mode" : "Preview mode",
      description: isPreviewMode ? "You can now edit components" : "Viewing your app as users will see it"
    });
  };

  return (
    <div className="h-screen flex flex-col bg-builder-bg text-builder-text">
      <BuilderNavigation
        onPreview={previewApp}
        onExport={exportCode}
        isPreviewMode={isPreviewMode}
        onToggleAI={() => setShowAI(!showAI)}
        showAI={showAI}
      />
      
      {/* Phase 6 Features Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 mr-4">Phase 6 MVP Features:</span>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Auth Forms
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>Authentication Form Integration</DialogTitle>
              </DialogHeader>
              <AuthFormIntegration 
                mode={authMode}
                onModeChange={setAuthMode}
              />
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Database className="w-3 h-3" />
                Schema Visualizer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>Schema & Component Relationships</DialogTitle>
              </DialogHeader>
              <SchemaVisualizer 
                tables={[
                  { id: 'users', name: 'users', columns: ['id', 'email', 'password', 'created_at'] },
                  { id: 'projects', name: 'projects', columns: ['id', 'user_id', 'name', 'data'] },
                  { id: 'components', name: 'components', columns: ['id', 'project_id', 'type', 'props'] }
                ]}
                blocks={components.map(comp => ({
                  id: comp.id,
                  type: comp.type,
                  name: comp.content.substring(0, 30),
                  position: comp.position
                }))}
              />
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <BarChart3 className="w-3 h-3" />
                Analytics
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>Analytics & API Logs</DialogTitle>
              </DialogHeader>
              <AnalyticsLogs />
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                Documentation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>Deployment Documentation Generator</DialogTitle>
              </DialogHeader>
              <DeploymentDocumentation />
            </DialogContent>
          </Dialog>

          <div className="ml-auto flex gap-2">
            <Button
              variant={activeView === 'ai-content' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveView(activeView === 'ai-content' ? 'canvas' : 'ai-content')}
            >
              <Sparkles className="w-3 h-3 mr-1" />
              AI Content
            </Button>
            <Button
              variant={activeView === 'templates' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveView(activeView === 'templates' ? 'canvas' : 'templates')}
            >
              <Palette className="w-3 h-3 mr-1" />
              Templates
            </Button>
            <Button
              variant={activeView === 'seo' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveView(activeView === 'seo' ? 'canvas' : 'seo')}
            >
              <Search className="w-3 h-3 mr-1" />
              SEO
            </Button>
            <Button
              variant={activeView === 'collaboration' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveView(activeView === 'collaboration' ? 'canvas' : 'collaboration')}
            >
              <Users className="w-3 h-3 mr-1" />
              Collaboration
            </Button>
            <Button
              variant={activeView === 'preview' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveView(activeView === 'preview' ? 'canvas' : 'preview')}
            >
              <Zap className="w-3 h-3 mr-1" />
              Live Preview
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        <ComponentLibrary onAddComponent={addComponent} />
        
        <div className="flex-1 flex flex-col">
          <div className="flex-1 relative">
            {activeView === 'canvas' && (
              <BuilderCanvas
                components={components}
                selectedComponent={selectedComponent}
                onSelectComponent={setSelectedComponent}
                onUpdateComponent={updateComponent}
                onDeleteComponent={deleteComponent}
                isPreviewMode={isPreviewMode}
              />
            )}
            
            {activeView === 'preview' && (
              <RealtimeLivePreview
                components={components}
                selectedComponent={selectedComponent}
                onComponentUpdate={updateComponent}
              />
            )}
            
            {activeView === 'collaboration' && (
              <div className="h-full flex">
                <div className="flex-1">
                  <BuilderCanvas
                    components={components}
                    selectedComponent={selectedComponent}
                    onSelectComponent={setSelectedComponent}
                    onUpdateComponent={updateComponent}
                    onDeleteComponent={deleteComponent}
                    isPreviewMode={isPreviewMode}
                  />
                </div>
                <div className="w-80 border-l border-gray-200">
                  <RealtimeCollaborationPanel
                    onComponentUpdate={updateComponent}
                    onComponentAdd={addComponent}
                    currentUser="You"
                  />
                </div>
              </div>
            )}

            {activeView === 'ai-content' && (
              <div className="h-full flex">
                <div className="flex-1">
                  <BuilderCanvas
                    components={components}
                    selectedComponent={selectedComponent}
                    onSelectComponent={setSelectedComponent}
                    onUpdateComponent={updateComponent}
                    onDeleteComponent={deleteComponent}
                    isPreviewMode={isPreviewMode}
                  />
                </div>
                <div className="w-96 border-l border-gray-200">
                  <AIContentPanel
                    onContentGenerated={(content) => {
                      if (selectedComponent) {
                        updateComponent(selectedComponent.id, {
                          content: selectedComponent.content.includes('title') 
                            ? selectedComponent.content.replace(/title: "[^"]*"/, `title: "${content}"`)
                            : content
                        });
                        toast({
                          title: "Content Applied",
                          description: "AI-generated content has been applied to your component."
                        });
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {activeView === 'templates' && (
              <div className="h-full flex">
                <div className="flex-1">
                  <TemplateLibrary
                    onTemplateSelect={(template) => {
                      // Apply template components
                      const newComponents = template.components.map((comp, index) => ({
                        id: `${comp.type}-${Date.now()}-${index}`,
                        type: comp.type,
                        content: comp.props.title || comp.props.subtitle || `${comp.type} content`,
                        style: comp.props,
                        position: { x: 50, y: 50 + index * 120 }
                      }));
                      
                      setComponents(newComponents as Component[]);
                      toast({
                        title: "Template Applied",
                        description: `${template.name} template has been loaded successfully.`
                      });
                      setActiveView('canvas');
                    }}
                  />
                </div>
              </div>
            )}

            {activeView === 'seo' && (
              <div className="h-full flex">
                <div className="flex-1">
                  <BuilderCanvas
                    components={components}
                    selectedComponent={selectedComponent}
                    onSelectComponent={setSelectedComponent}
                    onUpdateComponent={updateComponent}
                    onDeleteComponent={deleteComponent}
                    isPreviewMode={isPreviewMode}
                  />
                </div>
                <div className="w-96 border-l border-gray-200">
                  <SEOPanel
                    content={components.map(c => c.content).join(' ')}
                    onOptimize={(optimizations) => {
                      // Apply SEO optimizations to selected component or all components
                      if (selectedComponent && optimizations.title) {
                        updateComponent(selectedComponent.id, {
                          content: optimizations.title
                        });
                      }
                      toast({
                        title: "SEO Optimized",
                        description: "SEO improvements have been applied to your content."
                      });
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          
          {showAI && (
            <div className="h-80 border-t border-builder-border">
              <AIAssistant
                components={components}
                onUpdateComponent={updateComponent}
                onAddComponent={addComponent}
              />
            </div>
          )}
        </div>
        
        {activeView !== 'collaboration' && (
          <PropertiesPanel
            selectedComponent={selectedComponent}
            onUpdateComponent={(updates) => 
              selectedComponent && updateComponent(selectedComponent.id, updates)
            }
          />
        )}
      </div>
    </div>
  );
};

const getDefaultContent = (type: string): string => {
  const defaults: Record<string, string> = {
    heading: "Your Heading Here",
    text: "Your text content goes here. Click to edit this text.",
    button: "Click Me",
    image: "https://via.placeholder.com/300x200?text=Image",
    card: "Card Title"
  };
  return defaults[type] || "Content";
};

const getDefaultStyle = (type: string): Record<string, any> => {
  const defaults: Record<string, any> = {
    heading: { fontSize: "2rem", fontWeight: "bold", color: "#333" },
    text: { fontSize: "1rem", color: "#666", lineHeight: "1.5" },
    button: { 
      backgroundColor: "#8b5cf6", 
      color: "white", 
      padding: "12px 24px", 
      borderRadius: "8px",
      border: "none",
      cursor: "pointer"
    },
    image: { width: "300px", height: "200px", objectFit: "cover" },
    card: { 
      backgroundColor: "white", 
      padding: "24px", 
      borderRadius: "12px", 
      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      border: "1px solid #e2e8f0"
    }
  };
  return defaults[type] || {};
};

const generateReactCode = (components: Component[]): string => {
  const componentCode = components.map(comp => {
    const styleString = Object.entries(comp.style)
      .map(([key, value]) => `${key}: "${value}"`)
      .join(", ");
    
    switch (comp.type) {
      case "heading":
        return `<h1 style={{${styleString}}}>${comp.content}</h1>`;
      case "text":
        return `<p style={{${styleString}}}>${comp.content}</p>`;
      case "button":
        return `<button style={{${styleString}}}>${comp.content}</button>`;
      case "image":
        return `<img src="${comp.content}" style={{${styleString}}} alt="Generated image" />`;
      case "card":
        return `<div style={{${styleString}}}>
  <h3>${comp.content}</h3>
  <p>Card content goes here...</p>
</div>`;
      default:
        return `<div style={{${styleString}}}>${comp.content}</div>`;
    }
  }).join("\n    ");

  return `import React from 'react';

const GeneratedApp = () => {
  return (
    <div style={{ padding: "20px", minHeight: "100vh" }}>
      ${componentCode}
    </div>
  );
};

export default GeneratedApp;`;
};

export default Builder;