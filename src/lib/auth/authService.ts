import { User } from '../database/schema';
import { getDatabase } from '../database/mockDatabase';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignupData extends AuthCredentials {
  username: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

class AuthService {
  private db = getDatabase();
  private currentUser: User | null = null;
  private token: string | null = null;

  // Mock JWT token generation
  private generateToken(user: User): string {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      iat: Date.now(),
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };
    
    // In a real app, this would be properly signed
    return btoa(JSON.stringify(payload));
  }

  // Mock password hashing (in real app, use bcrypt)
  private hashPassword(password: string): string {
    // Simple hash for demo - use proper hashing in production
    return btoa(password + 'salt');
  }

  private verifyPassword(password: string, hashedPassword: string): boolean {
    return this.hashPassword(password) === hashedPassword;
  }

  // Validate token and get user
  private validateToken(token: string): User | null {
    try {
      const payload = JSON.parse(atob(token));
      if (payload.exp < Date.now()) {
        return null; // Token expired
      }
      return this.currentUser;
    } catch {
      return null;
    }
  }

  // Initialize auth state from localStorage
  async initializeAuth(): Promise<AuthState> {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');

    if (savedToken && savedUser) {
      try {
        const user = JSON.parse(savedUser);
        const validUser = this.validateToken(savedToken);
        
        if (validUser) {
          this.currentUser = user;
          this.token = savedToken;
          
          // Update last login
          await this.db.updateUser(user.id, {
            lastLoginAt: new Date()
          });
          
          return {
            user,
            isAuthenticated: true,
            isLoading: false,
            token: savedToken
          };
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      }
    }

    // Clear invalid data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      token: null
    };
  }

  // Sign up new user
  async signup(signupData: SignupData): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await this.db.getUserByEmail(signupData.email);
      if (existingUser) {
        return {
          success: false,
          error: 'User with this email already exists'
        };
      }

      // Create new user
      const hashedPassword = this.hashPassword(signupData.password);
      const newUser = await this.db.createUser({
        email: signupData.email,
        username: signupData.username,
        firstName: signupData.firstName,
        lastName: signupData.lastName,
        role: 'user',
        subscription: 'free',
        isEmailVerified: false,
        preferences: {
          theme: 'system',
          notifications: true,
          autoSave: true,
          defaultView: 'canvas'
        }
      });

      // Store password separately (in real app, this would be in secure storage)
      localStorage.setItem(`password_${newUser.id}`, hashedPassword);

      // Generate token
      const token = this.generateToken(newUser);
      
      // Save auth state
      this.currentUser = newUser;
      this.token = token;
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(newUser));

      return {
        success: true,
        user: newUser,
        token
      };
    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        error: 'Failed to create account. Please try again.'
      };
    }
  }

  // Sign in existing user
  async signin(credentials: AuthCredentials): Promise<AuthResponse> {
    try {
      // Find user by email
      const user = await this.db.getUserByEmail(credentials.email);
      if (!user) {
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }

      // Verify password
      const storedPassword = localStorage.getItem(`password_${user.id}`);
      if (!storedPassword || !this.verifyPassword(credentials.password, storedPassword)) {
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }

      // Update last login
      const updatedUser = await this.db.updateUser(user.id, {
        lastLoginAt: new Date()
      });

      // Generate token
      const token = this.generateToken(updatedUser);
      
      // Save auth state
      this.currentUser = updatedUser;
      this.token = token;
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));

      return {
        success: true,
        user: updatedUser,
        token
      };
    } catch (error) {
      console.error('Signin error:', error);
      return {
        success: false,
        error: 'Failed to sign in. Please try again.'
      };
    }
  }

  // Sign out user
  async signout(): Promise<void> {
    this.currentUser = null;
    this.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Get current token
  getCurrentToken(): string | null {
    return this.token;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.currentUser !== null && this.token !== null;
  }

  // Reset password (mock implementation)
  async resetPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const user = await this.db.getUserByEmail(email);
      if (!user) {
        return {
          success: false,
          message: 'No account found with this email address'
        };
      }

      // In a real app, you would send an email with reset link
      // For demo, we'll just generate a temporary password
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = this.hashPassword(tempPassword);
      localStorage.setItem(`password_${user.id}`, hashedPassword);

      // Log the temporary password (for demo only)
      // Temporary password generated for demo purposes

      return {
        success: true,
        message: 'Password reset instructions have been sent to your email'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to reset password. Please try again.'
      };
    }
  }

  // Update user profile
  async updateProfile(updates: Partial<User>): Promise<AuthResponse> {
    try {
      if (!this.currentUser) {
        return {
          success: false,
          error: 'Not authenticated'
        };
      }

      const updatedUser = await this.db.updateUser(this.currentUser.id, updates);
      
      // Update current user state
      this.currentUser = updatedUser;
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));

      return {
        success: true,
        user: updatedUser
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update profile'
      };
    }
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.currentUser) {
        return {
          success: false,
          message: 'Not authenticated'
        };
      }

      // Verify current password
      const storedPassword = localStorage.getItem(`password_${this.currentUser.id}`);
      if (!storedPassword || !this.verifyPassword(currentPassword, storedPassword)) {
        return {
          success: false,
          message: 'Current password is incorrect'
        };
      }

      // Update password
      const hashedNewPassword = this.hashPassword(newPassword);
      localStorage.setItem(`password_${this.currentUser.id}`, hashedNewPassword);

      return {
        success: true,
        message: 'Password changed successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to change password'
      };
    }
  }
}

// Singleton instance
let authServiceInstance: AuthService | null = null;

export const getAuthService = (): AuthService => {
  if (!authServiceInstance) {
    authServiceInstance = new AuthService();
  }
  return authServiceInstance;
};

export { AuthService };
