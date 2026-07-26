'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, User } from '@/utils/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  refreshProfile: () => Promise<void>;
  language: 'en' | 'bn';
  toggleLanguage: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<'en' | 'bn'>('en');

  // Load language preference from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('lang') as 'en' | 'bn';
      if (savedLang === 'bn' || savedLang === 'en') {
        setLanguage(savedLang);
      }
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = api.getAuthToken();
      if (token) {
        try {
          const profile = await api.getProfile();
          setUser(profile);
        } catch (error) {
          console.warn("Access token expired, attempting refresh...");
          // Try to refresh the token
          const newToken = await api.refreshAccessToken();
          if (newToken) {
            try {
              const profile = await api.getProfile();
              setUser(profile);
            } catch {
              console.error("Profile fetch failed after token refresh");
              api.clearAuthToken();
              setUser(null);
            }
          } else {
            api.clearAuthToken();
            setUser(null);
          }
        }
      } else {
        // Demo mode / auto fallback: check localStorage or load default demo profile
        if (typeof window !== 'undefined') {
          const savedUser = localStorage.getItem('user');
          if (savedUser) {
            try {
              setUser(JSON.parse(savedUser));
            } catch {
              setUser(null);
            }
          } else {
            // Provide default active profile for seamless demonstration
            const defaultUser = {
              id: 101,
              username: 'Rakib',
              email: 'rakib@gmail.com',
              first_name: 'Rakibul',
              last_name: 'Islam',
              profile: {
                phone: '01817860068',
                nid: '1998269271829',
                email_verified: true,
                phone_verified: true,
                nid_verified: true,
                nid_name: 'Rakibul Islam',
                nid_dob: '2000-01-01',
                nid_address: 'Dhaka, Bangladesh',
              },
            };
            localStorage.setItem('user', JSON.stringify(defaultUser));
            setUser(defaultUser);
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.login(username, password);
      api.setAuthToken(res.access);
      api.setRefreshToken(res.refresh);
      setUser(res.user);
    } catch (error) {
      setLoading(false);
      throw error;
    }
    setLoading(false);
  };

  const logout = () => {
    api.clearAuthToken();
    setUser(null);
  };

  const refreshProfile = async () => {
    try {
      const profile = await api.getProfile();
      setUser(profile);
    } catch (e) {
      console.error("Failed to refresh profile", e);
    }
  };

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'bn' : 'en';
    setLanguage(nextLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lang', nextLang);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser, refreshProfile, language, toggleLanguage }}>
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
