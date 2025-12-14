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
      const response: any = await api.getUserBudget(year, month);
      const payload = response?.data ?? response;
      setBudget(payload as MonthlyBudget);
    } catch (err: any) {
      if (err?.response?.status === 404) {
          setBudget(null);
      } else {
          console.error("useBudgets fetch error:", err);
      }
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
      let response: any;

      // 1. UPDATE (PUT) - Backend zabrania wysyłania roku i miesiąca przy edycji
      if (budget && budget.budgetId) {
        // Trik: wyciągamy year i month do oddzielnych zmiennych, 
        // a resztę (kwotę i kategorie) zapisujemy w 'updatePayload'.
        // Dzięki temu nie wyślemy zabronionych pól do API.
        const { year, month, ...updatePayload } = data as any;
        
        console.log("Wysyłam UPDATE (bez roku/miesiąca):", updatePayload);
        response = await api.updateUserBudget(budget.budgetId, updatePayload);
      } 
      
      // 2. CREATE (POST) - Tutaj rok i miesiąc są wymagane
      else {
        try {
            console.log("Wysyłam CREATE:", data);
            response = await api.createUserBudget(data);
        } catch (createErr: any) {
            // Auto-fix na konflikt (409) - jeśli budżet jednak istnieje
            if (createErr?.response?.status === 409) {
                console.warn("Błąd 409 przy Create - próbuję naprawić przez Update...");
                const existingResponse: any = await api.getUserBudget(year, month);
                const existingBudget = existingResponse?.data ?? existingResponse;
                
                if (existingBudget && existingBudget.budgetId) {
                    // Tutaj też musimy usunąć rok/miesiąc przed update'm!
                    const { year, month, ...updatePayload } = data as any;
                    response = await api.updateUserBudget(existingBudget.budgetId, updatePayload);
                } else {
                    throw createErr;
                }
            } else {
                throw createErr;
            }
        }
      }

      const updatedBudget = response?.data ?? response;
      setBudget(updatedBudget);
      return true;

    } catch (err: any) {
      // --- DIAGNOSTYKA BŁĘDÓW ---
      if (err?.response?.status === 400) {
          console.error("Błąd walidacji (400):", err.response.data);
          alert(`BŁĄD DANYCH (Backend odrzucił): \n${JSON.stringify(err.response.data, null, 2)}`);
      } else {
          const msg = err?.message || "Błąd zapisu";
          console.error("useBudgets update error:", err);
          alert("Wystąpił błąd: " + msg);
      }
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