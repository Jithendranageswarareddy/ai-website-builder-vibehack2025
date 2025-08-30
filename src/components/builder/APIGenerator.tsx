import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Code2, Zap, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DatabaseTable } from "./SchemaDesigner";

interface APIEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  tableName: string;
  code: string;
}

export interface APIGeneratorProps {
  tables: DatabaseTable[];
  endpoints: APIEndpoint[];
  setEndpoints: (endpoints: APIEndpoint[]) => void;
}

export const APIGenerator = ({ tables, endpoints, setEndpoints }: APIGeneratorProps) => {
  const [description, setDescription] = useState("");
  const [selectedTable, setSelectedTable] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateCRUDEndpoints = (table: DatabaseTable) => {
    const tableName = table.name.toLowerCase();
    const modelName = table.name;
    
    const newEndpoints: APIEndpoint[] = [
      {
        id: `${tableName}-get-all`,
        method: 'GET',
        path: `/api/${tableName}s`,
        description: `Get all ${tableName} records`,
        tableName: table.name,
        code: generateGetAllCode(tableName, modelName)
      },
      {
        id: `${tableName}-get-one`,
        method: 'GET',
        path: `/api/${tableName}s/:id`,
        description: `Get a single ${tableName} by ID`,
        tableName: table.name,
        code: generateGetOneCode(tableName, modelName)
      },
      {
        id: `${tableName}-create`,
        method: 'POST',
        path: `/api/${tableName}s`,
        description: `Create a new ${tableName}`,
        tableName: table.name,
        code: generateCreateCode(tableName, modelName, table.fields)
      },
      {
        id: `${tableName}-update`,
        method: 'PUT',
        path: `/api/${tableName}s/:id`,
        description: `Update a ${tableName} by ID`,
        tableName: table.name,
        code: generateUpdateCode(tableName, modelName)
      },
      {
        id: `${tableName}-delete`,
        method: 'DELETE',
        path: `/api/${tableName}s/:id`,
        description: `Delete a ${tableName} by ID`,
        tableName: table.name,
        code: generateDeleteCode(tableName, modelName)
      }
    ];

    setEndpoints([...endpoints, ...newEndpoints]);
    toast({
      title: "Endpoints Generated",
      description: `Created 5 CRUD endpoints for ${table.name}`
    });
  };

  const generateCustomEndpoint = async () => {
    if (!description.trim() || !selectedTable) {
      toast({
        title: "Missing Information",
        description: "Please select a table and provide a description",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI generation (in real implementation, call OpenAI API)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const table = tables.find(t => t.name === selectedTable);
    if (!table) return;

    const customEndpoint: APIEndpoint = {
      id: `custom-${Date.now()}`,
      method: 'POST',
      path: `/api/${selectedTable.toLowerCase()}/custom`,
      description: description,
      tableName: selectedTable,
      code: generateCustomCode(description, selectedTable.toLowerCase(), selectedTable)
    };

    setEndpoints([...endpoints, customEndpoint]);
    setDescription("");
    setIsGenerating(false);
    
    toast({
      title: "Custom Endpoint Generated",
      description: "AI has created your custom endpoint"
    });
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Code Copied",
      description: "Endpoint code copied to clipboard"
    });
  };

  const getMethodColor = (method: string) => {
    const colors = {
      GET: 'bg-green-500',
      POST: 'bg-blue-500',
      PUT: 'bg-orange-500',
      DELETE: 'bg-red-500'
    };
    return colors[method as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Code2 className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">API Endpoint Generator</h2>
      </div>

      <Tabs defaultValue="crud" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="crud">CRUD Generation</TabsTrigger>
          <TabsTrigger value="custom">AI Custom</TabsTrigger>
        </TabsList>

        <TabsContent value="crud" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate CRUD Endpoints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tables.map(table => (
                  <Card key={table.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{table.name}</h3>
                      <Badge variant="outline">{table.fields.length} fields</Badge>
                    </div>
                    <Button 
                      onClick={() => generateCRUDEndpoints(table)}
                      className="w-full"
                      size="sm"
                    >
                      Generate CRUD
                    </Button>
                  </Card>
                ))}
              </div>
              
              {tables.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Create database tables first to generate CRUD endpoints</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                AI-Powered Custom Endpoint
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="table-select">Select Table</Label>
                <select
                  id="table-select"
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Choose a table...</option>
                  {tables.map(table => (
                    <option key={table.id} value={table.name}>{table.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="endpoint-description">Describe Your Endpoint</Label>
                <Textarea
                  id="endpoint-description"
                  placeholder="e.g., 'Create an endpoint to get all published posts with their authors' or 'Add a search endpoint for users by email'"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              
              <Button 
                onClick={generateCustomEndpoint}
                disabled={isGenerating || !description.trim() || !selectedTable}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Generate Custom Endpoint
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Generated Endpoints */}
      {endpoints.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Generated Endpoints ({endpoints.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {endpoints.map(endpoint => (
                <Card key={endpoint.id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge className={getMethodColor(endpoint.method)}>
                        {endpoint.method}
                      </Badge>
                      <code className="text-sm font-mono">{endpoint.path}</code>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyCode(endpoint.code)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {endpoint.description}
                  </p>
                  
                  <div className="bg-muted p-3 rounded-md">
                    <pre className="text-xs overflow-x-auto">
                      <code>{endpoint.code}</code>
                    </pre>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Code generation helpers
const generateGetAllCode = (tableName: string, modelName: string) => `
// GET /api/${tableName}s
app.get('/api/${tableName}s', async (req, res) => {
  try {
    const ${tableName}s = await prisma.${tableName}.findMany();
    res.json(${tableName}s);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ${tableName}s' });
  }
});`;

const generateGetOneCode = (tableName: string, modelName: string) => `
// GET /api/${tableName}s/:id
app.get('/api/${tableName}s/:id', async (req, res) => {
  try {
    const ${tableName} = await prisma.${tableName}.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    
    if (!${tableName}) {
      return res.status(404).json({ error: '${modelName} not found' });
    }
    
    res.json(${tableName});
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ${tableName}' });
  }
});`;

const generateCreateCode = (tableName: string, modelName: string, fields: any[]) => {
  const fieldNames = fields.filter(f => f.name !== 'id').map(f => f.name).join(', ');
  
  return `
// POST /api/${tableName}s
app.post('/api/${tableName}s', async (req, res) => {
  try {
    const { ${fieldNames} } = req.body;
    
    const new${modelName} = await prisma.${tableName}.create({
      data: { ${fieldNames} }
    });
    
    res.status(201).json(new${modelName});
  } catch (error) {
    res.status(400).json({ error: 'Failed to create ${tableName}' });
  }
});`;
};

const generateUpdateCode = (tableName: string, modelName: string) => `
// PUT /api/${tableName}s/:id
app.put('/api/${tableName}s/:id', async (req, res) => {
  try {
    const updated${modelName} = await prisma.${tableName}.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    });
    
    res.json(updated${modelName});
  } catch (error) {
    res.status(400).json({ error: 'Failed to update ${tableName}' });
  }
});`;

const generateDeleteCode = (tableName: string, modelName: string) => `
// DELETE /api/${tableName}s/:id
app.delete('/api/${tableName}s/:id', async (req, res) => {
  try {
    await prisma.${tableName}.delete({
      where: { id: parseInt(req.params.id) }
    });
    
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete ${tableName}' });
  }
});`;

const generateCustomCode = (description: string, tableName: string, modelName: string) => `
// Custom endpoint: ${description}
app.post('/api/${tableName}/custom', async (req, res) => {
  try {
    // AI-generated code based on: "${description}"
    const result = await prisma.${tableName}.findMany({
      // Add custom logic here based on requirements
      where: req.body.filters || {},
      include: req.body.include || {}
    });
    
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: 'Custom endpoint failed' });
  }
});`;
