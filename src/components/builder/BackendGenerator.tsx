import { DatabaseTable, DatabaseRelation } from "./SchemaDesigner";

interface AuthConfig {
  enableRegistration: boolean;
  enableLogin: boolean;
  enablePasswordReset: boolean;
  jwtSecret: string;
  sessionExpiry: string;
  passwordMinLength: number;
}

interface APIEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  tableName: string;
  code: string;
}

export interface BackendConfig {
  tables: DatabaseTable[];
  relations: DatabaseRelation[];
  endpoints: APIEndpoint[];
  authConfig: AuthConfig;
  projectName: string;
}

export const generateBackendCode = (config: BackendConfig) => {
  const files: { [key: string]: string } = {};

  // Generate package.json
  files['package.json'] = generatePackageJson(config.projectName);

  // Generate server.js
  files['src/server.js'] = generateServerJs(config);

  // Generate Prisma schema
  files['prisma/schema.prisma'] = generatePrismaSchema(config.tables, config.relations);

  // Generate .env file
  files['.env'] = generateEnvFile(config.authConfig);

  // Generate routes
  files['src/routes/auth.js'] = generateAuthRoutes(config.authConfig);
  
  config.tables.forEach(table => {
    files[`src/routes/${table.name.toLowerCase()}.js`] = generateTableRoutes(table, config.endpoints);
  });

  // Generate middleware
  files['src/middleware/auth.js'] = generateAuthMiddleware(config.authConfig);

  // Generate README
  files['README.md'] = generateBackendReadme(config);

  // Generate Docker files
  files['Dockerfile'] = generateDockerfile();
  files['docker-compose.yml'] = generateDockerCompose(config.projectName);

  return files;
};

const generatePackageJson = (projectName: string) => {
  return JSON.stringify({
    "name": `${projectName.toLowerCase().replace(/\s+/g, '-')}-backend`,
    "version": "1.0.0",
    "description": `Backend API for ${projectName}`,
    "main": "src/server.js",
    "type": "commonjs",
    "scripts": {
      "start": "node src/server.js",
      "dev": "nodemon src/server.js",
      "build": "echo 'No build step needed'",
      "db:generate": "prisma generate",
      "db:push": "prisma db push",
      "db:migrate": "prisma migrate dev",
      "db:studio": "prisma studio",
      "db:seed": "node prisma/seed.js"
    },
    "keywords": ["api", "backend", "prisma", "express", "jwt", "bcrypt"],
    "author": "BuilderAI Generated",
    "license": "MIT",
    "dependencies": {
      "express": "^4.18.2",
      "cors": "^2.8.5",
      "helmet": "^7.1.0",
      "dotenv": "^16.3.1",
      "@prisma/client": "^5.7.1",
      "bcryptjs": "^2.4.3",
      "jsonwebtoken": "^9.0.2",
      "express-rate-limit": "^7.1.5",
      "express-validator": "^7.0.1"
    },
    "devDependencies": {
      "prisma": "^5.7.1",
      "nodemon": "^3.0.2"
    }
  }, null, 2);
};

const generateServerJs = (config: BackendConfig) => {
  const tableRoutes = config.tables.map(table => 
    `app.use('/api/${table.name.toLowerCase()}s', require('./routes/${table.name.toLowerCase()}'));`
  ).join('\n');

  return `const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
${tableRoutes}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(\`🚀 Server running on http://localhost:\${PORT}\`);
  console.log(\`📚 API documentation: http://localhost:\${PORT}/health\`);
});

module.exports = app;`;
};

const generatePrismaSchema = (tables: DatabaseTable[], relations: DatabaseRelation[]) => {
  const prismaFieldTypes: { [key: string]: string } = {
    'String': 'String',
    'Int': 'Int',
    'Float': 'Float',
    'Boolean': 'Boolean',
    'DateTime': 'DateTime',
    'Json': 'Json'
  };

  const models = tables.map(table => {
    const fields = table.fields.map(field => {
      let fieldDef = `  ${field.name} ${prismaFieldTypes[field.type] || 'String'}`;
      
      if (field.name === 'id') {
        fieldDef += ' @id @default(autoincrement())';
      } else {
        if (field.unique) fieldDef += ' @unique';
        if (!field.required && field.name !== 'id') fieldDef += '?';
        if (field.defaultValue) fieldDef += ` @default(${field.defaultValue})`;
      }
      
      return fieldDef;
    }).join('\n');

    // Add default timestamps
    const timestamps = `  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt`;

    return `model ${table.name} {
${fields}
${timestamps}
}`;
  }).join('\n\n');

  return `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

${models}`;
};

const generateEnvFile = (authConfig: AuthConfig) => {
  return `# Environment Configuration
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL="file:./dev.db"

# Authentication
JWT_SECRET="${authConfig.jwtSecret}"
JWT_EXPIRES_IN="${authConfig.sessionExpiry}"
BCRYPT_ROUNDS=12

# API Keys (add as needed)
# OPENAI_API_KEY=your_openai_api_key
# STRIPE_SECRET_KEY=your_stripe_secret_key
# SENDGRID_API_KEY=your_sendgrid_api_key`;
};

const generateAuthRoutes = (authConfig: AuthConfig) => {
  return `const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

${authConfig.enableRegistration ? `
// POST /api/auth/register
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: ${authConfig.passwordMinLength} }),
  body('name').trim().isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS));

    // Create user
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: { id: true, name: true, email: true, createdAt: true }
    });

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
` : ''}

${authConfig.enableLogin ? `
// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      user: { id: user.id, name: user.name, email: user.email },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
` : ''}

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, name: true, email: true, createdAt: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;`;
};

const generateTableRoutes = (table: DatabaseTable, endpoints: APIEndpoint[]) => {
  const tableEndpoints = endpoints.filter(e => e.tableName === table.name);
  const routeCode = tableEndpoints.map(endpoint => endpoint.code).join('\n\n');

  return `const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

${routeCode}

module.exports = router;`;
};

const generateAuthMiddleware = (authConfig: AuthConfig) => {
  return `const jwt = require('jsonwebtoken');

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
};

const generateBackendReadme = (config: BackendConfig) => {
  return `# ${config.projectName} Backend API

Generated by BuilderAI - AI-Powered Backend Generator

## Features

- 🚀 Express.js REST API
- 🗄️ Prisma ORM with SQLite
- 🔐 JWT Authentication
- 🛡️ Security middleware (Helmet, CORS, Rate limiting)
- ✅ Input validation
- 📊 Database models for: ${config.tables.map(t => t.name).join(', ')}

## Quick Start

1. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Setup database**
   \`\`\`bash
   npx prisma generate
   npx prisma db push
   \`\`\`

3. **Start development server**
   \`\`\`bash
   npm run dev
   \`\`\`

## API Endpoints

### Authentication
${config.authConfig.enableRegistration ? '- `POST /api/auth/register` - User registration\n' : ''}${config.authConfig.enableLogin ? '- `POST /api/auth/login` - User login\n' : ''}- \`GET /api/auth/me\` - Get current user

### Data Endpoints
${config.tables.map(table => `
#### ${table.name}
- \`GET /api/${table.name.toLowerCase()}s\` - Get all ${table.name.toLowerCase()}s
- \`GET /api/${table.name.toLowerCase()}s/:id\` - Get ${table.name.toLowerCase()} by ID
- \`POST /api/${table.name.toLowerCase()}s\` - Create new ${table.name.toLowerCase()}
- \`PUT /api/${table.name.toLowerCase()}s/:id\` - Update ${table.name.toLowerCase()}
- \`DELETE /api/${table.name.toLowerCase()}s/:id\` - Delete ${table.name.toLowerCase()}`).join('\n')}

## Environment Variables

Copy \`.env.example\` to \`.env\` and configure:

\`\`\`
NODE_ENV=development
PORT=3001
DATABASE_URL="file:./dev.db"
JWT_SECRET=your_jwt_secret
\`\`\`

## Database Schema

${config.tables.map(table => `
### ${table.name}
${table.fields.map(field => `- \`${field.name}\`: ${field.type}${field.required ? ' (required)' : ''}${field.unique ? ' (unique)' : ''}`).join('\n')}
`).join('\n')}

## Deployment

### Docker
\`\`\`bash
docker build -t ${config.projectName.toLowerCase()}-backend .
docker run -p 3001:3001 ${config.projectName.toLowerCase()}-backend
\`\`\`

### Railway/Render
1. Connect your repository
2. Set environment variables
3. Deploy automatically

---

Generated with ❤️ by BuilderAI`;
};

const generateDockerfile = () => {
  return `FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3001

CMD ["npm", "start"]`;
};

const generateDockerCompose = (projectName: string) => {
  return `version: '3.8'

services:
  api:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=file:./data/prod.db
    volumes:
      - ./data:/app/data
    restart: unless-stopped

  # Optional: Add PostgreSQL for production
  # postgres:
  #   image: postgres:15-alpine
  #   environment:
  #     POSTGRES_DB: ${projectName.toLowerCase().replace(/\s+/g, '_')}
  #     POSTGRES_USER: postgres
  #     POSTGRES_PASSWORD: password
  #   volumes:
  #     - postgres_data:/var/lib/postgresql/data
  #   ports:
  #     - "5432:5432"

# volumes:
#   postgres_data:`;
};
