import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Undo2, 
  Redo2, 
  History, 
  RotateCcw,
  Clock,
  Zap,
  Eye,
  CheckCircle,
  Circle,
  GitBranch,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HistoryEntry {
  data: any;
  timestamp: Date;
  action: string;
  id: string;
  isCurrent: boolean;
}

interface HistoryPanelProps {
  history: HistoryEntry[];
  currentIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  undoAction: string | null;
  redoAction: string | null;
  onUndo: () => void;
  onRedo: () => void;
  onGoToState: (index: number) => void;
  onClearHistory: () => void;
  title?: string;
}

export const HistoryPanel = ({
  history,
  currentIndex,
  canUndo,
  canRedo,
  undoAction,
  redoAction,
  onUndo,
  onRedo,
  onGoToState,
  onClearHistory,
  title = "History"
}: HistoryPanelProps) => {
  const [showPreview, setShowPreview] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return timestamp.toLocaleDateString();
  };

  const getActionIcon = (action: string) => {
    if (action.includes('Add')) return <Zap className="w-3 h-3 text-green-500" />;
    if (action.includes('Remove') || action.includes('Delet')) return <Trash2 className="w-3 h-3 text-red-500" />;
    if (action.includes('Update') || action.includes('Edit')) return <Circle className="w-3 h-3 text-blue-500" />;
    if (action.includes('Move')) return <GitBranch className="w-3 h-3 text-purple-500" />;
    return <Circle className="w-3 h-3 text-gray-500" />;
  };

  const getActionColor = (action: string) => {
    if (action.includes('Add')) return 'bg-green-50 border-green-200';
    if (action.includes('Remove') || action.includes('Delet')) return 'bg-red-50 border-red-200';
    if (action.includes('Update') || action.includes('Edit')) return 'bg-blue-50 border-blue-200';
    if (action.includes('Move')) return 'bg-purple-50 border-purple-200';
    return 'bg-gray-50 border-gray-200';
  };

  const handlePreview = (index: number) => {
    setPreviewIndex(index);
    setShowPreview(true);
    // Note: In a real implementation, you'd pass the preview data to parent
    toast({
      title: "Preview Mode",
      description: `Previewing state: ${history[index]?.action}`,
    });
  };

  const handleGoToState = (index: number) => {
    onGoToState(index);
    setShowPreview(false);
    setPreviewIndex(null);
    
    toast({
      title: "State Restored",
      description: `Jumped to: ${history[index]?.action}`,
    });
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          {title}
          <Badge variant="secondary" className="text-xs">
            {history.length} states
          </Badge>
          {showPreview && (
            <Badge variant="outline" className="text-xs">
              <Eye className="w-3 h-3 mr-1" />
              Preview
            </Badge>
          )}
        </CardTitle>
        
        {/* Quick Actions */}
        <div className="flex gap-2 mt-3">
          <Button
            size="sm"
            variant="outline"
            onClick={onUndo}
            disabled={!canUndo}
            className="flex-1"
          >
            <Undo2 className="w-3 h-3 mr-1" />
            Undo
            {undoAction && (
              <span className="ml-1 text-xs opacity-70 truncate">
                ({undoAction})
              </span>
            )}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={onRedo}
            disabled={!canRedo}
            className="flex-1"
          >
            <Redo2 className="w-3 h-3 mr-1" />
            Redo
            {redoAction && (
              <span className="ml-1 text-xs opacity-70 truncate">
                ({redoAction})
              </span>
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* History Timeline */}
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-2 py-4">
            {history.map((entry, index) => (
              <div
                key={entry.id}
                className={`relative group transition-all duration-200 ${
                  entry.isCurrent 
                    ? 'transform scale-105' 
                    : previewIndex === index 
                      ? 'transform scale-102 opacity-80' 
                      : 'hover:transform hover:scale-102'
                }`}
              >
                {/* Timeline connector */}
                {index < history.length - 1 && (
                  <div className="absolute left-4 top-10 w-0.5 h-6 bg-border" />
                )}
                
                <Card 
                  className={`p-3 cursor-pointer transition-all duration-200 ${
                    entry.isCurrent 
                      ? 'ring-2 ring-primary bg-primary/5' 
                      : previewIndex === index 
                        ? 'ring-1 ring-blue-300 bg-blue-50' 
                        : getActionColor(entry.action)
                  }`}
                  onClick={() => handleGoToState(index)}
                >
                  <div className="flex items-start gap-3">
                    {/* Action Icon & Current Indicator */}
                    <div className="flex items-center gap-1 mt-0.5">
                      {entry.isCurrent ? (
                        <CheckCircle className="w-4 h-4 text-primary fill-current" />
                      ) : (
                        getActionIcon(entry.action)
                      )}
                      <div className="w-1 h-1 bg-border rounded-full" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm truncate">
                          {entry.action}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreview(index);
                            }}
                            className="h-6 w-6 p-0"
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimestamp(entry.timestamp)}</span>
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                        {entry.isCurrent && (
                          <Badge variant="default" className="text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
            
            {history.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No history available</p>
                <p className="text-xs">Actions will appear here as you work</p>
              </div>
            )}
          </div>
        </ScrollArea>
        
        {/* Footer Actions */}
        <div className="p-4 border-t space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>History: {currentIndex + 1} of {history.length}</span>
            <div className="flex items-center gap-2">
              {canUndo && (
                <span className="flex items-center gap-1">
                  <Undo2 className="w-3 h-3" />
                  {Math.max(0, currentIndex)} available
                </span>
              )}
              {canRedo && (
                <span className="flex items-center gap-1">
                  <Redo2 className="w-3 h-3" />
                  {history.length - currentIndex - 1} available
                </span>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onClearHistory}
              disabled={history.length <= 1}
              className="flex-1"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Clear History
            </Button>
            
            {showPreview && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowPreview(false);
                  setPreviewIndex(null);
                }}
                className="flex-1"
              >
                Exit Preview
              </Button>
            )}
          </div>
          
          {showPreview && previewIndex !== null && (
            <div className="bg-blue-50 border border-blue-200 rounded p-2">
              <p className="text-xs text-blue-800 text-center">
                Previewing: <strong>{history[previewIndex]?.action}</strong>
                <br />
                Click "Exit Preview" to return to current state
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Specialized History Panel for Canvas Operations
export const CanvasHistoryPanel = ({
  canvasHistory,
  onUndo,
  onRedo,
  onGoToState,
  onClearHistory
}: {
  canvasHistory: any;
  onUndo: () => void;
  onRedo: () => void;
  onGoToState: (index: number) => void;
  onClearHistory: () => void;
}) => {
  const historyInfo = canvasHistory.getHistoryInfo();
  const fullHistory = canvasHistory.getFullHistory();

  return (
    <HistoryPanel
      title="Canvas History"
      history={fullHistory}
      currentIndex={historyInfo.currentIndex}
      canUndo={historyInfo.canUndo}
      canRedo={historyInfo.canRedo}
      undoAction={historyInfo.undoAction}
      redoAction={historyInfo.redoAction}
      onUndo={onUndo}
      onRedo={onRedo}
      onGoToState={onGoToState}
      onClearHistory={onClearHistory}
    />
  );
};

// Specialized History Panel for Schema Operations
export const SchemaHistoryPanel = ({
  schemaHistory,
  onUndo,
  onRedo,
  onGoToState,
  onClearHistory
}: {
  schemaHistory: any;
  onUndo: () => void;
  onRedo: () => void;
  onGoToState: (index: number) => void;
  onClearHistory: () => void;
}) => {
  const historyInfo = schemaHistory.getHistoryInfo();
  const fullHistory = schemaHistory.getFullHistory();

  return (
    <HistoryPanel
      title="Schema History"
      history={fullHistory}
      currentIndex={historyInfo.currentIndex}
      canUndo={historyInfo.canUndo}
      canRedo={historyInfo.canRedo}
      undoAction={historyInfo.undoAction}
      redoAction={historyInfo.redoAction}
      onUndo={onUndo}
      onRedo={onRedo}
      onGoToState={onGoToState}
      onClearHistory={onClearHistory}
    />
  );
};
