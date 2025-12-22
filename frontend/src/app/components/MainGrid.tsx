import * as React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import Collapse from '@mui/material/Collapse';
import BoxUnstyled from '@mui/material/Box';
import ReceiptUploadDialog from "../components/dialogs/ReceiptUploadDialog";
import { mapOcrToExpenseForm } from "@/hooks/useOcrMapping";

import ExpenseDonut from '../components/ExpenseDonut';
import { useDashboard } from '@/hooks/useDashboard';
import { useExpanses } from '@/hooks/useExpanses';
import { useBudgets } from '@/hooks/useBudgets';
import { api } from '@/api-client/client';
import { Category, NewExpense, NewExpenseItem, NewCategoryBudget } from '@/api-client/models';

import ExpenseDialog, { ExpenseFormData } from '../components/dialogs/ExpenseDialog';
import ConfirmDialog from '../components/dialogs/ConfirmDialog';
import BudgetDialog from '../components/dialogs/BudgetDialog';
import LottieLoader from '../components/common/LottieLoader';

export default function MainGrid() {
    const [selectedMonth, setSelectedMonth] = React.useState(() => new Date());
    const [isMounted, setIsMounted] = React.useState(false);

    const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
    const [refreshTrigger, setRefreshTrigger] = React.useState(0);
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [isReceiptDialogOpen, setIsReceiptDialogOpen] = React.useState(false);

    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [isBudgetOpen, setIsBudgetOpen] = React.useState(false);
    const [editingExpense, setEditingExpense] = React.useState<ExpenseFormData | null>(null);
    const [deleteId, setDeleteId] = React.useState<string | null>(null);

    // --- PAGINACJA STAN ---
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth() + 1;

    // Resetuj stronę do 0 przy zmianie miesiąca
    React.useEffect(() => {
        setPage(0);
    }, [year, month]);

    const { kpi, categorySummary, loading: dashboardLoading } = useDashboard(year, month, refreshTrigger);
    const { data: expenses, loading: expensesLoading } = useExpanses(year, month, undefined, refreshTrigger);
    const { budget: currentBudget, updateBudget } = useBudgets(year, month);

    const isLoading = dashboardLoading || expensesLoading;

    // --- Helpery ---
    const calculateAverageDays = (date: Date): number => {
        const today = new Date();
        const isCurrentMonth = today.getFullYear() === date.getFullYear() && today.getMonth() === date.getMonth();
        if (isCurrentMonth) return today.getDate();
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const daysToAverage = calculateAverageDays(selectedMonth);
    const totalSpending = kpi?.totalSpendingMonth ?? 0;
    const avgPerDay = totalSpending / (daysToAverage || 1);
    const donutData = (categorySummary || []).map((c) => ({
        label: c.categoryName,
        value: c.totalSpendingMonth,
    }));

    // --- Nawigacja ---
    function prevMonth() {
        const d = new Date(selectedMonth);
        d.setMonth(d.getMonth() - 1);
        setSelectedMonth(d);
    }
    function nextMonth() {
        const d = new Date(selectedMonth);
        d.setMonth(d.getMonth() + 1);
        setSelectedMonth(d);
    }
    function toggleRow(id: string) {
        setExpanded((s) => ({ ...s, [id]: !s[id] }));
    }

    // --- Paginacja Handlery ---
    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // --- Ładowanie kategorii ---
    React.useEffect(() => {
        const loadCategories = async () => {
            try {
                const response = await api.getCategories();
                const data = (response as any).data || response;
                if (Array.isArray(data)) {
                    const fixedCategories = data.map((c: any) => ({
                        ...c,
                        categoryId: c.categoryId || c.id,
                        name: c.name
                    }));
                    setCategories(fixedCategories);
                } else {
                    setCategories([]);
                }
            } catch (err) {
                console.error("Błąd ładowania kategorii:", err);
            }
        };
        loadCategories();
    }, []);

    // --- Handlery ---
    const handleAddClick = () => { setEditingExpense(null); setIsFormOpen(true); };

    const handleEditClick = async (expenseRow: any) => {
        try {
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
        } catch (error) { console.error("Błąd edycji", error); }
    };

    const handleDeleteClick = (id: string) => setDeleteId(id);

    const handleConfirmDelete = async () => {
        if (!deleteId) return;
        try {
            await api.deleteExpense(deleteId);
            setRefreshTrigger(prev => prev + 1);
        } catch (error) { console.error(error); } finally { setDeleteId(null); }
    };

    const handleFormSubmit = async (data: ExpenseFormData) => {
        try {
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
            if (data.id) { await api.updateExpense(data.id, expensePayload); }
            else { await api.addManualExpense(expensePayload); }
            setIsFormOpen(false);
            setRefreshTrigger(prev => prev + 1);
        } catch (error) { console.error(error); alert("Error saving expense"); }
    };

    const handleSaveBudget = async (totalAmount: number, categoryBudgets: NewCategoryBudget[]) => {
        const payload = {
            year: Number(year),
            month: Number(month),
            budget: Number(totalAmount),
            categoryBudgets: categoryBudgets.map(cb => ({
                categoryId: String(cb.categoryId),
                budget: Number(cb.budget)
            }))
        };

        const success = await updateBudget(payload);
        if (success) {
            setIsBudgetOpen(false);
            setRefreshTrigger(prev => prev + 1);
        }
    };

    const monthLabel = isMounted
        ? selectedMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })
        : "...";

    const budgetValue = currentBudget?.budget ?? kpi?.budget ?? 0;
    const hasBudget = budgetValue > 0;

    // --- Przygotowanie danych do tabeli (Paginacja) ---
    const allExpenses = expenses || [];
    const visibleExpenses = allExpenses.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    // --- LOADER ---
    // Pokazujemy loader (Kotka) jeśli:
    // 1. Aplikacja się jeszcze nie zamontowała (!isMounted) LUB
    // 2. Aplikacja się zamontowała ORAZ trwa ładowanie danych
    if (!isMounted || (isLoading && !kpi && allExpenses.length === 0)) {
        return (
            <Box sx={{ width: '100%', height: '50vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <LottieLoader size={200} />
                <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>Loading data...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>

            <ExpenseDialog
                open={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={editingExpense}
                categories={categories.map(c => ({ id: c.categoryId || (c as any).id, name: c.name! }))}
            />
            <ReceiptUploadDialog
                open={isReceiptDialogOpen}
                onClose={() => setIsReceiptDialogOpen(false)}
                onUploaded={(ocr) => {
                    const mapped = mapOcrToExpenseForm(ocr);
                    setEditingExpense(mapped);
                    setIsFormOpen(true);
                }}
            />

            <ConfirmDialog
                open={!!deleteId}
                title="Delete Expense"
                content="Are you sure you want to delete this expense?"
                onClose={() => setDeleteId(null)}
                onConfirm={handleConfirmDelete}
            />

            <BudgetDialog
                open={isBudgetOpen}
                onClose={() => setIsBudgetOpen(false)}
                onSave={handleSaveBudget}
                categories={categories}
                currentBudget={currentBudget}
            />

            {/* Header */}
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
                    <Paper sx={{ px: 2, py: 0.5, textAlign: 'center', minWidth: '150px' }}>{monthLabel}</Paper>
                    <IconButton onClick={nextMonth}><ArrowForwardIosIcon fontSize="small" /></IconButton>
                </Stack>
            </Box>

            {/* KPI Cards */}
            <Grid container spacing={2} sx={{ mb: 2 }} columns={12}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="caption">Total Spending This Month</Typography>
                            <Typography variant="h6">{totalSpending.toFixed(2)} PLN</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {isMounted && selectedMonth.toLocaleString('en-US', { month: 'long' })}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent sx={{ position: 'relative' }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                <Box>
                                    <Typography variant="caption">Remaining budget</Typography>
                                    <Typography variant="h6" color={hasBudget && (budgetValue - totalSpending < 0) ? 'error.main' : 'text.primary'}>
                                        {hasBudget ? ((budgetValue - totalSpending).toFixed(2)) : "—"} PLN
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Total: {hasBudget ? `${budgetValue} PLN` : "Not set"}
                                    </Typography>
                                </Box>
                                <Button
                                    size="small"
                                    variant={hasBudget ? "text" : "outlined"}
                                    startIcon={hasBudget ? <EditIcon /> : <AddIcon />}
                                    onClick={() => setIsBudgetOpen(true)}
                                    sx={{ minWidth: 'auto', px: 1 }}
                                >
                                    {hasBudget ? "Edit" : "Set"}
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="caption">Avg per day</Typography>
                            <Typography variant="h6">{avgPerDay.toFixed(2)} PLN</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Average over {daysToAverage} days
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Stack 
                        direction="row" 
                        spacing={1} 
                        sx={{ 
                            height: '100%', 
                            width: '100%',
                            alignItems: 'stretch'
                        }} 
                    >
                        <Button 
                            variant="contained" 
                            onClick={handleAddClick}
                            sx={{ 
                                flex: 1,
                                whiteSpace: 'normal',
                                textAlign: 'center',
                                lineHeight: 1.2,
                                px: 1
                            }}
                        >
                            Add expense
                        </Button>
                        <Button 
                            variant="outlined" 
                            onClick={() => setIsReceiptDialogOpen(true)}
                            sx={{ 
                                flex: 1,
                                whiteSpace: 'normal',
                                textAlign: 'center',
                                lineHeight: 1.2,
                                px: 1
                            }}
                        >
                            Add from receipt
                        </Button>
                    </Stack>
                </Grid>
            </Grid>

            {/* Charts & Tables */}
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
                                    <TableCell align="right">Amount</TableCell>
                                    <TableCell />
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {visibleExpenses.map((row: any) => (
                                    <React.Fragment key={row.expenseId}>
                                        <TableRow hover onClick={() => toggleRow(row.expenseId)} style={{cursor: 'pointer'}}>
                                            <TableCell>{new Date(row.transactionDate).toLocaleDateString('pl-PL')}</TableCell>
                                            <TableCell>{row.description || '—'}</TableCell>
                                            <TableCell align="right">{(row.totalAmount ?? 0).toFixed(2)} PLN</TableCell>
                                            <TableCell>
                                                <Button size="small">{expanded[row.expenseId] ? "Hide" : "Show"}</Button>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
                                                <Collapse in={!!expanded[row.expenseId]} timeout="auto" unmountOnExit>
                                                    <BoxUnstyled sx={{ margin: 1, py: 2 }}>
                                                        <Typography variant="body2" sx={{mb: 1}}>Items count: {row.itemCount ?? 0}</Typography>

                                                        <Stack direction="row" spacing={1}>
                                                            <Button size="small" variant="outlined" onClick={() => handleEditClick(row)}>Details</Button>
                                                            <Button size="small" variant="outlined" color="error" onClick={() => handleDeleteClick(row.expenseId)}>Delete</Button>
                                                        </Stack>
                                                    </BoxUnstyled>
                                                </Collapse>
                                            </TableCell>
                                        </TableRow>
                                    </React.Fragment>
                                ))}
                                {visibleExpenses.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">No expenses found</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={allExpenses.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage="Wierszy na stronę:"
                    />
                </Grid>
            </Grid>
        </Box>
    );
}