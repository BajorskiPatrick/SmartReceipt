// src/hooks/useAuth.ts
"use client";

import { useState } from "react";
import axios from "axios";
import { api } from "@/api-client/client";
import type { UserLogin, UserRegistration } from "@/api-client/models";

const basePath = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1.0";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(data: UserLogin) {
    setLoading(true);
    setError(null);

    try {
      const res: any = await axios.post(`${basePath}/auth/login`, data, { withCredentials: true });

      const token = res?.data?.token;
      if (!token) throw new Error("Brak tokenu w odpowiedzi");

      localStorage.setItem("accessToken", token);
      return true;
    } catch (e: any) {
      setError(e.message || "Błąd logowania");
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function register(data: UserRegistration) {
    setLoading(true);
    setError(null);

    try {
      await axios.post(`${basePath}/auth/register`, data, { withCredentials: true });
      return true;
    } catch (e: any) {
      setError(e.message || "Błąd rejestracji");
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      await axios.post(`${basePath}/auth/logout`, {}, { withCredentials: true });
    } catch (e) {
      console.warn("Logout request failed", e);
    }
    localStorage.removeItem("accessToken");
    window.location.href = "/login";
  }

  return { login, register, logout, loading, error };
}
