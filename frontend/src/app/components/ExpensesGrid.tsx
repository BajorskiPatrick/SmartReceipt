"use client";
import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Button from '@mui/material/Button';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

// --- KOMPONENTY Z MAINGRID ---
import ExpenseDialog, { ExpenseFormData } from '../components/dialogs/ExpenseDialog';
import ConfirmDialog from '../components/dialogs/ConfirmDialog';
import ReceiptUploadDialog from "../components/dialogs/ReceiptUploadDialog";
import LottieLoader from '../components/common/LottieLoader';

// --- IKONY ---
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import SearchIcon from '@mui/icons-material/Search';

// --- API I HOOKI ---
import { useExpanses } from '@/hooks/useExpanses';
import { api } from '@/api-client/client';
import { mapOcrToExpenseForm } from "@/hooks/useOcrMapping";
import { Category, NewExpense, NewExpenseItem } from '@/api-client/models';
import { useCategories } from "@/hooks/useCategories";

export default function ExpensesGrid() {
  const now = new Date();
  const [current, setCurrent] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // --- POBIERANIE DANYCH ---
  const year = current.getFullYear();
  const month = current.getMonth() + 1;
  const { data: expenses, loading } = useExpanses(year, month, undefined, refreshTrigger);
  const { categories } = useCategories();


  // --- STANY UI ---
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseFormData | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Filtry
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sort, setSort] = useState<string>('date_desc');
  
  // Paginacja
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // --- HANDLERY ---
  const handleAddClick = () => { 
      setEditingExpense(null); 
      setIsFormOpen(true); 
  };

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
    } catch (error) { 
        console.error("Błąd edycji", error); 
    }
  };

  const handleDeleteClick = (id: string) => setDeleteId(id);

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
        await api.deleteExpense(deleteId);
        setRefreshTrigger(prev => prev + 1);
    } catch (error) { 
        console.error(error); 
    } finally { 
        setDeleteId(null); 
    }
  };

  const handleFormSubmit = async (data: ExpenseFormData) => {
    try {
        const expensePayload: NewExpense = {
            description: data.description,
            transactionDate: new Date(data.transactionDate).toISOString(),
            items: data.items.map(item => ({
                productName: item.productName,
                price: Number(item.price),
                quantity: Number(item.quantity),
                categoryId: item.categoryId
            } as NewExpenseItem))
        };
        
        if (data.id) { await api.updateExpense(data.id, expensePayload); } 
        else { await api.addManualExpense(expensePayload); }
        
        setIsFormOpen(false);
        setRefreshTrigger(prev => prev + 1);
    } catch (error) { 
        console.error(error); 
        alert("Error saving expense"); 
    }
  };

  // --- LOGIKA WIDOKU ---
  function prevMonth() {
    const d = new Date(current);
    d.setMonth(d.getMonth() - 1);
    setCurrent(d);
    setPage(0);
  }

  function nextMonth() {
    const d = new Date(current);
    d.setMonth(d.getMonth() + 1);
    setCurrent(d);
    setPage(0);
  }

  const monthLabel = current.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  // FILTROWANIE I SORTOWANIE
  const filtered = useMemo(() => {
    if (!expenses) return [];
    return expenses.filter((e: any) => {
      const q = query.trim().toLowerCase();
      const matchesQ = !q || 
        (e.description && e.description.toLowerCase().includes(q)) || 
        (e.totalAmount && e.totalAmount.toString().includes(q));
      
      // Dopasowanie kategorii po nazwie
      const matchesCategory = categoryFilter === 'all' || e.categoryName === categoryFilter;
      return matchesQ && matchesCategory;
    });
  }, [expenses, query, categoryFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a: any, b: any) => {
      const dateA = new Date(a.transactionDate).getTime();
      const dateB = new Date(b.transactionDate).getTime();
      const amountA = a.totalAmount || 0;
      const amountB = b.totalAmount || 0;

      if (sort === 'date_desc') return dateB - dateA;
      if (sort === 'date_asc') return dateA - dateB;
      if (sort === 'amount_desc') return amountB - amountA;
      if (sort === 'amount_asc') return amountA - amountB;
      return 0;
    });
  }, [filtered, sort]);

  const paginatedSorted = sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // --- LOADER ---
  if (!isMounted || (loading && (!expenses || expenses.length === 0))) {
    return (
        <Box sx={{ width: '100%', height: '50vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <LottieLoader size={200} />
            <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>Loading expenses...</Typography>
        </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1200px' } }}>
      
      {/* --- DIALOGI --- */}
      <ExpenseDialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingExpense}
        categories={categories.map(c => ({ id: c.categoryId, name: c.name }))}
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
        title="Confirm Deletion"
        content="Are you sure you want to delete this expense? This action cannot be undone."
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* --- PRZYCISKI DODAWANIA --- */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mb: 2 }}>
          <Button variant="contained" onClick={handleAddClick}>Add Expense</Button>
          <Button variant="outlined" onClick={() => setIsReceiptDialogOpen(true)}>From Receipt</Button>
      </Box>

      {/* --- NAGŁÓWEK I FILTRY --- */}
      <Stack 
        direction={{ xs: 'column', md: 'row' }} 
        justifyContent="space-between" 
        alignItems={{ xs: 'stretch', md: 'center' }}
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Stack direction="row" alignItems="center" spacing={2} justifyContent={{ xs: 'space-between', md: 'flex-start' }}>
            <Typography variant="h6">Expenses</Typography>
            {loading && expenses && expenses.length > 0 && <CircularProgress size={20} />}
            
            <Stack direction="row" alignItems="center" spacing={1}>
                <IconButton onClick={prevMonth} size="small">
                    <ArrowBackIosNewIcon fontSize="inherit" />
                </IconButton>
                <Paper sx={{ px: 2, py: 0.5, textTransform: 'capitalize', minWidth: 140, textAlign: 'center' }}>
                    {monthLabel}
                </Paper>
                <IconButton onClick={nextMonth} size="small">
                    <ArrowForwardIosIcon fontSize="inherit" />
                </IconButton>
            </Stack>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
             <TextField
                size="small"
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
                sx={{ minWidth: 200 }}
              />
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="sort-select-label">Sort</InputLabel>
                <Select labelId="sort-select-label" value={sort} label="Sort" onChange={(e) => setSort(String(e.target.value))}>
                  <MenuItem value="date_desc">Date (newest)</MenuItem>
                  <MenuItem value="date_asc">Date (oldest)</MenuItem>
                  <MenuItem value="amount_desc">Amount (descending)</MenuItem>
                  <MenuItem value="amount_asc">Amount (ascending)</MenuItem>
                </Select>
              </FormControl>
        </Stack>
      </Stack>

      {/* --- TABELA --- */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: '70vh' }}>
            <Table stickyHeader size="small">
            <TableHead>
                <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="center">Actions</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {paginatedSorted.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                            No expenses match the criteria.
                        </TableCell>
                    </TableRow>
                ) : (
                    paginatedSorted.map((row: any) => (
                    <TableRow key={row.expenseId} hover>
                        <TableCell>{new Date(row.transactionDate).toLocaleDateString('pl-PL')}</TableCell>
                        <TableCell>{row.description || '—'}</TableCell>
                        <TableCell align="right">{(row.totalAmount || 0).toFixed(2)} zł</TableCell>
                        <TableCell align="center">
                            <Stack direction="row" spacing={1} justifyContent="center">
                                <Button 
                                    size="small" 
                                    variant="outlined"
                                    onClick={() => handleEditClick(row)}
                                    sx={{ minWidth: 'auto' }}
                                >
                                    Edit
                                </Button>
                                <Button 
                                    size="small" 
                                    variant="outlined" 
                                    color="error"
                                    onClick={() => handleDeleteClick(row.expenseId)}
                                    sx={{ minWidth: 'auto' }}
                                >
                                    Delete
                                </Button>
                            </Stack>
                        </TableCell>
                    </TableRow>
                    ))
                )}
            </TableBody>
            </Table>
        </TableContainer>

        <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filtered.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Rows per page:"
        />
      </Paper>
    </Box>
  );
}