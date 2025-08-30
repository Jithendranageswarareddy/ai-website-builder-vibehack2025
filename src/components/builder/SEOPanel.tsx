import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Target, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Globe,
  Smartphone,
  Gauge,
  Eye,
  Share,
  BarChart3,
  Lightbulb
} from 'lucide-react';

interface SEOAnalysis {
  score: number;
  title: {
    content: string;
    length: number;
    score: number;
    issues: string[];
  };
  description: {
    content: string;
    length: number;
    score: number;
    issues: string[];
  };
  keywords: {
    primary: string[];
    secondary: string[];
    density: number;
    score: number;
  };
  structure: {
    headings: { h1: number; h2: number; h3: number };
    images: { total: number; withAlt: number };
    links: { internal: number; external: number };
    score: number;
  };
  performance: {
    loadTime: number;
    mobileScore: number;
    desktopScore: number;
    score: number;
  };
}

interface SEOPanelProps {
  content: string;
  onOptimize: (optimizations: Record<string, any>) => void;
}

export const SEOPanel: React.FC<SEOPanelProps> = ({ content, onOptimize }) => {
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [focusKeyword, setFocusKeyword] = useState('');

  useEffect(() => {
    if (content) {
      analyzeContent();
    }
  }, [content]);

  const analyzeContent = async () => {
    setIsAnalyzing(true);
    
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock SEO analysis
    const mockAnalysis: SEOAnalysis = {
      score: Math.floor(Math.random() * 30) + 65, // 65-95
      title: {
        content: title || 'Your Website Title',
        length: (title || 'Your Website Title').length,
        score: title && title.length >= 30 && title.length <= 60 ? 90 : 60,
        issues: title?.length > 60 ? ['Title too long'] : title?.length < 30 ? ['Title too short'] : []
      },
      description: {
        content: description || 'Your website description',
        length: (description || 'Your website description').length,
        score: description && description.length >= 120 && description.length <= 160 ? 95 : 70,
        issues: description?.length > 160 ? ['Description too long'] : description?.length < 120 ? ['Description too short'] : []
      },
      keywords: {
        primary: keywords.split(',').slice(0, 3).map(k => k.trim()).filter(k => k),
        secondary: keywords.split(',').slice(3, 8).map(k => k.trim()).filter(k => k),
        density: Math.random() * 3 + 1,
        score: keywords ? 85 : 45
      },
      structure: {
        headings: { h1: 1, h2: Math.floor(Math.random() * 5) + 2, h3: Math.floor(Math.random() * 8) + 3 },
        images: { total: Math.floor(Math.random() * 10) + 5, withAlt: Math.floor(Math.random() * 8) + 3 },
        links: { internal: Math.floor(Math.random() * 15) + 5, external: Math.floor(Math.random() * 8) + 2 },
        score: 78
      },
      performance: {
        loadTime: Math.random() * 2 + 1,
        mobileScore: Math.floor(Math.random() * 20) + 75,
        desktopScore: Math.floor(Math.random() * 20) + 80,
        score: 82
      }
    };

    setAnalysis(mockAnalysis);
    setIsAnalyzing(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  const optimizationSuggestions = [
    {
      category: 'Content',
      items: [
        'Add focus keyword to title',
        'Include target keywords naturally',
        'Improve content readability',
        'Add internal links'
      ]
    },
    {
      category: 'Technical',
      items: [
        'Optimize images for web',
        'Add alt text to images',
        'Improve page load speed',
        'Add structured data'
      ]
    },
    {
      category: 'Mobile',
      items: [
        'Ensure mobile responsiveness',
        'Optimize for touch interfaces',
        'Test on various devices',
        'Improve mobile performance'
      ]
    }
  ];

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5 text-green-600" />
          SEO Optimization
          {analysis && (
            <Badge variant={getScoreBadgeVariant(analysis.score)} className="ml-auto">
              Score: {analysis.score}/100
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="content" className="text-xs">Content</TabsTrigger>
            <TabsTrigger value="technical" className="text-xs">Technical</TabsTrigger>
            <TabsTrigger value="suggestions" className="text-xs">Tips</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-96">
            <TabsContent value="overview" className="space-y-4">
              {isAnalyzing ? (
                <div className="text-center py-8">
                  <Gauge className="w-8 h-8 mx-auto mb-4 animate-spin text-green-600" />
                  <p className="text-sm text-muted-foreground">Analyzing SEO performance...</p>
                </div>
              ) : analysis ? (
                <>
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getScoreColor(analysis.score)} mb-2`}>
                      {analysis.score}
                    </div>
                    <p className="text-sm text-muted-foreground">Overall SEO Score</p>
                    <Progress value={analysis.score} className="mt-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Card className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">Content</span>
                      </div>
                      <div className={`text-lg font-bold ${getScoreColor((analysis.title.score + analysis.description.score + analysis.keywords.score) / 3)}`}>
                        {Math.round((analysis.title.score + analysis.description.score + analysis.keywords.score) / 3)}
                      </div>
                    </Card>

                    <Card className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium">Structure</span>
                      </div>
                      <div className={`text-lg font-bold ${getScoreColor(analysis.structure.score)}`}>
                        {analysis.structure.score}
                      </div>
                    </Card>

                    <Card className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Gauge className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">Performance</span>
                      </div>
                      <div className={`text-lg font-bold ${getScoreColor(analysis.performance.score)}`}>
                        {analysis.performance.score}
                      </div>
                    </Card>

                    <Card className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Smartphone className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium">Mobile</span>
                      </div>
                      <div className={`text-lg font-bold ${getScoreColor(analysis.performance.mobileScore)}`}>
                        {analysis.performance.mobileScore}
                      </div>
                    </Card>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Quick Issues</h4>
                    {[...analysis.title.issues, ...analysis.description.issues].map((issue, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        <AlertCircle className="w-3 h-3 text-red-500" />
                        <span>{issue}</span>
                      </div>
                    ))}
                    {[...analysis.title.issues, ...analysis.description.issues].length === 0 && (
                      <div className="flex items-center gap-2 text-xs text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        <span>No critical issues found</span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Search className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click Analyze to start SEO analysis</p>
                  <Button onClick={analyzeContent} className="mt-2">
                    <Search className="w-4 h-4 mr-2" />
                    Analyze SEO
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="seo-title">SEO Title</Label>
                  <Input
                    id="seo-title"
                    placeholder="Your page title (30-60 characters)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <div className="flex justify-between text-xs mt-1">
                    <span className={title.length < 30 || title.length > 60 ? 'text-red-500' : 'text-green-600'}>
                      {title.length} characters
                    </span>
                    <span className="text-muted-foreground">30-60 recommended</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="seo-description">Meta Description</Label>
                  <Textarea
                    id="seo-description"
                    placeholder="Describe your page (120-160 characters)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="h-20"
                  />
                  <div className="flex justify-between text-xs mt-1">
                    <span className={description.length < 120 || description.length > 160 ? 'text-red-500' : 'text-green-600'}>
                      {description.length} characters
                    </span>
                    <span className="text-muted-foreground">120-160 recommended</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="focus-keyword">Focus Keyword</Label>
                  <Input
                    id="focus-keyword"
                    placeholder="Primary keyword for this page"
                    value={focusKeyword}
                    onChange={(e) => setFocusKeyword(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="keywords">Keywords</Label>
                  <Input
                    id="keywords"
                    placeholder="Additional keywords (comma separated)"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                  />
                </div>

                <Button onClick={analyzeContent} disabled={isAnalyzing} className="w-full">
                  {isAnalyzing ? 'Analyzing...' : 'Update Analysis'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="technical" className="space-y-4">
              {analysis && (
                <>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Page Structure</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>H1 headings:</span>
                          <Badge variant={analysis.structure.headings.h1 === 1 ? "default" : "destructive"}>
                            {analysis.structure.headings.h1}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>H2 headings:</span>
                          <Badge variant="outline">{analysis.structure.headings.h2}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>H3 headings:</span>
                          <Badge variant="outline">{analysis.structure.headings.h3}</Badge>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium text-sm mb-2">Images</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total images:</span>
                          <span>{analysis.structure.images.total}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>With alt text:</span>
                          <Badge variant={analysis.structure.images.withAlt === analysis.structure.images.total ? "default" : "secondary"}>
                            {analysis.structure.images.withAlt}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium text-sm mb-2">Performance</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Load time:</span>
                          <Badge variant={analysis.performance.loadTime < 3 ? "default" : "destructive"}>
                            {analysis.performance.loadTime.toFixed(1)}s
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Mobile score:</span>
                          <Badge variant={getScoreBadgeVariant(analysis.performance.mobileScore)}>
                            {analysis.performance.mobileScore}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Desktop score:</span>
                          <Badge variant={getScoreBadgeVariant(analysis.performance.desktopScore)}>
                            {analysis.performance.desktopScore}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="suggestions" className="space-y-4">
              {optimizationSuggestions.map((category, index) => (
                <div key={index}>
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    {category.category}
                  </h4>
                  <div className="space-y-2">
                    {category.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-start gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                        <span className="text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                  {index < optimizationSuggestions.length - 1 && <Separator className="mt-3" />}
                </div>
              ))}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
};
