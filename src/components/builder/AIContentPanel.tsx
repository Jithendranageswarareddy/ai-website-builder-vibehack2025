import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAIAssistant, ContentRequest } from '@/hooks/use-ai-assistant';
import { 
  Sparkles, 
  Wand2, 
  Target, 
  TrendingUp, 
  Copy, 
  Check,
  Lightbulb,
  Zap,
  Brain,
  RefreshCw
} from 'lucide-react';

interface AIContentPanelProps {
  onContentGenerated: (content: string) => void;
}

export const AIContentPanel: React.FC<AIContentPanelProps> = ({ onContentGenerated }) => {
  const { generateContent, improveContent, generateSEOContent, isLoading, lastResponse } = useAIAssistant();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'generate' | 'improve' | 'seo'>('generate');
  
  // Form states
  const [contentType, setContentType] = useState<ContentRequest['type']>('hero');
  const [tone, setTone] = useState<ContentRequest['tone']>('professional');
  const [audience, setAudience] = useState('');
  const [context, setContext] = useState('');
  const [currentContent, setCurrentContent] = useState('');
  const [feedback, setFeedback] = useState('');
  const [keywords, setKeywords] = useState('');

  const handleGenerate = async () => {
    const request: ContentRequest = {
      type: contentType,
      context: context || 'Generate engaging content for a modern website',
      audience,
      tone,
      length: 'medium'
    };
    
    await generateContent(request);
  };

  const handleImprove = async () => {
    if (!currentContent.trim()) return;
    await improveContent(currentContent, feedback);
  };

  const handleSEOGenerate = async () => {
    const keywordList = keywords.split(',').map(k => k.trim()).filter(k => k);
    if (keywordList.length === 0) return;
    await generateSEOContent(keywordList);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const useContent = () => {
    if (lastResponse) {
      onContentGenerated(lastResponse.content);
    }
  };

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          AI Content Assistant
          <Badge variant="secondary" className="ml-auto">
            <Sparkles className="w-3 h-3 mr-1" />
            Beta
          </Badge>
        </CardTitle>
        
        <div className="flex gap-1">
          <Button
            variant={activeTab === 'generate' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('generate')}
            className="flex-1"
          >
            <Wand2 className="w-4 h-4 mr-1" />
            Generate
          </Button>
          <Button
            variant={activeTab === 'improve' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('improve')}
            className="flex-1"
          >
            <TrendingUp className="w-4 h-4 mr-1" />
            Improve
          </Button>
          <Button
            variant={activeTab === 'seo' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('seo')}
            className="flex-1"
          >
            <Target className="w-4 h-4 mr-1" />
            SEO
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <ScrollArea className="h-96">
          {activeTab === 'generate' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content-type">Content Type</Label>
                <Select value={contentType} onValueChange={(value: ContentRequest['type']) => setContentType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hero">Hero Section</SelectItem>
                    <SelectItem value="features">Features</SelectItem>
                    <SelectItem value="cta">Call to Action</SelectItem>
                    <SelectItem value="general">General Content</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tone">Tone</Label>
                <Select value={tone} onValueChange={(value: ContentRequest['tone']) => setTone(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="audience">Target Audience</Label>
                <Input
                  id="audience"
                  placeholder="e.g., small business owners, developers, students"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="context">Context & Requirements</Label>
                <Textarea
                  id="context"
                  placeholder="Describe your product, service, or specific requirements..."
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  className="h-20"
                />
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 mr-2" />
                )}
                Generate Content
              </Button>
            </div>
          )}

          {activeTab === 'improve' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-content">Current Content</Label>
                <Textarea
                  id="current-content"
                  placeholder="Paste your existing content here..."
                  value={currentContent}
                  onChange={(e) => setCurrentContent(e.target.value)}
                  className="h-24"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback">Improvement Goals</Label>
                <Textarea
                  id="feedback"
                  placeholder="What would you like to improve? (e.g., make it more engaging, add urgency, simplify language)"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="h-20"
                />
              </div>

              <Button 
                onClick={handleImprove} 
                disabled={isLoading || !currentContent.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <TrendingUp className="w-4 h-4 mr-2" />
                )}
                Improve Content
              </Button>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords</Label>
                <Input
                  id="keywords"
                  placeholder="web design, marketing, business (comma separated)"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Enter 2-5 keywords separated by commas
                </p>
              </div>

              <div className="bg-muted/50 p-3 rounded-lg">
                <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                  <Lightbulb className="w-4 h-4" />
                  SEO Tips
                </h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Use primary keywords in titles</li>
                  <li>• Keep titles under 60 characters</li>
                  <li>• Include action words</li>
                  <li>• Focus on user intent</li>
                </ul>
              </div>

              <Button 
                onClick={handleSEOGenerate} 
                disabled={isLoading || !keywords.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Target className="w-4 h-4 mr-2" />
                )}
                Generate SEO Content
              </Button>
            </div>
          )}

          {lastResponse && (
            <>
              <Separator className="my-4" />
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Generated Content</h4>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(lastResponse.confidence * 100)}% confidence
                  </Badge>
                </div>

                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm">{lastResponse.content}</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(lastResponse.content)}
                    className="flex-1"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 mr-1" />
                    ) : (
                      <Copy className="w-4 h-4 mr-1" />
                    )}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                  <Button
                    size="sm"
                    onClick={useContent}
                    className="flex-1"
                  >
                    <Zap className="w-4 h-4 mr-1" />
                    Use Content
                  </Button>
                </div>

                {lastResponse.suggestions.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="font-medium text-xs text-muted-foreground">Suggestions</h5>
                    <div className="space-y-1">
                      {lastResponse.suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-start gap-2 text-xs">
                          <Lightbulb className="w-3 h-3 mt-0.5 text-yellow-500 flex-shrink-0" />
                          <span className="text-muted-foreground">{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
