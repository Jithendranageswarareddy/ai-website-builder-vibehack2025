import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Type, 
  Image, 
  Square, 
  MousePointer,
  Layout,
  Search,
  Plus
} from "lucide-react";
import { useState } from "react";

interface ComponentLibraryProps {
  onAddComponent: (type: string) => void;
}

const componentTypes = [
  { id: "heading", name: "Heading", icon: Type, description: "Add text headings" },
  { id: "text", name: "Text", icon: Type, description: "Paragraph text content" },
  { id: "button", name: "Button", icon: MousePointer, description: "Interactive buttons" },
  { id: "image", name: "Image", icon: Image, description: "Pictures and graphics" },
  { id: "card", name: "Card", icon: Layout, description: "Content containers" },
];

export const ComponentLibrary = ({ onAddComponent }: ComponentLibraryProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredComponents = componentTypes.filter(comp =>
    comp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-64 bg-builder-panel border-r border-builder-border flex flex-col">
      <div className="p-4 border-b border-builder-border">
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <Layout className="w-4 h-4" />
          Components
        </h2>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-builder-text/50" />
          <Input
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-builder-bg border-builder-border text-builder-text placeholder:text-builder-text/50"
          />
        </div>
      </div>
      
      <div className="flex-1 p-4 space-y-2 overflow-y-auto">
        {filteredComponents.map((component) => {
          const Icon = component.icon;
          return (
            <Card
              key={component.id}
              className="cursor-pointer hover:bg-builder-border/50 transition-colors bg-builder-bg border-builder-border group"
              onClick={() => onAddComponent(component.id)}
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-builder-text">{component.name}</h3>
                    <p className="text-xs text-builder-text/70 truncate">{component.description}</p>
                  </div>
                  <Plus className="w-4 h-4 text-builder-text/50 group-hover:text-primary transition-colors" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-builder-border">
        <Button className="w-full btn-ai text-sm">
          <Plus className="w-4 h-4 mr-2" />
          Request Custom Component
        </Button>
      </div>
    </div>
  );
};