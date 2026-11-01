import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/index';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  registerStudent: (payload: { name: string; studentId?: string; email: string; password: string }) => Promise<void>;
  quickDemoLogin: (role: UserRole, email?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('meritlens_token');
    const savedUser = localStorage.getItem('meritlens_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('meritlens_token');
        localStorage.removeItem('meritlens_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await api.login(email, password);
      setUser(data.user);
      setToken(data.token);
    } finally {
      setIsLoading(false);
    }
  };

  const registerStudent = async (payload: { name: string; studentId?: string; email: string; password: string }) => {
    setIsLoading(true);
    try {
      const data = await api.registerStudent(payload);
      setUser(data.user);
      setToken(data.token);
    } finally {
      setIsLoading(false);
    }
  };

  const quickDemoLogin = async (targetRole: UserRole, email?: string) => {
    setIsLoading(true);
    try {
      if (targetRole === 'teacher') {
        await login('teacher@meritlens.edu', 'admin123');
      } else {
        const studentEmail = email || 'mahitha@student.edu';
        await login(studentEmail, 'student123');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        token,
        isLoading,
        login,
        registerStudent,
        quickDemoLogin,
        logout
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
