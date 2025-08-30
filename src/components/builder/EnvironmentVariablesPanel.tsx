import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  Key, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Copy, 
  Download,
  Upload,
  Shield,
  AlertTriangle,
  CheckCircle,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EnvironmentVariable {
  id: string;
  key: string;
  value: string;
  description?: string;
  type: 'frontend' | 'backend' | 'both';
  required: boolean;
  sensitive: boolean;
}

interface EnvironmentVariablesPanelProps {
  environmentVariables: Record<string, string>;
  onVariablesChange: (variables: Record<string, string>) => void;
}

export const EnvironmentVariablesPanel = ({
  environmentVariables,
  onVariablesChange
}: EnvironmentVariablesPanelProps) => {
  const [variables, setVariables] = useState<EnvironmentVariable[]>([]);
  const [newVariable, setNewVariable] = useState({
    key: '',
    value: '',
    description: '',
    type: 'both' as const,
    required: false,
    sensitive: false
  });
  const [visibleValues, setVisibleValues] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('manage');
  const [envFileContent, setEnvFileContent] = useState('');
  const { toast } = useToast();

  // Predefined environment variable templates
  const envTemplates = [
    {
      category: 'Database',
      variables: [
        {
          key: 'DATABASE_URL',
          value: 'postgresql://username:password@localhost:5432/database_name',
          description: 'PostgreSQL database connection string',
          type: 'backend' as const,
          required: true,
          sensitive: true
        },
        {
          key: 'MONGODB_URI',
          value: 'mongodb://localhost:27017/myapp',
          description: 'MongoDB connection string',
          type: 'backend' as const,
          required: false,
          sensitive: true
        }
      ]
    },
    {
      category: 'Authentication',
      variables: [
        {
          key: 'JWT_SECRET',
          value: 'your-super-secret-jwt-key-change-this-in-production',
          description: 'Secret key for JWT token signing',
          type: 'backend' as const,
          required: true,
          sensitive: true
        },
        {
          key: 'AUTH0_CLIENT_ID',
          value: 'your-auth0-client-id',
          description: 'Auth0 client ID for authentication',
          type: 'frontend' as const,
          required: false,
          sensitive: false
        },
        {
          key: 'AUTH0_CLIENT_SECRET',
          value: 'your-auth0-client-secret',
          description: 'Auth0 client secret',
          type: 'backend' as const,
          required: false,
          sensitive: true
        }
      ]
    },
    {
      category: 'API Keys',
      variables: [
        {
          key: 'VITE_OPENAI_API_KEY',
          value: 'sk-your-openai-api-key',
          description: 'OpenAI API key for AI features',
          type: 'frontend' as const,
          required: false,
          sensitive: true
        },
        {
          key: 'STRIPE_SECRET_KEY',
          value: 'sk_test_your-stripe-secret-key',
          description: 'Stripe secret key for payments',
          type: 'backend' as const,
          required: false,
          sensitive: true
        },
        {
          key: 'VITE_STRIPE_PUBLISHABLE_KEY',
          value: 'pk_test_your-stripe-publishable-key',
          description: 'Stripe publishable key',
          type: 'frontend' as const,
          required: false,
          sensitive: false
        }
      ]
    },
    {
      category: 'Configuration',
      variables: [
        {
          key: 'NODE_ENV',
          value: 'development',
          description: 'Node.js environment mode',
          type: 'backend' as const,
          required: true,
          sensitive: false
        },
        {
          key: 'PORT',
          value: '3001',
          description: 'Server port number',
          type: 'backend' as const,
          required: false,
          sensitive: false
        },
        {
          key: 'VITE_API_URL',
          value: 'http://localhost:3001',
          description: 'Backend API URL for frontend',
          type: 'frontend' as const,
          required: true,
          sensitive: false
        }
      ]
    }
  ];

  useEffect(() => {
    // Convert environmentVariables object to EnvironmentVariable array
    const varsArray = Object.entries(environmentVariables).map(([key, value]) => ({
      id: key,
      key,
      value,
      type: key.startsWith('VITE_') ? 'frontend' as const : 'backend' as const,
      required: false,
      sensitive: key.toLowerCase().includes('secret') || 
                key.toLowerCase().includes('key') || 
                key.toLowerCase().includes('password')
    }));
    setVariables(varsArray);
  }, [environmentVariables]);

  useEffect(() => {
    // Update parent component when variables change
    const varsObject = variables.reduce((acc, variable) => {
      acc[variable.key] = variable.value;
      return acc;
    }, {} as Record<string, string>);
    onVariablesChange(varsObject);
  }, [variables, onVariablesChange]);

  const addVariable = () => {
    if (!newVariable.key.trim()) {
      toast({
        title: "Invalid Variable",
        description: "Please enter a variable name.",
        variant: "destructive"
      });
      return;
    }

    if (variables.some(v => v.key === newVariable.key)) {
      toast({
        title: "Variable Exists",
        description: "A variable with this name already exists.",
        variant: "destructive"
      });
      return;
    }

    const variable: EnvironmentVariable = {
      id: Date.now().toString(),
      key: newVariable.key,
      value: newVariable.value,
      description: newVariable.description,
      type: newVariable.type,
      required: newVariable.required,
      sensitive: newVariable.sensitive
    };

    setVariables(prev => [...prev, variable]);
    setNewVariable({
      key: '',
      value: '',
      description: '',
      type: 'both',
      required: false,
      sensitive: false
    });

    toast({
      title: "Variable Added",
      description: `${variable.key} has been added.`,
    });
  };

  const removeVariable = (id: string) => {
    setVariables(prev => prev.filter(v => v.id !== id));
    toast({
      title: "Variable Removed",
      description: "Environment variable has been removed.",
    });
  };

  const updateVariable = (id: string, updates: Partial<EnvironmentVariable>) => {
    setVariables(prev => 
      prev.map(variable => 
        variable.id === id ? { ...variable, ...updates } : variable
      )
    );
  };

  const toggleValueVisibility = (id: string) => {
    setVisibleValues(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const addFromTemplate = (templateVar: any) => {
    const variable: EnvironmentVariable = {
      id: Date.now().toString(),
      ...templateVar
    };

    if (variables.some(v => v.key === variable.key)) {
      toast({
        title: "Variable Exists",
        description: "This variable is already added.",
        variant: "destructive"
      });
      return;
    }

    setVariables(prev => [...prev, variable]);
    toast({
      title: "Template Added",
      description: `${variable.key} has been added from template.`,
    });
  };

  const generateEnvFile = (type: 'frontend' | 'backend' | 'both') => {
    const filteredVars = variables.filter(v => 
      type === 'both' || v.type === type || v.type === 'both'
    );

    const content = filteredVars
      .map(variable => {
        const comment = variable.description ? `# ${variable.description}\n` : '';
        return `${comment}${variable.key}=${variable.value}`;
      })
      .join('\n\n');

    return content;
  };

  const downloadEnvFile = (type: 'frontend' | 'backend' | 'both') => {
    const content = generateEnvFile(type);
    const filename = type === 'both' ? '.env' : 
                    type === 'frontend' ? '.env.frontend' : '.env.backend';
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "File Downloaded",
      description: `${filename} has been downloaded.`,
    });
  };

  const copyEnvFile = (type: 'frontend' | 'backend' | 'both') => {
    const content = generateEnvFile(type);
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied",
      description: "Environment variables copied to clipboard!",
    });
  };

  const parseEnvFile = (content: string) => {
    const lines = content.split('\n');
    const parsedVars: EnvironmentVariable[] = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=');
          parsedVars.push({
            id: `imported-${index}`,
            key: key.trim(),
            value: value.trim(),
            type: key.startsWith('VITE_') ? 'frontend' : 'backend',
            required: false,
            sensitive: key.toLowerCase().includes('secret') || 
                      key.toLowerCase().includes('key') || 
                      key.toLowerCase().includes('password')
          });
        }
      }
    });

    return parsedVars;
  };

  const importEnvFile = () => {
    try {
      const importedVars = parseEnvFile(envFileContent);
      const newVars = importedVars.filter(importedVar => 
        !variables.some(existingVar => existingVar.key === importedVar.key)
      );

      setVariables(prev => [...prev, ...newVars]);
      setEnvFileContent('');
      
      toast({
        title: "Import Successful",
        description: `${newVars.length} new variables imported.`,
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Invalid .env file format.",
        variant: "destructive"
      });
    }
  };

  const validateVariables = () => {
    const issues = [];
    
    variables.forEach(variable => {
      if (variable.required && !variable.value.trim()) {
        issues.push(`${variable.key} is required but empty`);
      }
      
      if (variable.sensitive && variable.value === 'your-secret-key') {
        issues.push(`${variable.key} should be changed from default value`);
      }
    });

    return issues;
  };

  const validationIssues = validateVariables();

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5 text-primary" />
          Environment Variables
          <Badge variant="secondary" className="text-xs">
            {variables.length} variables
          </Badge>
          {validationIssues.length > 0 && (
            <Badge variant="destructive" className="text-xs">
              {validationIssues.length} issues
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-4 mx-4">
            <TabsTrigger value="manage" className="text-xs">
              <Settings className="w-3 h-3 mr-1" />
              Manage
            </TabsTrigger>
            <TabsTrigger value="templates" className="text-xs">
              <Plus className="w-3 h-3 mr-1" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="export" className="text-xs">
              <Download className="w-3 h-3 mr-1" />
              Export
            </TabsTrigger>
            <TabsTrigger value="import" className="text-xs">
              <Upload className="w-3 h-3 mr-1" />
              Import
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manage" className="flex-1 m-0">
            <div className="flex flex-col h-full">
              {/* Validation Issues */}
              {validationIssues.length > 0 && (
                <div className="p-4 border-b bg-red-50">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-red-800">
                        Configuration Issues
                      </p>
                      {validationIssues.map((issue, index) => (
                        <p key={index} className="text-xs text-red-600">
                          • {issue}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Add New Variable */}
              <div className="p-4 border-b space-y-3">
                <h3 className="font-medium">Add New Variable</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="VARIABLE_NAME"
                    value={newVariable.key}
                    onChange={(e) => setNewVariable(prev => ({
                      ...prev,
                      key: e.target.value.toUpperCase()
                    }))}
                  />
                  <Input
                    placeholder="Variable value"
                    type={newVariable.sensitive ? 'password' : 'text'}
                    value={newVariable.value}
                    onChange={(e) => setNewVariable(prev => ({
                      ...prev,
                      value: e.target.value
                    }))}
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={newVariable.type}
                    onChange={(e) => setNewVariable(prev => ({
                      ...prev,
                      type: e.target.value as any
                    }))}
                    className="text-xs border rounded px-2 py-1"
                  >
                    <option value="both">Both</option>
                    <option value="frontend">Frontend</option>
                    <option value="backend">Backend</option>
                  </select>
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={newVariable.required}
                      onChange={(e) => setNewVariable(prev => ({
                        ...prev,
                        required: e.target.checked
                      }))}
                    />
                    Required
                  </label>
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={newVariable.sensitive}
                      onChange={(e) => setNewVariable(prev => ({
                        ...prev,
                        sensitive: e.target.checked
                      }))}
                    />
                    Sensitive
                  </label>
                  <Button size="sm" onClick={addVariable}>
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Variables List */}
              <ScrollArea className="flex-1 px-4">
                <div className="space-y-3 py-4">
                  {variables.map((variable) => (
                    <Card key={variable.id} className="p-3">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-sm font-medium">
                                {variable.key}
                              </span>
                              <Badge 
                                variant="outline" 
                                className="text-xs"
                              >
                                {variable.type}
                              </Badge>
                              {variable.required && (
                                <Badge variant="destructive" className="text-xs">
                                  Required
                                </Badge>
                              )}
                              {variable.sensitive && (
                                <Shield className="w-3 h-3 text-yellow-500" />
                              )}
                            </div>
                            {variable.description && (
                              <p className="text-xs text-muted-foreground mb-2">
                                {variable.description}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleValueVisibility(variable.id)}
                            >
                              {visibleValues.has(variable.id) ? (
                                <EyeOff className="w-3 h-3" />
                              ) : (
                                <Eye className="w-3 h-3" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => navigator.clipboard.writeText(variable.value)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeVariable(variable.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <Input
                          value={variable.value}
                          type={variable.sensitive && !visibleValues.has(variable.id) ? 'password' : 'text'}
                          onChange={(e) => updateVariable(variable.id, { value: e.target.value })}
                          className="font-mono text-xs"
                        />
                      </div>
                    </Card>
                  ))}
                  
                  {variables.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No environment variables configured</p>
                      <p className="text-xs">Add variables or use templates to get started</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="flex-1 m-0">
            <ScrollArea className="h-full px-4">
              <div className="space-y-4 py-4">
                {envTemplates.map((template, index) => (
                  <div key={index} className="space-y-3">
                    <h3 className="font-medium">{template.category}</h3>
                    <div className="space-y-2">
                      {template.variables.map((templateVar, varIndex) => (
                        <Card key={varIndex} className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-sm font-medium">
                                  {templateVar.key}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {templateVar.type}
                                </Badge>
                                {templateVar.required && (
                                  <Badge variant="destructive" className="text-xs">
                                    Required
                                  </Badge>
                                )}
                                {templateVar.sensitive && (
                                  <Shield className="w-3 h-3 text-yellow-500" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {templateVar.description}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => addFromTemplate(templateVar)}
                              disabled={variables.some(v => v.key === templateVar.key)}
                            >
                              {variables.some(v => v.key === templateVar.key) ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : (
                                <Plus className="w-3 h-3" />
                              )}
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="export" className="flex-1 m-0">
            <div className="p-4 space-y-4">
              <div className="space-y-3">
                <h3 className="font-medium">Export Environment Files</h3>
                <p className="text-sm text-muted-foreground">
                  Download .env files for different environments and deployment targets.
                </p>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => downloadEnvFile('frontend')}
                    className="justify-start"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Frontend .env
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => copyEnvFile('frontend')}
                    className="justify-start"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Frontend
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => downloadEnvFile('backend')}
                    className="justify-start"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Backend .env
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => copyEnvFile('backend')}
                    className="justify-start"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Backend
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => downloadEnvFile('both')}
                    className="justify-start"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Complete .env
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => copyEnvFile('both')}
                    className="justify-start"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy All
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-sm">Preview</h4>
                <div className="bg-black rounded p-3 max-h-40 overflow-y-auto">
                  <pre className="text-xs text-green-400 font-mono">
                    {generateEnvFile('both')}
                  </pre>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="import" className="flex-1 m-0">
            <div className="p-4 space-y-4">
              <div className="space-y-3">
                <h3 className="font-medium">Import Environment Variables</h3>
                <p className="text-sm text-muted-foreground">
                  Paste your .env file content below to import variables.
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="env-content">Environment File Content</Label>
                <Textarea
                  id="env-content"
                  placeholder={`DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
VITE_API_URL=http://localhost:3001`}
                  value={envFileContent}
                  onChange={(e) => setEnvFileContent(e.target.value)}
                  className="h-40 font-mono text-xs"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={importEnvFile}
                  disabled={!envFileContent.trim()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import Variables
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEnvFileContent('')}
                >
                  Clear
                </Button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-xs text-blue-800">
                  <strong>Tip:</strong> Only new variables will be imported. 
                  Existing variables with the same name will be skipped.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
