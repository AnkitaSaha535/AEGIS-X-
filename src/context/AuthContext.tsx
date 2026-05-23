import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { UserRole, AuthContextType } from '../types';

const CREDENTIALS: Record<UserRole, { password: string; displayName: string }> = {
  admin: { password: 'admin123', displayName: 'Commander' },
  user: { password: 'user123', displayName: 'Operator' },
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<UserRole | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [photoURL, setPhotoURL] = useState<string | null>(null);

  const login = useCallback((loginRole: UserRole, user: string, password: string): boolean => {
    const creds = CREDENTIALS[loginRole];
    if (password === creds.password) {
      setIsAuthenticated(true);
      setRole(loginRole);
      setUsername(user || 'unknown');
      setDisplayName(creds.displayName);
      setPhotoURL(null);
      return true;
    }
    return false;
  }, []);

  const loginWithGoogle = useCallback((oauthRole: UserRole, oauthDisplayName: string, email: string, oauthPhotoURL: string) => {
    setIsAuthenticated(true);
    setRole(oauthRole);
    setUsername(email);
    setDisplayName(oauthDisplayName);
    setPhotoURL(oauthPhotoURL || null);
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setRole(null);
    setUsername(null);
    setDisplayName(null);
    setPhotoURL(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, username, displayName, photoURL, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
