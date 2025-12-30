"use client";
import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid'; // Grid v1
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import CircularProgress from '@mui/material/CircularProgress';

// Ikony
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ShowChartIcon from '@mui/icons-material/ShowChart';

// Komponenty Layoutu
import AppNavbar from '../components/AppNavbar';
import SideMenu from '../components/SideMenu';
import AppTheme from '../shared-theme/AppTheme';

// Wykresy (MUI X-Charts)
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { LineChart } from '@mui/x-charts/LineChart';

// Hooki i API
import { useExpanses } from '@/hooks/useExpanses';
import { useBudgets } from '@/hooks/useBudgets';
import { useDashboard } from '@/hooks/useDashboard';
// NOWY HOOK: do danych rocznych
import { useYearlyDashboard } from '@/hooks/useYearlyDashboard'; 

// Twój działający Loader
import LottieLoader from '../components/common/LottieLoader';
import { 
  chartsCustomizations, 
  dataGridCustomizations, 
  datePickersCustomizations, 
  treeViewCustomizations 
} from '../theme/customizations';

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};
const shortenCategoryName = (name: string): string => {
  if (!name) return "(brak)";
  const firstWord = name.split(" ")[0]; // tylko pierwsze słowo
  return firstWord.length > 12 ? firstWord.slice(0, 12) + "…" : firstWord;
};


// --- KOMPONENT HEATMAPY ---
const DailyHeatmap = ({ data, daysInMonth }: { data: Record<number, number>, daysInMonth: number }) => {
    const maxVal = Math.max(...Object.values(data), 1);
    
    return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 2 }}>
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const value = data[day] || 0;
                const intensity = value / maxVal;
                
                const bg = value === 0 ? '#f5f5f5' : `rgba(25, 118, 210, ${0.2 + (intensity * 0.8)})`;
                const color = intensity > 0.6 ? '#fff' : '#000';
                
                return (
                    <Tooltip key={day} title={`Dzień ${day}: ${value.toFixed(2)} PLN`} arrow>
                        <Box sx={{
                            width: 36, height: 36, bgcolor: bg, color: color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            borderRadius: 1, fontSize: '0.75rem', cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': { transform: 'scale(1.15)', zIndex: 10, boxShadow: 2 }
                        }}>
                            {day}
                        </Box>
                    </Tooltip>
                );
            })}
        </Box>
    );
};

export default function StatisticsPage(props: { disableCustomTheme?: boolean }) {
  // --- STAN ---
  const initialYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = React.useState(initialYear);
  const [selectedMonth, setSelectedMonth] = React.useState(() => new Date());
  const [isMounted, setIsMounted] = React.useState(false);

  // --- EFEKTY ---
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // --- OBSŁUGA DANYCH / API ---
  const currentMonth = selectedMonth.getMonth() + 1;
  const currentYearForMonth = selectedMonth.getFullYear();

  // 1. DANE ROCZNE (używamy nowego hooka)
  const { data: yearlyData, loading: yearlyLoading } = useYearlyDashboard(selectedYear);
  
  // 2. DANE MIESIĘCZNE (używamy istniejących hooków)
  const { data: expenses, loading: expensesLoading } = useExpanses(currentYearForMonth, currentMonth);
  const { budget: budgetData, loading: budgetLoading } = useBudgets(currentYearForMonth, currentMonth);
  const { kpi } = useDashboard(currentYearForMonth, currentMonth);
  const { categorySummary } = useDashboard(currentYearForMonth, currentMonth);
  
  const isLoading = yearlyLoading || expensesLoading || budgetLoading;

  // --- NAWIGACJA DATA ---
  const handleYearChange = (event: SelectChangeEvent<number>) => {
    const newYear = Number(event.target.value);
    setSelectedYear(newYear);
    
    setSelectedMonth(prev => {
      const newDate = new Date(prev);
      newDate.setFullYear(newYear);
      return newDate;
    });
  };

  const prevMonth = () => {
    setSelectedMonth(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const nextMonth = () => {
    setSelectedMonth(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };
  
  const monthLabel = isMounted 
    ? selectedMonth.toLocaleString('pl-PL', { month: 'long', year: 'numeric' }) 
    : "...";
  const daysInCurrentMonth = new Date(currentYearForMonth, currentMonth, 0).getDate();

  // --- PRZETWARZANIE DANYCH DO WYKRESÓW MIESIĘCZNYCH ---
  /*const processedData = React.useMemo(() => {
    if (!expenses || expenses.length === 0) return null;

    const heatmap: Record<number, number> = {};
    const dailyTrendArr = new Array(daysInCurrentMonth).fill(0);
    const catMap: Record<string, number> = {};

    expenses.forEach((item: any) => {
        const date = new Date(item.transactionDate);
        const day = date.getDate();
        const amount = item.totalAmount || 0;
        const catName = item.categoryName || 'Inne';

        heatmap[day] = (heatmap[day] || 0) + amount;
        if (day >= 1 && day <= daysInCurrentMonth) {
            // Dodajemy kwotę do tablicy dla dnia (index = dzień - 1)
            dailyTrendArr[day - 1] += amount;
        }
        catMap[catName] = (catMap[catName] || 0) + amount;
    });

    const pieData = Object.keys(catMap).map((key, index) => ({
        id: index, value: catMap[key], label: key
    }));

    const budgetCategories = budgetData?.categoryBudgets || [];
    const allCatNames = Array.from(new Set([
        ...Object.keys(catMap), 
        ...budgetCategories.map((b: any) => b.categoryName)
    ]));

    const comparisonData = allCatNames.map(name => {
        const spent = catMap[name] || 0;
        const budgetItem = budgetCategories.find((b: any) => b.categoryName === name);
        const planned = budgetItem ? budgetItem.budget : 0;
        return { category: name, spent, planned };
    }).sort((a, b) => b.spent - a.spent); 

    return { heatmap, dailyTrendArr, pieData, comparisonData };

  }, [expenses, budgetData, daysInCurrentMonth]);
    */
const processedData = React.useMemo(() => {
    if (!categorySummary || !expenses) return null;

    // =========================
    // 1. BUDŻET vs WYDATKI (per kategoria)
    // =========================
    const budgetCategories = budgetData?.categoryBudgets || [];

    const spentByCategory: Record<string, number> = {};
    categorySummary.forEach((c: any) => {
        spentByCategory[c.categoryName] = c.totalSpendingMonth;
    });

    const allCategoryNames = Array.from(
        new Set([
        ...Object.keys(spentByCategory),
        ...budgetCategories.map((b: any) => b.categoryName),
        ])
    );

    const MIN_CATEGORIES = 5;

    const realComparisonData = allCategoryNames
    .map((name) => ({
        category: shortenCategoryName(name),
        spent: spentByCategory[name] || 0,
        planned:
        budgetCategories.find((b: any) => b.categoryName === name)?.budget || 0,
    }))
    // usuwamy puste
    .filter(item => item.spent > 0 || item.planned > 0);

    // ➕ DOPEŁNIANIE DO 5
    const placeholdersNeeded = Math.max(
    0,
    MIN_CATEGORIES - realComparisonData.length
    );

    const placeholders = Array.from({ length: placeholdersNeeded }, (_, i) => ({
    category: ``, // pusta etykieta
    spent: 0,
    planned: 0,
    }));

    const comparisonData = [...realComparisonData, ...placeholders];

    // =========================
    // 2. HEATMAPA DZIENNA
    // =========================
    const heatmap: Record<number, number> = {};

    expenses.forEach((e: any) => {
        const day = new Date(e.transactionDate).getDate();
        heatmap[day] = (heatmap[day] || 0) + (e.totalAmount || 0);
    });

    // =========================
    // 3. TREND DZIENNY
    // =========================
    const daysInMonth = new Date(currentYearForMonth, currentMonth, 0).getDate();

    const dailyTrendArr = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        return heatmap[day] || 0;
    });

    return {
        comparisonData,
        heatmap,
        dailyTrendArr,
    };
    }, [categorySummary, budgetData, expenses, currentYearForMonth, currentMonth]);


  // --- RENDEROWANIE ---
  
  // 1. Loader 
  if (!isMounted || (isLoading && !expenses && !yearlyData)) {
     return (
        <AppTheme {...props} themeComponents={xThemeComponents}>
            <Box sx={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <LottieLoader size={200} />
                <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
                    Ładowanie danych rocznych i miesięcznych...
                </Typography>
                {yearlyLoading && <CircularProgress size={24} sx={{ mt: 2 }} />}
            </Box>
        </AppTheme>
     );
  }
  
  const years = [initialYear - 1, initialYear, initialYear + 1];

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        <AppNavbar />
        
        <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: 'auto', backgroundColor: 'background.default' }}>
          <Stack spacing={4} sx={{ mt: { xs: 8, md: 2 }, maxWidth: '1700px', mx: 'auto' }}>
            
            {/* --- SEKCJA GÓRNA: WYBÓR ROKU I TYTUŁ --- */}
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
                <Box>
                    <Typography component="h1" variant="h4">Statystyki Finansowe</Typography>
                    <Typography color="text.secondary">Trendy roczne i szczegóły miesięczne.</Typography>
                </Box>
                
                {/* WYBÓR ROKU */}
                <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                    <InputLabel id="year-select-label">Rok</InputLabel>
                    <Select
                        labelId="year-select-label"
                        value={selectedYear}
                        onChange={handleYearChange}
                        label="Rok"
                    >
                        {years.map(y => (
                            <MenuItem key={y} value={y}>{y}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Stack>

            <Divider />

            {/* --- WYKRES 1: PORÓWNANIE ROCZNE (12 MIESIĘCY) --- */}
            <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>Wydatki w {selectedYear} (Budżet vs Wydano)</Typography>
                {yearlyData ? (
                    <Box sx={{ height: 350, width: '100%' }}>
                        <BarChart
                            dataset={yearlyData}
                            xAxis={[{ scaleType: 'band', dataKey: 'month' }]}
                            series={[
                                { dataKey: 'budget', label: 'Budżet (PLN)', color: '#e0e0e0' },
                                { dataKey: 'spent', label: 'Wydano (PLN)', color: '#1976d2' }
                            ]}
                            borderRadius={4}
                            slotProps={{ legend: { hidden: false } }}
                        />
                    </Box>
                ) : (
                    <Box sx={{ height: 350, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                         <Typography color="text.secondary">Brak danych rocznych lub trwają symulacje...</Typography>
                    </Box>
                )}
            </Paper>

            <Divider sx={{ my: 4 }} />

            {/* --- SEKCJA ŚRODKOWA: NAWIGACJA MIESIĘCZNA I KPI --- */}
            <Box>
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                    <Typography component="h2" variant="h5">Szczegóły Miesiąca</Typography>
                    
                    <Paper sx={{ display: 'flex', alignItems: 'center', p: 0.5, borderRadius: 3 }}>
                        <IconButton onClick={prevMonth}><ArrowBackIosNewIcon /></IconButton>
                        <Typography variant="subtitle1" sx={{ mx: 3, minWidth: 150, textAlign: 'center' }}>
                            {monthLabel}
                        </Typography>
                        <IconButton onClick={nextMonth}><ArrowForwardIosIcon /></IconButton>
                    </Paper>
                </Stack>

                {/* KPI Cards dla wybranego miesiąca (Używają Twojego kpi) */}
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <AttachMoneyIcon fontSize="large" color="primary" />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Wydano w {selectedMonth.toLocaleString('pl-PL', { month: 'long' })}</Typography>
                                        <Typography variant="h4">{kpi?.totalSpendingMonth?.toFixed(2) || "0.00"} PLN</Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <CalendarMonthIcon fontSize="large" color="secondary" />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Limit Budżetu</Typography>
                                        <Typography variant="h4">{budgetData?.budget?.toFixed(2) || "0.00"} PLN</Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <ShowChartIcon fontSize="large" color="success" />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Zostało do końca budżetu</Typography>
                                        <Typography variant="h4">
                                            {((budgetData?.budget || 0) - (kpi?.totalSpendingMonth || 0)).toFixed(2)} PLN
                                        </Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>

            {/* --- SEKCJA DOLNA: WYKRESY MIESIĘCZNE --- */}
            {processedData && expenses && expenses.length > 0 ? (
                <>
                    {/* Budżet Kategoriowy vs Realizacja */}
                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom>Budżet Kategoriowy vs Realizacja</Typography>
                        <Typography variant="caption" sx={{ mb: 2, display: 'block' }}>Jak wydatki w kategoriach mają się do planowanych limitów.</Typography>
                        <Box sx={{ height: 400, width: '100%' }}>
                            <BarChart
                                dataset={processedData.comparisonData}
                                xAxis={[{ scaleType: 'band', dataKey: 'category' }]}
                                series={[
                                    { dataKey: 'planned', label: 'Planowany Budżet', color: '#e0e0e0' },
                                    { dataKey: 'spent', label: 'Wydano', color: '#1976d2' }
                                ]}
                                borderRadius={4}
                            />
                        </Box>
                    </Paper>

                    <Grid container spacing={3}>
                        

                        {/* Kalendarz Intensywności i Trend Dzienny */}
                        <Grid item xs={12} md={7}>
                            <Paper sx={{ p: 3, height: '100%' }}>
                                <Typography variant="h6">Kalendarz Intensywności</Typography>
                                <Typography variant="caption" color="text.secondary">Dni z największymi wydatkami.</Typography>
                                
                                <Divider sx={{ my: 2 }} />
                                <DailyHeatmap data={processedData.heatmap} daysInMonth={daysInCurrentMonth} />
                                
                                <Box sx={{ mt: 4 }}>
                                    <Typography variant="subtitle2" gutterBottom>Trend Dzienny</Typography>
                                    <Box sx={{ height: 200, width: '100%' }}>
                                        <LineChart
                                            xAxis={[{ data: Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1), label: 'Dzień miesiąca' }]}
                                            series={[
                                                { data: processedData.dailyTrendArr, label: 'Wydatki dzienne', area: true, showMark: false, color: '#90caf9' },
                                            ]}
                                        />
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </>
            ) : (
                <Paper sx={{ p: 5, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary">Brak szczegółowych danych wydatków dla {monthLabel}.</Typography>
                    <Typography>Sprawdź inny miesiąc lub dodaj transakcje.</Typography>
                </Paper>
            )}

          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}