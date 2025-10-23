import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { hashPassword, setAuthStatus, isSessionValid, clearAuthData } from '@/lib/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  // Pre-computed hash for the password "qr@2k25"
  const CORRECT_PASSWORD_HASH = 'd26185c8075359891322d5b795aacfb293883126827003aa02faa730137d671c';

  useEffect(() => {
    // Check if user is already authenticated with valid session
    if (isSessionValid()) {
      setIsAuthenticated(true);
    } else {
      clearAuthData();
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Hash the provided password
      const hashedPassword = await hashPassword(password);
      
      // Check credentials
      if (username === 'LabAdmin' && hashedPassword === CORRECT_PASSWORD_HASH) {
        setIsAuthenticated(true);
        setAuthStatus(true);
        setLocation('/');
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    clearAuthData();
    setLocation('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
