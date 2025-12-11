"use client";

import { useEffect, useState } from "react";
import { api } from "@/api-client/client";
import type { ExpenseDetails, NewExpense } from "@/api-client/models";

interface UseExpenseDetailReturn {
  expense: ExpenseDetails | null;
  isLoading: boolean;
  error: string | null;
  updateExpense: (data: NewExpense) => Promise<boolean>;
  deleteExpense: () => Promise<boolean>;
  refetch: () => Promise<void>;
}

export function useExpenseDetail(expenseId: string): UseExpenseDetailReturn {
  const [expense, setExpense] = useState<ExpenseDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExpense = async () => {
    if (!expenseId) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const response: any = await api.getExpense(expenseId);
      const payload = response?.data ?? response;
      setExpense(payload as ExpenseDetails);
    } catch (err: any) {
      const message = err?.message || "Błąd pobierania wydatku";
      setError(message);
      console.error("useExpenseDetail fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpense();
  }, [expenseId]);

  const updateExpense = async (data: NewExpense): Promise<boolean> => {
    setError(null);
    
    try {
      const response: any = await api.updateExpense(expenseId, data);
      const updatedExpense = response?.data ?? response;
      setExpense(updatedExpense);
      return true;
    } catch (err: any) {
      const message = err?.message || "Błąd aktualizacji wydatku";
      setError(message);
      console.error("useExpenseDetail update error:", err);
      return false;
    }
  };

  const deleteExpense = async (): Promise<boolean> => {
    setError(null);
    
    try {
      await api.deleteExpense(expenseId);
      setExpense(null);
      return true;
    } catch (err: any) {
      const message = err?.message || "Błąd usuwania wydatku";
      setError(message);
      console.error("useExpenseDetail delete error:", err);
      return false;
    }
  };

  return {
    expense,
    isLoading,
    error,
    updateExpense,
    deleteExpense,
    refetch: fetchExpense
  };
}
