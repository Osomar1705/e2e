import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { getMe } from '../api/users';

interface AuthContextType {
  user: User | null;
  token: string | null;
  setToken: (token: string) => Promise<User | null>;
  logout: () => void;
  loading: boolean;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const refreshUser = async (): Promise<User | null> => {
    try {
      const res = await getMe();
      setUser(res.data);
      return res.data;
    } catch {
      setUser(null);
      return null;
    }
  };

  const setToken = async (t: string): Promise<User | null> => {
    localStorage.setItem('token', t);
    setTokenState(t);
    return refreshUser();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setTokenState(null);
    setUser(null);
  };

  useEffect(() => {
    if (token) {
      refreshUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, setToken, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
