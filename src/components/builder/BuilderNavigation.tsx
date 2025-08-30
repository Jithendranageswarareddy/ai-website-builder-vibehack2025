import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Code2, 
  Eye, 
  Download, 
  Play, 
  MessageSquare, 
  Home, 
  Save, 
  Share,
  Sparkles 
} from "lucide-react";
import { Link } from "react-router-dom";

interface BuilderNavigationProps {
  onPreview: () => void;
  onExport: () => void;
  isPreviewMode: boolean;
  onToggleAI: () => void;
  showAI: boolean;
}

export const BuilderNavigation = ({ 
  onPreview, 
  onExport, 
  isPreviewMode, 
  onToggleAI,
  showAI 
}: BuilderNavigationProps) => {
  return (
    <nav className="h-16 bg-builder-panel border-b border-builder-border px-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Code2 className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold">BuilderAI</span>
        </Link>
        
        <div className="h-6 w-px bg-builder-border" />
        
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium">Untitled Project</span>
          <Badge variant="secondary" className="bg-primary/20 text-primary text-xs">
            Auto-saved
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleAI}
          className={`${showAI ? 'bg-primary/20 text-primary' : 'hover:bg-builder-border'}`}
        >
          <MessageSquare className="w-4 h-4 mr-1" />
          AI Assistant
          {showAI && <div className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
        </Button>
        
        <Button variant="ghost" size="sm" className="hover:bg-builder-border">
          <Save className="w-4 h-4 mr-1" />
          Save
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onPreview}
          className={`hover:bg-builder-border ${isPreviewMode ? 'bg-primary/20 text-primary' : ''}`}
        >
          {isPreviewMode ? <Eye className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
          {isPreviewMode ? 'Edit' : 'Preview'}
        </Button>
        
        <Button variant="ghost" size="sm" onClick={onExport} className="hover:bg-builder-border">
          <Download className="w-4 h-4 mr-1" />
          Export
        </Button>
        
        <Button size="sm" className="btn-ai ml-2">
          <Share className="w-4 h-4 mr-1" />
          Deploy
        </Button>
      </div>
    </nav>
  );
};