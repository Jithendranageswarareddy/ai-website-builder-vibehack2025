import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRealtimeLivePreview } from "@/hooks/use-realtime-live-preview";
import { Component } from "@/pages/Builder";
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  Eye, 
  EyeOff, 
  RefreshCw,
  Zap,
  Download,
  Play,
  Pause,
  RotateCcw
} from "lucide-react";

interface RealtimeLivePreviewProps {
  components: Component[];
  selectedComponent: Component | null;
  onComponentUpdate?: (id: string, updates: Partial<Component>) => void;
  className?: string;
}

export const RealtimeLivePreview = ({
  components,
  selectedComponent,
  onComponentUpdate,
  className = ""
}: RealtimeLivePreviewProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');

  const {
    previewState,
    isUpdating,
    pendingUpdates,
    updateComponent,
    syncComponents,
    setPreviewMode,
    toggleLivePreview,
    generateLiveCSS,
    getResponsiveStyles,
    exportPreview
  } = useRealtimeLivePreview(components);

  // Sync components when they change
  useEffect(() => {
    syncComponents(components);
  }, [components, syncComponents]);

  // Update last update time
  useEffect(() => {
    setLastUpdateTime(new Date().toLocaleTimeString());
  }, [previewState.lastUpdate]);

  // Generate HTML for iframe
  const generatePreviewHTML = () => {
    const css = generateLiveCSS();
    const responsiveStyles = getResponsiveStyles();
    
    const componentsHTML = previewState.components.map(component => {
      const isSelected = selectedComponent?.id === component.id;
      const selectedClass = isSelected ? 'preview-selected' : '';
      
      switch (component.type) {
        case 'heading':
          return `<h1 id="${component.id}" class="${selectedClass}" style="${convertStyleToCSS(component.style)}">${component.content}</h1>`;
        case 'text':
          return `<p id="${component.id}" class="${selectedClass}" style="${convertStyleToCSS(component.style)}">${component.content}</p>`;
        case 'button':
          return `<button id="${component.id}" class="${selectedClass}" style="${convertStyleToCSS(component.style)}">${component.content}</button>`;
        case 'image':
          return `<img id="${component.id}" class="${selectedClass}" src="${component.content}" style="${convertStyleToCSS(component.style)}" alt="Preview image" />`;
        case 'card':
          return `
            <div id="${component.id}" class="${selectedClass}" style="${convertStyleToCSS(component.style)}">
              <h3>${component.content}</h3>
              <p>This is a sample card component with placeholder content.</p>
            </div>
          `;
        default:
          return `<div id="${component.id}" class="${selectedClass}" style="${convertStyleToCSS(component.style)}">${component.content}</div>`;
      }
    }).join('\n');

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Live Preview</title>
        <style>
          body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #ffffff;
            min-height: 100vh;
            transition: all 0.3s ease;
          }
          
          .preview-selected {
            outline: 2px solid #8b5cf6 !important;
            outline-offset: 2px;
            animation: pulse 2s infinite;
          }
          
          @keyframes pulse {
            0%, 100% { outline-color: #8b5cf6; }
            50% { outline-color: #a78bfa; }
          }
          
          .updating {
            transition: all 0.2s ease;
            transform: scale(1.02);
          }
          
          /* Real-time update indicator */
          .realtime-indicator {
            position: fixed;
            top: 10px;
            right: 10px;
            background: #10b981;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 1000;
            display: ${isUpdating ? 'block' : 'none'};
          }
          
          /* Responsive styles */
          @media (max-width: 768px) {
            body { padding: 10px; }
          }
          
          /* Custom styles */
          ${css}
        </style>
      </head>
      <body>
        <div class="realtime-indicator">
          🔄 Updating...
        </div>
        
        <div id="preview-container" style="${convertStyleToCSS(responsiveStyles)}">
          ${componentsHTML}
        </div>
        
        <script>
          // Handle component interactions
          document.addEventListener('click', function(e) {
            if (e.target.id) {
              parent.postMessage({
                type: 'component_select',
                componentId: e.target.id
              }, '*');
            }
          });
          
          // Auto-refresh on updates
          let lastUpdate = ${previewState.lastUpdate};
          setInterval(() => {
            if (${previewState.lastUpdate} > lastUpdate) {
              lastUpdate = ${previewState.lastUpdate};
              // Trigger re-render effect
              document.body.style.opacity = '0.95';
              setTimeout(() => {
                document.body.style.opacity = '1';
              }, 100);
            }
          }, 100);
          
          // Smooth scroll to selected component
          ${selectedComponent ? `
            setTimeout(() => {
              const element = document.getElementById('${selectedComponent.id}');
              if (element) {
                element.scrollIntoView({ 
                  behavior: 'smooth', 
                  block: 'center' 
                });
              }
            }, 100);
          ` : ''}
        </script>
      </body>
      </html>
    `;
  };

  // Convert style object to CSS string
  const convertStyleToCSS = (style: Record<string, any>) => {
    return Object.entries(style)
      .map(([key, value]) => {
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `${cssKey}: ${value}`;
      })
      .join('; ');
  };

  // Update iframe content
  const updateIframe = () => {
    if (!iframeRef.current) return;
    
    setIsLoading(true);
    const html = generatePreviewHTML();
    
    const iframe = iframeRef.current;
    const doc = iframe.contentDocument;
    
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
    }
    
    setTimeout(() => setIsLoading(false), 200);
  };

  // Update iframe when preview state changes
  useEffect(() => {
    updateIframe();
  }, [previewState, selectedComponent, isUpdating]);

  // Handle iframe messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'component_select' && onComponentUpdate) {
        const component = components.find(c => c.id === event.data.componentId);
        if (component && onComponentUpdate) {
          // Simulate component selection feedback
          onComponentUpdate(component.id, { 
            style: { 
              ...component.style, 
              outline: '2px solid #8b5cf6' 
            } 
          });
          
          // Remove outline after a short delay
          setTimeout(() => {
            onComponentUpdate(component.id, { 
              style: { 
                ...component.style, 
                outline: 'none' 
              } 
            });
          }, 1000);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [components, onComponentUpdate]);

  const downloadPreview = () => {
    const html = generatePreviewHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `preview-${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className={`h-full flex flex-col ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            Live Preview
            {isUpdating && (
              <Badge variant="secondary" className="animate-pulse">
                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                Updating
              </Badge>
            )}
            {pendingUpdates > 0 && (
              <Badge variant="outline">
                {pendingUpdates} pending
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Last updated: {lastUpdateTime}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={toggleLivePreview}
            >
              {previewState.isLive ? (
                <>
                  <Pause className="w-3 h-3 mr-1" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 mr-1" />
                  Resume
                </>
              )}
            </Button>
          </div>
        </CardTitle>

        {/* Device preview controls */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={previewState.previewMode === 'desktop' ? 'default' : 'outline'}
              onClick={() => setPreviewMode('desktop')}
            >
              <Monitor className="w-3 h-3 mr-1" />
              Desktop
            </Button>
            <Button
              size="sm"
              variant={previewState.previewMode === 'tablet' ? 'default' : 'outline'}
              onClick={() => setPreviewMode('tablet')}
            >
              <Tablet className="w-3 h-3 mr-1" />
              Tablet
            </Button>
            <Button
              size="sm"
              variant={previewState.previewMode === 'mobile' ? 'default' : 'outline'}
              onClick={() => setPreviewMode('mobile')}
            >
              <Smartphone className="w-3 h-3 mr-1" />
              Mobile
            </Button>
          </div>

          <div className="flex gap-1">
            <Button size="sm" variant="outline" onClick={updateIframe}>
              <RefreshCw className="w-3 h-3 mr-1" />
              Refresh
            </Button>
            <Button size="sm" variant="outline" onClick={downloadPreview}>
              <Download className="w-3 h-3 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 relative">
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-sm">Updating preview...</span>
            </div>
          </div>
        )}

        {/* Real-time status indicators */}
        <div className="absolute top-2 left-2 z-20 flex gap-2">
          {previewState.isLive && (
            <Badge variant="default" className="bg-green-500">
              <Circle className="w-2 h-2 mr-1 fill-current animate-pulse" />
              Live
            </Badge>
          )}
          {pendingUpdates > 0 && (
            <Badge variant="secondary">
              <Zap className="w-3 h-3 mr-1" />
              {pendingUpdates} updates
            </Badge>
          )}
        </div>

        {/* Preview iframe */}
        <div className="h-full bg-gray-100 overflow-auto">
          <div 
            className="mx-auto bg-white shadow-lg transition-all duration-300"
            style={getResponsiveStyles()}
          >
            <iframe
              ref={iframeRef}
              className="w-full h-full border-0"
              style={{ minHeight: '600px' }}
              title="Live Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>

        {/* Empty state */}
        {components.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center text-muted-foreground">
              <EyeOff className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No components to preview</p>
              <p className="text-sm">Drag components from the library to see them here</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
