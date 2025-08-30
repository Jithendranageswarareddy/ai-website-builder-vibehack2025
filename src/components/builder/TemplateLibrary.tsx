import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Palette, 
  Layout, 
  Smartphone, 
  Briefcase, 
  ShoppingCart, 
  GraduationCap,
  Heart,
  Camera,
  Code,
  Crown,
  Search,
  Star,
  Download,
  Eye
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  category: 'business' | 'portfolio' | 'ecommerce' | 'blog' | 'landing' | 'personal';
  description: string;
  tags: string[];
  preview: string;
  isPremium?: boolean;
  rating: number;
  downloads: number;
  components: Array<{
    type: 'hero' | 'features' | 'cta' | 'gallery' | 'testimonials' | 'contact';
    props: Record<string, any>;
  }>;
}

const templates: Template[] = [
  {
    id: 'modern-business',
    name: 'Modern Business',
    category: 'business',
    description: 'Clean and professional design perfect for corporate websites',
    tags: ['professional', 'corporate', 'modern'],
    preview: '/templates/modern-business.jpg',
    rating: 4.8,
    downloads: 1247,
    components: [
      {
        type: 'hero',
        props: {
          title: 'Transform Your Business with Innovation',
          subtitle: 'Leading solutions for modern enterprises',
          backgroundStyle: 'gradient',
          buttonStyle: 'primary'
        }
      },
      {
        type: 'features',
        props: {
          title: 'Why Choose Us',
          layout: 'grid',
          items: [
            { title: 'Expert Team', description: 'Industry-leading professionals' },
            { title: '24/7 Support', description: 'Round-the-clock assistance' },
            { title: 'Proven Results', description: 'Track record of success' }
          ]
        }
      }
    ]
  },
  {
    id: 'creative-portfolio',
    name: 'Creative Portfolio',
    category: 'portfolio',
    description: 'Showcase your work with this stunning creative portfolio template',
    tags: ['creative', 'portfolio', 'artistic'],
    preview: '/templates/creative-portfolio.jpg',
    rating: 4.9,
    downloads: 892,
    components: [
      {
        type: 'hero',
        props: {
          title: 'Creative Designer & Developer',
          subtitle: 'Bringing ideas to life through design',
          backgroundStyle: 'image',
          layout: 'centered'
        }
      }
    ]
  },
  {
    id: 'ecommerce-store',
    name: 'E-Commerce Store',
    category: 'ecommerce',
    description: 'Complete online store template with product showcase',
    tags: ['ecommerce', 'shop', 'products'],
    preview: '/templates/ecommerce-store.jpg',
    isPremium: true,
    rating: 4.7,
    downloads: 2156,
    components: [
      {
        type: 'hero',
        props: {
          title: 'Premium Products, Exceptional Quality',
          subtitle: 'Discover our curated collection',
          backgroundStyle: 'product-showcase'
        }
      }
    ]
  },
  {
    id: 'startup-landing',
    name: 'Startup Landing',
    category: 'landing',
    description: 'High-converting landing page for startups and SaaS products',
    tags: ['startup', 'saas', 'conversion'],
    preview: '/templates/startup-landing.jpg',
    rating: 4.6,
    downloads: 1689,
    components: [
      {
        type: 'hero',
        props: {
          title: 'The Future of Your Industry Starts Here',
          subtitle: 'Revolutionary platform for modern businesses',
          backgroundStyle: 'tech-gradient'
        }
      }
    ]
  },
  {
    id: 'personal-blog',
    name: 'Personal Blog',
    category: 'blog',
    description: 'Elegant blog template for writers and content creators',
    tags: ['blog', 'personal', 'content'],
    preview: '/templates/personal-blog.jpg',
    rating: 4.5,
    downloads: 743,
    components: [
      {
        type: 'hero',
        props: {
          title: 'Stories Worth Sharing',
          subtitle: 'A journey through thoughts and experiences',
          backgroundStyle: 'minimal'
        }
      }
    ]
  },
  {
    id: 'wedding-photography',
    name: 'Wedding Photography',
    category: 'personal',
    description: 'Beautiful template for wedding photographers and planners',
    tags: ['wedding', 'photography', 'elegant'],
    preview: '/templates/wedding-photography.jpg',
    isPremium: true,
    rating: 5.0,
    downloads: 456,
    components: [
      {
        type: 'hero',
        props: {
          title: 'Capturing Your Special Moments',
          subtitle: 'Timeless wedding photography',
          backgroundStyle: 'romantic'
        }
      }
    ]
  }
];

interface TemplateLibraryProps {
  onTemplateSelect: (template: Template) => void;
}

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({ onTemplateSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories = [
    { id: 'all', label: 'All Templates', icon: Layout },
    { id: 'business', label: 'Business', icon: Briefcase },
    { id: 'portfolio', label: 'Portfolio', icon: Camera },
    { id: 'ecommerce', label: 'E-Commerce', icon: ShoppingCart },
    { id: 'landing', label: 'Landing Page', icon: Smartphone },
    { id: 'blog', label: 'Blog', icon: GraduationCap },
    { id: 'personal', label: 'Personal', icon: Heart }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.icon || Layout;
  };

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-purple-600" />
          Template Library
          <Badge variant="secondary" className="ml-auto">
            {templates.length} templates
          </Badge>
        </CardTitle>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Layout className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="h-full">
          <TabsList className="grid grid-cols-4 lg:grid-cols-7 mb-4">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="text-xs flex flex-col gap-1 h-auto py-2"
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{category.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <ScrollArea className="h-96">
            <div className={`gap-4 ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2' : 'space-y-3'}`}>
              {filteredTemplates.map((template) => {
                const Icon = getCategoryIcon(template.category);
                
                return (
                  <Card key={template.id} className="group hover:shadow-lg transition-all duration-200">
                    <div className="relative">
                      <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 rounded-t-lg flex items-center justify-center">
                        <Icon className="w-12 h-12 text-muted-foreground/50" />
                        {template.isPremium && (
                          <Crown className="absolute top-2 right-2 w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                      
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-t-lg flex items-center justify-center gap-2">
                        <Button size="sm" variant="secondary">
                          <Eye className="w-4 h-4 mr-1" />
                          Preview
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => onTemplateSelect(template)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Use Template
                        </Button>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-sm">{template.name}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {template.description}
                          </p>
                        </div>
                        {template.isPremium && (
                          <Badge variant="secondary" className="text-xs">
                            Premium
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{template.rating}</span>
                          <span className="text-muted-foreground">
                            ({template.downloads})
                          </span>
                        </div>
                        
                        <div className="flex gap-1">
                          {template.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-8">
                <Layout className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No templates found</p>
                <p className="text-xs text-muted-foreground">Try adjusting your search or category filter</p>
              </div>
            )}
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
};
