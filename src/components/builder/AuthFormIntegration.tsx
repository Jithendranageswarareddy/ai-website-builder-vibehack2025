import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff,
  LogIn,
  UserPlus,
  CheckCircle,
  AlertCircle,
  Loader2,
  Shield,
  Key,
  Database,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AuthFormProps {
  mode: 'signup' | 'login' | 'reset';
  onModeChange: (mode: 'signup' | 'login' | 'reset') => void;
  apiEndpoint?: string;
  enableDemo?: boolean;
}

export const AuthFormIntegration = ({
  mode = 'login',
  onModeChange,
  apiEndpoint = 'http://localhost:3001/api/auth',
  enableDemo = true
}: AuthFormProps) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoMode, setDemoMode] = useState(enableDemo);
  const { toast } = useToast();

  // Mock API responses for demo
  const mockApiCall = async (endpoint: string, data: any) => {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
    
    if (endpoint.includes('signup')) {
      return {
        success: true,
        message: 'Account created successfully!',
        user: {
          id: Date.now(),
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          token: 'mock_jwt_token_' + Date.now()
        }
      };
    }
    
    if (endpoint.includes('login')) {
      if (data.email === 'demo@example.com' && data.password === 'demo123') {
        return {
          success: true,
          message: 'Login successful!',
          user: {
            id: 1,
            email: data.email,
            firstName: 'Demo',
            lastName: 'User',
            token: 'mock_jwt_token_demo'
          }
        };
      } else {
        throw new Error('Invalid credentials. Try demo@example.com / demo123');
      }
    }
    
    if (endpoint.includes('reset')) {
      return {
        success: true,
        message: 'Password reset email sent!'
      };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (mode === 'signup' && formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // API endpoint mapping
      const endpoints = {
        signup: `${apiEndpoint}/register`,
        login: `${apiEndpoint}/login`,
        reset: `${apiEndpoint}/reset-password`
      };

      const endpoint = endpoints[mode];
      
      let result;
      if (demoMode) {
        // Use mock API for demo
        result = await mockApiCall(endpoint, formData);
      } else {
        // Real API call (would fail in demo environment)
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        result = await response.json();
      }

      // Success handling
      toast({
        title: "Success!",
        description: result.message,
      });

      // Store auth data (in real app, use secure storage)
      if (result.user && result.user.token) {
        localStorage.setItem('auth_token', result.user.token);
        localStorage.setItem('user_data', JSON.stringify(result.user));
      }

      // Reset form
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: ''
      });

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getSubmitButtonText = () => {
    if (loading) return <Loader2 className="w-4 h-4 animate-spin" />;
    
    switch (mode) {
      case 'signup': return 'Create Account';
      case 'login': return 'Sign In';
      case 'reset': return 'Send Reset Email';
      default: return 'Submit';
    }
  };

  const getFormTitle = () => {
    switch (mode) {
      case 'signup': return 'Create Your Account';
      case 'login': return 'Welcome Back';
      case 'reset': return 'Reset Password';
      default: return 'Authentication';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <div className="w-8 h-8 bg-gradient-ai rounded-full flex items-center justify-center">
            {mode === 'signup' ? <UserPlus className="w-4 h-4 text-white" /> :
             mode === 'login' ? <LogIn className="w-4 h-4 text-white" /> :
             <Key className="w-4 h-4 text-white" />}
          </div>
          <CardTitle>{getFormTitle()}</CardTitle>
        </div>
        
        {/* Demo Mode Toggle */}
        <div className="flex items-center justify-center gap-2">
          <Badge variant={demoMode ? "default" : "outline"} className="text-xs">
            {demoMode ? "Demo Mode" : "Live API"}
          </Badge>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDemoMode(!demoMode)}
            className="h-6 px-2 text-xs"
          >
            <Settings className="w-3 h-3 mr-1" />
            Toggle
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Fields for Signup */}
          {mode === 'signup' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  required
                  placeholder="John"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  required
                  placeholder="Doe"
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
                placeholder={demoMode ? "demo@example.com" : "your@email.com"}
                className="pl-10"
              />
            </div>
          </div>

          {/* Password Field */}
          {mode !== 'reset' && (
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  placeholder={demoMode ? "demo123" : "Your password"}
                  className="pl-10 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}

          {/* Confirm Password for Signup */}
          {mode === 'signup' && (
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                  placeholder="Confirm your password"
                  className="pl-10"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {getSubmitButtonText()}
          </Button>
        </form>

        {/* Mode Switching */}
        <div className="text-center space-y-2">
          {mode === 'login' && (
            <>
              <Button
                variant="link"
                size="sm"
                onClick={() => onModeChange('signup')}
                className="text-xs"
              >
                Don't have an account? Sign up
              </Button>
              <br />
              <Button
                variant="link"
                size="sm"
                onClick={() => onModeChange('reset')}
                className="text-xs"
              >
                Forgot your password?
              </Button>
            </>
          )}

          {mode === 'signup' && (
            <Button
              variant="link"
              size="sm"
              onClick={() => onModeChange('login')}
              className="text-xs"
            >
              Already have an account? Sign in
            </Button>
          )}

          {mode === 'reset' && (
            <Button
              variant="link"
              size="sm"
              onClick={() => onModeChange('login')}
              className="text-xs"
            >
              Back to sign in
            </Button>
          )}
        </div>

        {/* Demo Instructions */}
        {demoMode && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-800">
                  Demo Mode Active
                </p>
                <p className="text-xs text-blue-600">
                  {mode === 'login' 
                    ? 'Use: demo@example.com / demo123'
                    : 'Fill any valid data - this is a simulation'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* API Endpoint Info */}
        <div className="bg-gray-50 border rounded p-2">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Database className="w-3 h-3" />
            <span>Endpoint: {demoMode ? 'Mock API' : `${apiEndpoint}/${mode === 'signup' ? 'register' : mode}`}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Integration component for the canvas builder
export const AuthFormBlock = ({ 
  properties = { mode: 'login', title: 'Authentication' },
  onPropertiesChange 
}: {
  properties?: any;
  onPropertiesChange?: (properties: any) => void;
}) => {
  const [authMode, setAuthMode] = useState<'signup' | 'login' | 'reset'>(properties.mode || 'login');

  const handleModeChange = (mode: 'signup' | 'login' | 'reset') => {
    setAuthMode(mode);
    onPropertiesChange?.({ ...properties, mode });
  };

  return (
    <div className="p-4">
      <AuthFormIntegration
        mode={authMode}
        onModeChange={handleModeChange}
        enableDemo={true}
      />
    </div>
  );
};
