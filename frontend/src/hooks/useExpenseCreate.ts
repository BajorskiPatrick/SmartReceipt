"use client";

import { useState } from "react";
import { api } from "@/api-client/client";
import type { NewExpense, ExpenseDetails } from "@/api-client/models";

interface UseExpenseCreateReturn {
  createExpense: (data: NewExpense) => Promise<ExpenseDetails | null>;
  isLoading: boolean;
  error: string | null;
}

export function useExpenseCreate(): UseExpenseCreateReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createExpense = async (data: NewExpense): Promise<ExpenseDetails | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response: any = await api.addManualExpense(data);
      const payload = response?.data ?? response;
      return payload as ExpenseDetails;
    } catch (err: any) {
      const message = err?.message || "Błąd dodawania wydatku";
      setError(message);
      console.error("useExpenseCreate error:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createExpense,
    isLoading,
    error
  };
}
