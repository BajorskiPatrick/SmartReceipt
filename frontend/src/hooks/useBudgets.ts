"use client";

import { useEffect, useState } from "react";
import { api } from "@/api-client/client";
import type { MonthlyBudget, NewMonthlyBudget } from "@/api-client/models";

interface UseBudgetsReturn {
  budget: MonthlyBudget | null;
  isLoading: boolean;
  error: string | null;
  updateBudget: (data: NewMonthlyBudget) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useBudgets(year: number, month: number): UseBudgetsReturn {
  const [budget, setBudget] = useState<MonthlyBudget | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBudget = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response: any = await api.getBudget(year, month);
      const payload = response?.data ?? response;
      setBudget(payload as MonthlyBudget);
    } catch (err: any) {
      const message = err?.message || "Błąd pobierania budżetu";
      setError(message);
      console.error("useBudgets fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBudget();
  }, [year, month]);

  const updateBudget = async (data: NewMonthlyBudget): Promise<boolean> => {
    setError(null);
    
    try {
      const response: any = await api.createOrUpdateBudget(data);
      const updatedBudget = response?.data ?? response;
      setBudget(updatedBudget);
      return true;
    } catch (err: any) {
      const message = err?.message || "Błąd aktualizacji budżetu";
      setError(message);
      console.error("useBudgets update error:", err);
      return false;
    }
  };

  return {
    budget,
    isLoading,
    error,
    updateBudget,
    refetch: fetchBudget
  };
}
