import { useDashboard } from "./useDashboard";

export function useExpensesTrend(year?: number, month?: number) {
  const { data, isLoading } = useDashboard(year, month);
  // poprawna nazwa to trendSummary
  const trend = data?.trendSummary ?? [];
  return { data: trend, isLoading };
}
