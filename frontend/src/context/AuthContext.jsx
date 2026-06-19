import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // On mount, hydrate user from storage (already done in useState init).
    setInitializing(false);
  }, []);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const loggedInUser = await authService.login(credentials);
      setUser(loggedInUser);
      toast.success(`Welcome back, ${loggedInUser?.name || 'User'}!`);
      return loggedInUser;
    } catch (error) {
      const message = error?.response?.data?.message || 'Invalid email or password';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const registerMall = useCallback(async (payload) => {
    setLoading(true);
    try {
      const result = await authService.registerMall(payload);
      if (result?.user) setUser(result.user);
      toast.success('Mall registered successfully!');
      return result;
    } catch (error) {
      const message = error?.response?.data?.message || 'Registration failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const next = { ...prev, ...updates };
      return next;
    });
  }, []);

  const value = {
    user,
    isAuthenticated: Boolean(user) && authService.isAuthenticated(),
    role: user?.role,
    loading,
    initializing,
    login,
    registerMall,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
