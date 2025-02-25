// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from "react";
import { login as loginApi, logout as logoutApi, register as registerApi } from "../api/auth"; // Import logoutApi

interface AuthResponse {
  access: string;
  refresh: string;
  user: any;
}

interface AuthContextType {
  user: any;
  accessToken: string | null;
  refreshToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    try {
      const data = (await loginApi(email, password)) as AuthResponse;
      setAccessToken(data.access);
      setRefreshToken(data.refresh);
      setUser(data.user);

      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);
      localStorage.setItem("user", JSON.stringify(data.user));
    } catch (error: any) {
      console.error("Login failed:", error.message);
      throw error;
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    try {
      await registerApi({ username, email, password });
    } catch (error: any) {
      console.error("Signup failed:", error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");
  
      if (!refreshToken || !accessToken) {
        throw new Error("No tokens available");
      }
  
      await logoutApi(accessToken, refreshToken);
      alert("You have successfully logged out!");
    } catch (error: any) {
      alert("Logout failed. Please try again.");
    } finally {
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
  
      setTimeout(() => {
        window.location.href = "/";
      }, 1000); // ⏳ 2-second delay
    }
  };
  
  // Load stored authentication data on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedAccess = localStorage.getItem("accessToken");
    const storedRefresh = localStorage.getItem("refreshToken");

    if (storedUser && storedAccess && storedRefresh) {
      setUser(JSON.parse(storedUser));
      setAccessToken(storedAccess);
      setRefreshToken(storedRefresh);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, accessToken, refreshToken, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
