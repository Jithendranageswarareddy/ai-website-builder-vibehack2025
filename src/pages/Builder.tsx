import { useState } from "react";
import { BuilderCanvas } from "@/components/builder/BuilderCanvas";
import { ComponentLibrary } from "@/components/builder/ComponentLibrary";
import { PropertiesPanel } from "@/components/builder/PropertiesPanel";
import { BuilderNavigation } from "@/components/builder/BuilderNavigation";
import { AIAssistant } from "@/components/builder/AIAssistant";
import { Button } from "@/components/ui/button";
import { Eye, Code2, Download, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

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
      
      <div className="flex-1 flex overflow-hidden">
        <ComponentLibrary onAddComponent={addComponent} />
        
        <div className="flex-1 flex flex-col">
          <div className="flex-1 relative">
            <BuilderCanvas
              components={components}
              selectedComponent={selectedComponent}
              onSelectComponent={setSelectedComponent}
              onUpdateComponent={updateComponent}
              onDeleteComponent={deleteComponent}
              isPreviewMode={isPreviewMode}
            />
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
        
        <PropertiesPanel
          selectedComponent={selectedComponent}
          onUpdateComponent={(updates) => 
            selectedComponent && updateComponent(selectedComponent.id, updates)
          }
        />
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