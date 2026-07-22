import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('burger_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLoggedIn, setIsLoggedIn] = useState(!!currentUser);

  useEffect(() => {
    setIsLoggedIn(!!currentUser);
    if (currentUser) {
      localStorage.setItem('burger_auth_user', JSON.stringify(currentUser));
      // Sync to legacy keys as well to preserve other views
      localStorage.setItem('burger_is_logged_in', 'true');
      localStorage.setItem('burger_profile', JSON.stringify({
        name: currentUser.name,
        email: currentUser.email,
        phone: "555-0199",
        avatar: null
      }));
    } else {
      localStorage.removeItem('burger_auth_user');
      localStorage.removeItem('burger_is_logged_in');
      localStorage.removeItem('burger_profile');
    }
  }, [currentUser]);

  const sendOTP = async (email) => {
    return await authService.sendOTP(email);
  };

  const verifyOTP = async (email, otp) => {
    const data = await authService.verifyOTP(email, otp);
    setCurrentUser(data.user);
    return data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setCurrentUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      isLoggedIn,
      sendOTP,
      verifyOTP,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}
