import { useState, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Copy, Move, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface CanvasBlock {
  id: string;
  type: 'hero' | 'form' | 'table' | 'auth-form' | 'text' | 'image' | 'button';
  x: number;
  y: number;
  width: number;
  height: number;
  properties: {
    title?: string;
    subtitle?: string;
    placeholder?: string;
    buttonText?: string;
    backgroundColor?: string;
    textColor?: string;
    fontSize?: string;
    borderRadius?: string;
    shadow?: string;
    textAlign?: string;
    padding?: string;
    fields?: Array<{
      name: string;
      type: 'text' | 'email' | 'password' | 'number' | 'textarea';
      label: string;
      required: boolean;
    }>;
    columns?: Array<{
      key: string;
      title: string;
      type: 'text' | 'number' | 'date';
    }>;
    authType?: 'login' | 'register' | 'reset';
  };
}

interface CanvasBuilderProps {
  blocks: CanvasBlock[];
  setBlocks: (blocks: CanvasBlock[]) => void;
  selectedBlockId: string | null;
  setSelectedBlockId: (id: string | null) => void;
}

export const CanvasBuilder = ({ 
  blocks, 
  setBlocks, 
  selectedBlockId, 
  setSelectedBlockId 
}: CanvasBuilderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleDragStart = useCallback((e: React.DragEvent, blockType: string) => {
    e.dataTransfer.setData('blockType', blockType);
    e.dataTransfer.effectAllowed = 'copy';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const blockType = e.dataTransfer.getData('blockType') as CanvasBlock['type'];
    
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newBlock: CanvasBlock = {
      id: `block-${Date.now()}`,
      type: blockType,
      x: Math.max(0, x - 100),
      y: Math.max(0, y - 50),
      width: getDefaultWidth(blockType),
      height: getDefaultHeight(blockType),
      properties: getDefaultProperties(blockType)
    };

    setBlocks([...blocks, newBlock]);
    setSelectedBlockId(newBlock.id);
    
    toast({
      title: "Block Added",
      description: `${blockType.charAt(0).toUpperCase() + blockType.slice(1)} block added to canvas`
    });
  }, [blocks, setBlocks, setSelectedBlockId, toast]);

  const handleBlockMouseDown = useCallback((e: React.MouseEvent, blockId: string) => {
    e.stopPropagation();
    setSelectedBlockId(blockId);
    setIsDragging(true);
    
    const block = blocks.find(b => b.id === blockId);
    if (block) {
      setDragOffset({
        x: e.clientX - block.x,
        y: e.clientY - block.y
      });
    }
  }, [blocks, setSelectedBlockId]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !selectedBlockId) return;
    
    const newBlocks = blocks.map(block => 
      block.id === selectedBlockId 
        ? {
            ...block,
            x: Math.max(0, e.clientX - dragOffset.x),
            y: Math.max(0, e.clientY - dragOffset.y)
          }
        : block
    );
    
    setBlocks(newBlocks);
  }, [isDragging, selectedBlockId, blocks, dragOffset, setBlocks]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedBlockId(null);
    }
  }, [setSelectedBlockId]);

  const deleteBlock = useCallback((blockId: string) => {
    setBlocks(blocks.filter(b => b.id !== blockId));
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
    toast({
      title: "Block Deleted",
      description: "Block has been removed from canvas"
    });
  }, [blocks, selectedBlockId, setBlocks, setSelectedBlockId, toast]);

  const duplicateBlock = useCallback((blockId: string) => {
    const blockToDuplicate = blocks.find(b => b.id === blockId);
    if (blockToDuplicate) {
      const newBlock: CanvasBlock = {
        ...blockToDuplicate,
        id: `block-${Date.now()}`,
        x: blockToDuplicate.x + 20,
        y: blockToDuplicate.y + 20
      };
      setBlocks([...blocks, newBlock]);
      setSelectedBlockId(newBlock.id);
      toast({
        title: "Block Duplicated",
        description: "Block has been duplicated successfully"
      });
    }
  }, [blocks, setBlocks, setSelectedBlockId, toast]);

  return (
    <div className="flex h-full">
      {/* Component Library */}
      <div className="w-64 bg-muted/30 border-r border-border/50 p-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full"></div>
          Components
        </h3>
        
        <div className="space-y-2">
          {[
            { type: 'hero', label: 'Hero Section', icon: '🎯', desc: 'Landing section with title and CTA' },
            { type: 'form', label: 'Form', icon: '📝', desc: 'Custom form with fields' },
            { type: 'table', label: 'Data Table', icon: '📊', desc: 'Display data in table format' },
            { type: 'auth-form', label: 'Auth Form', icon: '🔐', desc: 'Login/Register forms' },
            { type: 'text', label: 'Text Block', icon: '📄', desc: 'Rich text content' },
            { type: 'button', label: 'Button', icon: '🔘', desc: 'Call-to-action button' }
          ].map((component) => (
            <Card 
              key={component.type}
              className="cursor-grab active:cursor-grabbing hover:bg-primary/5 transition-colors"
              draggable
              onDragStart={(e) => handleDragStart(e, component.type as CanvasBlock['type'])}
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{component.icon}</span>
                  <span className="font-medium text-sm">{component.label}</span>
                </div>
                <p className="text-xs text-muted-foreground">{component.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
          <p className="text-xs text-muted-foreground mb-2">💡 Tip</p>
          <p className="text-xs">Drag components onto the canvas to build your page</p>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative">
        <div 
          ref={canvasRef}
          className="w-full h-full bg-white relative overflow-auto cursor-crosshair"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onClick={handleCanvasClick}
          style={{ 
            backgroundImage: `
              radial-gradient(circle, #e5e7eb 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        >
          {/* Canvas Blocks */}
          {blocks.map((block) => (
            <div
              key={block.id}
              className={`absolute border-2 rounded-lg overflow-hidden group transition-all ${
                selectedBlockId === block.id 
                  ? 'border-primary shadow-lg shadow-primary/20 z-10' 
                  : 'border-dashed border-gray-300 hover:border-primary/50'
              }`}
              style={{
                left: block.x,
                top: block.y,
                width: block.width,
                height: block.height
              }}
              onMouseDown={(e) => handleBlockMouseDown(e, block.id)}
            >
              {/* Block Content */}
              <div className="w-full h-full p-4 bg-white">
                <BlockRenderer block={block} />
              </div>

              {/* Block Controls */}
              {selectedBlockId === block.id && (
                <div className="absolute -top-10 left-0 flex items-center gap-1 bg-primary text-white px-2 py-1 rounded text-xs">
                  <Badge variant="secondary" className="text-xs bg-white/20">
                    {block.type}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 hover:bg-white/20"
                    onClick={() => duplicateBlock(block.id)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 hover:bg-white/20"
                    onClick={() => deleteBlock(block.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              )}

              {/* Resize Handles */}
              {selectedBlockId === block.id && (
                <>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary border border-white rounded cursor-se-resize"></div>
                  <div className="absolute top-1/2 -right-1 w-2 h-6 bg-primary border border-white rounded cursor-e-resize"></div>
                  <div className="absolute -bottom-1 left-1/2 w-6 h-2 bg-primary border border-white rounded cursor-s-resize"></div>
                </>
              )}
            </div>
          ))}

          {/* Empty State */}
          {blocks.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <div className="text-6xl mb-4">🎨</div>
                <h3 className="text-lg font-semibold mb-2">Start Building</h3>
                <p className="text-sm">Drag components from the left panel to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Block Renderer Component
const BlockRenderer = ({ block }: { block: CanvasBlock }) => {
  switch (block.type) {
    case 'hero':
      return (
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2" style={{ color: block.properties.textColor }}>
            {block.properties.title || 'Hero Title'}
          </h1>
          <p className="text-muted-foreground mb-4">
            {block.properties.subtitle || 'Hero subtitle text goes here'}
          </p>
          <Button>{block.properties.buttonText || 'Get Started'}</Button>
        </div>
      );

    case 'form':
      return (
        <div className="space-y-3">
          <h3 className="font-semibold">{block.properties.title || 'Contact Form'}</h3>
          {(block.properties.fields || getDefaultFormFields()).map((field, index) => (
            <div key={index}>
              <label className="text-sm font-medium">{field.label}</label>
              <input 
                type={field.type} 
                placeholder={field.label}
                className="w-full p-2 border rounded text-sm"
                disabled
              />
            </div>
          ))}
          <Button className="w-full">{block.properties.buttonText || 'Submit'}</Button>
        </div>
      );

    case 'table':
      return (
        <div>
          <h3 className="font-semibold mb-2">{block.properties.title || 'Data Table'}</h3>
          <div className="border rounded">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  {(block.properties.columns || getDefaultTableColumns()).map((col, index) => (
                    <th key={index} className="p-2 text-left">{col.title}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-2">Sample</td>
                  <td className="p-2">Data</td>
                  <td className="p-2">Row</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      );

    case 'auth-form':
      return (
        <div className="space-y-3">
          <h3 className="font-semibold text-center">
            {block.properties.authType === 'register' ? 'Sign Up' : 
             block.properties.authType === 'reset' ? 'Reset Password' : 'Sign In'}
          </h3>
          <input type="email" placeholder="Email" className="w-full p-2 border rounded text-sm" disabled />
          <input type="password" placeholder="Password" className="w-full p-2 border rounded text-sm" disabled />
          {block.properties.authType === 'register' && (
            <input type="password" placeholder="Confirm Password" className="w-full p-2 border rounded text-sm" disabled />
          )}
          <Button className="w-full">
            {block.properties.authType === 'register' ? 'Create Account' : 
             block.properties.authType === 'reset' ? 'Reset Password' : 'Sign In'}
          </Button>
        </div>
      );

    case 'text':
      return (
        <div>
          <h3 className="font-semibold mb-2">{block.properties.title || 'Text Block'}</h3>
          <p className="text-sm text-muted-foreground">
            {block.properties.subtitle || 'Your text content goes here. You can customize this in the properties panel.'}
          </p>
        </div>
      );

    case 'button':
      return (
        <div className="text-center">
          <Button style={{ backgroundColor: block.properties.backgroundColor }}>
            {block.properties.buttonText || 'Click Me'}
          </Button>
        </div>
      );

    default:
      return <div className="text-center text-muted-foreground">Unknown block type</div>;
  }
};

// Helper functions
const getDefaultWidth = (type: string): number => {
  switch (type) {
    case 'hero': return 400;
    case 'form': return 300;
    case 'table': return 500;
    case 'auth-form': return 280;
    case 'text': return 300;
    case 'button': return 150;
    default: return 200;
  }
};

const getDefaultHeight = (type: string): number => {
  switch (type) {
    case 'hero': return 200;
    case 'form': return 250;
    case 'table': return 200;
    case 'auth-form': return 220;
    case 'text': return 120;
    case 'button': return 80;
    default: return 100;
  }
};

const getDefaultProperties = (type: string): CanvasBlock['properties'] => {
  switch (type) {
    case 'hero':
      return {
        title: 'Welcome to Our Platform',
        subtitle: 'Build amazing applications with ease',
        buttonText: 'Get Started',
        backgroundColor: '#ffffff',
        textColor: '#000000'
      };
    case 'form':
      return {
        title: 'Contact Us',
        buttonText: 'Send Message',
        fields: getDefaultFormFields()
      };
    case 'table':
      return {
        title: 'Data Overview',
        columns: getDefaultTableColumns()
      };
    case 'auth-form':
      return {
        authType: 'login' as const
      };
    case 'text':
      return {
        title: 'About Section',
        subtitle: 'Tell your story here. Customize this text to match your brand and message.'
      };
    case 'button':
      return {
        buttonText: 'Learn More',
        backgroundColor: '#3b82f6'
      };
    default:
      return {};
  }
};

const getDefaultFormFields = () => [
  { name: 'name', type: 'text' as const, label: 'Full Name', required: true },
  { name: 'email', type: 'email' as const, label: 'Email Address', required: true },
  { name: 'message', type: 'textarea' as const, label: 'Message', required: false }
];

const getDefaultTableColumns = () => [
  { key: 'id', title: 'ID', type: 'number' as const },
  { key: 'name', title: 'Name', type: 'text' as const },
  { key: 'status', title: 'Status', type: 'text' as const }
];
