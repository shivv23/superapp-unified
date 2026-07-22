"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiLogin, apiRegister, apiLogout, apiGetProfile, type AuthUser } from "./api";

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, fullName: string, phone: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "superapp_auth";

function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, isAuthenticated: false, isLoading: true });

  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      setState({ user, isAuthenticated: true, isLoading: false });
    } else {
      setState({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const data = await apiLogin(email, password);
      if (data.status === "success") {
        setState({ user: data.data.user, isAuthenticated: true, isLoading: false });
        return { success: true };
      }
      return { success: false, error: data.message || "Login failed." };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Login failed. Is the auth service running?" };
    }
  }, []);

  const register = useCallback(async (email: string, password: string, fullName: string, phone: string) => {
    try {
      const data = await apiRegister(email, password, fullName, phone);
      if (data.status === "success") {
        setState({ user: data.data.user, isAuthenticated: true, isLoading: false });
        return { success: true };
      }
      return { success: false, error: data.message || "Registration failed." };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Registration failed. Is the auth service running?" };
    }
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setState({ user: null, isAuthenticated: false, isLoading: false });
    window.location.href = "/";
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
