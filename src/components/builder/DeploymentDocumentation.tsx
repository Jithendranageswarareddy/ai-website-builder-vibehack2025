import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  FileText, 
  Download, 
  Copy, 
  Check,
  BookOpen,
  Package,
  Rocket,
  Settings,
  Code,
  Database,
  Globe,
  Terminal,
  GitBranch,
  Shield,
  Monitor,
  Lightbulb,
  ExternalLink,
  FolderOpen
} from "lucide-react";

interface ProjectConfig {
  name: string;
  description: string;
  version: string;
  author: string;
  license: string;
  repository: string;
  homepage: string;
  keywords: string[];
  framework: 'react' | 'next' | 'vite';
  hasAuth: boolean;
  hasDatabase: boolean;
  hasApi: boolean;
  deploymentTarget: 'vercel' | 'netlify' | 'generic';
  envVars: Array<{
    name: string;
    description: string;
    required: boolean;
    example?: string;
  }>;
}

export const DeploymentDocumentation = () => {
  const [activeTab, setActiveTab] = useState('generator');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  
  const [projectConfig, setProjectConfig] = useState<ProjectConfig>({
    name: 'AI Website Builder Project',
    description: 'A full-stack web application built with AI-powered drag and drop interface',
    version: '1.0.0',
    author: 'Your Name',
    license: 'MIT',
    repository: 'https://github.com/yourusername/your-project',
    homepage: 'https://your-project.vercel.app',
    keywords: ['react', 'typescript', 'ai', 'drag-drop', 'website-builder'],
    framework: 'vite',
    hasAuth: true,
    hasDatabase: true,
    hasApi: true,
    deploymentTarget: 'vercel',
    envVars: [
      {
        name: 'DATABASE_URL',
        description: 'PostgreSQL database connection string',
        required: true,
        example: 'postgresql://user:password@localhost:5432/mydb'
      },
      {
        name: 'JWT_SECRET',
        description: 'Secret key for JWT token signing',
        required: true,
        example: 'your-super-secret-jwt-key-here'
      },
      {
        name: 'NEXTAUTH_SECRET',
        description: 'NextAuth.js secret for session encryption',
        required: false,
        example: 'your-nextauth-secret'
      }
    ]
  });

  const generateReadme = (): string => {
    const badges = [
      `![React](https://img.shields.io/badge/React-18.3.1-blue)`,
      `![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)`,
      `![Vite](https://img.shields.io/badge/Vite-5.4.19-purple)`,
      `![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.0-cyan)`,
      `![License](https://img.shields.io/badge/License-${projectConfig.license}-green)`
    ].join(' ');

    const envSection = projectConfig.envVars.length > 0 ? `
## 🔐 Environment Variables

Create a \`.env\` file in the root directory with the following variables:

\`\`\`env
${projectConfig.envVars.map(env => `${env.name}=${env.example || 'your_value_here'}`).join('\n')}
\`\`\`

### Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
${projectConfig.envVars.map(env => 
  `| \`${env.name}\` | ${env.description} | ${env.required ? '✅' : '❌'} | \`${env.example || 'N/A'}\` |`
).join('\n')}
` : '';

    const deploymentSection = projectConfig.deploymentTarget === 'vercel' ? `
## 🚀 Deployment

### Vercel (Recommended)

1. **Connect to Vercel:**
   \`\`\`bash
   npx vercel
   \`\`\`

2. **Set Environment Variables:**
   - Go to your Vercel dashboard
   - Navigate to Settings > Environment Variables
   - Add all the required environment variables listed above

3. **Deploy:**
   \`\`\`bash
   npx vercel --prod
   \`\`\`

### Manual Deployment

1. **Build the project:**
   \`\`\`bash
   npm run build
   \`\`\`

2. **Upload the \`dist\` folder to your hosting provider**

3. **Configure environment variables on your hosting platform**
` : `
## 🚀 Deployment

### Build for Production

\`\`\`bash
npm run build
\`\`\`

The built files will be in the \`dist\` directory, ready to be deployed to any static hosting service.

### Deployment Options

- **Netlify:** Drag and drop the \`dist\` folder or connect your git repository
- **Vercel:** \`npx vercel\` or connect via GitHub
- **GitHub Pages:** Use GitHub Actions to build and deploy
- **AWS S3 + CloudFront:** Upload to S3 bucket and configure CloudFront distribution
`;

    const databaseSection = projectConfig.hasDatabase ? `
## 🗄️ Database Setup

This project uses PostgreSQL as the primary database.

### Local Development

1. **Install PostgreSQL:**
   - macOS: \`brew install postgresql\`
   - Windows: Download from [postgresql.org](https://www.postgresql.org/download/)
   - Linux: \`sudo apt-get install postgresql\`

2. **Create Database:**
   \`\`\`bash
   createdb ${projectConfig.name.toLowerCase().replace(/\s+/g, '_')}
   \`\`\`

3. **Update \`DATABASE_URL\` in your \`.env\` file**

4. **Run Migrations:**
   \`\`\`bash
   npm run db:migrate
   \`\`\`

### Production Database

- **Vercel Postgres:** Easy integration with Vercel deployments
- **Supabase:** Free tier with generous limits
- **PlanetScale:** Serverless MySQL alternative
- **Railway:** Simple PostgreSQL hosting
` : '';

    const authSection = projectConfig.hasAuth ? `
## 🔐 Authentication

This project includes a complete authentication system with:

- User registration and login
- JWT token management
- Protected routes
- Password reset functionality
- Session management

### Setup

1. Set the \`JWT_SECRET\` environment variable
2. Configure authentication providers in \`src/lib/auth.ts\`
3. Customize the auth forms in \`src/components/auth/\`

### Features

- ✅ Email/Password authentication
- ✅ JWT token-based sessions
- ✅ Protected route middleware
- ✅ Password strength validation
- ✅ Account verification
` : '';

    const apiSection = projectConfig.hasApi ? `
## 🔌 API Endpoints

The project includes a RESTful API with the following endpoints:

### Authentication
- \`POST /api/auth/register\` - User registration
- \`POST /api/auth/login\` - User login
- \`POST /api/auth/logout\` - User logout
- \`POST /api/auth/refresh\` - Refresh JWT token

### Projects
- \`GET /api/projects\` - List user projects
- \`POST /api/projects\` - Create new project
- \`GET /api/projects/:id\` - Get project details
- \`PUT /api/projects/:id\` - Update project
- \`DELETE /api/projects/:id\` - Delete project

### Schema Management
- \`GET /api/schema/tables\` - List database tables
- \`POST /api/schema/tables\` - Create new table
- \`PUT /api/schema/tables/:id\` - Update table schema
- \`DELETE /api/schema/tables/:id\` - Delete table

### Deployment
- \`POST /api/deploy/vercel\` - Deploy to Vercel
- \`GET /api/deploy/status/:id\` - Check deployment status
- \`POST /api/export/zip\` - Export project as ZIP
` : '';

    return `# ${projectConfig.name}

${badges}

> ${projectConfig.description}

## ✨ Features

- 🎨 **Drag & Drop Interface** - Intuitive visual website builder
- 🤖 **AI-Powered** - Smart component suggestions and code generation
- ⚡ **Real-time Preview** - See changes instantly as you build
- 🏗️ **Full-Stack Generation** - Complete frontend and backend code
- 📱 **Responsive Design** - Mobile-first responsive layouts
- 🔐 **Authentication System** - Complete user management${projectConfig.hasAuth ? '' : ' (optional)'}
- 🗄️ **Database Integration** - Schema design and management${projectConfig.hasDatabase ? '' : ' (optional)'}
- 🚀 **One-Click Deployment** - Deploy to Vercel, Netlify, and more
- 📦 **Export Projects** - Download complete project files
- 🔄 **Version Control** - Project history and collaboration tools

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Build Tool:** Vite 5.4.19
- **State Management:** React Hooks + Context API
- **UI Components:** shadcn/ui component library
- **Styling:** Tailwind CSS with custom design system
- **Icons:** Lucide React${projectConfig.hasDatabase ? '\n- **Database:** PostgreSQL with Prisma ORM' : ''}${projectConfig.hasAuth ? '\n- **Authentication:** JWT tokens with secure sessions' : ''}
- **Deployment:** Vercel, Netlify, or any static hosting

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- npm or yarn or pnpm
${projectConfig.hasDatabase ? '- PostgreSQL (for database features)' : ''}

### Installation

1. **Clone the repository:**
   \`\`\`bash
   git clone ${projectConfig.repository}
   cd ${projectConfig.name.toLowerCase().replace(/\s+/g, '-')}
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables:**
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   Then edit \`.env\` with your configuration.

4. **Start the development server:**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Open your browser:**
   Navigate to [http://localhost:5173](http://localhost:5173)

${envSection}${databaseSection}${authSection}${apiSection}

## 📁 Project Structure

\`\`\`
${projectConfig.name.toLowerCase().replace(/\s+/g, '-')}/
├── public/                 # Static assets
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── builder/      # Website builder components
│   │   └── auth/         # Authentication components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   ├── pages/            # Page components
│   └── assets/           # Images and media
├── package.json          # Dependencies and scripts
├── tailwind.config.ts    # Tailwind CSS configuration
├── vite.config.ts        # Vite configuration
└── README.md            # This file
\`\`\`

## 🎯 Usage

### Building Websites

1. **Start with Templates:** Choose from pre-built templates or start from scratch
2. **Drag & Drop Components:** Add headers, buttons, forms, and more
3. **Customize Properties:** Adjust colors, text, spacing, and behavior
4. **Real-time Preview:** See your changes instantly
5. **AI Assistance:** Get smart suggestions for improvements
6. **Export & Deploy:** Download your project or deploy directly

### Key Components

- **Canvas Builder:** Main drag-and-drop interface
- **Component Library:** Available UI components
- **Properties Panel:** Customize selected components
- **Code Export:** Generate clean, production-ready code
- **Project Manager:** Save and manage multiple projects

${deploymentSection}

## 🔧 Development

### Available Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run preview\` - Preview production build
- \`npm run lint\` - Run ESLint
- \`npm run type-check\` - Run TypeScript checks

### Code Quality

- **TypeScript:** Full type safety
- **ESLint:** Code linting and formatting
- **Prettier:** Code formatting (via ESLint)
- **Tailwind CSS:** Utility-first styling

### Testing

\`\`\`bash
npm run test
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: \`git checkout -b feature/amazing-feature\`
3. Commit your changes: \`git commit -m 'Add amazing feature'\`
4. Push to the branch: \`git push origin feature/amazing-feature\`
5. Open a Pull Request

## 📝 License

This project is licensed under the ${projectConfig.license} License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📚 **Documentation:** [Project Wiki](${projectConfig.repository}/wiki)
- 🐛 **Issues:** [GitHub Issues](${projectConfig.repository}/issues)
- 💬 **Discussions:** [GitHub Discussions](${projectConfig.repository}/discussions)
- 📧 **Email:** ${projectConfig.author}

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI library
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Lucide](https://lucide.dev/) - Icons

---

Made with ❤️ by [${projectConfig.author}](${projectConfig.homepage})

**⭐ Star this repo if you found it helpful!**
`;
  };

  const generateEnvExample = (): string => {
    return projectConfig.envVars.map(env => 
      `# ${env.description}\n${env.name}=${env.example || 'your_value_here'}`
    ).join('\n\n');
  };

  const generatePackageJsonDocs = (): string => {
    return `# Package.json Guide

## Scripts Explanation

- \`dev\` - Starts the Vite development server with hot reload
- \`build\` - Builds the project for production
- \`preview\` - Serves the production build locally for testing
- \`lint\` - Runs ESLint to check for code issues

## Dependencies

### Core Framework
- **react** & **react-dom** - React framework for building the UI
- **typescript** - Type safety and better development experience

### Build & Development
- **vite** - Fast build tool and development server
- **@vitejs/plugin-react** - React support for Vite

### UI & Styling
- **tailwindcss** - Utility-first CSS framework
- **@tailwindcss/typography** - Typography plugin for Tailwind
- **tailwind-merge** - Utility for merging Tailwind classes
- **class-variance-authority** - Component variant management

### Component Library
- **@radix-ui/** packages - Headless UI primitives
- **lucide-react** - Beautiful icon library

### Code Quality
- **eslint** - Code linting and quality checks
- **@typescript-eslint/** - TypeScript support for ESLint

## Adding New Dependencies

\`\`\`bash
# Add a new dependency
npm install package-name

# Add a development dependency
npm install -D package-name

# Update all dependencies
npm update
\`\`\`
`;
  };

  const generateDockerDocs = (): string => {
    return `# Docker Deployment Guide

## Dockerfile

\`\`\`dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
\`\`\`

## Docker Compose

\`\`\`yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:80"
    environment:
      - NODE_ENV=production
    depends_on:
      - postgres

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: \${DB_NAME}
      POSTGRES_USER: \${DB_USER}
      POSTGRES_PASSWORD: \${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
\`\`\`

## Commands

\`\`\`bash
# Build and run
docker-compose up --build

# Run in background
docker-compose up -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f app
\`\`\`
`;
  };

  const copyToClipboard = async (text: string, section: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Deployment Documentation
          <Badge variant="secondary" className="text-xs">
            Auto-Generated
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-4 mx-4">
            <TabsTrigger value="generator" className="text-xs">
              <Settings className="w-3 h-3 mr-1" />
              Config
            </TabsTrigger>
            <TabsTrigger value="readme" className="text-xs">
              <BookOpen className="w-3 h-3 mr-1" />
              README
            </TabsTrigger>
            <TabsTrigger value="docs" className="text-xs">
              <FileText className="w-3 h-3 mr-1" />
              Docs
            </TabsTrigger>
            <TabsTrigger value="export" className="text-xs">
              <Package className="w-3 h-3 mr-1" />
              Export
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="flex-1 m-0">
            <ScrollArea className="h-full px-4">
              <div className="space-y-6 py-4">
                {/* Basic Info */}
                <Card className="p-4">
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    Project Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Project Name</Label>
                      <Input
                        id="name"
                        value={projectConfig.name}
                        onChange={(e) => setProjectConfig(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="version">Version</Label>
                      <Input
                        id="version"
                        value={projectConfig.version}
                        onChange={(e) => setProjectConfig(prev => ({ ...prev, version: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="author">Author</Label>
                      <Input
                        id="author"
                        value={projectConfig.author}
                        onChange={(e) => setProjectConfig(prev => ({ ...prev, author: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="license">License</Label>
                      <select
                        id="license"
                        value={projectConfig.license}
                        onChange={(e) => setProjectConfig(prev => ({ ...prev, license: e.target.value }))}
                        className="w-full border rounded px-3 py-2"
                      >
                        <option value="MIT">MIT</option>
                        <option value="Apache-2.0">Apache 2.0</option>
                        <option value="GPL-3.0">GPL 3.0</option>
                        <option value="BSD-3-Clause">BSD 3-Clause</option>
                        <option value="ISC">ISC</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={projectConfig.description}
                      onChange={(e) => setProjectConfig(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </Card>

                {/* Features */}
                <Card className="p-4">
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Features & Components
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        <span>Authentication System</span>
                      </div>
                      <Switch
                        checked={projectConfig.hasAuth}
                        onCheckedChange={(checked) => setProjectConfig(prev => ({ ...prev, hasAuth: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        <span>Database Integration</span>
                      </div>
                      <Switch
                        checked={projectConfig.hasDatabase}
                        onCheckedChange={(checked) => setProjectConfig(prev => ({ ...prev, hasDatabase: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        <span>API Endpoints</span>
                      </div>
                      <Switch
                        checked={projectConfig.hasApi}
                        onCheckedChange={(checked) => setProjectConfig(prev => ({ ...prev, hasApi: checked }))}
                      />
                    </div>
                  </div>
                </Card>

                {/* Deployment */}
                <Card className="p-4">
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <Rocket className="w-4 h-4" />
                    Deployment Target
                  </h3>
                  <select
                    value={projectConfig.deploymentTarget}
                    onChange={(e) => setProjectConfig(prev => ({ ...prev, deploymentTarget: e.target.value as any }))}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="vercel">Vercel (Recommended)</option>
                    <option value="netlify">Netlify</option>
                    <option value="generic">Generic Hosting</option>
                  </select>
                </Card>

                {/* Environment Variables */}
                <Card className="p-4">
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <Terminal className="w-4 h-4" />
                    Environment Variables
                  </h3>
                  <div className="space-y-3">
                    {projectConfig.envVars.map((env, index) => (
                      <div key={index} className="border rounded p-3">
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <Input
                            placeholder="Variable name"
                            value={env.name}
                            onChange={(e) => {
                              const newEnvVars = [...projectConfig.envVars];
                              newEnvVars[index].name = e.target.value;
                              setProjectConfig(prev => ({ ...prev, envVars: newEnvVars }));
                            }}
                          />
                          <Input
                            placeholder="Example value"
                            value={env.example || ''}
                            onChange={(e) => {
                              const newEnvVars = [...projectConfig.envVars];
                              newEnvVars[index].example = e.target.value;
                              setProjectConfig(prev => ({ ...prev, envVars: newEnvVars }));
                            }}
                          />
                        </div>
                        <Input
                          placeholder="Description"
                          value={env.description}
                          onChange={(e) => {
                            const newEnvVars = [...projectConfig.envVars];
                            newEnvVars[index].description = e.target.value;
                            setProjectConfig(prev => ({ ...prev, envVars: newEnvVars }));
                          }}
                        />
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={env.required}
                              onCheckedChange={(checked) => {
                                const newEnvVars = [...projectConfig.envVars];
                                newEnvVars[index].required = checked;
                                setProjectConfig(prev => ({ ...prev, envVars: newEnvVars }));
                              }}
                            />
                            <span className="text-xs">Required</span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const newEnvVars = projectConfig.envVars.filter((_, i) => i !== index);
                              setProjectConfig(prev => ({ ...prev, envVars: newEnvVars }));
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => {
                        setProjectConfig(prev => ({
                          ...prev,
                          envVars: [...prev.envVars, {
                            name: '',
                            description: '',
                            required: false,
                            example: ''
                          }]
                        }));
                      }}
                    >
                      Add Environment Variable
                    </Button>
                  </div>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="readme" className="flex-1 m-0">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 border-b">
                <h3 className="font-medium">README.md Preview</h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(generateReadme(), 'readme')}
                  >
                    {copiedSection === 'readme' ? (
                      <Check className="w-3 h-3 mr-1" />
                    ) : (
                      <Copy className="w-3 h-3 mr-1" />
                    )}
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => downloadFile(generateReadme(), 'README.md')}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-4">
                  <pre className="whitespace-pre-wrap text-xs font-mono bg-gray-50 p-4 rounded overflow-x-auto">
                    {generateReadme()}
                  </pre>
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="docs" className="flex-1 m-0">
            <ScrollArea className="h-full px-4">
              <div className="space-y-4 py-4">
                {/* .env.example */}
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      .env.example
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(generateEnvExample(), 'env')}
                      >
                        {copiedSection === 'env' ? (
                          <Check className="w-3 h-3 mr-1" />
                        ) : (
                          <Copy className="w-3 h-3 mr-1" />
                        )}
                        Copy
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => downloadFile(generateEnvExample(), '.env.example')}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                  <pre className="text-xs font-mono bg-gray-50 p-3 rounded overflow-x-auto">
                    {generateEnvExample()}
                  </pre>
                </Card>

                {/* Package.json Guide */}
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Dependencies Guide
                    </h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(generatePackageJsonDocs(), 'package')}
                    >
                      {copiedSection === 'package' ? (
                        <Check className="w-3 h-3 mr-1" />
                      ) : (
                        <Copy className="w-3 h-3 mr-1" />
                      )}
                      Copy
                    </Button>
                  </div>
                  <pre className="text-xs font-mono bg-gray-50 p-3 rounded overflow-x-auto whitespace-pre-wrap">
                    {generatePackageJsonDocs()}
                  </pre>
                </Card>

                {/* Docker Guide */}
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium flex items-center gap-2">
                      <Monitor className="w-4 h-4" />
                      Docker Deployment
                    </h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(generateDockerDocs(), 'docker')}
                    >
                      {copiedSection === 'docker' ? (
                        <Check className="w-3 h-3 mr-1" />
                      ) : (
                        <Copy className="w-3 h-3 mr-1" />
                      )}
                      Copy
                    </Button>
                  </div>
                  <pre className="text-xs font-mono bg-gray-50 p-3 rounded overflow-x-auto whitespace-pre-wrap">
                    {generateDockerDocs()}
                  </pre>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="export" className="flex-1 m-0">
            <div className="p-4 space-y-4">
              <Card className="p-4">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Export Documentation Bundle
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Download all documentation files for your project deployment.
                </p>
                
                <div className="space-y-3">
                  <Button
                    className="w-full justify-start"
                    onClick={() => downloadFile(generateReadme(), 'README.md')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Download README.md
                    <Badge variant="secondary" className="ml-auto">
                      {Math.ceil(generateReadme().length / 1024)}KB
                    </Badge>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => downloadFile(generateEnvExample(), '.env.example')}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Download .env.example
                    <Badge variant="secondary" className="ml-auto">
                      {Math.ceil(generateEnvExample().length / 1024)}KB
                    </Badge>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => downloadFile(generatePackageJsonDocs(), 'DEPENDENCIES.md')}
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Download Dependencies Guide
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => downloadFile(generateDockerDocs(), 'DOCKER.md')}
                  >
                    <Monitor className="w-4 h-4 mr-2" />
                    Download Docker Guide
                  </Button>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <GitBranch className="w-4 h-4" />
                  Additional Resources
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Project Repository</span>
                    <Button size="sm" variant="outline" asChild>
                      <a href={projectConfig.repository} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Open
                      </a>
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Live Demo</span>
                    <Button size="sm" variant="outline" asChild>
                      <a href={projectConfig.homepage} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Visit
                      </a>
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-green-50 border-green-200">
                <h3 className="font-medium mb-2 flex items-center gap-2 text-green-800">
                  <Check className="w-4 h-4" />
                  Ready for Deployment
                </h3>
                <p className="text-sm text-green-700">
                  Your documentation is complete and ready to be included in your project export. 
                  Users will have all the information they need to set up and deploy your application.
                </p>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
