import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Lightbulb, 
  Layout, 
  Palette, 
  Code, 
  Zap, 
  TrendingUp,
  Users,
  Shield,
  Database,
  Globe,
  Smartphone,
  Monitor
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CanvasBlock } from "./CanvasBuilder";

interface SmartSuggestion {
  id: string;
  type: 'component' | 'layout' | 'style' | 'performance' | 'seo' | 'accessibility';
  title: string;
  description: string;
  reasoning: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high';
  category: string;
  implementation?: {
    component?: string;
    properties?: any;
    action?: string;
  };
  preview?: string;
}

interface SmartComponentSuggestionsProps {
  blocks: CanvasBlock[];
  onAddBlock: (block: CanvasBlock) => void;
  onUpdateBlocks: (blocks: CanvasBlock[]) => void;
  projectContext?: {
    tables: any[];
    endpoints: any[];
    authConfig: any;
  };
}

export const SmartComponentSuggestions = ({
  blocks,
  onAddBlock,
  onUpdateBlocks,
  projectContext
}: SmartComponentSuggestionsProps) => {
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { toast } = useToast();

  const categories = [
    { id: 'all', name: 'All Suggestions', icon: Lightbulb },
    { id: 'component', name: 'Components', icon: Layout },
    { id: 'style', name: 'Design', icon: Palette },
    { id: 'performance', name: 'Performance', icon: Zap },
    { id: 'seo', name: 'SEO', icon: TrendingUp },
    { id: 'accessibility', name: 'Accessibility', icon: Users }
  ];

  useEffect(() => {
    generateSmartSuggestions();
  }, [blocks]);

  const generateSmartSuggestions = async () => {
    setIsAnalyzing(true);
    
    try {
      // Simulate AI analysis (in real implementation, this would call OpenAI API)
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newSuggestions: SmartSuggestion[] = [];
      
      // Component Suggestions
      analyzeComponentNeeds(newSuggestions);
      
      // Layout Suggestions
      analyzeLayoutOpportunities(newSuggestions);
      
      // Style Suggestions
      analyzeDesignPatterns(newSuggestions);
      
      // Performance Suggestions
      analyzePerformanceOptimizations(newSuggestions);
      
      // SEO Suggestions
      analyzeSEOOpportunities(newSuggestions);
      
      // Accessibility Suggestions
      analyzeAccessibilityImprovements(newSuggestions);
      
      // Sort by priority and confidence
      newSuggestions.sort((a, b) => {
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        return (priorityWeight[b.priority] * b.confidence) - (priorityWeight[a.priority] * a.confidence);
      });
      
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeComponentNeeds = (suggestions: SmartSuggestion[]) => {
    const blockTypes = blocks.map(block => block.type);
    
    // Check for missing essential components
    if (!blockTypes.includes('hero')) {
      suggestions.push({
        id: 'missing-hero',
        type: 'component',
        title: 'Add Hero Section',
        description: 'Your page would benefit from a compelling hero section to grab visitors\' attention',
        reasoning: 'Hero sections increase user engagement by 40% and clearly communicate your value proposition',
        confidence: 0.9,
        priority: 'high',
        category: 'Essential Components',
        implementation: {
          component: 'hero',
          properties: {
            title: 'Welcome to Our Platform',
            subtitle: 'Transform your ideas into reality',
            buttonText: 'Get Started'
          }
        }
      });
    }

    if (blockTypes.includes('hero') && !blockTypes.includes('form')) {
      suggestions.push({
        id: 'add-contact-form',
        type: 'component',
        title: 'Add Contact Form',
        description: 'Capture leads with a strategically placed contact form',
        reasoning: 'Pages with contact forms have 65% higher conversion rates',
        confidence: 0.85,
        priority: 'high',
        category: 'Lead Generation',
        implementation: {
          component: 'form',
          properties: {
            title: 'Get In Touch',
            fields: [
              { name: 'name', type: 'text', label: 'Full Name', required: true },
              { name: 'email', type: 'email', label: 'Email Address', required: true },
              { name: 'company', type: 'text', label: 'Company', required: false },
              { name: 'message', type: 'textarea', label: 'Message', required: true }
            ]
          }
        }
      });
    }

    if (projectContext?.tables && projectContext.tables.length > 0 && !blockTypes.includes('table')) {
      suggestions.push({
        id: 'display-data-table',
        type: 'component',
        title: 'Display Your Data',
        description: 'Showcase your database content with an interactive table',
        reasoning: `You have ${projectContext.tables.length} database table(s) that could be displayed to users`,
        confidence: 0.8,
        priority: 'medium',
        category: 'Data Display',
        implementation: {
          component: 'table',
          properties: {
            title: `${projectContext.tables[0]?.name || 'Data'} Overview`,
            columns: projectContext.tables[0]?.columns?.slice(0, 4) || []
          }
        }
      });
    }

    if (projectContext?.authConfig && !blockTypes.includes('auth-form')) {
      suggestions.push({
        id: 'add-authentication',
        type: 'component',
        title: 'Add User Authentication',
        description: 'Enable user registration and login functionality',
        reasoning: 'Your backend supports authentication - connect it to your frontend',
        confidence: 0.95,
        priority: 'high',
        category: 'User Management',
        implementation: {
          component: 'auth-form',
          properties: {
            authType: 'login',
            title: 'Welcome Back'
          }
        }
      });
    }
  };

  const analyzeLayoutOpportunities = (suggestions: SmartSuggestion[]) => {
    if (blocks.length > 3) {
      const positions = blocks.map(block => ({ x: block.x, y: block.y }));
      const hasOverlap = positions.some((pos, i) => 
        positions.slice(i + 1).some(otherPos => 
          Math.abs(pos.x - otherPos.x) < 100 && Math.abs(pos.y - otherPos.y) < 100
        )
      );

      if (hasOverlap) {
        suggestions.push({
          id: 'organize-layout',
          type: 'layout',
          title: 'Organize Component Layout',
          description: 'Auto-arrange components for better visual hierarchy',
          reasoning: 'Overlapping components can confuse users and hurt usability',
          confidence: 0.8,
          priority: 'medium',
          category: 'Layout Optimization',
          implementation: {
            action: 'auto-arrange'
          }
        });
      }
    }

    // Suggest responsive improvements
    if (blocks.length > 1) {
      suggestions.push({
        id: 'responsive-layout',
        type: 'layout',
        title: 'Optimize for Mobile',
        description: 'Ensure your layout works perfectly on all devices',
        reasoning: '60% of web traffic comes from mobile devices',
        confidence: 0.7,
        priority: 'high',
        category: 'Responsive Design',
        implementation: {
          action: 'add-responsive-breakpoints'
        }
      });
    }
  };

  const analyzeDesignPatterns = (suggestions: SmartSuggestion[]) => {
    const colors = blocks.map(block => block.properties.backgroundColor).filter(Boolean);
    const uniqueColors = new Set(colors);

    if (uniqueColors.size < 2 && blocks.length > 1) {
      suggestions.push({
        id: 'color-variety',
        type: 'style',
        title: 'Add Color Contrast',
        description: 'Enhance visual appeal with a cohesive color palette',
        reasoning: 'Color variety improves user engagement and brand recognition',
        confidence: 0.6,
        priority: 'medium',
        category: 'Visual Design',
        implementation: {
          action: 'apply-color-scheme'
        }
      });
    }

    // Check for consistent spacing
    const hasPadding = blocks.some(block => block.properties.padding);
    if (!hasPadding && blocks.length > 1) {
      suggestions.push({
        id: 'consistent-spacing',
        type: 'style',
        title: 'Improve Spacing Consistency',
        description: 'Add consistent padding and margins for better visual rhythm',
        reasoning: 'Consistent spacing improves readability and professional appearance',
        confidence: 0.75,
        priority: 'medium',
        category: 'Typography & Spacing'
      });
    }
  };

  const analyzePerformanceOptimizations = (suggestions: SmartSuggestion[]) => {
    if (blocks.length > 5) {
      suggestions.push({
        id: 'lazy-loading',
        type: 'performance',
        title: 'Enable Lazy Loading',
        description: 'Improve page load speed with lazy loading for components',
        reasoning: 'Lazy loading can improve initial page load time by up to 50%',
        confidence: 0.8,
        priority: 'medium',
        category: 'Load Performance'
      });
    }

    suggestions.push({
      id: 'image-optimization',
      type: 'performance',
      title: 'Optimize Images',
      description: 'Compress and optimize images for faster loading',
      reasoning: 'Optimized images reduce bandwidth usage and improve user experience',
      confidence: 0.7,
      priority: 'medium',
      category: 'Asset Optimization'
    });
  };

  const analyzeSEOOpportunities = (suggestions: SmartSuggestion[]) => {
    const hasHero = blocks.some(block => block.type === 'hero');
    
    if (hasHero) {
      suggestions.push({
        id: 'seo-meta-tags',
        type: 'seo',
        title: 'Add SEO Meta Tags',
        description: 'Improve search engine visibility with proper meta tags',
        reasoning: 'Well-crafted meta tags can increase click-through rates by 30%',
        confidence: 0.9,
        priority: 'high',
        category: 'Search Optimization'
      });
    }

    suggestions.push({
      id: 'structured-data',
      type: 'seo',
      title: 'Add Structured Data',
      description: 'Help search engines understand your content better',
      reasoning: 'Structured data can lead to rich snippets in search results',
      confidence: 0.7,
      priority: 'medium',
      category: 'Search Enhancement'
    });
  };

  const analyzeAccessibilityImprovements = (suggestions: SmartSuggestion[]) => {
    suggestions.push({
      id: 'aria-labels',
      type: 'accessibility',
      title: 'Add ARIA Labels',
      description: 'Improve screen reader compatibility with proper ARIA labels',
      reasoning: '15% of users rely on assistive technologies',
      confidence: 0.85,
      priority: 'high',
      category: 'Screen Reader Support'
    });

    suggestions.push({
      id: 'keyboard-navigation',
      type: 'accessibility',
      title: 'Enhance Keyboard Navigation',
      description: 'Ensure all interactive elements are keyboard accessible',
      reasoning: 'Keyboard navigation is essential for users with motor disabilities',
      confidence: 0.8,
      priority: 'medium',
      category: 'Motor Accessibility'
    });
  };

  const applySuggestion = async (suggestion: SmartSuggestion) => {
    if (suggestion.implementation?.component) {
      const newBlock: CanvasBlock = {
        id: `${suggestion.implementation.component}-${Date.now()}`,
        type: suggestion.implementation.component as any,
        x: 50,
        y: blocks.length * 120 + 50,
        width: 400,
        height: suggestion.implementation.component === 'hero' ? 200 : 300,
        properties: suggestion.implementation.properties || {}
      };
      
      onAddBlock(newBlock);
      
      toast({
        title: "Suggestion Applied",
        description: suggestion.title,
      });
    } else if (suggestion.implementation?.action) {
      // Handle layout actions
      switch (suggestion.implementation.action) {
        case 'auto-arrange':
          autoArrangeBlocks();
          break;
        case 'apply-color-scheme':
          applyColorScheme();
          break;
        default:
          toast({
            title: "Feature Coming Soon",
            description: `${suggestion.title} will be implemented in a future update.`,
          });
      }
    }
  };

  const autoArrangeBlocks = () => {
    const arrangedBlocks = blocks.map((block, index) => ({
      ...block,
      x: 50 + (index % 2) * 420,
      y: 50 + Math.floor(index / 2) * 220
    }));
    
    onUpdateBlocks(arrangedBlocks);
    toast({
      title: "Layout Organized",
      description: "Components have been auto-arranged for better spacing.",
    });
  };

  const applyColorScheme = () => {
    const colorScheme = [
      '#3b82f6', // blue
      '#ef4444', // red  
      '#10b981', // green
      '#f59e0b', // yellow
      '#8b5cf6'  // purple
    ];
    
    const updatedBlocks = blocks.map((block, index) => ({
      ...block,
      properties: {
        ...block.properties,
        backgroundColor: colorScheme[index % colorScheme.length]
      }
    }));
    
    onUpdateBlocks(updatedBlocks);
    toast({
      title: "Color Scheme Applied",
      description: "A cohesive color palette has been applied to your components.",
    });
  };

  const filteredSuggestions = selectedCategory === 'all' 
    ? suggestions 
    : suggestions.filter(s => s.type === selectedCategory);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      component: Layout,
      layout: Monitor,
      style: Palette,
      performance: Zap,
      seo: TrendingUp,
      accessibility: Users
    };
    return icons[type as keyof typeof icons] || Lightbulb;
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-primary" />
          Smart Suggestions
          <Badge variant="secondary" className="text-xs">
            {suggestions.length} insights
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Category Filter */}
        <div className="px-4 pb-3">
          <div className="flex gap-1 overflow-x-auto">
            {categories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="text-xs whitespace-nowrap"
              >
                <category.icon className="w-3 h-3 mr-1" />
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Suggestions List */}
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-3 pb-4">
            {isAnalyzing ? (
              <div className="text-center py-8">
                <Zap className="w-8 h-8 mx-auto mb-4 animate-pulse text-primary" />
                <p className="text-sm text-muted-foreground">Analyzing your website...</p>
              </div>
            ) : filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((suggestion) => {
                const TypeIcon = getTypeIcon(suggestion.type);
                
                return (
                  <Card key={suggestion.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{getPriorityIcon(suggestion.priority)}</span>
                            <TypeIcon className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{suggestion.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {suggestion.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {Math.round(suggestion.confidence * 100)}%
                          </Badge>
                          <Button
                            size="sm"
                            onClick={() => applySuggestion(suggestion)}
                          >
                            Apply
                          </Button>
                        </div>
                      </div>
                      
                      <div className="pl-9">
                        <div className="bg-muted/50 rounded p-2">
                          <p className="text-xs text-muted-foreground">
                            <strong>Why:</strong> {suggestion.reasoning}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No suggestions for this category yet.</p>
                <p className="text-xs">Keep building and I'll provide more insights!</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <Button
            onClick={generateSmartSuggestions}
            disabled={isAnalyzing}
            size="sm"
            className="w-full"
          >
            {isAnalyzing ? (
              <Zap className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Lightbulb className="w-4 h-4 mr-2" />
            )}
            {isAnalyzing ? 'Analyzing...' : 'Refresh Suggestions'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
