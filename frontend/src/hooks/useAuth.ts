// src/hooks/useAuth.ts
"use client";

import { useState } from "react";
import { api } from "@/api-client/client";
import type { UserLogin } from "@/api-client/models";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(data: UserLogin) {
    setLoading(true);
    setError(null);
    try {
      const res: any = await api.loginUser(data);
      // try a few possible shapes
      const token =
        (res && res.data && (res.data.token || res.data.accessToken)) ||
        (res && (res.token || res.accessToken)) ||
        null;

      if (!token) {
        // sometimes generator returns object directly
        // try to read a top-level 'token'
        if (res && typeof res === "object") {
          const possible = (res as any).token ?? (res as any).accessToken;
          if (possible) {
            localStorage.setItem("accessToken", possible);
            return true;
          }
        }
        throw new Error("No token in response");
      }

      localStorage.setItem("accessToken", token);
      return true;
    } catch (e: any) {
      setError(e?.message || "Błąd logowania");
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function refresh() {
    try {
      const res: any = await api.userTokenRefresh();
      const token =
        (res && res.data && (res.data.token || res.data.accessToken)) ||
        (res && (res.token || res.accessToken)) ||
        null;
      if (token) localStorage.setItem("accessToken", token);
      else localStorage.removeItem("accessToken");
    } catch {
      localStorage.removeItem("accessToken");
    }
  }

  function logout() {
    try {
      api.logoutUser();
    } catch {}
    localStorage.removeItem("accessToken");
  }

  return { login, refresh, logout, loading, error };
}
