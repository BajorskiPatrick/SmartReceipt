import * as React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Collapse from '@mui/material/Collapse';
import BoxUnstyled from '@mui/material/Box';

// Importy komponentów i hooków
import ExpenseDonut from './ExpenseDonut';
import { useDashboard } from '@/hooks/useDashboard';
import { useExpanses } from '@/hooks/useExpanses';
import { api } from '@/api-client/client';
import { Category, NewExpense, NewExpenseItem } from '@/api-client/models';
import ExpenseDialog, { ExpenseFormData } from '../components/dialogs/ExpenseDialog';
import ConfirmDialog from '../components/dialogs/ConfirmDialog';


export default function MainGrid() {
  // Stan 'current' jest używany jako wybrany miesiąc (Data Picker)
  const [selectedMonth, setSelectedMonth] = React.useState(() => new Date());
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});

  // 1. Stany globalne
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);
  const [categories, setCategories] = React.useState<Category[]>([]);
  
  // 2. Stany dla Dialogów
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingExpense, setEditingExpense] = React.useState<ExpenseFormData | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const year = selectedMonth.getFullYear();
  const month = selectedMonth.getMonth() + 1; // API chce 1-12

  // 3. Użycie hooków (zależnych od miesiąca i triggera)
  // W hooku useDashboard zaimplementowaliśmy logikę pobierania KPI, categorySummary, itd.
  const { kpi, categorySummary } = useDashboard(year, month, refreshTrigger);
  const { data: expenses } = useExpanses(year, month, undefined, refreshTrigger);
  
  // ---------------------------------------------------------------------
  // FUNKCJE POMOCNICZE I OBLICZENIA DLA KPI
  // ---------------------------------------------------------------------
  
  // Helper obliczający, przez ile dni uśredniać
  const calculateAverageDays = (date: Date): number => {
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === date.getFullYear() && today.getMonth() === date.getMonth();

    if (isCurrentMonth) {
        // Dla bieżącego miesiąca: uśredniamy tylko przez dni, które minęły
        return today.getDate();
    } else {
        // Dla miesięcy w przeszłości: uśredniamy przez całkowitą liczbę dni w tym miesiącu
        const year = date.getFullYear();
        const month = date.getMonth(); 
        // 0. dzień następnego miesiąca to ostatni dzień bieżącego miesiąca
        return new Date(year, month + 1, 0).getDate();
    }
  };

  // Obliczenia używane w JSX
  const daysToAverage = calculateAverageDays(selectedMonth);
  const totalSpending = kpi?.totalSpendingMonth ?? 0;
  const avgPerDay = totalSpending / (daysToAverage || 1);
  // Obliczenia dla Donut Chart
  const donutData = (categorySummary || []).map((c) => ({
    label: c.categoryName,
    value: c.totalSpendingMonth,
  }));
  // totalThisMonth używane jako fallback dla donut chart
  const totalThisMonth = (donutData.reduce((s, d) => s + (d.value || 0), 0) as number) || totalSpending || 0;


  // ---------------------------------------------------------------------
  // LOGIKA NAWIGACJI
  // ---------------------------------------------------------------------
  function prevMonth() {
    const d = new Date(selectedMonth);
    d.setMonth(d.getMonth() - 1);
    setSelectedMonth(d); // Używamy setSelectedMonth, aby odświeżyć dane!
  }
  function nextMonth() {
    const d = new Date(selectedMonth);
    d.setMonth(d.getMonth() + 1);
    setSelectedMonth(d); // Używamy setSelectedMonth, aby odświeżyć dane!
  }
  function toggleRow(id: string) {
    setExpanded((s) => ({ ...s, [id]: !s[id] }));
  }


  // ---------------------------------------------------------------------
  // LOGIKA POBIERANIA KATEGORII (tylko raz przy starcie)
  // ---------------------------------------------------------------------
  React.useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await api.getCategories();
        const data = (response as any).data || response;
        
        if (Array.isArray(data)) {
             // Mapujemy kategorie do formatu {id, name}
            const mappedCategories = data.map((c: any) => ({
                id: c.categoryId,
                name: c.name
            }));
            setCategories(mappedCategories);
        } else {
            setCategories([]);
        }

      } catch (err) {
        console.error("Błąd ładowania kategorii:", err);
      }
    };
    loadCategories();
  }, []); // Pusta tablica zależności, ładuje tylko raz


  // ---------------------------------------------------------------------
  // LOGIKA API I FORMULARZY
  // ---------------------------------------------------------------------

  const handleAddClick = () => {
    setEditingExpense(null);
    setIsFormOpen(true);
  };

  const handleEditClick = async (expenseRow: any) => {
    try {
        // POBIERANIE PEŁNYCH DETALI WYDATKU
        const response = await api.getExpenseDetails(expenseRow.expenseId);
        const details = (response as any).data || response;

        const formattedDate = new Date(details.transactionDate).toISOString().slice(0, 16);

        const formFormat: ExpenseFormData = {
            id: details.expenseId,
            description: details.description,
            transactionDate: formattedDate,
            items: details.items.map((item: any) => ({
                expenseItemId: item.expenseItemId,
                productName: item.productName,
                price: item.price,
                quantity: item.quantity,
                categoryId: item.categoryId || ""
            }))
        };
        setEditingExpense(formFormat);
        setIsFormOpen(true);
    } catch (error) {
        console.error("Nie udało się pobrać szczegółów wydatku", error);
        alert("Błąd: Nie można załadować szczegółów wydatku.");
    }
  };

  const handleDeleteClick = (expenseId: string) => {
    setDeleteId(expenseId); // Otwiera ConfirmDialog
  };

  const handleConfirmDelete = async () => {
      if (!deleteId) return;

      try {
          await api.deleteExpense(deleteId);
          setRefreshTrigger(prev => prev + 1); // Odśwież listę i KPI
      } catch (error) {
          console.error(error);
          alert("Błąd podczas usuwania");
      } finally {
          setDeleteId(null);
      }
  };

  const handleFormSubmit = async (data: ExpenseFormData) => {
      try {
          // Tworzenie payload zgodnego z API
          const expensePayload: NewExpense = {
              description: data.description,
              transactionDate: new Date(data.transactionDate).toISOString(),
              items: data.items.map(item => ({
                  productName: item.productName,
                  price: item.price,
                  quantity: item.quantity,
                  categoryId: item.categoryId
              } as NewExpenseItem))
          };

          if (data.id) {
              await api.updateExpense(data.id, expensePayload);
          } else {
              await api.addManualExpense(expensePayload);
          }
          
          setIsFormOpen(false);
          setRefreshTrigger(prev => prev + 1); // Odświeżenie danych po sukcesie

      } catch (error) {
          console.error(error);
          alert("Wystąpił błąd podczas zapisywania!");
      }
  };
  

  const monthLabel = selectedMonth.toLocaleString(undefined, { month: 'long', year: 'numeric' });

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      
      {/* DIALOGI */}
      <ExpenseDialog 
        open={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSubmit={handleFormSubmit}
        initialData={editingExpense}
        categories={categories} 
      />
      <ConfirmDialog
        open={!!deleteId} 
        title="Delete Expense"
        content="Are you sure you want to delete this expense? This action cannot be undone."
        onClose={() => setDeleteId(null)} 
        onConfirm={handleConfirmDelete}
      />

      {/* NAGŁÓWEK I NAWIGACJA */}
      <Box sx={{ position: 'relative', mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography component="h2" variant="h6">Dashboard</Typography>
          <Box />
        </Stack>

        <Stack
          direction="row" spacing={1} alignItems="center"
          sx={{
            position: { xs: 'static', md: 'absolute' }, left: { md: '50%' }, 
            transform: { md: 'translateX(-50%)' }, top: { md: 0 },
            width: { xs: '100%', md: 'auto' }, justifyContent: 'center',
          }}
        >
          <IconButton onClick={prevMonth}><ArrowBackIosNewIcon fontSize="small" /></IconButton>
          <Paper sx={{ px: 2, py: 0.5, textAlign: 'center' }}>{monthLabel}</Paper>
          <IconButton onClick={nextMonth}><ArrowForwardIosIcon fontSize="small" /></IconButton>
        </Stack>
      </Box>

      {/* KARTY KPI (Teraz w pełni dynamiczne) */}
      <Grid container spacing={2} sx={{ mb: 2 }} columns={12}>
        {/* Karta 1: Wydatki Miesiąca */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="caption">Total Spending This Month</Typography>
              <Typography variant="h6">{totalSpending.toFixed(2)} PLN</Typography>
              <Typography variant="body2" color="text.secondary">
                 Wybrano: {selectedMonth.toLocaleString('pl-PL', { month: 'long', year: 'numeric' })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Karta 2: Pozostały Budżet (Logika pozostaje ta sama) */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="caption">Remaining budget</Typography>
              <Typography variant="h6">{kpi ? Math.max(0, (kpi.budget ?? 0) - totalSpending).toFixed(2) : "—"} PLN</Typography>
              <Typography variant="body2" color="text.secondary">Budget: {(kpi?.budget ?? "-") } PLN</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Karta 3: Średnia Dzienna (Używamy zmiennych z sekcji 1) */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="caption">Avg per day</Typography>
              <Typography variant="h6">{avgPerDay.toFixed(2)} PLN</Typography>
              <Typography variant="body2" color="text.secondary">
                 Uśrednione dla {daysToAverage} dni
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Karta 4: Przyciski */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Stack direction="row" spacing={1} sx={{ height: '100%' }} alignItems="center">
            <Button variant="contained" onClick={handleAddClick}>Add expense</Button>
            <Button variant="outlined">Add from receipt</Button>
          </Stack>
        </Grid>
      </Grid>

      {/* Główna Zawartość: Wykres i Tabela */}
      <Grid container spacing={2} columns={12}>
        <Grid size={{ xs: 12, md: 4 }}>
          <ExpenseDonut data={donutData} totalLabel="This month" />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Recent expenses</Typography>
          <TableContainer component={Box}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {(expenses || []).map((row: any) => (
                  <React.Fragment key={row.expenseId}>
                    <TableRow hover onClick={() => toggleRow(row.expenseId)} style={{cursor: 'pointer'}}>
                      <TableCell>{new Date(row.transactionDate).toLocaleDateString('pl-PL')}</TableCell>
                      <TableCell>{row.description || '—'}</TableCell>
                      <TableCell>{row.categoryName || '—'}</TableCell>
                      <TableCell align="right">{(row.totalAmount ?? 0).toFixed(2)} PLN</TableCell>
                      <TableCell>
                        <Button size="small">
                            {expanded[row.expenseId] ? "Hide" : "Show"}
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                        <Collapse in={!!expanded[row.expenseId]} timeout="auto" unmountOnExit>
                          <BoxUnstyled sx={{ margin: 1, py: 2 }}>
                            <Typography variant="body2" sx={{mb: 1}}>Items count: {row.itemCount ?? 0}</Typography>
                            
                            <Stack direction="row" spacing={1}>
                                <Button 
                                    size="small" variant="outlined" 
                                    onClick={() => handleEditClick(row)}
                                >
                                    Edit items
                                </Button>
                                <Button 
                                    size="small" variant="outlined" color="error"
                                    onClick={() => handleDeleteClick(row.expenseId)}
                                >
                                    Delete
                                </Button>
                                <Button size="small" href={`/expenses/${row.expenseId}`}>Full Details</Button>
                            </Stack>

                          </BoxUnstyled>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  );
}