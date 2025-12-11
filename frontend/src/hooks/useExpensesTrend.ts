// src/hooks/useExpensesTrend.ts  //// 🆕 NEW
"use client";

import { useMemo } from "react";
import { useDashboard } from "./useDashboard";
import type { DashboardTrendItem } from "@/api-client/models";

export function useExpensesTrend(year?: number, month?: number) {
  const { trendSummary, loading, error } = useDashboard(year, month);

  const trend = useMemo(() => {
    if (!trendSummary) return [];
    // sort by year, month ascending
    const sorted = [...trendSummary].sort((a: DashboardTrendItem, b: DashboardTrendItem) => {
      if (a.year === b.year) return a.month - b.month;
      return a.year - b.year;
    });
    return sorted;
  }, [trendSummary]);

  return { data: trend, loading, error };
}
