import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { getAuthService, AuthState, AuthCredentials, SignupData, AuthResponse } from '../lib/auth/authService';
import { User } from '../lib/database/schema';

interface AuthContextType extends AuthState {
  signin: (credentials: AuthCredentials) => Promise<AuthResponse>;
  signup: (signupData: SignupData) => Promise<AuthResponse>;
  signout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  updateProfile: (updates: Partial<User>) => Promise<AuthResponse>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthState = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    token: null
  });

  const authService = getAuthService();

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const state = await authService.initializeAuth();
        setAuthState(state);
      } catch (error) {
        console.error('Auth initialization error:', error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          token: null
        });
      }
    };

    initAuth();
  }, []);

  // Sign in
  const signin = useCallback(async (credentials: AuthCredentials): Promise<AuthResponse> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await authService.signin(credentials);
      
      if (response.success && response.user && response.token) {
        setAuthState({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          token: response.token
        });
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
      
      return response;
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return {
        success: false,
        error: 'An unexpected error occurred'
      };
    }
  }, [authService]);

  // Sign up
  const signup = useCallback(async (signupData: SignupData): Promise<AuthResponse> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await authService.signup(signupData);
      
      if (response.success && response.user && response.token) {
        setAuthState({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          token: response.token
        });
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
      
      return response;
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return {
        success: false,
        error: 'An unexpected error occurred'
      };
    }
  }, [authService]);

  // Sign out
  const signout = useCallback(async (): Promise<void> => {
    try {
      await authService.signout();
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        token: null
      });
    } catch (error) {
      console.error('Signout error:', error);
    }
  }, [authService]);

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    return await authService.resetPassword(email);
  }, [authService]);

  // Update profile
  const updateProfile = useCallback(async (updates: Partial<User>): Promise<AuthResponse> => {
    const response = await authService.updateProfile(updates);
    
    if (response.success && response.user) {
      setAuthState(prev => ({
        ...prev,
        user: response.user!
      }));
    }
    
    return response;
  }, [authService]);

  // Change password
  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    return await authService.changePassword(currentPassword, newPassword);
  }, [authService]);

  // Refresh auth state
  const refreshAuth = useCallback(async (): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      const state = await authService.initializeAuth();
      setAuthState(state);
    } catch (error) {
      console.error('Auth refresh error:', error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        token: null
      });
    }
  }, [authService]);

  return {
    ...authState,
    signin,
    signup,
    signout,
    resetPassword,
    updateProfile,
    changePassword,
    refreshAuth
  };
};

// Auth Provider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuthState();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};
