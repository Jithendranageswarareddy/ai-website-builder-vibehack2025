import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Palette, 
  Code2, 
  Database, 
  Layers, 
  Plus, 
  Eye, 
  Download,
  Sparkles,
  MessageSquare,
  Play
} from "lucide-react";

export const BuilderInterface = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container px-4 md:px-6">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Experience the 
            <span className="bg-gradient-ai bg-clip-text text-transparent"> Builder Interface</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See how easy it is to build professional applications with our intuitive drag-and-drop builder.
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          <Card className="overflow-hidden border-2 border-primary/10">
            <CardHeader className="bg-builder-panel text-builder-text">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Project Dashboard
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-primary/20 text-primary">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Active
                  </Badge>
                  <Button size="sm" className="btn-ai">
                    <Play className="w-3 h-3 mr-1" />
                    Preview
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="grid lg:grid-cols-4 h-[600px]">
                {/* Components Panel */}
                <div className="bg-muted/30 border-r border-border/50 p-4">
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      Components
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { name: "Header", icon: "□" },
                        { name: "Button", icon: "▢" },
                        { name: "Form", icon: "▥" },
                        { name: "Card", icon: "▦" },
                        { name: "Gallery", icon: "▣" },
                        { name: "Footer", icon: "▤" }
                      ].map((component, i) => (
                        <Button
                          key={i}
                          variant="ghost"
                          size="sm"
                          className="h-auto p-3 flex flex-col items-center gap-1 hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          <span className="text-lg">{component.icon}</span>
                          <span className="text-xs">{component.name}</span>
                        </Button>
                      ))}
                    </div>

                    <Button size="sm" className="w-full btn-ghost-ai">
                      <Plus className="w-3 h-3 mr-1" />
                      Add Component
                    </Button>
                  </div>
                </div>

                {/* Canvas Area */}
                <div className="lg:col-span-2 bg-white border-r border-border/50 relative overflow-hidden">
                  <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                  <div className="relative z-10 p-8 space-y-6">
                    {/* Simulated webpage elements */}
                    <div className="bg-gradient-primary p-4 rounded-lg text-white">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold">Hero Section</h3>
                        <Badge className="bg-white/20">Editable</Badge>
                      </div>
                      <p className="text-sm opacity-90 mt-2">Experience the future of no-code development!</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-muted/50 p-3 rounded border-2 border-dashed border-primary/30 hover:border-primary/60 cursor-pointer transition-colors">
                          <div className="w-8 h-8 bg-primary/20 rounded mb-2"></div>
                          <div className="h-2 bg-muted rounded mb-1"></div>
                          <div className="h-1 bg-muted/70 rounded"></div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-muted/30 p-4 rounded-lg border-2 border-dashed border-accent/30">
                      <div className="text-center text-muted-foreground">
                        <Plus className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Drop components here</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Properties Panel */}
                <div className="bg-muted/30 p-4">
                  <Tabs defaultValue="design" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="design" className="text-xs">
                        <Palette className="w-3 h-3 mr-1" />
                        Design
                      </TabsTrigger>
                      <TabsTrigger value="code" className="text-xs">
                        <Code2 className="w-3 h-3 mr-1" />
                        Code
                      </TabsTrigger>
                      <TabsTrigger value="data" className="text-xs">
                        <Database className="w-3 h-3 mr-1" />
                        Data
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="design" className="space-y-4 mt-4">
                      <div>
                        <label className="text-xs font-medium mb-2 block">Background</label>
                        <div className="flex gap-2">
                          <div className="w-6 h-6 bg-white border rounded cursor-pointer"></div>
                          <div className="w-6 h-6 bg-primary rounded cursor-pointer"></div>
                          <div className="w-6 h-6 bg-gradient-primary rounded cursor-pointer"></div>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-2 block">Typography</label>
                        <select className="w-full text-xs p-2 border rounded">
                          <option>Inter</option>
                          <option>Roboto</option>
                          <option>Open Sans</option>
                        </select>
                      </div>
                    </TabsContent>

                    <TabsContent value="code" className="space-y-4 mt-4">
                      <div className="bg-black/90 text-green-400 p-3 rounded text-xs font-mono">
                        <div>{'<div className="hero">'}</div>
                        <div className="ml-2">{'<h1>Welcome</h1>'}</div>
                        <div>{'</div>'}</div>
                      </div>
                      <Button size="sm" className="w-full btn-ai text-xs">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Optimize
                      </Button>
                    </TabsContent>

                    <TabsContent value="data" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <div className="text-xs font-medium">Connected APIs</div>
                        <div className="bg-muted/50 p-2 rounded text-xs">
                          /api/users
                        </div>
                        <div className="bg-muted/50 p-2 rounded text-xs">
                          /api/products
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="mt-6 space-y-2">
                    <Button size="sm" className="w-full" variant="outline">
                      <Eye className="w-3 h-3 mr-1" />
                      Preview
                    </Button>
                    <Button size="sm" className="w-full btn-hero">
                      <Download className="w-3 h-3 mr-1" />
                      Export Code
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Assistant Chat */}
          <Card className="mt-8 max-w-md mx-auto">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="w-8 h-8 bg-gradient-ai rounded-full flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                AI Assistant
                <div className="ml-auto">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm">
                  <strong>AI:</strong> I've added a hero section to your page. Would you like me to customize the colors to match your brand?
                </p>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg ml-6">
                <p className="text-sm">
                  <strong>You:</strong> Yes, make it purple and blue gradient
                </p>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm">
                  <strong>AI:</strong> Perfect! I've applied a purple-blue gradient. The hero section now matches your brand colors. ✨
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};