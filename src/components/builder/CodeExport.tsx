import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import JSZip from "jszip";
import { 
  Download, 
  Copy, 
  Code2, 
  FileText, 
  Package, 
  CheckCircle,
  ExternalLink,
  Sparkles
} from "lucide-react";
import { CanvasBlock } from "./CanvasBuilder";
import { DatabaseTable } from "./SchemaDesigner";
import { generateBackendCode, BackendConfig } from "./BackendGenerator";
import { useToast } from "@/hooks/use-toast";

interface CodeExportProps {
  blocks: CanvasBlock[];
  tables: DatabaseTable[];
  endpoints: any[];
  authConfig: any;
  projectName: string;
}

export const CodeExport = ({ 
  blocks, 
  tables, 
  endpoints, 
  authConfig, 
  projectName 
}: CodeExportProps) => {
  const [activeTab, setActiveTab] = useState('frontend');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const { toast } = useToast();

  const generateFrontendCode = () => {
    const htmlCode = generateHTML(blocks, projectName);
    const reactCode = generateReactCode(blocks, projectName);
    const cssCode = generateCSS(blocks);
    
    return {
      'index.html': htmlCode,
      'App.jsx': reactCode,
      'styles.css': cssCode,
      'package.json': generatePackageJson(projectName),
      'README.md': generateReadme(projectName, 'frontend')
    };
  };

  const exportFrontendCode = async () => {
    setIsExporting(true);
    try {
      const files = generateFrontendCode();
      const zip = new JSZip();

      Object.entries(files).forEach(([path, content]) => {
        zip.file(path, content);
      });

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName.toLowerCase().replace(/\s+/g, '-')}-frontend.zip`;
      a.click();
      URL.revokeObjectURL(url);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
      
      toast({
        title: "Frontend Exported! 🎉",
        description: "Your frontend code has been downloaded successfully"
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your code",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportBackendCode = async () => {
    setIsExporting(true);
    try {
      const backendConfig: BackendConfig = {
        tables,
        relations: [],
        endpoints,
        authConfig,
        projectName
      };

      const files = generateBackendCode(backendConfig);
      const zip = new JSZip();

      Object.entries(files).forEach(([path, content]) => {
        zip.file(path, content);
      });

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName.toLowerCase().replace(/\s+/g, '-')}-backend.zip`;
      a.click();
      URL.revokeObjectURL(url);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
      
      toast({
        title: "Backend Exported! 🚀",
        description: "Your backend code has been downloaded successfully"
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your backend code",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportFullStackApp = async () => {
    setIsExporting(true);
    try {
      const frontendFiles = generateFrontendCode();
      const backendConfig: BackendConfig = {
        tables,
        relations: [],
        endpoints,
        authConfig,
        projectName
      };
      const backendFiles = generateBackendCode(backendConfig);

      const zip = new JSZip();
      
      // Add frontend files
      const frontendFolder = zip.folder("frontend");
      Object.entries(frontendFiles).forEach(([path, content]) => {
        frontendFolder?.file(path, content);
      });

      // Add backend files
      const backendFolder = zip.folder("backend");
      Object.entries(backendFiles).forEach(([path, content]) => {
        backendFolder?.file(path, content);
      });

      // Add root files
      zip.file('docker-compose.yml', generateDockerCompose(projectName));
      zip.file('README.md', generateFullStackReadme(projectName));

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName.toLowerCase().replace(/\s+/g, '-')}-fullstack.zip`;
      a.click();
      URL.revokeObjectURL(url);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
      
      toast({
        title: "Full-Stack App Exported! 🎯",
        description: "Complete application with frontend and backend ready for deployment"
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your full-stack application",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const copyToClipboard = (code: string, type: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Code Copied! 📋",
      description: `${type} code has been copied to clipboard`
    });
  };

  const frontendFiles = generateFrontendCode();
  const currentCode = activeTab === 'html' ? frontendFiles['index.html'] :
                     activeTab === 'react' ? frontendFiles['App.jsx'] :
                     activeTab === 'css' ? frontendFiles['styles.css'] :
                     frontendFiles['package.json'];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border/50 bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4" />
            <h3 className="font-semibold">Code Export</h3>
            {exportSuccess && (
              <Badge className="bg-green-100 text-green-700 animate-pulse">
                <CheckCircle className="w-3 h-3 mr-1" />
                Exported!
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {blocks.length} blocks
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {tables.length} tables
            </Badge>
          </div>
        </div>
      </div>

      {/* Export Actions */}
      <div className="p-4 border-b border-border/50">
        <div className="grid grid-cols-3 gap-3">
          <Button
            onClick={exportFrontendCode}
            disabled={isExporting}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Frontend
          </Button>
          
          <Button
            onClick={exportBackendCode}
            disabled={isExporting}
            className="flex items-center gap-2"
            variant="outline"
          >
            <Package className="w-4 h-4" />
            Backend
          </Button>
          
          <Button
            onClick={exportFullStackApp}
            disabled={isExporting}
            className="flex items-center gap-2 bg-gradient-primary hover:opacity-90"
          >
            {isExporting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Full-Stack
          </Button>
        </div>
      </div>

      {/* Code Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="mx-4 mt-4">
            <TabsTrigger value="html" className="text-xs">HTML</TabsTrigger>
            <TabsTrigger value="react" className="text-xs">React</TabsTrigger>
            <TabsTrigger value="css" className="text-xs">CSS</TabsTrigger>
            <TabsTrigger value="package" className="text-xs">Package</TabsTrigger>
          </TabsList>

          <div className="flex-1 p-4 overflow-hidden">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span className="font-medium text-sm">
                    {activeTab === 'html' ? 'index.html' :
                     activeTab === 'react' ? 'App.jsx' :
                     activeTab === 'css' ? 'styles.css' :
                     'package.json'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(currentCode, activeTab.toUpperCase())}
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                </div>
              </div>

              <div className="flex-1 bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto font-mono text-sm">
                <pre className="whitespace-pre-wrap break-words">
                  <code>{currentCode}</code>
                </pre>
              </div>
            </div>
          </div>
        </Tabs>
      </div>

      {/* Export Stats */}
      <div className="p-3 border-t border-border/50 bg-muted/20">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Size: {Math.round(currentCode.length / 1024)}KB | 
            Lines: {currentCode.split('\n').length}
          </span>
          <span>
            Ready for production deployment
          </span>
        </div>
      </div>
    </div>
  );
};

// Helper functions for code generation
const generateHTML = (blocks: CanvasBlock[], projectName: string): string => {
  // This is the same HTML generation logic from LivePreview
  const bodyContent = blocks.map(block => {
    const style = `left: ${block.x}px; top: ${block.y}px; width: ${block.width}px; height: ${block.height}px;`;
    return `<div class="block" style="${style}">
      ${generateBlockHTML(block)}
    </div>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName}</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        ${bodyContent}
    </div>
    <script src="script.js"></script>
</body>
</html>`;
};

const generateReactCode = (blocks: CanvasBlock[], projectName: string): string => {
  const components = blocks.map(block => generateBlockReact(block)).join('\n');
  
  return `import React from 'react';
import './styles.css';

function App() {
  return (
    <div className="container">
      ${components}
    </div>
  );
}

export default App;`;
};

const generateCSS = (blocks: CanvasBlock[]): string => {
  return `/* Generated CSS for ${blocks.length} blocks */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
}

.container {
  position: relative;
  width: 100%;
  min-height: 100vh;
}

.block {
  position: absolute;
  transition: all 0.2s ease;
}

/* Component-specific styles */
${blocks.map(block => generateBlockCSS(block)).join('\n')}

/* Responsive design */
@media (max-width: 768px) {
  .block {
    position: static !important;
    width: 100% !important;
    margin-bottom: 20px;
  }
}`;
};

const generatePackageJson = (projectName: string): string => {
  return JSON.stringify({
    "name": projectName.toLowerCase().replace(/\s+/g, '-'),
    "version": "1.0.0",
    "description": `Generated by BuilderAI - ${projectName}`,
    "main": "index.html",
    "scripts": {
      "start": "live-server .",
      "build": "echo 'Build complete'",
      "dev": "live-server . --port=3000"
    },
    "devDependencies": {
      "live-server": "^1.2.2"
    },
    "keywords": ["website", "frontend", "generated"],
    "author": "BuilderAI Generated",
    "license": "MIT"
  }, null, 2);
};

const generateReadme = (projectName: string, type: string): string => {
  return `# ${projectName}

Generated by BuilderAI - AI-Powered Website Builder

## 🚀 Quick Start

### Development
\`\`\`bash
npm install
npm start
\`\`\`

### Production
\`\`\`bash
npm run build
\`\`\`

## 📁 Project Structure

\`\`\`
${type === 'frontend' ? `
├── index.html          # Main HTML file
├── App.jsx            # React component
├── styles.css         # Stylesheet
├── package.json       # Dependencies
└── README.md         # This file
` : `
├── src/
│   ├── server.js     # Express server
│   ├── routes/       # API routes
│   └── middleware/   # Auth middleware
├── prisma/
│   └── schema.prisma # Database schema
├── package.json      # Dependencies
└── README.md        # This file
`}
\`\`\`

## ✨ Features

${type === 'frontend' ? '- Responsive design\n- Modern CSS\n- Interactive components' : '- REST API\n- JWT Authentication\n- Database integration'}

---

Built with ❤️ by BuilderAI`;
};

const generateDockerCompose = (projectName: string): string => {
  return `version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=file:./data/prod.db
    volumes:
      - ./data:/app/data

volumes:
  data:`;
};

const generateFullStackReadme = (projectName: string): string => {
  return `# ${projectName} - Full-Stack Application

Generated by BuilderAI - Complete frontend and backend solution

## 🚀 Quick Start

### Using Docker (Recommended)
\`\`\`bash
docker-compose up -d
\`\`\`

### Manual Setup
\`\`\`bash
# Backend
cd backend
npm install
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm start
\`\`\`

## 📡 API Endpoints

- \`GET /health\` - Health check
- \`POST /api/auth/login\` - User login
- \`POST /api/auth/register\` - User registration
- \`GET /api/auth/me\` - Get current user

## 🔧 Environment Variables

Backend (.env):
\`\`\`
NODE_ENV=development
JWT_SECRET=your-secret-key
DATABASE_URL=file:./dev.db
\`\`\`

## 🌐 Access

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Documentation: http://localhost:3001/health

---

Built with ❤️ by BuilderAI`;
};

// Additional helper functions for generating block-specific code
const generateBlockHTML = (block: CanvasBlock): string => {
  // Implementation similar to LivePreview component
  switch (block.type) {
    case 'hero':
      return `<div class="hero">
        <h1>${block.properties.title || 'Hero Title'}</h1>
        <p>${block.properties.subtitle || 'Hero subtitle'}</p>
        <button>${block.properties.buttonText || 'Get Started'}</button>
      </div>`;
    // Add other block types...
    default:
      return `<div>Block content</div>`;
  }
};

const generateBlockReact = (block: CanvasBlock): string => {
  const style = `{{left: '${block.x}px', top: '${block.y}px', width: '${block.width}px', height: '${block.height}px'}}`;
  return `<div className="block" style=${style}>
    {/* ${block.type} component */}
  </div>`;
};

const generateBlockCSS = (block: CanvasBlock): string => {
  return `/* ${block.type} block styles */`;
};
