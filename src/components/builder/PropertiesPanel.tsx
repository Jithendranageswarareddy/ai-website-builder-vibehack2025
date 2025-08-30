import { Component } from "@/pages/Builder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Settings, Palette, Code2, Type } from "lucide-react";

interface PropertiesPanelProps {
  selectedComponent: Component | null;
  onUpdateComponent: (updates: Partial<Component>) => void;
}

export const PropertiesPanel = ({ selectedComponent, onUpdateComponent }: PropertiesPanelProps) => {
  if (!selectedComponent) {
    return (
      <div className="w-80 bg-builder-panel border-l border-builder-border p-6">
        <div className="text-center text-builder-text/50">
          <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No Selection</h3>
          <p className="text-sm">Select a component to edit its properties</p>
        </div>
      </div>
    );
  }

  const updateContent = (content: string) => {
    onUpdateComponent({ content });
  };

  const updateStyle = (styleKey: string, value: string) => {
    onUpdateComponent({
      style: { ...selectedComponent.style, [styleKey]: value }
    });
  };

  return (
    <div className="w-80 bg-builder-panel border-l border-builder-border flex flex-col">
      <div className="p-4 border-b border-builder-border">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="bg-primary/20 text-primary">
            {selectedComponent.type}
          </Badge>
          <span className="text-sm text-builder-text/70">#{selectedComponent.id.split('-')[1]}</span>
        </div>
        <h2 className="font-semibold text-builder-text">Component Properties</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-3 m-4 mb-0">
            <TabsTrigger value="content" className="text-xs">
              <Type className="w-3 h-3 mr-1" />
              Content
            </TabsTrigger>
            <TabsTrigger value="style" className="text-xs">
              <Palette className="w-3 h-3 mr-1" />
              Style
            </TabsTrigger>
            <TabsTrigger value="advanced" className="text-xs">
              <Code2 className="w-3 h-3 mr-1" />
              Code
            </TabsTrigger>
          </TabsList>

          <div className="p-4">
            <TabsContent value="content" className="mt-0 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content" className="text-sm font-medium text-builder-text">
                  {selectedComponent.type === 'image' ? 'Image URL' : 'Text Content'}
                </Label>
                <Input
                  id="content"
                  value={selectedComponent.content}
                  onChange={(e) => updateContent(e.target.value)}
                  placeholder={selectedComponent.type === 'image' ? 'Enter image URL...' : 'Enter text...'}
                  className="bg-builder-bg border-builder-border text-builder-text"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-builder-text">X Position</Label>
                  <Input
                    type="number"
                    value={selectedComponent.position.x}
                    onChange={(e) => onUpdateComponent({ 
                      position: { ...selectedComponent.position, x: parseInt(e.target.value) || 0 }
                    })}
                    className="bg-builder-bg border-builder-border text-builder-text"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-builder-text">Y Position</Label>
                  <Input
                    type="number"
                    value={selectedComponent.position.y}
                    onChange={(e) => onUpdateComponent({ 
                      position: { ...selectedComponent.position, y: parseInt(e.target.value) || 0 }
                    })}
                    className="bg-builder-bg border-builder-border text-builder-text"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="style" className="mt-0 space-y-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-builder-text">Font Size</Label>
                  <Input
                    value={selectedComponent.style.fontSize || ''}
                    onChange={(e) => updateStyle('fontSize', e.target.value)}
                    placeholder="e.g., 16px, 1rem"
                    className="bg-builder-bg border-builder-border text-builder-text"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-builder-text">Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={selectedComponent.style.color || '#000000'}
                      onChange={(e) => updateStyle('color', e.target.value)}
                      className="w-12 h-9 p-1 bg-builder-bg border-builder-border"
                    />
                    <Input
                      value={selectedComponent.style.color || ''}
                      onChange={(e) => updateStyle('color', e.target.value)}
                      placeholder="#000000"
                      className="flex-1 bg-builder-bg border-builder-border text-builder-text"
                    />
                  </div>
                </div>
                
                {selectedComponent.type === 'button' && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-builder-text">Background</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={selectedComponent.style.backgroundColor || '#8b5cf6'}
                        onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                        className="w-12 h-9 p-1 bg-builder-bg border-builder-border"
                      />
                      <Input
                        value={selectedComponent.style.backgroundColor || ''}
                        onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                        placeholder="#8b5cf6"
                        className="flex-1 bg-builder-bg border-builder-border text-builder-text"
                      />
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-builder-text">Border Radius</Label>
                  <Input
                    value={selectedComponent.style.borderRadius || ''}
                    onChange={(e) => updateStyle('borderRadius', e.target.value)}
                    placeholder="e.g., 8px, 1rem"
                    className="bg-builder-bg border-builder-border text-builder-text"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-builder-text">Padding</Label>
                  <Input
                    value={selectedComponent.style.padding || ''}
                    onChange={(e) => updateStyle('padding', e.target.value)}
                    placeholder="e.g., 12px, 1rem"
                    className="bg-builder-bg border-builder-border text-builder-text"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="mt-0 space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-builder-text">CSS Classes</Label>
                <Input
                  placeholder="Enter CSS classes..."
                  className="bg-builder-bg border-builder-border text-builder-text"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-builder-text">Custom CSS</Label>
                <textarea
                  placeholder="Enter custom CSS properties..."
                  className="w-full h-24 px-3 py-2 text-sm bg-builder-bg border border-builder-border rounded-md text-builder-text placeholder:text-builder-text/50 resize-none"
                />
              </div>
              
              <Button size="sm" className="w-full btn-ai">
                AI Optimize Styles
              </Button>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};