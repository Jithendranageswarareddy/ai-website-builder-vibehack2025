import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Download, 
  Package, 
  FileText, 
  FolderTree, 
  CheckCircle,
  AlertCircle,
  Copy,
  Eye,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CanvasBlock } from "./CanvasBuilder";
import JSZip from "jszip";

interface ZipFile {
  path: string;
  content: string;
  type: 'text' | 'json' | 'binary';
  size: number;
}

interface ProjectExportProps {
  blocks: CanvasBlock[];
  tables: any[];
  endpoints: any[];
  authConfig: any;
  projectName: string;
  environmentVariables: Record<string, string>;
}

export const ProjectExport = ({
  blocks,
  tables,
  endpoints,
  authConfig,
  projectName,
  environmentVariables
}: ProjectExportProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedFiles, setGeneratedFiles] = useState<ZipFile[]>([]);
  const [exportType, setExportType] = useState<'frontend' | 'backend' | 'fullstack'>('fullstack');
  const [activeTab, setActiveTab] = useState('generate');
  const { toast } = useToast();

  const generateProjectFiles = async (): Promise<ZipFile[]> => {
    const files: ZipFile[] = [];
    
    // Frontend files
    if (exportType === 'frontend' || exportType === 'fullstack') {
      // React App structure
      files.push({
        path: 'frontend/package.json',
        content: generateFrontendPackageJson(),
        type: 'json',
        size: 0
      });

      files.push({
        path: 'frontend/src/App.tsx',
        content: generateAppComponent(),
        type: 'text',
        size: 0
      });

      files.push({
        path: 'frontend/src/main.tsx',
        content: generateMainFile(),
        type: 'text',
        size: 0
      });

      files.push({
        path: 'frontend/src/index.css',
        content: generateStylesFile(),
        type: 'text',
        size: 0
      });

      files.push({
        path: 'frontend/index.html',
        content: generateIndexHtml(),
        type: 'text',
        size: 0
      });

      files.push({
        path: 'frontend/vite.config.ts',
        content: generateViteConfig(),
        type: 'text',
        size: 0
      });

      files.push({
        path: 'frontend/tailwind.config.js',
        content: generateTailwindConfig(),
        type: 'text',
        size: 0
      });

      files.push({
        path: 'frontend/postcss.config.js',
        content: generatePostCSSConfig(),
        type: 'text',
        size: 0
      });

      files.push({
        path: 'frontend/tsconfig.json',
        content: generateTSConfig(),
        type: 'json',
        size: 0
      });

      // Generate component files
      blocks.forEach((block, index) => {
        files.push({
          path: `frontend/src/components/${block.type}Component${index + 1}.tsx`,
          content: generateBlockComponent(block),
          type: 'text',
          size: 0
        });
      });

      // Environment variables for frontend
      if (Object.keys(environmentVariables).length > 0) {
        files.push({
          path: 'frontend/.env',
          content: generateFrontendEnvFile(),
          type: 'text',
          size: 0
        });
      }
    }

    // Backend files
    if (exportType === 'backend' || exportType === 'fullstack') {
      files.push({
        path: 'backend/package.json',
        content: generateBackendPackageJson(),
        type: 'json',
        size: 0
      });

      files.push({
        path: 'backend/server.js',
        content: generateServerFile(),
        type: 'text',
        size: 0
      });

      files.push({
        path: 'backend/prisma/schema.prisma',
        content: generatePrismaSchema(),
        type: 'text',
        size: 0
      });

      // Generate API routes
      endpoints.forEach(endpoint => {
        files.push({
          path: `backend/routes/${endpoint.name.toLowerCase()}.js`,
          content: generateAPIRoute(endpoint),
          type: 'text',
          size: 0
        });
      });

      // Auth middleware
      if (authConfig.enableLogin || authConfig.enableRegistration) {
        files.push({
          path: 'backend/middleware/auth.js',
          content: generateAuthMiddleware(),
          type: 'text',
          size: 0
        });

        files.push({
          path: 'backend/routes/auth.js',
          content: generateAuthRoutes(),
          type: 'text',
          size: 0
        });
      }

      // Database configuration
      files.push({
        path: 'backend/config/database.js',
        content: generateDatabaseConfig(),
        type: 'text',
        size: 0
      });

      // Environment variables for backend
      files.push({
        path: 'backend/.env',
        content: generateBackendEnvFile(),
        type: 'text',
        size: 0
      });

      files.push({
        path: 'backend/.env.example',
        content: generateEnvExample(),
        type: 'text',
        size: 0
      });
    }

    // Root project files
    files.push({
      path: 'README.md',
      content: generateProjectReadme(),
      type: 'text',
      size: 0
    });

    files.push({
      path: 'package.json',
      content: generateRootPackageJson(),
      type: 'json',
      size: 0
    });

    if (exportType === 'fullstack') {
      files.push({
        path: 'docker-compose.yml',
        content: generateDockerCompose(),
        type: 'text',
        size: 0
      });

      files.push({
        path: 'Dockerfile.frontend',
        content: generateFrontendDockerfile(),
        type: 'text',
        size: 0
      });

      files.push({
        path: 'Dockerfile.backend',
        content: generateBackendDockerfile(),
        type: 'text',
        size: 0
      });
    }

    files.push({
      path: '.gitignore',
      content: generateGitignore(),
      type: 'text',
      size: 0
    });

    files.push({
      path: 'DEPLOYMENT.md',
      content: generateDeploymentGuide(),
      type: 'text',
      size: 0
    });

    // Calculate file sizes
    files.forEach(file => {
      file.size = new Blob([file.content]).size;
    });

    return files;
  };

  const generateZipDownload = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Generate files
      setGenerationProgress(20);
      const files = await generateProjectFiles();
      setGeneratedFiles(files);
      
      setGenerationProgress(40);
      
      // Create ZIP
      const zip = new JSZip();
      
      files.forEach((file, index) => {
        zip.file(file.path, file.content);
        setGenerationProgress(40 + (index / files.length) * 40);
      });
      
      setGenerationProgress(80);
      
      // Generate ZIP blob
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      setGenerationProgress(90);
      
      // Download
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${projectName.toLowerCase().replace(/\s+/g, '-')}-${exportType}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setGenerationProgress(100);
      
      toast({
        title: "ZIP Download Complete",
        description: `${files.length} files exported successfully!`,
      });

    } catch (error) {
      console.error('ZIP generation error:', error);
      toast({
        title: "Export Failed",
        description: "Unable to generate project ZIP file.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setTimeout(() => setGenerationProgress(0), 2000);
    }
  };

  // File generation functions
  const generateFrontendPackageJson = () => JSON.stringify({
    name: `${projectName.toLowerCase().replace(/\s+/g, '-')}-frontend`,
    private: true,
    version: "0.1.0",
    type: "module",
    scripts: {
      dev: "vite",
      build: "tsc && vite build",
      lint: "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
      preview: "vite preview"
    },
    dependencies: {
      react: "^18.3.1",
      "react-dom": "^18.3.1",
      "react-router-dom": "^6.22.3",
      axios: "^1.6.8"
    },
    devDependencies: {
      "@types/react": "^18.3.3",
      "@types/react-dom": "^18.3.0",
      "@typescript-eslint/eslint-plugin": "^7.2.0",
      "@typescript-eslint/parser": "^7.2.0",
      "@vitejs/plugin-react": "^4.2.1",
      autoprefixer: "^10.4.19",
      eslint: "^8.57.0",
      "eslint-plugin-react-hooks": "^4.6.0",
      "eslint-plugin-react-refresh": "^0.4.6",
      postcss: "^8.4.38",
      tailwindcss: "^3.4.3",
      typescript: "^5.2.2",
      vite: "^5.2.0"
    }
  }, null, 2);

  const generateBackendPackageJson = () => JSON.stringify({
    name: `${projectName.toLowerCase().replace(/\s+/g, '-')}-backend`,
    version: "1.0.0",
    description: `Backend API for ${projectName}`,
    main: "server.js",
    scripts: {
      start: "node server.js",
      dev: "nodemon server.js",
      "db:migrate": "npx prisma migrate dev",
      "db:generate": "npx prisma generate",
      "db:seed": "npx prisma db seed"
    },
    dependencies: {
      express: "^4.19.2",
      "@prisma/client": "^5.12.1",
      prisma: "^5.12.1",
      jsonwebtoken: "^9.0.2",
      bcryptjs: "^2.4.3",
      cors: "^2.8.5",
      helmet: "^7.1.0",
      "express-rate-limit": "^7.2.0",
      dotenv: "^16.4.5"
    },
    devDependencies: {
      nodemon: "^3.1.0"
    }
  }, null, 2);

  const generateAppComponent = () => `import React from 'react';
import './index.css';

// Generated components
${blocks.map((block, index) => 
  `import ${block.type}Component${index + 1} from './components/${block.type}Component${index + 1}';`
).join('\n')}

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          ${projectName}
        </h1>
        
        <div className="space-y-8">
          ${blocks.map((block, index) => 
            `<${block.type}Component${index + 1} />`
          ).join('\n          ')}
        </div>
      </div>
    </div>
  );
}

export default App;`;

  const generateMainFile = () => `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);`;

  const generateStylesFile = () => `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-family: 'Inter', system-ui, sans-serif;
  }
}

@layer components {
  .btn-primary {
    @apply bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-md p-6 border border-gray-200;
  }
}`;

  const generateIndexHtml = () => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
    <meta name="description" content="Generated with AI-Powered Website Builder" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

  const generateBlockComponent = (block: CanvasBlock) => {
    const componentName = `${block.type}Component`;
    const props = block.properties;

    switch (block.type) {
      case 'hero':
        return `import React from 'react';

const ${componentName} = () => {
  return (
    <section 
      className="py-20 px-6 text-center"
      style={{
        backgroundColor: '${props.backgroundColor || '#f8fafc'}',
        color: '${props.textColor || '#1f2937'}'
      }}
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-6">
          ${props.title || 'Welcome to Our Platform'}
        </h1>
        <p className="text-xl mb-8 opacity-90">
          ${props.subtitle || 'Build amazing experiences with our cutting-edge technology'}
        </p>
        <button className="btn-primary text-lg px-8 py-3">
          ${props.buttonText || 'Get Started'}
        </button>
      </div>
    </section>
  );
};

export default ${componentName};`;

      case 'form':
        return `import React, { useState } from 'react';

const ${componentName} = () => {
  const [formData, setFormData] = useState({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="card max-w-md mx-auto">
      <h3 className="text-2xl font-semibold mb-6">${props.title || 'Contact Form'}</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        ${props.fields?.map((field: any) => `
        <div>
          <label className="block text-sm font-medium mb-2">
            ${field.label}${field.required ? ' *' : ''}
          </label>
          ${field.type === 'textarea' ? 
            `<textarea 
              name="${field.name}"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={4}
              ${field.required ? 'required' : ''}
              onChange={handleChange}
            />` :
            `<input 
              type="${field.type}"
              name="${field.name}"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              ${field.required ? 'required' : ''}
              onChange={handleChange}
            />`
          }
        </div>`).join('') || ''}
        
        <button type="submit" className="btn-primary w-full">
          ${props.buttonText || 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default ${componentName};`;

      default:
        return `import React from 'react';

const ${componentName} = () => {
  return (
    <div className="card">
      <p>Generated ${block.type} component</p>
    </div>
  );
};

export default ${componentName};`;
    }
  };

  const generateServerFile = () => `const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
${endpoints.map(endpoint => `app.use('/api/${endpoint.name.toLowerCase()}', require('./routes/${endpoint.name.toLowerCase()}'));`).join('\n')}

${authConfig.enableLogin || authConfig.enableRegistration ? "app.use('/api/auth', require('./routes/auth'));" : ''}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(\`🚀 Server running on port \${PORT}\`);
});

module.exports = app;`;

  const generatePrismaSchema = () => `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

${tables.map(table => `
model ${table.name} {
  id        String   @id @default(cuid())
  ${table.columns?.map((col: any) => `${col.name}  ${col.type}${col.required ? '' : '?'}`).join('\n  ') || ''}
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}`).join('\n')}

${authConfig.enableLogin || authConfig.enableRegistration ? `
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String?
  role      String   @default("user")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}` : ''}`;

  const generateProjectReadme = () => `# ${projectName}

> Generated with AI-Powered Website Builder

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (or update DATABASE_URL for other providers)

### Installation

1. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Setup environment variables:**
   \`\`\`bash
   # Copy environment files
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   
   # Edit backend/.env with your database URL and secrets
   \`\`\`

3. **Setup database:**
   \`\`\`bash
   cd backend
   npx prisma migrate dev
   npx prisma generate
   \`\`\`

4. **Start development servers:**
   \`\`\`bash
   # Terminal 1 - Backend
   cd backend && npm run dev
   
   # Terminal 2 - Frontend  
   cd frontend && npm run dev
   \`\`\`

## 📁 Project Structure

\`\`\`
${projectName}/
├── frontend/          # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
├── backend/           # Node.js + Express + Prisma
│   ├── routes/
│   ├── middleware/
│   ├── prisma/
│   └── server.js
├── README.md
└── package.json
\`\`\`

## 🔧 Available Scripts

### Root Project
- \`npm run dev\` - Start both frontend and backend
- \`npm run build\` - Build for production

### Frontend (\`cd frontend\`)
- \`npm run dev\` - Development server
- \`npm run build\` - Production build  
- \`npm run preview\` - Preview production build

### Backend (\`cd backend\`)
- \`npm run dev\` - Development server with nodemon
- \`npm start\` - Production server
- \`npm run db:migrate\` - Run database migrations
- \`npm run db:generate\` - Generate Prisma client

## 🌐 Deployment

See \`DEPLOYMENT.md\` for detailed deployment instructions for:
- Vercel (Frontend + Backend)
- Netlify (Frontend) + Railway (Backend)  
- Docker containers
- Traditional VPS

## 📚 API Documentation

### Available Endpoints:
${endpoints.map(endpoint => `- \`${endpoint.method} /api/${endpoint.name.toLowerCase()}\` - ${endpoint.description || 'Generated endpoint'}`).join('\n')}

${authConfig.enableLogin || authConfig.enableRegistration ? `
### Authentication:
- \`POST /api/auth/register\` - User registration
- \`POST /api/auth/login\` - User login
- \`POST /api/auth/logout\` - User logout
` : ''}

## 🔐 Environment Variables

### Backend (\`backend/.env\`):
\`\`\`
DATABASE_URL="postgresql://user:pass@localhost:5432/mydb"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3001
FRONTEND_URL="http://localhost:5173"
\`\`\`

### Frontend (\`frontend/.env\`):
\`\`\`
VITE_API_URL="http://localhost:3001"
${Object.keys(environmentVariables).filter(key => key.startsWith('VITE_')).map(key => `${key}="${environmentVariables[key]}"`).join('\n')}
\`\`\`

## 🎨 Customization

This project was generated with the following components:
${blocks.map((block, index) => `- ${block.type}Component${index + 1} (${block.type})`).join('\n')}

Feel free to modify and extend these components to fit your needs!

## 📄 License

MIT License - feel free to use for personal and commercial projects.

---

**Built with ❤️ using AI-Powered Website Builder**`;

  const generateFrontendEnvFile = () => {
    const frontendVars = Object.entries(environmentVariables)
      .filter(([key]) => key.startsWith('VITE_'))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    return `# Frontend Environment Variables
VITE_API_URL=http://localhost:3001

${frontendVars}`;
  };

  const generateBackendEnvFile = () => {
    const backendVars = Object.entries(environmentVariables)
      .filter(([key]) => !key.startsWith('VITE_'))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    return `# Backend Environment Variables
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=3001
FRONTEND_URL="http://localhost:5173"

${backendVars}`;
  };

  const generateViteConfig = () => `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
  },
})`;

  const generateTailwindConfig = () => `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`;

  const generatePostCSSConfig = () => `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;

  const generateTSConfig = () => JSON.stringify({
    compilerOptions: {
      target: "ES2020",
      useDefineForClassFields: true,
      lib: ["ES2020", "DOM", "DOM.Iterable"],
      module: "ESNext",
      skipLibCheck: true,
      moduleResolution: "bundler",
      allowImportingTsExtensions: true,
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      jsx: "react-jsx",
      strict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noFallthroughCasesInSwitch: true
    },
    include: ["src"],
    references: [{ path: "./tsconfig.node.json" }]
  }, null, 2);

  const generateRootPackageJson = () => JSON.stringify({
    name: projectName.toLowerCase().replace(/\s+/g, '-'),
    version: "1.0.0",
    description: `Full-stack application: ${projectName}`,
    scripts: {
      dev: "concurrently \"npm run dev --prefix backend\" \"npm run dev --prefix frontend\"",
      build: "npm run build --prefix frontend && npm run build --prefix backend",
      start: "npm start --prefix backend",
      install: "npm install --prefix backend && npm install --prefix frontend"
    },
    devDependencies: {
      concurrently: "^8.2.2"
    }
  }, null, 2);

  const generateDockerCompose = () => `version: '3.8'

services:
  database:
    image: postgres:15
    environment:
      POSTGRES_DB: ${projectName.toLowerCase().replace(/\s+/g, '')}
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@database:5432/${projectName.toLowerCase().replace(/\s+/g, '')}
      JWT_SECRET: your-super-secret-jwt-key
      FRONTEND_URL: http://localhost:3000
    depends_on:
      - database

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:3000"
    environment:
      VITE_API_URL: http://localhost:3001
    depends_on:
      - backend

volumes:
  postgres_data:`;

  const generateFrontendDockerfile = () => `FROM node:18-alpine

WORKDIR /app

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`;

  const generateBackendDockerfile = () => `FROM node:18-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm install

COPY backend/ .
RUN npx prisma generate

EXPOSE 3001
CMD ["npm", "start"]`;

  const generateGitignore = () => `# Dependencies
node_modules/
*/node_modules/

# Production builds
dist/
build/

# Environment variables
.env
.env.local
.env.production
.env.test

# Database
*.db
*.sqlite

# Logs
*.log
npm-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Prisma
prisma/migrations/`;

  const generateDeploymentGuide = () => `# Deployment Guide

## Vercel Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set build command: \`cd frontend && npm run build\`
3. Set output directory: \`frontend/dist\`
4. Add environment variables in Vercel dashboard

### Backend (Vercel Functions)
1. Install Vercel CLI: \`npm i -g vercel\`
2. Deploy: \`vercel --prod\`
3. Configure database connection in Vercel dashboard

## Netlify + Railway

### Frontend (Netlify)
1. Connect repository to Netlify
2. Build command: \`cd frontend && npm run build\`
3. Publish directory: \`frontend/dist\`

### Backend (Railway)
1. Connect repository to Railway
2. Set root directory: \`backend\`
3. Railway will auto-detect and deploy

## Docker Deployment

\`\`\`bash
# Build and run with Docker Compose
docker-compose up --build

# Or build individually
docker build -f Dockerfile.frontend -t ${projectName.toLowerCase()}-frontend .
docker build -f Dockerfile.backend -t ${projectName.toLowerCase()}-backend .
\`\`\`

## Environment Variables Checklist

### Production Frontend
- \`VITE_API_URL\` - Your backend URL
${Object.keys(environmentVariables).filter(key => key.startsWith('VITE_')).map(key => `- \`${key}\` - ${key.replace('VITE_', '').toLowerCase()}`).join('\n')}

### Production Backend  
- \`DATABASE_URL\` - Production database connection
- \`JWT_SECRET\` - Strong random secret (32+ characters)
- \`FRONTEND_URL\` - Your frontend URL for CORS
${Object.keys(environmentVariables).filter(key => !key.startsWith('VITE_')).map(key => `- \`${key}\` - Production value for ${key.toLowerCase()}`).join('\n')}

## Database Setup

### PostgreSQL (Recommended)
1. Create database
2. Update \`DATABASE_URL\` in \`.env\`
3. Run migrations: \`npx prisma migrate deploy\`

### Alternative Databases
- **SQLite**: Change provider in \`schema.prisma\`
- **MySQL**: Update \`DATABASE_URL\` format
- **MongoDB**: Use Prisma MongoDB connector`;

  const generateAuthMiddleware = () => `const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };`;

  const generateAuthRoutes = () => `const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      }
    });
    
    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '${authConfig.sessionExpiry || '7d'}' }
    );
    
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '${authConfig.sessionExpiry || '7d'}' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;`;

  const generateAPIRoute = (endpoint: any) => `const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET all ${endpoint.name}
router.get('/', async (req, res) => {
  try {
    const items = await prisma.${endpoint.name.toLowerCase()}.findMany();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET ${endpoint.name} by ID
router.get('/:id', async (req, res) => {
  try {
    const item = await prisma.${endpoint.name.toLowerCase()}.findUnique({
      where: { id: req.params.id }
    });
    
    if (!item) {
      return res.status(404).json({ error: '${endpoint.name} not found' });
    }
    
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create ${endpoint.name}
router.post('/', authenticateToken, async (req, res) => {
  try {
    const item = await prisma.${endpoint.name.toLowerCase()}.create({
      data: req.body
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT update ${endpoint.name}
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await prisma.${endpoint.name.toLowerCase()}.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE ${endpoint.name}
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.${endpoint.name.toLowerCase()}.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;`;

  const generateDatabaseConfig = () => `const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn'] : ['warn', 'error'],
});

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;`;

  const generateEnvExample = () => `# Database
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Server
PORT=3001
FRONTEND_URL="http://localhost:5173"

# Optional: Additional environment variables
${Object.keys(environmentVariables).filter(key => !key.startsWith('VITE_')).map(key => `${key}="your-${key.toLowerCase()}-value"`).join('\n')}`;

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const totalSize = generatedFiles.reduce((sum, file) => sum + file.size, 0);
  const fileCount = generatedFiles.length;

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          Project Export
          {fileCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {fileCount} files ({formatFileSize(totalSize)})
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mx-4">
            <TabsTrigger value="generate" className="text-xs">
              <Package className="w-3 h-3 mr-1" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="preview" className="text-xs">
              <Eye className="w-3 h-3 mr-1" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="structure" className="text-xs">
              <FolderTree className="w-3 h-3 mr-1" />
              Structure
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="flex-1 m-0">
            <div className="p-4 space-y-4">
              <div className="space-y-3">
                <h3 className="font-medium">Export Type</h3>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={exportType === 'frontend' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setExportType('frontend')}
                  >
                    Frontend Only
                  </Button>
                  <Button
                    variant={exportType === 'backend' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setExportType('backend')}
                  >
                    Backend Only
                  </Button>
                  <Button
                    variant={exportType === 'fullstack' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setExportType('fullstack')}
                  >
                    Full Stack
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium">Export Details</h3>
                <div className="bg-muted/50 rounded p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Project Name:</span>
                    <span className="font-medium">{projectName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Components:</span>
                    <span className="font-medium">{blocks.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Database Tables:</span>
                    <span className="font-medium">{tables.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>API Endpoints:</span>
                    <span className="font-medium">{endpoints.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Environment Variables:</span>
                    <span className="font-medium">{Object.keys(environmentVariables).length}</span>
                  </div>
                </div>
              </div>

              {isGenerating && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Generating ZIP...</span>
                    <span>{generationProgress}%</span>
                  </div>
                  <Progress value={generationProgress} className="w-full" />
                </div>
              )}

              <Button
                onClick={generateZipDownload}
                disabled={isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Settings className="w-4 h-4 mr-2 animate-spin" />
                    Generating ZIP...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download ZIP
                  </>
                )}
              </Button>

              <div className="text-xs text-muted-foreground">
                <p>✅ Includes production-ready code</p>
                <p>✅ Complete documentation</p>
                <p>✅ Docker configuration</p>
                <p>✅ Deployment instructions</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="flex-1 m-0">
            <ScrollArea className="h-full px-4">
              <div className="space-y-3 py-4">
                {generatedFiles.length > 0 ? (
                  generatedFiles.map((file, index) => (
                    <Card key={index} className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{file.path}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Generate a ZIP to preview files</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="structure" className="flex-1 m-0">
            <ScrollArea className="h-full px-4">
              <div className="py-4 space-y-2">
                <div className="font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <FolderTree className="w-4 h-4" />
                    <span className="font-medium">{projectName}/</span>
                  </div>
                  
                  {exportType !== 'backend' && (
                    <div className="ml-6 space-y-1">
                      <div>📁 frontend/</div>
                      <div className="ml-4 space-y-1">
                        <div>📁 src/</div>
                        <div className="ml-4 space-y-1">
                          <div>📁 components/</div>
                          <div>📄 App.tsx</div>
                          <div>📄 main.tsx</div>
                          <div>📄 index.css</div>
                        </div>
                        <div>📄 package.json</div>
                        <div>📄 vite.config.ts</div>
                        <div>📄 tailwind.config.js</div>
                        <div>📄 index.html</div>
                      </div>
                    </div>
                  )}
                  
                  {exportType !== 'frontend' && (
                    <div className="ml-6 space-y-1">
                      <div>📁 backend/</div>
                      <div className="ml-4 space-y-1">
                        <div>📁 routes/</div>
                        <div>📁 middleware/</div>
                        <div>📁 prisma/</div>
                        <div>📄 server.js</div>
                        <div>📄 package.json</div>
                        <div>📄 .env</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="ml-6 space-y-1">
                    <div>📄 README.md</div>
                    <div>📄 DEPLOYMENT.md</div>
                    <div>📄 package.json</div>
                    <div>📄 .gitignore</div>
                    {exportType === 'fullstack' && (
                      <>
                        <div>📄 docker-compose.yml</div>
                        <div>📄 Dockerfile.frontend</div>
                        <div>📄 Dockerfile.backend</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
