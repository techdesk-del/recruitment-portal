import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  AuthUser, 
  UserRole, 
  AuthPermission, 
  ROLE_PERMISSIONS, 
  LoginCredentials, 
  RegisterData 
} from '../types';
import { authApi, AUTH_TOKEN_KEY } from '../services/api';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => Promise<void>;
  can: (permission: AuthPermission) => boolean;
  isAdmin: boolean;
  isRecruiter: boolean;
  isHiringManager: boolean;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'urbangaon_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(AUTH_TOKEN_KEY);
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Synchronize state with localStorage
  const saveSession = (newToken: string, newUser: AuthUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem(AUTH_TOKEN_KEY, newToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
  };

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  }, []);

  // Verify stored session on app load
  useEffect(() => {
    const verifySession = async () => {
      const existingToken = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!existingToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await authApi.getMe();
        if (response.success && response.user) {
          setUser(response.user);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.user));
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Session verification failed, logging out:', err);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, [logout]);

  // Listen for unauthorized 401 events globally
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [logout]);

  // Login handler
  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authApi.login(credentials);
      if (res.token && res.user) {
        saveSession(res.token, res.user);
      } else {
        throw new Error('Authentication failed. No token returned.');
      }
    } catch (err: any) {
      const message = err.message || 'Login failed. Please check your credentials.';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Register handler
  const register = async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authApi.register(data);
      if (res.token && res.user) {
        saveSession(res.token, res.user);
      } else {
        throw new Error('Registration failed.');
      }
    } catch (err: any) {
      const message = err.message || 'Registration failed.';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick role switcher for demo & inspection
  const switchRole = async (newRole: UserRole) => {
    if (!user) return;
    try {
      const res = await authApi.updateUserRole(user.id, newRole);
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
      }
    } catch {
      // Fallback local update
      const updatedUser: AuthUser = { ...user, role: newRole };
      setUser(updatedUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
    }
  };

  // Permission evaluator
  const can = useCallback((permission: AuthPermission): boolean => {
    if (!user) return false;
    const allowed = ROLE_PERMISSIONS[user.role] || [];
    return allowed.includes(permission);
  }, [user]);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    switchRole,
    can,
    isAdmin: user?.role === 'admin',
    isRecruiter: user?.role === 'recruiter',
    isHiringManager: user?.role === 'hiring_manager',
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
