import { useDashboard } from "./useDashboard";

export function useCategorySummary(year?: number, month?: number) {
  const { data } = useDashboard(year, month);
  // poprawna nazwa to categorySummary
  return data?.categorySummary ?? [];
}
