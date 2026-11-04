/**
 * AuthContext.jsx
 * Implements authentication state and role access using React Context API only
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('rental_token') || null);
  const [loading, setLoading] = useState(true);

  // Check token and fetch user on initial mount
  useEffect(() => {
    async function initAuth() {
      const storedToken = localStorage.getItem('rental_token');
      if (storedToken) {
        try {
          const res = await api.getMe();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            logout();
          }
        } catch (err) {
          console.error('Failed to restore session:', err.message);
          logout();
        }
      }
      setLoading(false);
    }

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.login({ email, password });
      if (res.success && res.token) {
        localStorage.setItem('rental_token', res.token);
        setToken(res.token);
        setUser(res.user);
        return { success: true, message: res.message, user: res.user };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (err) {
      return { success: false, message: err.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.register(userData);
      if (res.success && res.token) {
        localStorage.setItem('rental_token', res.token);
        setToken(res.token);
        setUser(res.user);
        return { success: true, message: res.message, user: res.user };
      }
      return { success: false, message: res.message || 'Registration failed' };
    } catch (err) {
      return { success: false, message: err.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('rental_token');
    setToken(null);
    setUser(null);
  };

  // Helper for 2nd year project presentation: quickly switch demo accounts
  const quickSwitchDemo = async (roleType) => {
    if (roleType === 'Admin') {
      return await login('admin@rental.edu', 'admin123');
    } else if (roleType === 'Staff') {
      return await login('staff@rental.edu', 'staff123');
    } else {
      return await login('customer@rental.edu', 'cust123');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, quickSwitchDemo }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
