# AI-Powered Full-Stack Website & Backend Builder

## Project Objective

Build a platform that enables non-technical users to create and deploy full-stack web applications using drag-and-drop tools combined with AI-assisted code generation.

## Core Requirements

The platform must allow users to:

### Frontend Development
- Design the frontend visually using a canvas or block system
- Generate production-ready code (HTML/CSS/JS or React)
- Real-time preview and editing capabilities

### Backend Development  
- Generate backend APIs using AI
- Create database models and schemas
- Implement authentication flows
- Build server-side logic with simple prompts

### Deployment & Integration
- Preview, edit, and deploy full applications (frontend, backend, database)
- One-click deployment to production platforms
- Minimal technical knowledge required

### AI-Powered Features
- Natural language processing for component generation
- Code optimization and suggestions
- Automated best practices implementation

## MVP Focus Areas

- **No-Code Platforms**: Visual development without programming knowledge
- **AI Code Generation**: Automated production-ready code creation  
- **Full-Stack Development**: Complete application development lifecycle

## Optional Advanced Features

- AI chat assistant for development guidance
- Database schema visualizer and backend logic builder
- Integration with deployment platforms (Vercel, Render, Supabase)
- Code snippet upload and conversion to visual components
- Role management and user authentication systems
- Test generation and quality assurance
- Collaborative editing and version control

## Getting Started

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation & Setup

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Step 3: Install dependencies
npm install

# Step 4: Start the development server
npm run dev
```

The application will be available at `http://localhost:8080`

## Technologies Used

This project is built with:

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: shadcn/ui components with Radix UI
- **Styling**: Tailwind CSS
- **State Management**: React hooks and context
- **Routing**: React Router DOM

## Current Implementation Status

### ✅ Completed Features
- **Visual Canvas Builder**: Drag-and-drop component positioning
- **Component Library**: Pre-built UI components (headings, text, buttons, images, cards)
- **Properties Panel**: Real-time component editing and styling
- **AI Assistant**: Interactive chat interface with natural language processing
- **Code Export**: React component generation with clean JSX output
- **Real-time Preview**: Live editing with instant visual feedback
- **Professional UI**: Modern dark-theme builder interface

### ⚠️ Partially Implemented
- **Code Generation**: Limited to frontend React components only
- **Component System**: Basic component types, extensible architecture

### ❌ Missing Features  
- **Backend Generation**: API endpoints, server logic, database models
- **Authentication**: User management, role-based access
- **Database Integration**: Schema design, data persistence
- **Deployment**: Automated deployment to cloud platforms
- **Advanced AI**: Complex code generation, optimization suggestions

## Project Structure

```
src/
├── components/
│   ├── builder/          # Core builder interface components
│   ├── ui/              # Reusable UI components (shadcn/ui)
│   └── ...              # Other components
├── pages/               # Main application pages
├── hooks/               # Custom React hooks
└── lib/                 # Utility functions
```

## Deployment

Build the project for production:

```sh
npm run build
```

The built files will be in the `dist` directory, ready to deploy to any static hosting service like Vercel, Netlify, or GitHub Pages.
