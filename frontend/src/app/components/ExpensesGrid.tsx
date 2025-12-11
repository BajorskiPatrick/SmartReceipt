"use client";
import * as React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

type ExpenseRow = {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  notes?: string;
};

const MOCK_EXPENSES: ExpenseRow[] = [
  { id: 'e1', date: '2025-11-10', description: 'Weekly groceries', category: 'Food', amount: 129.45 },
  { id: 'e2', date: '2025-11-08', description: 'Fuel', category: 'Transport', amount: 185.0, notes: 'Partial fill' },
  { id: 'e3', date: '2025-11-02', description: 'Conference ticket', category: 'Work', amount: 420.0 },
  { id: 'e4', date: '2025-10-28', description: 'Cinema', category: 'Entertainment', amount: 48.5 },
];

export default function ExpensesGrid() {
  const now = new Date();
  const [current, setCurrent] = React.useState(() => new Date(now.getFullYear(), now.getMonth(), 1));
  const [query, setQuery] = React.useState('');
  const [category, setCategory] = React.useState<string>('all');
  const [sort, setSort] = React.useState<string>('date_desc');
  const [page, setPage] = React.useState(0);
  const itemsPerPage = 10;

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

  const monthLabel = current.toLocaleString(undefined, { month: 'long', year: 'numeric' });

  const filtered = MOCK_EXPENSES.filter((e) => {
    const q = query.trim().toLowerCase();
    const matchesQ = !q || e.description.toLowerCase().includes(q) || e.amount.toString().includes(q);
    const matchesCategory = category === 'all' || e.category === category;
    return matchesQ && matchesCategory;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'date_desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (sort === 'date_asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
    if (sort === 'amount_desc') return b.amount - a.amount;
    if (sort === 'amount_asc') return a.amount - b.amount;
    return 0;
  });

  const paginatedSorted = sorted.slice(page * itemsPerPage, (page + 1) * itemsPerPage);
  const totalPages = Math.ceil(sorted.length / itemsPerPage);

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1200px' } }}>
      <Box sx={{ position: 'relative', mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Wydatki</Typography>
          <Box />
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{
            position: { xs: 'static', md: 'absolute' },
            left: { md: '50%' },
            transform: { md: 'translateX(-50%)' },
            top: { md: 0 },
            width: { xs: '100%', md: 'auto' },
            justifyContent: 'center',
            mt: { xs: 1, md: 0 },
            flexWrap: 'wrap',
          }}
        >
          <IconButton aria-label="previous month" onClick={prevMonth}>
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
          <Paper sx={{ px: 2, py: 0.5, textAlign: 'center', minWidth: 120 }}>{monthLabel}</Paper>
          <IconButton aria-label="next month" onClick={nextMonth}>
            <ArrowForwardIosIcon fontSize="small" />
          </IconButton>
          <TextField
            size="small"
            placeholder="Szukaj (opis, kwota)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel id="category-select-label">Kategoria</InputLabel>
            <Select labelId="category-select-label" value={category} label="Kategoria" onChange={(e) => setCategory(String(e.target.value))}>
              <MenuItem value="all">Wszystkie</MenuItem>
              <MenuItem value="Food">Food</MenuItem>
              <MenuItem value="Transport">Transport</MenuItem>
              <MenuItem value="Work">Work</MenuItem>
              <MenuItem value="Entertainment">Entertainment</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="sort-select-label">Sortuj</InputLabel>
            <Select labelId="sort-select-label" value={sort} label="Sortuj" onChange={(e) => setSort(String(e.target.value))}>
              <MenuItem value="date_desc">Data (najnowsze)</MenuItem>
              <MenuItem value="date_asc">Data (najstarsze)</MenuItem>
              <MenuItem value="amount_desc">Kwota (malejąco)</MenuItem>
              <MenuItem value="amount_asc">Kwota (rosnąco)</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Box>

      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Data</TableCell>
              <TableCell>Opis</TableCell>
              <TableCell>Kategoria</TableCell>
              <TableCell align="right">Kwota</TableCell>
              <TableCell align="center">Akcje</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedSorted.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>{new Date(row.date).toLocaleDateString('pl-PL')}</TableCell>
                <TableCell>{row.description}</TableCell>
                <TableCell>{row.category}</TableCell>
                <TableCell align="right">{row.amount.toFixed(2)} zł</TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <IconButton size="small" aria-label="view"><VisibilityIcon fontSize="small" /></IconButton>
                    <IconButton size="small" aria-label="edit"><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" aria-label="delete"><DeleteIcon fontSize="small" /></IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Pagination Controls */}
      <Stack direction="row" justifyContent="center" alignItems="center" spacing={1} sx={{ mt: 2 }}>
        <IconButton size="small" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
          <ArrowBackIosNewIcon fontSize="small" />
        </IconButton>
        <Typography variant="body2">Strona {page + 1} z {totalPages}</Typography>
        <IconButton size="small" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
          <ArrowForwardIosIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Box>
  );
}
