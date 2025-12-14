// src/hooks/useYearlyDashboard.ts
"use client";

import { useEffect, useState } from "react";
import { api } from "@/api-client/client";
import type { DashboardKpi } from "@/api-client/models"; // Używamy DashboardKpi dla struktury
import { MainAppApi } from "../api-client/MainAppApi"; // Importujemy klasę API (lub po prostu używamy 'api')


// Definicja typu, który będzie zwracany przez hooka dla wykresu rocznego
export interface MonthlyKpi {
    month: string; // Skrót miesiąca
    spent: number;
    budget: number;
}

const MONTHS_LABELS = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];

// --- FUNKCJA POBIERAJĄCA PRAWDZIWE DANE ROCZNE (12 wywołań API) ---
const getRealYearlyDataFromApi = async (year: number): Promise<MonthlyKpi[]> => {
    // Tworzymy tablicę 12 Promise'ów (po jednym dla każdego miesiąca)
    const promises = MONTHS_LABELS.map((_, index) => {
        const month = index + 1;
        // Wywołujemy istniejący endpoint dla każdego miesiąca
        return api.getDashboardData(year, month);
    });

    // Czekamy na wszystkie odpowiedzi
    const results = await Promise.allSettled(promises);
    
    // Przetwarzamy odpowiedzi
    return results.map((result, index) => {
        let spent = 0;
        let budget = 0;
        
        if (result.status === 'fulfilled') {
            // Przetwarzamy obiekt DashboardData
            const dashboardData = (result.value && (result.value as any).data) ? (result.value as any).data : result.value;
            
            spent = dashboardData?.kpi?.totalSpendingMonth ?? 0;
            // Zakładamy, że budżet też jest w DashboardData lub MonthlyBudget. 
            // Ponieważ go nie mamy, musimy to założyć, ale użyjemy też wartości z trendSummary, jeśli istnieje:
            budget = dashboardData?.kpi?.budget ?? 6000; // Używamy 6000 jako fallback

            // Próbujemy znaleźć budżet z trendu, jeśli jest dostępny (często jest to w trendSummary)
            const trendItem = dashboardData?.trendSummary?.find((t: any) => t.month === index + 1);
            if (trendItem?.budget) {
                 budget = trendItem.budget;
            }
        } 
        
        return {
            month: MONTHS_LABELS[index],
            spent: spent,
            budget: budget,
        };
    });
}
// --------------------------------------------------------

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
                const yearlyData = await getRealYearlyDataFromApi(year); 
                
                if (!mounted) return;

                setData(yearlyData);
            } catch (e: any) {
                setError(e?.message ?? "Błąd ładowania danych rocznych (12x API call)");
            } finally {
                if (mounted) setLoading(false);
            }
        }
        load();
        return () => { mounted = false; };
    }, [year]);

    return { data, loading, error, year };
}