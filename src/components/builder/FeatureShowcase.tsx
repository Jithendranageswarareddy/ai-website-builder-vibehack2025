import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, 
  Palette, 
  Search, 
  Users, 
  Zap, 
  BarChart3,
  CheckCircle,
  Star,
  TrendingUp,
  Target,
  Brain,
  Globe,
  Smartphone,
  Monitor,
  Rocket,
  Shield,
  Clock,
  Award
} from 'lucide-react';

interface FeatureShowcaseProps {
  onFeatureSelect: (feature: string) => void;
}

export const FeatureShowcase: React.FC<FeatureShowcaseProps> = ({ onFeatureSelect }) => {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  const advancedFeatures = [
    {
      id: 'ai-content',
      title: 'AI Content Generation',
      description: 'Intelligent content creation with multiple tones and contexts',
      icon: Sparkles,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      features: [
        'Multi-tone content generation',
        'Context-aware suggestions',
        'SEO optimization hints',
        'Real-time confidence scoring'
      ],
      status: 'live',
      popularity: 95
    },
    {
      id: 'templates',
      title: 'Template Library',
      description: 'Professional templates for every industry and use case',
      icon: Palette,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      features: [
        '50+ premium templates',
        'Industry-specific designs',
        'One-click application',
        'Customizable components'
      ],
      status: 'live',
      popularity: 89
    },
    {
      id: 'seo',
      title: 'Advanced SEO Tools',
      description: 'Comprehensive SEO analysis and optimization',
      icon: Search,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      features: [
        'Real-time SEO scoring',
        'Keyword optimization',
        'Performance analysis',
        'Mobile-first indexing'
      ],
      status: 'live',
      popularity: 92
    },
    {
      id: 'collaboration',
      title: 'Real-time Collaboration',
      description: 'Work together with live cursors and instant updates',
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      features: [
        'Live cursor tracking',
        'Real-time component sync',
        'Activity timeline',
        'User presence indicators'
      ],
      status: 'live',
      popularity: 87
    },
    {
      id: 'analytics',
      title: 'Advanced Analytics',
      description: 'Comprehensive insights into your website performance',
      icon: BarChart3,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      features: [
        'Real-time API monitoring',
        'Performance metrics',
        'User behavior tracking',
        'Custom event logging'
      ],
      status: 'live',
      popularity: 91
    },
    {
      id: 'preview',
      title: 'Live Preview System',
      description: 'Instant preview with responsive device modes',
      icon: Zap,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      features: [
        'Instant component updates',
        'Multi-device preview',
        'Auto-save functionality',
        'Export capabilities'
      ],
      status: 'live',
      popularity: 94
    }
  ];

  const stats = [
    { label: 'Active Features', value: '6', icon: Rocket },
    { label: 'User Satisfaction', value: '98%', icon: Star },
    { label: 'Performance Score', value: '95/100', icon: TrendingUp },
    { label: 'Uptime', value: '99.9%', icon: Shield }
  ];

  const recentUpdates = [
    {
      feature: 'AI Content Generation',
      update: 'Added multi-language support',
      timestamp: '2 hours ago',
      type: 'enhancement'
    },
    {
      feature: 'Template Library',
      update: 'New e-commerce templates added',
      timestamp: '5 hours ago',
      type: 'new'
    },
    {
      feature: 'SEO Tools',
      update: 'Improved keyword density analysis',
      timestamp: '1 day ago',
      type: 'improvement'
    },
    {
      feature: 'Real-time Collaboration',
      update: 'Enhanced cursor smoothing',
      timestamp: '2 days ago',
      type: 'enhancement'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">🚀 Advanced AI Website Builder</h1>
        <p className="text-lg text-muted-foreground mb-4">
          Complete end-to-end real-time website building experience
        </p>
        <div className="flex justify-center gap-2">
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            All Systems Operational
          </Badge>
          <Badge variant="secondary">Version 2.0</Badge>
          <Badge variant="outline">Premium Features</Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <Icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="features" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="updates">Recent Updates</TabsTrigger>
          <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {advancedFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={feature.id} 
                  className="group hover:shadow-lg transition-all duration-200 cursor-pointer"
                  onClick={() => onFeatureSelect(feature.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${feature.bgColor}`}>
                        <Icon className={`w-5 h-5 ${feature.color}`} />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {feature.status}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs">{feature.popularity}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <CardDescription className="mb-3">
                      {feature.description}
                    </CardDescription>
                    
                    <div className="space-y-2 mb-4">
                      {feature.features.map((feat, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                          <span className="text-muted-foreground">{feat}</span>
                        </div>
                      ))}
                    </div>

                    <Progress value={feature.popularity} className="mb-3" />
                    
                    <Button 
                      size="sm" 
                      className="w-full group-hover:bg-primary/90"
                      onClick={(e) => {
                        e.stopPropagation();
                        onFeatureSelect(feature.id);
                      }}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      Try {feature.title}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="updates" className="space-y-4">
          <div className="space-y-4">
            {recentUpdates.map((update, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${
                      update.type === 'new' ? 'bg-green-100 text-green-600' :
                      update.type === 'enhancement' ? 'bg-blue-100 text-blue-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      {update.type === 'new' ? <Sparkles className="w-4 h-4" /> :
                       update.type === 'enhancement' ? <TrendingUp className="w-4 h-4" /> :
                       <Target className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{update.feature}</h4>
                        <Badge variant="outline" className="text-xs capitalize">
                          {update.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{update.update}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {update.timestamp}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="roadmap" className="space-y-4">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  Coming Soon
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-medium">Advanced AI Features</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• AI-powered design suggestions</li>
                      <li>• Automatic A/B testing</li>
                      <li>• Smart content optimization</li>
                      <li>• Voice-to-website generation</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Enterprise Features</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Team workspaces</li>
                      <li>• Advanced permissions</li>
                      <li>• Custom integrations</li>
                      <li>• White-label solutions</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-600" />
                  Performance Targets 2025
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Load Time</span>
                      <span>&lt; 1s</span>
                    </div>
                    <Progress value={85} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>AI Response Time</span>
                      <span>&lt; 500ms</span>
                    </div>
                    <Progress value={75} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Real-time Latency</span>
                      <span>&lt; 50ms</span>
                    </div>
                    <Progress value={90} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
