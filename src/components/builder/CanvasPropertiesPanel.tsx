import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { 
  Settings, 
  Palette, 
  Type, 
  Layout, 
  Plus, 
  Trash2,
  Eye,
  EyeOff
} from "lucide-react";
import { CanvasBlock } from "./CanvasBuilder";
import { useToast } from "@/hooks/use-toast";

interface PropertiesPanelProps {
  selectedBlock: CanvasBlock | null;
  updateBlock: (blockId: string, updates: Partial<CanvasBlock>) => void;
}

export const PropertiesPanel = ({ selectedBlock, updateBlock }: PropertiesPanelProps) => {
  const [previewMode, setPreviewMode] = useState(false);
  const { toast } = useToast();

  if (!selectedBlock) {
    return (
      <div className="w-80 bg-muted/30 border-l border-border/50 p-4">
        <div className="text-center text-muted-foreground">
          <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="font-semibold mb-2">No Selection</h3>
          <p className="text-sm">Select a block on the canvas to edit its properties</p>
        </div>
      </div>
    );
  }

  const updateProperty = (key: string, value: any) => {
    updateBlock(selectedBlock.id, {
      properties: {
        ...selectedBlock.properties,
        [key]: value
      }
    });
  };

  const updatePosition = (key: 'x' | 'y' | 'width' | 'height', value: number) => {
    updateBlock(selectedBlock.id, { [key]: value });
  };

  const addFormField = () => {
    const currentFields = selectedBlock.properties.fields || [];
    const newField = {
      name: `field_${currentFields.length + 1}`,
      type: 'text' as const,
      label: `Field ${currentFields.length + 1}`,
      required: false
    };
    updateProperty('fields', [...currentFields, newField]);
    toast({
      title: "Field Added",
      description: "New form field has been added"
    });
  };

  const removeFormField = (index: number) => {
    const currentFields = selectedBlock.properties.fields || [];
    updateProperty('fields', currentFields.filter((_, i) => i !== index));
    toast({
      title: "Field Removed",
      description: "Form field has been removed"
    });
  };

  const updateFormField = (index: number, field: any) => {
    const currentFields = selectedBlock.properties.fields || [];
    const updatedFields = currentFields.map((f, i) => i === index ? field : f);
    updateProperty('fields', updatedFields);
  };

  const addTableColumn = () => {
    const currentColumns = selectedBlock.properties.columns || [];
    const newColumn = {
      key: `col_${currentColumns.length + 1}`,
      title: `Column ${currentColumns.length + 1}`,
      type: 'text' as const
    };
    updateProperty('columns', [...currentColumns, newColumn]);
    toast({
      title: "Column Added",
      description: "New table column has been added"
    });
  };

  const removeTableColumn = (index: number) => {
    const currentColumns = selectedBlock.properties.columns || [];
    updateProperty('columns', currentColumns.filter((_, i) => i !== index));
    toast({
      title: "Column Removed",
      description: "Table column has been removed"
    });
  };

  const updateTableColumn = (index: number, column: any) => {
    const currentColumns = selectedBlock.properties.columns || [];
    const updatedColumns = currentColumns.map((c, i) => i === index ? column : c);
    updateProperty('columns', updatedColumns);
  };

  return (
    <div className="w-80 bg-muted/30 border-l border-border/50 overflow-y-auto">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Properties
          </h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>
        <Badge variant="secondary" className="text-xs">
          {selectedBlock.type.charAt(0).toUpperCase() + selectedBlock.type.slice(1)}
        </Badge>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mx-4 mt-4">
          <TabsTrigger value="content" className="text-xs">
            <Type className="w-3 h-3 mr-1" />
            Content
          </TabsTrigger>
          <TabsTrigger value="style" className="text-xs">
            <Palette className="w-3 h-3 mr-1" />
            Style
          </TabsTrigger>
          <TabsTrigger value="layout" className="text-xs">
            <Layout className="w-3 h-3 mr-1" />
            Layout
          </TabsTrigger>
        </TabsList>

        <div className="p-4">
          <TabsContent value="content" className="space-y-4 mt-0">
            {/* Content Properties */}
            {(selectedBlock.type === 'hero' || selectedBlock.type === 'text' || selectedBlock.type === 'form' || selectedBlock.type === 'table') && (
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={selectedBlock.properties.title || ''}
                  onChange={(e) => updateProperty('title', e.target.value)}
                  placeholder="Enter title"
                />
              </div>
            )}

            {(selectedBlock.type === 'hero' || selectedBlock.type === 'text') && (
              <div>
                <Label htmlFor="subtitle">Subtitle</Label>
                <Textarea
                  id="subtitle"
                  value={selectedBlock.properties.subtitle || ''}
                  onChange={(e) => updateProperty('subtitle', e.target.value)}
                  placeholder="Enter subtitle"
                  rows={3}
                />
              </div>
            )}

            {(selectedBlock.type === 'hero' || selectedBlock.type === 'form' || selectedBlock.type === 'button') && (
              <div>
                <Label htmlFor="buttonText">Button Text</Label>
                <Input
                  id="buttonText"
                  value={selectedBlock.properties.buttonText || ''}
                  onChange={(e) => updateProperty('buttonText', e.target.value)}
                  placeholder="Enter button text"
                />
              </div>
            )}

            {/* Auth Form Type */}
            {selectedBlock.type === 'auth-form' && (
              <div>
                <Label htmlFor="authType">Form Type</Label>
                <Select
                  value={selectedBlock.properties.authType || 'login'}
                  onValueChange={(value) => updateProperty('authType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="login">Login</SelectItem>
                    <SelectItem value="register">Register</SelectItem>
                    <SelectItem value="reset">Reset Password</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Form Fields Management */}
            {selectedBlock.type === 'form' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Form Fields</Label>
                  <Button size="sm" onClick={addFormField}>
                    <Plus className="w-3 h-3 mr-1" />
                    Add
                  </Button>
                </div>
                <div className="space-y-3">
                  {(selectedBlock.properties.fields || []).map((field, index) => (
                    <Card key={index} className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Input
                            value={field.label}
                            onChange={(e) => updateFormField(index, { ...field, label: e.target.value })}
                            placeholder="Field label"
                            className="text-xs"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFormField(index)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Select
                            value={field.type}
                            onValueChange={(value) => updateFormField(index, { ...field, type: value })}
                          >
                            <SelectTrigger className="text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="password">Password</SelectItem>
                              <SelectItem value="number">Number</SelectItem>
                              <SelectItem value="textarea">Textarea</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="flex items-center gap-1">
                            <Switch
                              checked={field.required}
                              onCheckedChange={(checked) => updateFormField(index, { ...field, required: checked })}
                            />
                            <Label className="text-xs">Required</Label>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Table Columns Management */}
            {selectedBlock.type === 'table' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Table Columns</Label>
                  <Button size="sm" onClick={addTableColumn}>
                    <Plus className="w-3 h-3 mr-1" />
                    Add
                  </Button>
                </div>
                <div className="space-y-3">
                  {(selectedBlock.properties.columns || []).map((column, index) => (
                    <Card key={index} className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Input
                            value={column.title}
                            onChange={(e) => updateTableColumn(index, { ...column, title: e.target.value })}
                            placeholder="Column title"
                            className="text-xs"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeTableColumn(index)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Input
                            value={column.key}
                            onChange={(e) => updateTableColumn(index, { ...column, key: e.target.value })}
                            placeholder="Column key"
                            className="text-xs"
                          />
                          <Select
                            value={column.type}
                            onValueChange={(value) => updateTableColumn(index, { ...column, type: value })}
                          >
                            <SelectTrigger className="text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="number">Number</SelectItem>
                              <SelectItem value="date">Date</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="style" className="space-y-4 mt-0">
            {/* Style Properties */}
            <div>
              <Label htmlFor="textColor">Text Color</Label>
              <div className="flex gap-2">
                <Input
                  id="textColor"
                  type="color"
                  value={selectedBlock.properties.textColor || '#000000'}
                  onChange={(e) => updateProperty('textColor', e.target.value)}
                  className="w-16 h-8 p-1"
                />
                <Input
                  value={selectedBlock.properties.textColor || '#000000'}
                  onChange={(e) => updateProperty('textColor', e.target.value)}
                  placeholder="#000000"
                  className="text-xs"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="backgroundColor">Background Color</Label>
              <div className="flex gap-2">
                <Input
                  id="backgroundColor"
                  type="color"
                  value={selectedBlock.properties.backgroundColor || '#ffffff'}
                  onChange={(e) => updateProperty('backgroundColor', e.target.value)}
                  className="w-16 h-8 p-1"
                />
                <Input
                  value={selectedBlock.properties.backgroundColor || '#ffffff'}
                  onChange={(e) => updateProperty('backgroundColor', e.target.value)}
                  placeholder="#ffffff"
                  className="text-xs"
                />
              </div>
            </div>

            <div>
              <Label>Font Size</Label>
              <div className="flex items-center gap-2 mt-1">
                <Slider
                  value={[parseInt(selectedBlock.properties.fontSize?.replace('px', '') || '16')]}
                  onValueChange={([value]) => updateProperty('fontSize', `${value}px`)}
                  max={48}
                  min={10}
                  step={1}
                  className="flex-1"
                />
                <span className="text-xs w-12 text-center">
                  {selectedBlock.properties.fontSize || '16px'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Border Radius</Label>
                <Select
                  value={selectedBlock.properties.borderRadius || 'default'}
                  onValueChange={(value) => updateProperty('borderRadius', value)}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="sm">Small</SelectItem>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="lg">Large</SelectItem>
                    <SelectItem value="full">Full</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Shadow</Label>
                <Select
                  value={selectedBlock.properties.shadow || 'none'}
                  onValueChange={(value) => updateProperty('shadow', value)}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="sm">Small</SelectItem>
                    <SelectItem value="md">Medium</SelectItem>
                    <SelectItem value="lg">Large</SelectItem>
                    <SelectItem value="xl">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="layout" className="space-y-4 mt-0">
            {/* Layout Properties */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="x">Position X</Label>
                <Input
                  id="x"
                  type="number"
                  value={selectedBlock.x}
                  onChange={(e) => updatePosition('x', parseInt(e.target.value) || 0)}
                  className="text-xs"
                />
              </div>
              <div>
                <Label htmlFor="y">Position Y</Label>
                <Input
                  id="y"
                  type="number"
                  value={selectedBlock.y}
                  onChange={(e) => updatePosition('y', parseInt(e.target.value) || 0)}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="width">Width</Label>
                <Input
                  id="width"
                  type="number"
                  value={selectedBlock.width}
                  onChange={(e) => updatePosition('width', parseInt(e.target.value) || 100)}
                  className="text-xs"
                />
              </div>
              <div>
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  type="number"
                  value={selectedBlock.height}
                  onChange={(e) => updatePosition('height', parseInt(e.target.value) || 100)}
                  className="text-xs"
                />
              </div>
            </div>

            <div>
              <Label>Alignment</Label>
              <div className="grid grid-cols-3 gap-1 mt-1">
                {['left', 'center', 'right'].map((align) => (
                  <Button
                    key={align}
                    size="sm"
                    variant={selectedBlock.properties.textAlign === align ? "default" : "outline"}
                    onClick={() => updateProperty('textAlign', align)}
                    className="text-xs"
                  >
                    {align.charAt(0).toUpperCase() + align.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label>Padding</Label>
              <div className="grid grid-cols-4 gap-1 mt-1">
                {['xs', 'sm', 'md', 'lg'].map((size) => (
                  <Button
                    key={size}
                    size="sm"
                    variant={selectedBlock.properties.padding === size ? "default" : "outline"}
                    onClick={() => updateProperty('padding', size)}
                    className="text-xs"
                  >
                    {size.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
