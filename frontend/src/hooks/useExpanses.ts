// src/hooks/useExpanses.ts  //// 🔥 CHANGED (was in repo but now real)
"use client";

import { useEffect, useState } from "react";
import { api } from "@/api-client/client";
import type { ExpenseSummary } from "@/api-client/models";

export function useExpanses(year?: number, month?: number, categoryId?: string, initialPage = 0, initialSize = 20) {
  const now = new Date();
  const y = year ?? now.getFullYear();
  const m = month ?? now.getMonth() + 1;

  const [page, setPage] = useState<number>(initialPage);
  const [size] = useState<number>(initialSize);
  const [data, setData] = useState<ExpenseSummary[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getExpensesList(y, m, categoryId, page, size);
        const payload = (res && (res as any).data) ? (res as any).data : res;
        if (!mounted) return;
        setData(payload?.content ?? payload ?? []);
        setTotalPages(payload?.totalPages ?? Math.ceil((payload?.totalElements ?? payload.length) / size));
      } catch (e: any) {
        setError(e?.message ?? "Błąd ładowania wydatków");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [y, m, categoryId, page, size]);

  return { data, page, setPage, size, totalPages, loading, error };
}
