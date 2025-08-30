import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Shield, User, Lock, Eye, EyeOff, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AuthConfig {
  enableRegistration: boolean;
  enableLogin: boolean;
  enablePasswordReset: boolean;
  jwtSecret: string;
  sessionExpiry: string;
  passwordMinLength: number;
}

export interface AuthGeneratorProps {
  authConfig: AuthConfig;
  setAuthConfig: (config: AuthConfig) => void;
}

export const AuthGenerator = ({ authConfig, setAuthConfig }: AuthGeneratorProps) => {
  const [showSecret, setShowSecret] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const { toast } = useToast();

  function generateRandomSecret(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)), 
      byte => byte.toString(16).padStart(2, '0')).join('');
  }

  const updateConfig = (updates: Partial<AuthConfig>) => {
    const newConfig = { ...authConfig, ...updates };
    setAuthConfig(newConfig);
  };

  const generateAuthSystem = () => {
    const authCode = generateAuthCode(authConfig);
    setGeneratedCode(authCode);
    
    toast({
      title: "Authentication System Generated",
      description: "Complete auth system with JWT and password hashing ready!"
    });
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    toast({
      title: "Code Copied",
      description: "Authentication code copied to clipboard"
    });
  };

  const generateNewSecret = () => {
    const newSecret = generateRandomSecret();
    updateConfig({ jwtSecret: newSecret });
    toast({
      title: "New Secret Generated",
      description: "JWT secret has been regenerated"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Shield className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Authentication System</h2>
      </div>

      <Tabs defaultValue="config" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="forms">Auth Forms</TabsTrigger>
          <TabsTrigger value="backend">Backend Code</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Features */}
              <div>
                <Label className="text-base font-semibold">Features</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="registration"
                      checked={authConfig.enableRegistration}
                      onChange={(e) => updateConfig({ enableRegistration: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="registration">User Registration</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="login"
                      checked={authConfig.enableLogin}
                      onChange={(e) => updateConfig({ enableLogin: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="login">User Login</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="reset"
                      checked={authConfig.enablePasswordReset}
                      onChange={(e) => updateConfig({ enablePasswordReset: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="reset">Password Reset</Label>
                  </div>
                </div>
              </div>

              {/* JWT Configuration */}
              <div>
                <Label className="text-base font-semibold">JWT Configuration</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label htmlFor="jwt-secret">JWT Secret</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="jwt-secret"
                          type={showSecret ? "text" : "password"}
                          value={authConfig.jwtSecret}
                          onChange={(e) => updateConfig({ jwtSecret: e.target.value })}
                          className="font-mono text-xs pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowSecret(!showSecret)}
                        >
                          {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                      <Button variant="outline" onClick={generateNewSecret}>
                        Generate
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="session-expiry">Session Expiry</Label>
                    <select
                      id="session-expiry"
                      value={authConfig.sessionExpiry}
                      onChange={(e) => updateConfig({ sessionExpiry: e.target.value })}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="1h">1 Hour</option>
                      <option value="24h">24 Hours</option>
                      <option value="7d">7 Days</option>
                      <option value="30d">30 Days</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Password Requirements */}
              <div>
                <Label className="text-base font-semibold">Password Requirements</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label htmlFor="min-length">Minimum Length</Label>
                    <Input
                      id="min-length"
                      type="number"
                      min="6"
                      max="50"
                      value={authConfig.passwordMinLength}
                      onChange={(e) => updateConfig({ passwordMinLength: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <Button onClick={generateAuthSystem} className="w-full">
                Generate Authentication System
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forms" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Login Form Preview */}
            {authConfig.enableLogin && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Login Form
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="user@example.com"
                      disabled
                    />
                  </div>
                  <div>
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      disabled
                    />
                  </div>
                  <Button className="w-full" disabled>
                    Sign In
                  </Button>
                  <div className="text-center text-sm text-muted-foreground">
                    Preview only - form will be functional in generated code
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Registration Form Preview */}
            {authConfig.enableRegistration && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Registration Form
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="reg-name">Full Name</Label>
                    <Input
                      id="reg-name"
                      placeholder="John Doe"
                      disabled
                    />
                  </div>
                  <div>
                    <Label htmlFor="reg-email">Email</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="user@example.com"
                      disabled
                    />
                  </div>
                  <div>
                    <Label htmlFor="reg-password">Password</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder={`Min ${authConfig.passwordMinLength} characters`}
                      disabled
                    />
                  </div>
                  <Button className="w-full" disabled>
                    Create Account
                  </Button>
                  <div className="text-center text-sm text-muted-foreground">
                    Preview only - form will be functional in generated code
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="backend" className="space-y-4">
          {generatedCode && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Generated Authentication Code
                  </span>
                  <Button variant="ghost" size="sm" onClick={copyCode}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-md max-h-96 overflow-y-auto">
                  <pre className="text-xs">
                    <code>{generatedCode}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
          
          {!generatedCode && (
            <Card>
              <CardContent className="text-center py-8">
                <Lock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">
                  Configure your authentication settings and click "Generate Authentication System" to see the backend code.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const generateAuthCode = (config: AuthConfig) => {
  return `// Authentication System - Generated Code

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const JWT_SECRET = '${config.jwtSecret}';
const JWT_EXPIRES_IN = '${config.sessionExpiry}';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

${config.enableRegistration ? `
// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate password length
    if (password.length < ${config.passwordMinLength}) {
      return res.status(400).json({ 
        error: 'Password must be at least ${config.passwordMinLength} characters long' 
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'User created successfully',
      user,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
` : ''}

${config.enableLogin ? `
// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
` : ''}

// GET /api/auth/me - Get current user profile
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
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

// POST /api/auth/logout
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  // In a more complex setup, you might maintain a blacklist of tokens
  res.json({ message: 'Logout successful' });
});

${config.enablePasswordReset ? `
// POST /api/auth/reset-password
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Validate password length
    if (newPassword.length < ${config.passwordMinLength}) {
      return res.status(400).json({ 
        error: 'Password must be at least ${config.passwordMinLength} characters long' 
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user password
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
` : ''}

module.exports = { authenticateToken };

// Prisma User Model (add to schema.prisma):
/*
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
*/`;
};
