// src/hooks/useExpenses.ts
import { useEffect, useState } from "react";
import { api } from "@/api-client/client";
import type { ExpenseSummary } from "@/api-client/models";

export function useExpenses(year?: number, month?: number, categoryId?: string) {
  const now = new Date();
  const y = year ?? now.getFullYear();
  const m = month ?? now.getMonth() + 1;

  const [data, setData] = useState<ExpenseSummary[]>([]);
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(true);
    api.getExpensesList(y, m, categoryId, page, 20)
      .then((res: any) => {
        const payload = res?.data ?? res;
        // payload likely has items/content and totalPages/totalElements
        const items = payload.items ?? payload.content ?? payload.expenses ?? [];
        setData(items);
        setTotalPages(payload.totalPages ?? payload.totalPages ?? 1);
      })
      .catch(() => {
        setData([]);
      })
      .finally(() => setIsLoading(false));
  }, [y, m, categoryId, page]);

  return { data, page, totalPages, setPage, isLoading };
}
