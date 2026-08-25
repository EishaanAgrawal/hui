import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: any) => Promise<void>;
  registerConsumer: (data: any) => Promise<void>;
  registerFarmer: (data: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isFarmer: boolean;
  isAdmin: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('farmdirect_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('farmdirect_token')
  );
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    if (!localStorage.getItem('farmdirect_token')) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const freshUser = await authApi.getMe();
      setUser(freshUser);
      localStorage.setItem('farmdirect_user', JSON.stringify(freshUser));
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (credentials: any) => {
    const data = await authApi.login(credentials);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('farmdirect_token', data.token);
    localStorage.setItem('farmdirect_user', JSON.stringify(data.user));
  };

  const registerConsumer = async (data: any) => {
    const res = await authApi.registerConsumer(data);
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('farmdirect_token', res.token);
    localStorage.setItem('farmdirect_user', JSON.stringify(res.user));
  };

  const registerFarmer = async (data: any) => {
    const res = await authApi.registerFarmer(data);
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('farmdirect_token', res.token);
    localStorage.setItem('farmdirect_user', JSON.stringify(res.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('farmdirect_token');
    localStorage.removeItem('farmdirect_user');
  };

  const isAuthenticated = !!token && !!user;
  const isFarmer = user?.role === 'FARMER';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        registerConsumer,
        registerFarmer,
        logout,
        isAuthenticated,
        isFarmer,
        isAdmin,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
