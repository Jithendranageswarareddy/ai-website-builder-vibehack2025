import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  Code, 
  Database, 
  Globe, 
  Palette, 
  Shield, 
  Zap,
  Users,
  BarChart3,
  FileText,
  Download,
  Play,
  Rocket,
  Star,
  Award,
  Target,
  Lightbulb,
  Heart
} from "lucide-react";

export const ProjectShowcase = () => {
  const phases = [
    {
      id: 1,
      title: "Backend Core",
      description: "Complete backend infrastructure with database design and API generation",
      status: "complete",
      features: [
        "Schema Designer with visual table creation",
        "API Generator with RESTful endpoints", 
        "Authentication system with JWT tokens",
        "Backend code generation with best practices"
      ]
    },
    {
      id: 2,
      title: "Frontend Core", 
      description: "Drag-and-drop visual website builder with live preview",
      status: "complete",
      features: [
        "Canvas Builder with intuitive drag-and-drop",
        "Properties Panel for component customization",
        "Live Preview with real-time updates",
        "Code Export generating clean React components"
      ]
    },
    {
      id: 3,
      title: "AI Features",
      description: "Intelligent assistance and optimization powered by AI",
      status: "complete", 
      features: [
        "AI Chat Assistant for natural language building",
        "Smart Component Suggestions based on context",
        "Code Optimization with performance improvements",
        "Intelligent layout and design recommendations"
      ]
    },
    {
      id: 4,
      title: "Deployment & ZIP",
      description: "Complete project export and deployment automation",
      status: "complete",
      features: [
        "Project Export as downloadable ZIP files",
        "Vercel Deployment with one-click publishing",
        "Environment Variables management",
        "Production-ready code generation"
      ]
    },
    {
      id: 5,
      title: "Collaboration & Project Management",
      description: "Team features and advanced project organization",
      status: "complete",
      features: [
        "Project Manager with save/load functionality",
        "History Panel with unlimited undo/redo",
        "Collaboration Panel for team workflows",
        "Advanced state management with persistence"
      ]
    },
    {
      id: 6,
      title: "Bonus Features for Hackathon MVP",
      description: "Professional features for complete demonstration",
      status: "complete",
      features: [
        "Auth Form Integration with backend endpoints",
        "Schema Visualizer with relationship mapping",
        "Analytics & Logs with real-time monitoring",
        "Deployment Documentation with auto-generation"
      ]
    }
  ];

  const techStack = [
    { name: "React 18.3.1", category: "Frontend", icon: "⚛️" },
    { name: "TypeScript 5.8.3", category: "Language", icon: "🔷" },
    { name: "Vite 5.4.19", category: "Build Tool", icon: "⚡" },
    { name: "Tailwind CSS", category: "Styling", icon: "🎨" },
    { name: "shadcn/ui", category: "Components", icon: "🧩" },
    { name: "Lucide React", category: "Icons", icon: "✨" },
    { name: "Mock ReactFlow", category: "Visualization", icon: "🔗" },
    { name: "Local Storage", category: "Persistence", icon: "💾" }
  ];

  const achievements = [
    { 
      title: "Complete Full-Stack Builder", 
      description: "End-to-end website creation from database to deployment",
      icon: <Globe className="w-5 h-5" />
    },
    { 
      title: "AI-Powered Intelligence", 
      description: "Smart suggestions and automated optimization",
      icon: <Lightbulb className="w-5 h-5" />
    },
    { 
      title: "Professional Documentation", 
      description: "Auto-generated README and deployment guides",
      icon: <FileText className="w-5 h-5" />
    },
    { 
      title: "Production Ready", 
      description: "Clean code export with deployment automation",
      icon: <Rocket className="w-5 h-5" />
    },
    { 
      title: "Collaborative Features", 
      description: "Team workflows with version control",
      icon: <Users className="w-5 h-5" />
    },
    { 
      title: "Analytics & Monitoring", 
      description: "Real-time logs and performance tracking",
      icon: <BarChart3 className="w-5 h-5" />
    }
  ];

  const mvpHighlights = [
    "🚀 **Zero-to-Deploy in Minutes** - Complete app from idea to live URL",
    "🎨 **Visual Building** - No coding required, intuitive drag-and-drop",
    "🤖 **AI Assistant** - Smart suggestions and automated optimizations", 
    "📊 **Full-Stack Generation** - Frontend + Backend + Database schema",
    "🔐 **Authentication Ready** - Complete user management system",
    "📈 **Analytics Built-in** - Monitor performance and usage",
    "📦 **Export Everything** - Download complete project files",
    "☁️ **One-Click Deploy** - Instant deployment to Vercel/Netlify"
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Award className="w-8 h-8 text-yellow-500" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            AI-Powered Website Builder
          </h1>
          <Award className="w-8 h-8 text-yellow-500" />
        </div>
        
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Complete hackathon MVP showcasing a professional-grade drag-and-drop website builder 
          with AI assistance, full-stack code generation, and deployment automation.
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            All 6 Phases Complete
          </Badge>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <Star className="w-3 h-3 mr-1" />
            Hackathon Ready
          </Badge>
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            <Target className="w-3 h-3 mr-1" />
            Production Quality
          </Badge>
        </div>
      </div>

      {/* MVP Highlights */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-purple-600" />
            🏆 Hackathon MVP Highlights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mvpHighlights.map((highlight, index) => (
              <div key={index} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm" dangerouslySetInnerHTML={{ __html: highlight }} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Development Phases */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center flex items-center justify-center gap-2">
          <Code className="w-6 h-6" />
          Development Phases
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {phases.map((phase) => (
            <Card key={phase.id} className="relative overflow-hidden">
              {/* Completion Badge */}
              <div className="absolute top-3 right-3">
                <Badge variant="default" className="bg-green-500 text-white">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Complete
                </Badge>
              </div>
              
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    {phase.id}
                  </div>
                  {phase.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{phase.description}</p>
              </CardHeader>
              
              <CardContent className="pt-0">
                <ul className="space-y-2">
                  {phase.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Technology Stack
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {techStack.map((tech, index) => (
              <div key={index} className="text-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="text-2xl mb-2">{tech.icon}</div>
                <div className="font-medium text-sm">{tech.name}</div>
                <div className="text-xs text-muted-foreground">{tech.category}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Key Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {achievements.map((achievement, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  {achievement.icon}
                </div>
                <div>
                  <h3 className="font-medium">{achievement.title}</h3>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Demo Instructions */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Play className="w-5 h-5" />
            🎮 Demo Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" />
                For Judges & Viewers
              </h3>
              <ul className="space-y-2 text-sm">
                <li>• Click "Phase 6 MVP Features" buttons in the top bar</li>
                <li>• Try the Auth Forms with demo credentials</li>
                <li>• Explore the Schema Visualizer diagrams</li>
                <li>• View live Analytics & API logs</li>
                <li>• Generate deployment documentation</li>
                <li>• Drag components onto the canvas</li>
                <li>• Use the AI Assistant for suggestions</li>
                <li>• Export complete project files</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Key Demo Points
              </h3>
              <ul className="space-y-2 text-sm">
                <li>• **Visual Building** - No coding knowledge required</li>
                <li>• **AI Intelligence** - Smart suggestions and optimization</li>
                <li>• **Full-Stack Output** - Complete working applications</li>
                <li>• **Professional Quality** - Production-ready code</li>
                <li>• **Real Authentication** - Working login/signup systems</li>
                <li>• **Instant Deployment** - One-click publishing</li>
                <li>• **Complete Documentation** - Auto-generated guides</li>
                <li>• **Analytics Dashboard** - Real monitoring capabilities</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center py-8 border-t">
        <div className="flex items-center justify-center gap-4 mb-4">
          <Badge variant="outline" className="px-4 py-2">
            <Code className="w-4 h-4 mr-2" />
            6 Phases Complete
          </Badge>
          <Badge variant="outline" className="px-4 py-2">
            <CheckCircle className="w-4 h-4 mr-2" />
            MVP Ready
          </Badge>
          <Badge variant="outline" className="px-4 py-2">
            <Star className="w-4 h-4 mr-2" />
            Demo Ready
          </Badge>
        </div>
        
        <p className="text-muted-foreground">
          Built with ❤️ for the hackathon - showcasing the future of no-code development
        </p>
        
        <div className="flex items-center justify-center gap-4 mt-4">
          <Button variant="outline" size="sm">
            <Globe className="w-3 h-3 mr-1" />
            Live Demo
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-3 h-3 mr-1" />
            Export Code
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="w-3 h-3 mr-1" />
            Documentation
          </Button>
        </div>
      </div>
    </div>
  );
};
