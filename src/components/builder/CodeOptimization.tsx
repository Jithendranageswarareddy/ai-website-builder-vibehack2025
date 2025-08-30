import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Code, 
  Wand2, 
  Copy, 
  Check, 
  AlertTriangle, 
  Zap,
  FileText,
  Settings,
  Download,
  Play,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CanvasBlock } from "./CanvasBuilder";

interface CodeIssue {
  id: string;
  type: 'error' | 'warning' | 'suggestion';
  category: 'performance' | 'accessibility' | 'security' | 'maintainability' | 'formatting';
  title: string;
  description: string;
  file: string;
  line?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  fixable: boolean;
  before?: string;
  after?: string;
  explanation?: string;
}

interface OptimizationResult {
  id: string;
  type: 'formatting' | 'linting' | 'bundling' | 'minification' | 'deduplication';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  sizeBefore?: number;
  sizeAfter?: number;
  timeSaved?: number;
  applied: boolean;
}

interface CodeOptimizationProps {
  blocks: CanvasBlock[];
  projectContext?: {
    tables: any[];
    endpoints: any[];
    authConfig: any;
  };
  onCodeUpdate?: (code: string) => void;
}

export const CodeOptimization = ({
  blocks,
  projectContext,
  onCodeUpdate
}: CodeOptimizationProps) => {
  const [issues, setIssues] = useState<CodeIssue[]>([]);
  const [optimizations, setOptimizations] = useState<OptimizationResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [activeTab, setActiveTab] = useState('issues');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    analyzeCode();
  }, [blocks]);

  const analyzeCode = async () => {
    setIsAnalyzing(true);
    
    try {
      // Simulate code analysis (in real implementation, this would use ESLint, etc.)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newIssues: CodeIssue[] = [];
      const newOptimizations: OptimizationResult[] = [];
      
      // Analyze current blocks for issues
      analyzeCodeIssues(newIssues);
      
      // Generate optimization opportunities
      generateOptimizations(newOptimizations);
      
      setIssues(newIssues);
      setOptimizations(newOptimizations);
      
    } catch (error) {
      console.error('Code analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeCodeIssues = (issues: CodeIssue[]) => {
    // Check for accessibility issues
    blocks.forEach((block, index) => {
      if (block.type === 'button' && !block.properties.buttonText) {
        issues.push({
          id: `missing-button-text-${block.id}`,
          type: 'error',
          category: 'accessibility',
          title: 'Missing Button Text',
          description: 'Button components must have accessible text content',
          file: 'components/Button.tsx',
          line: index + 1,
          severity: 'high',
          fixable: true,
          before: '<button></button>',
          after: '<button>Click Here</button>',
          explanation: 'Screen readers need text content to describe button purpose to users'
        });
      }

      if (block.type === 'form' && block.properties.fields) {
        const hasRequiredWithoutLabel = block.properties.fields.some(
          field => field.required && !field.label
        );
        
        if (hasRequiredWithoutLabel) {
          issues.push({
            id: `missing-labels-${block.id}`,
            type: 'warning',
            category: 'accessibility',
            title: 'Missing Form Labels',
            description: 'Required form fields need proper labels for accessibility',
            file: 'components/Form.tsx',
            severity: 'medium',
            fixable: true,
            before: '<input type="text" required />',
            after: '<label htmlFor="field">Label</label><input id="field" type="text" required />',
            explanation: 'Labels help users understand what information is expected'
          });
        }
      }

      // Performance issues
      if (block.properties.backgroundColor?.includes('gradient') && blocks.length > 5) {
        issues.push({
          id: `gradient-performance-${block.id}`,
          type: 'suggestion',
          category: 'performance',
          title: 'Optimize Gradient Rendering',
          description: 'Multiple gradients can impact rendering performance',
          file: 'styles.css',
          severity: 'low',
          fixable: true,
          before: 'background: linear-gradient(...)',
          after: 'background-image: url(gradient.svg)',
          explanation: 'Use SVG gradients for better performance with multiple elements'
        });
      }
    });

    // Security issues
    if (projectContext?.authConfig) {
      issues.push({
        id: 'jwt-secret-security',
        type: 'warning',
        category: 'security',
        title: 'Weak JWT Secret',
        description: 'JWT secret should be a strong, random string',
        file: 'auth/config.ts',
        severity: 'critical',
        fixable: true,
        before: 'jwtSecret: "your-secret-key"',
        after: 'jwtSecret: process.env.JWT_SECRET',
        explanation: 'Use environment variables for sensitive configuration'
      });
    }

    // Code formatting issues
    issues.push({
      id: 'formatting-consistency',
      type: 'suggestion',
      category: 'formatting',
      title: 'Inconsistent Code Formatting',
      description: 'Code formatting should be consistent across files',
      file: 'Multiple files',
      severity: 'low',
      fixable: true,
      explanation: 'Use Prettier to automatically format code consistently'
    });

    // Maintainability issues
    if (blocks.length > 10) {
      issues.push({
        id: 'component-extraction',
        type: 'suggestion',
        category: 'maintainability',
        title: 'Extract Reusable Components',
        description: 'Consider extracting common patterns into reusable components',
        file: 'components/Page.tsx',
        severity: 'medium',
        fixable: true,
        explanation: 'Smaller components are easier to test and maintain'
      });
    }
  };

  const generateOptimizations = (optimizations: OptimizationResult[]) => {
    // Code formatting
    optimizations.push({
      id: 'prettier-formatting',
      type: 'formatting',
      title: 'Format Code with Prettier',
      description: 'Automatically format all code files for consistency',
      impact: 'low',
      applied: false
    });

    // ESLint fixes
    optimizations.push({
      id: 'eslint-fixes',
      type: 'linting',
      title: 'Fix ESLint Issues',
      description: 'Automatically fix linting issues and code quality problems',
      impact: 'medium',
      applied: false
    });

    // Bundle optimization
    if (blocks.length > 5) {
      optimizations.push({
        id: 'bundle-optimization',
        type: 'bundling',
        title: 'Optimize Bundle Size',
        description: 'Remove unused code and optimize imports',
        impact: 'high',
        sizeBefore: 250000,
        sizeAfter: 180000,
        applied: false
      });
    }

    // Code minification
    optimizations.push({
      id: 'code-minification',
      type: 'minification',
      title: 'Minify Production Code',
      description: 'Compress code for faster loading in production',
      impact: 'high',
      sizeBefore: 180000,
      sizeAfter: 95000,
      applied: false
    });

    // Duplicate removal
    if (blocks.length > 3) {
      optimizations.push({
        id: 'remove-duplicates',
        type: 'deduplication',
        title: 'Remove Duplicate Code',
        description: 'Identify and extract duplicate code patterns',
        impact: 'medium',
        timeSaved: 15,
        applied: false
      });
    }
  };

  const fixIssue = async (issue: CodeIssue) => {
    if (!issue.fixable) {
      toast({
        title: "Manual Fix Required",
        description: "This issue requires manual intervention.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Simulate fixing the issue
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Remove the fixed issue
      setIssues(prev => prev.filter(i => i.id !== issue.id));
      
      toast({
        title: "Issue Fixed",
        description: issue.title,
      });
    } catch (error) {
      console.error('Error fixing issue:', error);
      toast({
        title: "Fix Failed",
        description: "Unable to fix this issue automatically.",
        variant: "destructive"
      });
    }
  };

  const applyOptimization = async (optimization: OptimizationResult) => {
    setIsOptimizing(true);
    
    try {
      // Simulate applying optimization
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mark optimization as applied
      setOptimizations(prev => 
        prev.map(opt => 
          opt.id === optimization.id 
            ? { ...opt, applied: true }
            : opt
        )
      );
      
      let message = optimization.title;
      if (optimization.sizeBefore && optimization.sizeAfter) {
        const saved = optimization.sizeBefore - optimization.sizeAfter;
        const percent = Math.round((saved / optimization.sizeBefore) * 100);
        message += ` (${percent}% size reduction)`;
      }
      
      toast({
        title: "Optimization Applied",
        description: message,
      });
    } catch (error) {
      console.error('Error applying optimization:', error);
      toast({
        title: "Optimization Failed",
        description: "Unable to apply this optimization.",
        variant: "destructive"
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const applyAllOptimizations = async () => {
    const unapplied = optimizations.filter(opt => !opt.applied);
    
    for (const optimization of unapplied) {
      await applyOptimization(optimization);
    }
  };

  const copyCodeFix = async (issue: CodeIssue) => {
    if (issue.after) {
      await navigator.clipboard.writeText(issue.after);
      setCopiedId(issue.id);
      setTimeout(() => setCopiedId(null), 2000);
      
      toast({
        title: "Code Copied",
        description: "Fixed code copied to clipboard",
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-gray-600';
      default: return 'text-gray-500';
    }
  };

  const formatFileSize = (bytes: number) => {
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Code className="w-5 h-5 text-primary" />
          Code Optimization
          <Badge variant="secondary" className="text-xs">
            {issues.length} issues
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mx-4">
            <TabsTrigger value="issues" className="text-xs">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Issues ({issues.length})
            </TabsTrigger>
            <TabsTrigger value="optimize" className="text-xs">
              <Zap className="w-3 h-3 mr-1" />
              Optimize
            </TabsTrigger>
            <TabsTrigger value="tools" className="text-xs">
              <Settings className="w-3 h-3 mr-1" />
              Tools
            </TabsTrigger>
          </TabsList>

          <TabsContent value="issues" className="flex-1 m-0">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b">
                <div className="flex gap-2">
                  <Button
                    onClick={analyzeCode}
                    disabled={isAnalyzing}
                    size="sm"
                    variant="outline"
                  >
                    {isAnalyzing ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Code className="w-4 h-4 mr-2" />
                    )}
                    {isAnalyzing ? 'Analyzing...' : 'Re-analyze Code'}
                  </Button>
                  
                  <Button
                    onClick={() => issues.filter(i => i.fixable).forEach(fixIssue)}
                    disabled={!issues.some(i => i.fixable)}
                    size="sm"
                  >
                    <Wand2 className="w-4 h-4 mr-2" />
                    Fix All
                  </Button>
                </div>
              </div>
              
              <ScrollArea className="flex-1 px-4">
                <div className="space-y-3 py-4">
                  {issues.map((issue) => (
                    <Card key={issue.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${getSeverityColor(issue.severity)}`} />
                              <Badge variant="outline" className="text-xs">
                                {issue.category}
                              </Badge>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{issue.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {issue.description}
                              </p>
                              {issue.file && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  📁 {issue.file}{issue.line && `:${issue.line}`}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {issue.after && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyCodeFix(issue)}
                              >
                                {copiedId === issue.id ? (
                                  <Check className="w-3 h-3" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </Button>
                            )}
                            {issue.fixable && (
                              <Button
                                size="sm"
                                onClick={() => fixIssue(issue)}
                              >
                                Fix
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        {issue.explanation && (
                          <div className="bg-muted/50 rounded p-2">
                            <p className="text-xs text-muted-foreground">
                              💡 {issue.explanation}
                            </p>
                          </div>
                        )}
                        
                        {issue.before && issue.after && (
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">❌ Before:</p>
                              <code className="text-xs bg-red-50 p-2 rounded block font-mono">
                                {issue.before}
                              </code>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">✅ After:</p>
                              <code className="text-xs bg-green-50 p-2 rounded block font-mono">
                                {issue.after}
                              </code>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                  
                  {issues.length === 0 && !isAnalyzing && (
                    <div className="text-center text-muted-foreground py-8">
                      <Check className="w-12 h-12 mx-auto mb-4 text-green-500" />
                      <p>No issues found! Your code looks great.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="optimize" className="flex-1 m-0">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b">
                <Button
                  onClick={applyAllOptimizations}
                  disabled={isOptimizing || optimizations.every(o => o.applied)}
                  size="sm"
                  className="w-full"
                >
                  {isOptimizing ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4 mr-2" />
                  )}
                  {isOptimizing ? 'Optimizing...' : 'Apply All Optimizations'}
                </Button>
              </div>
              
              <ScrollArea className="flex-1 px-4">
                <div className="space-y-3 py-4">
                  {optimizations.map((optimization) => (
                    <Card key={optimization.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm flex items-center gap-2">
                              {optimization.title}
                              {optimization.applied && (
                                <Check className="w-4 h-4 text-green-500" />
                              )}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {optimization.description}
                            </p>
                            
                            <div className="flex items-center gap-4 mt-2">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getImpactColor(optimization.impact)}`}
                              >
                                {optimization.impact} impact
                              </Badge>
                              
                              {optimization.sizeBefore && optimization.sizeAfter && (
                                <span className="text-xs text-muted-foreground">
                                  {formatFileSize(optimization.sizeBefore)} → {formatFileSize(optimization.sizeAfter)}
                                </span>
                              )}
                              
                              {optimization.timeSaved && (
                                <span className="text-xs text-muted-foreground">
                                  Saves {optimization.timeSaved}min dev time
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <Button
                            size="sm"
                            onClick={() => applyOptimization(optimization)}
                            disabled={optimization.applied || isOptimizing}
                          >
                            {optimization.applied ? 'Applied' : 'Apply'}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="tools" className="flex-1 m-0">
            <div className="p-4 space-y-4">
              <div className="space-y-3">
                <h3 className="font-medium">Development Tools</h3>
                
                <div className="grid grid-cols-1 gap-3">
                  <Card className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-sm">Prettier</h4>
                        <p className="text-xs text-muted-foreground">Code formatting</p>
                      </div>
                      <Button size="sm" variant="outline">
                        Configure
                      </Button>
                    </div>
                  </Card>
                  
                  <Card className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-sm">ESLint</h4>
                        <p className="text-xs text-muted-foreground">Code linting</p>
                      </div>
                      <Button size="sm" variant="outline">
                        Configure
                      </Button>
                    </div>
                  </Card>
                  
                  <Card className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-sm">Bundle Analyzer</h4>
                        <p className="text-xs text-muted-foreground">Analyze bundle size</p>
                      </div>
                      <Button size="sm" variant="outline">
                        <Play className="w-3 h-3 mr-1" />
                        Run
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-medium">Export Options</h3>
                
                <div className="grid grid-cols-1 gap-2">
                  <Button variant="outline" size="sm" className="justify-start">
                    <Download className="w-3 h-3 mr-2" />
                    Download Optimization Report
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    <FileText className="w-3 h-3 mr-2" />
                    Generate Code Quality Report
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
