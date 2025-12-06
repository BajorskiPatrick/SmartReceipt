// src/hooks/useCategorySummary.ts  //// 🆕 NEW
"use client";

import { useDashboard } from "./useDashboard";
import type { DashboardCategorySummaryItem } from "@/api-client/models";

export function useCategorySummary(year?: number, month?: number) {
  const { categorySummary, loading, error } = useDashboard(year, month);
  return { data: categorySummary ?? [], loading, error };
}

