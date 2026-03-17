import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, UserInfo } from '../../utils/authService';
import LoginScreen from './LoginScreen';

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    setIsLoading(true);
    
    if (!authService.isAuthenticated()) {
      setIsLoading(false);
      return;
    }

    const isValid = await authService.verifySession();
    
    if (isValid) {
      setUser(authService.getUserInfo());
    } else {
      setUser(null);
    }
    
    setIsLoading(false);
  }

  async function login(phone) {
    const result = await authService.login(phone);
    
    if (result.success && result.user) {
      setUser(result.user);
      return { success: true };
    }
    
    return { success: false, message: result.message };
  }

  async function logout() {
    await authService.logout();
    setUser(null);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-white text-2xl">Chargement...</div>
        </div>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={(userData) => setUser(userData)} />;
  }

  const value = {
    user,
    login,
    logout,
    isAuthenticated: true
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
