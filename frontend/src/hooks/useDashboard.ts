// src/hooks/useDashboard.ts  //// 🆕 NEW
"use client";

import { useEffect, useState } from "react";
import { api } from "@/api-client/client";
import type { DashboardData, DashboardKpi, DashboardCategorySummaryItem, DashboardTrendItem } from "@/api-client/models";

export function useDashboard(year?: number, month?: number) {
  const now = new Date();
  const y = year ?? now.getFullYear();
  const m = month ?? now.getMonth() + 1;

  const [data, setData] = useState<DashboardData | null>(null);
  const [kpi, setKpi] = useState<DashboardKpi | null>(null);
  const [categorySummary, setCategorySummary] = useState<DashboardCategorySummaryItem[] | null>(null);
  const [trendSummary, setTrendSummary] = useState<DashboardTrendItem[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getDashboardData(y, m);
        // generator może zwracać dane bez "data", więc próbujemy różne kształty
        const payload = (res && (res as any).data) ? (res as any).data : res;
        if (!mounted) return;
        setData(payload);
        setKpi(payload?.kpi ?? null);
        setCategorySummary(payload?.categorySummary ?? null);
        setTrendSummary(payload?.trendSummary ?? null);
      } catch (e: any) {
        setError(e?.message ?? "Błąd ładowania dashboardu");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [y, m]);

  return { data, kpi, categorySummary, trendSummary, loading, error, year: y, month: m };
}
