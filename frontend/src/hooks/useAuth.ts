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

      // Zapisujemy token i dane użytkownika
      localStorage.setItem("accessToken", token);
      
      // Jeśli backend nie zwraca emaila, bierzemy ten z formularza
      const userEmail = res?.data?.email || data.email;
      localStorage.setItem("userEmail", userEmail);
      
      // Tworzymy nazwę użytkownika z maila (część przed @)
      const userName = userEmail.split('@')[0];
      localStorage.setItem("userName", userName);

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
    // Czyścimy wszystko przy wylogowaniu
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    window.location.href = "/login";
  }

  return { login, register, logout, loading, error };
}