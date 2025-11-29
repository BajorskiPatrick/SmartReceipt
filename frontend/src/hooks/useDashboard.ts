// src/hooks/useDashboard.ts
import { useEffect, useState } from "react";
import { api } from "@/api-client/client";
import type { DashboardData } from "@/api-client/models";

export function useDashboard(year?: number, month?: number) {
  const now = new Date();
  const y = year ?? now.getFullYear();
  const m = month ?? now.getMonth() + 1;

  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    api.getDashboardData(y, m)
      .then((res: any) => {
        // generated clients often put payload on res.data or res
        const payload = res?.data ?? res;
        if (mounted) setData(payload as DashboardData);
      })
      .catch((e) => {
        setError(String(e));
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [y, m]);

  return { data, isLoading, error };
}
