"use client";

import { useEffect, useState } from "react";
import { api } from "@/api-client/client";

/**
 * Dane pod wykres roczny (BarChart)
 */
export interface MonthlyKpi {
  month: string;   // Sty, Lut, ...
  spent: number;
  budget: number;
}

const MONTHS_LABELS = [
  "Sty", "Lut", "Mar", "Kwi", "Maj", "Cze",
  "Lip", "Sie", "Wrz", "Paź", "Lis", "Gru"
];

export function useYearlyDashboard(year: number) {
  const [data, setData] = useState<MonthlyKpi[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        /**
         * ✅ JEDEN REQUEST NA CAŁY ROK
         * Endpoint backendowy (przykład):
         * GET /api/v1.0/statistics/yearly?year=2025
         */
        const response = await api.getYearlySpendingSummary(year);

        const yearly = (response as any)?.data ?? response;

        /**
         * yearly.monthlySummaries = [
         *   { month: 1, totalSpent: 1200, totalBudget: 2000 },
         *   ...
         * ]
         */
        const monthlyMap = new Map<number, any>(
          (yearly?.monthlySummaries ?? []).map((m: any) => [m.month, m])
        );

        const result: MonthlyKpi[] = MONTHS_LABELS.map((label, index) => {
          const monthNumber = index + 1;
          const item = monthlyMap.get(monthNumber);

          return {
            month: label,
            spent: item?.totalSpending ?? 0,    // ← sprawdź nazwę pola
            budget: item?.budget ?? 0,  // ← sprawdź nazwę pola
          };
        });

        if (mounted) setData(result);
      } catch (e: any) {
        if (mounted) {
          setError(e?.message ?? "Błąd ładowania danych rocznych");
          setData(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [year]);

  return { data, loading, error };
}
