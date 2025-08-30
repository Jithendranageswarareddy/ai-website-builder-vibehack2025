import { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Database, 
  Table, 
  Key, 
  Link, 
  Eye, 
  EyeOff,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layout,
  Layers,
  GitBranch,
  Box,
  Circle,
  Square
} from "lucide-react";

// Mock ReactFlow components (since ReactFlow might not be installed)
// In a real implementation, you would install react-flow-renderer
const MockReactFlow = ({ children, ...props }: any) => (
  <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300 relative overflow-hidden" {...props}>
    {children}
  </div>
);

const MockNode = ({ data, position, type }: any) => (
  <div 
    className={`absolute bg-white rounded-lg shadow-md border-2 p-3 min-w-[200px] ${
      type === 'table' ? 'border-blue-500' : 
      type === 'component' ? 'border-green-500' : 
      'border-gray-400'
    }`}
    style={{ 
      left: position.x, 
      top: position.y,
      transform: 'translate(-50%, -50%)'
    }}
  >
    <div className="flex items-center gap-2 mb-2">
      {type === 'table' ? <Database className="w-4 h-4 text-blue-500" /> :
       type === 'component' ? <Box className="w-4 h-4 text-green-500" /> :
       <Circle className="w-4 h-4 text-gray-500" />}
      <span className="font-medium text-sm">{data.label}</span>
    </div>
    {data.fields && (
      <div className="space-y-1">
        {data.fields.slice(0, 3).map((field: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            {field.isPrimary && <Key className="w-3 h-3 text-yellow-500" />}
            <span className={field.isPrimary ? 'font-medium' : ''}>{field.name}</span>
            <span className="text-gray-500">({field.type})</span>
          </div>
        ))}
        {data.fields.length > 3 && (
          <div className="text-xs text-gray-500">+{data.fields.length - 3} more...</div>
        )}
      </div>
    )}
    {data.description && (
      <div className="text-xs text-gray-600 mt-2 border-t pt-2">
        {data.description}
      </div>
    )}
  </div>
);

const MockEdge = ({ source, target, sourcePosition, targetPosition }: any) => (
  <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
    <defs>
      <marker
        id="arrowhead"
        markerWidth="10"
        markerHeight="7"
        refX="9"
        refY="3.5"
        orient="auto"
      >
        <polygon
          points="0 0, 10 3.5, 0 7"
          fill="#666"
        />
      </marker>
    </defs>
    <line
      x1={sourcePosition.x}
      y1={sourcePosition.y}
      x2={targetPosition.x}
      y2={targetPosition.y}
      stroke="#666"
      strokeWidth="2"
      markerEnd="url(#arrowhead)"
      strokeDasharray="5,5"
    />
  </svg>
);

interface SchemaVisualizerProps {
  tables: any[];
  blocks: any[];
  viewMode?: 'schema' | 'components' | 'combined';
}

export const SchemaVisualizer = ({
  tables = [],
  blocks = [],
  viewMode = 'combined'
}: SchemaVisualizerProps) => {
  const [activeView, setActiveView] = useState(viewMode);
  const [showRelations, setShowRelations] = useState(true);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  // Generate nodes for database tables
  const tableNodes = useMemo(() => {
    return tables.map((table, index) => ({
      id: `table-${table.id}`,
      type: 'table',
      position: { 
        x: 150 + (index % 3) * 250, 
        y: 100 + Math.floor(index / 3) * 200 
      },
      data: {
        label: table.name,
        fields: table.columns || [],
        description: `${table.columns?.length || 0} columns`
      }
    }));
  }, [tables]);

  // Generate nodes for UI components
  const componentNodes = useMemo(() => {
    return blocks.map((block, index) => ({
      id: `component-${block.id}`,
      type: 'component',
      position: { 
        x: 400 + (index % 4) * 200, 
        y: 300 + Math.floor(index / 4) * 150 
      },
      data: {
        label: block.type || 'Component',
        description: block.properties?.title || block.properties?.text || 'UI Component',
        fields: block.properties ? Object.keys(block.properties).map(key => ({
          name: key,
          type: typeof block.properties[key],
          value: block.properties[key]
        })) : []
      }
    }));
  }, [blocks]);

  // Generate relationships/edges
  const relationships = useMemo(() => {
    const edges: any[] = [];
    
    // Table relationships (mock - would be based on foreign keys)
    tables.forEach((table, index) => {
      if (index > 0) {
        edges.push({
          id: `rel-${table.id}-${tables[index - 1].id}`,
          source: `table-${tables[index - 1].id}`,
          target: `table-${table.id}`,
          sourcePosition: { x: 150 + ((index - 1) % 3) * 250, y: 100 + Math.floor((index - 1) / 3) * 200 },
          targetPosition: { x: 150 + (index % 3) * 250, y: 100 + Math.floor(index / 3) * 200 }
        });
      }
    });

    // Component to table relationships (mock - components that might use data)
    blocks.forEach((block, index) => {
      if (tables.length > 0 && (block.type === 'form' || block.type === 'table' || block.type === 'list')) {
        const targetTable = tables[index % tables.length];
        edges.push({
          id: `data-${block.id}-${targetTable.id}`,
          source: `component-${block.id}`,
          target: `table-${targetTable.id}`,
          sourcePosition: { x: 400 + (index % 4) * 200, y: 300 + Math.floor(index / 4) * 150 },
          targetPosition: { x: 150 + (tables.indexOf(targetTable) % 3) * 250, y: 100 + Math.floor(tables.indexOf(targetTable) / 3) * 200 }
        });
      }
    });

    return edges;
  }, [tables, blocks]);

  const getVisibleNodes = () => {
    switch (activeView) {
      case 'schema':
        return tableNodes;
      case 'components':
        return componentNodes;
      case 'combined':
        return [...tableNodes, ...componentNodes];
      default:
        return [];
    }
  };

  const getVisibleEdges = () => {
    if (!showRelations) return [];
    return relationships;
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
  const handleResetView = () => setZoom(1);

  const getNodeStats = () => {
    const nodes = getVisibleNodes();
    const tableCount = nodes.filter(n => n.type === 'table').length;
    const componentCount = nodes.filter(n => n.type === 'component').length;
    const relationCount = getVisibleEdges().length;

    return { tableCount, componentCount, relationCount };
  };

  const stats = getNodeStats();

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Layout className="w-5 h-5 text-primary" />
          Schema Visualizer
          <Badge variant="secondary" className="text-xs">
            {stats.tableCount} tables, {stats.componentCount} components
          </Badge>
        </CardTitle>
        
        {/* View Controls */}
        <div className="flex items-center justify-between">
          <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)}>
            <TabsList className="grid w-fit grid-cols-3">
              <TabsTrigger value="schema" className="text-xs">
                <Database className="w-3 h-3 mr-1" />
                Schema
              </TabsTrigger>
              <TabsTrigger value="components" className="text-xs">
                <Box className="w-3 h-3 mr-1" />
                Components
              </TabsTrigger>
              <TabsTrigger value="combined" className="text-xs">
                <Layers className="w-3 h-3 mr-1" />
                Combined
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowRelations(!showRelations)}
            >
              {showRelations ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              Relations
            </Button>
            
            <div className="flex gap-1">
              <Button size="sm" variant="outline" onClick={handleZoomOut}>
                <ZoomOut className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleResetView}>
                <RotateCcw className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleZoomIn}>
                <ZoomIn className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0">
        <div className="relative h-full">
          {/* Main Visualization Area */}
          <MockReactFlow style={{ transform: `scale(${zoom})` }}>
            {/* Render Nodes */}
            {getVisibleNodes().map((node) => (
              <MockNode
                key={node.id}
                {...node}
                selected={selectedNode === node.id}
                onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
              />
            ))}
            
            {/* Render Edges */}
            {getVisibleEdges().map((edge) => (
              <MockEdge key={edge.id} {...edge} />
            ))}
            
            {/* Empty State */}
            {getVisibleNodes().length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Layout className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No {activeView} to visualize</p>
                  <p className="text-sm">
                    {activeView === 'schema' ? 'Create database tables to see the schema diagram' :
                     activeView === 'components' ? 'Add UI components to see the component tree' :
                     'Create tables and components to see the full project visualization'}
                  </p>
                </div>
              </div>
            )}
          </MockReactFlow>
          
          {/* Legend */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg border p-3 space-y-2">
            <h4 className="font-medium text-sm">Legend</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>Database Tables</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>UI Components</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-8 h-0.5 bg-gray-600 border-dashed border-t"></div>
                <span>Relationships</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Key className="w-3 h-3 text-yellow-500" />
                <span>Primary Key</span>
              </div>
            </div>
          </div>
          
          {/* Stats Panel */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg border p-3">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-blue-600">{stats.tableCount}</div>
                <div className="text-xs text-muted-foreground">Tables</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">{stats.componentCount}</div>
                <div className="text-xs text-muted-foreground">Components</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600">{stats.relationCount}</div>
                <div className="text-xs text-muted-foreground">Relations</div>
              </div>
            </div>
          </div>
          
          {/* Zoom Indicator */}
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg border px-3 py-1">
            <span className="text-xs text-muted-foreground">
              Zoom: {Math.round(zoom * 100)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Simplified version for integration in other components
export const MiniSchemaVisualizer = ({ 
  tables, 
  blocks, 
  className = "h-40" 
}: { 
  tables: any[], 
  blocks: any[], 
  className?: string 
}) => {
  const nodeCount = tables.length + blocks.length;
  
  return (
    <div className={`bg-gradient-to-br from-gray-50 to-gray-100 rounded border-2 border-dashed border-gray-300 relative ${className}`}>
      {nodeCount > 0 ? (
        <div className="absolute inset-4 grid grid-cols-3 gap-2">
          {/* Mini representation of tables */}
          {tables.slice(0, 3).map((table, index) => (
            <div key={table.id} className="bg-blue-100 border border-blue-300 rounded p-2">
              <div className="flex items-center gap-1 mb-1">
                <Database className="w-3 h-3 text-blue-600" />
                <span className="text-xs font-medium truncate">{table.name}</span>
              </div>
              <div className="text-xs text-blue-600">{table.columns?.length || 0} cols</div>
            </div>
          ))}
          
          {/* Mini representation of components */}
          {blocks.slice(0, 3).map((block, index) => (
            <div key={block.id} className="bg-green-100 border border-green-300 rounded p-2">
              <div className="flex items-center gap-1 mb-1">
                <Box className="w-3 h-3 text-green-600" />
                <span className="text-xs font-medium truncate">{block.type}</span>
              </div>
              <div className="text-xs text-green-600">Component</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <Layout className="w-6 h-6 mx-auto mb-1 opacity-50" />
            <div className="text-xs">No schema</div>
          </div>
        </div>
      )}
      
      {nodeCount > 6 && (
        <div className="absolute bottom-2 right-2 bg-white rounded px-2 py-1 text-xs text-muted-foreground">
          +{nodeCount - 6} more
        </div>
      )}
    </div>
  );
};
