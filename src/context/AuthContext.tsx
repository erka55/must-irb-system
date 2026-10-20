'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  is_superuser?: boolean;
  is_staff?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      // localStorage-ийн оронд sessionStorage ашиглана
      const token = sessionStorage.getItem('access_token');
      if (token) {
        try {
          const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'}/users/me/`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(res.data);
        } catch (err) {
          sessionStorage.removeItem('access_token');
          sessionStorage.removeItem('refresh_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'}/token/`, {
      username,
      password,
    });

    // Токенуудыг sessionStorage-д хадгална
    sessionStorage.setItem('access_token', res.data.access);
    sessionStorage.setItem('refresh_token', res.data.refresh);

    // Нэвтэрсэн хэрэглэгчийн мэдээллийг авах
    const userRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'}/users/me/`, {
      headers: { Authorization: `Bearer ${res.data.access}` },
    });

    setUser(userRes.data);
  };

  const logout = () => {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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
