import { Component } from "@/pages/Builder";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Move, Copy } from "lucide-react";
import { useState, useRef } from "react";

interface BuilderCanvasProps {
  components: Component[];
  selectedComponent: Component | null;
  onSelectComponent: (component: Component | null) => void;
  onUpdateComponent: (id: string, updates: Partial<Component>) => void;
  onDeleteComponent: (id: string) => void;
  isPreviewMode: boolean;
}

export const BuilderCanvas = ({
  components,
  selectedComponent,
  onSelectComponent,
  onUpdateComponent,
  onDeleteComponent,
  isPreviewMode
}: BuilderCanvasProps) => {
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    dragOffset: { x: number; y: number };
  }>({ isDragging: false, dragOffset: { x: 0, y: 0 } });
  
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent, component: Component) => {
    if (isPreviewMode) return;
    
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setDragState({
      isDragging: true,
      dragOffset: {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
    });
    onSelectComponent(component);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState.isDragging || !selectedComponent || isPreviewMode) return;

    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    const newX = e.clientX - canvasRect.left - dragState.dragOffset.x;
    const newY = e.clientY - canvasRect.top - dragState.dragOffset.y;

    onUpdateComponent(selectedComponent.id, {
      position: { 
        x: Math.max(0, newX), 
        y: Math.max(0, newY) 
      }
    });
  };

  const handleMouseUp = () => {
    setDragState({ isDragging: false, dragOffset: { x: 0, y: 0 } });
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onSelectComponent(null);
    }
  };

  const renderComponent = (component: Component) => {
    const isSelected = selectedComponent?.id === component.id;
    
    const componentStyle = {
      ...component.style,
      position: 'absolute' as const,
      left: component.position.x,
      top: component.position.y,
      cursor: isPreviewMode ? 'default' : 'move'
    };

    let content;
    switch (component.type) {
      case "heading":
        content = <h1 style={componentStyle}>{component.content}</h1>;
        break;
      case "text":
        content = <p style={componentStyle}>{component.content}</p>;
        break;
      case "button":
        content = <button style={componentStyle}>{component.content}</button>;
        break;
      case "image":
        content = (
          <img 
            src={component.content} 
            style={componentStyle} 
            alt="Component image"
            draggable={false}
          />
        );
        break;
      case "card":
        content = (
          <div style={componentStyle}>
            <h3 style={{ margin: 0, marginBottom: '12px', fontSize: '1.25rem', fontWeight: 'bold' }}>
              {component.content}
            </h3>
            <p style={{ margin: 0, color: '#666', lineHeight: 1.5 }}>
              This is a card component. You can customize its content and styling.
            </p>
          </div>
        );
        break;
      default:
        content = <div style={componentStyle}>{component.content}</div>;
    }

    return (
      <div
        key={component.id}
        className={`group ${!isPreviewMode ? 'hover:ring-2 hover:ring-primary/50' : ''} ${
          isSelected && !isPreviewMode ? 'ring-2 ring-primary' : ''
        }`}
        onMouseDown={(e) => handleMouseDown(e, component)}
        style={{
          position: 'absolute',
          left: component.position.x,
          top: component.position.y
        }}
      >
        {content}
        
        {isSelected && !isPreviewMode && (
          <div className="absolute -top-8 left-0 flex gap-1 bg-builder-panel border border-builder-border rounded px-2 py-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 hover:bg-primary/20"
              onClick={() => {
                const newComponent = { 
                  ...component, 
                  id: `${component.type}-${Date.now()}`,
                  position: { 
                    x: component.position.x + 20, 
                    y: component.position.y + 20 
                  }
                };
                // Note: This would need to be passed as a prop in a real implementation
              }}
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 hover:bg-destructive/20"
              onClick={() => onDeleteComponent(component.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 relative overflow-auto bg-white">
      <div
        ref={canvasRef}
        className="relative min-h-full w-full"
        style={{ 
          backgroundImage: isPreviewMode ? 'none' : 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)',
          backgroundSize: isPreviewMode ? 'auto' : '20px 20px'
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleCanvasClick}
      >
        {components.length === 0 && !isPreviewMode && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center">
                <Move className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium mb-2">Start Building</h3>
              <p className="text-sm">Drag components from the library to start building your app</p>
            </div>
          </div>
        )}
        
        {components.map(renderComponent)}
      </div>
      
      {!isPreviewMode && (
        <div className="absolute bottom-4 left-4 bg-builder-panel border border-builder-border rounded-lg px-3 py-2 text-sm text-builder-text">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Canvas ({components.length} components)
          </div>
        </div>
      )}
    </div>
  );
};