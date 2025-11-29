"use client";
import * as React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import VisibilityIcon from '@mui/icons-material/Visibility';

type ReceiptRow = {
  id: string;
  shop: string;
  date: string;
  amount: number;
  status: 'verified' | 'needs_correction' | 'archived';
};

const MOCK_RECEIPTS: ReceiptRow[] = [
  { id: 'r1', shop: 'Biedronka', date: '2025-11-10', amount: 52.3, status: 'verified' },
  { id: 'r2', shop: 'Lidl', date: '2025-11-08', amount: 23.45, status: 'needs_correction' },
  { id: 'r3', shop: 'Żabka', date: '2025-11-05', amount: 12.0, status: 'verified' },
  { id: 'r4', shop: 'Media Markt', date: '2025-10-29', amount: 399.99, status: 'archived' },
];

export default function ReceiptsGrid() {
  const now = new Date();
  const [current, setCurrent] = React.useState(() => new Date(now.getFullYear(), now.getMonth(), 1));
  const [query, setQuery] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(0);
  const itemsPerPage = 6;

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

  const filtered = MOCK_RECEIPTS.filter((r) => {
    const q = query.trim().toLowerCase();
    const matchQ = !q || r.shop.toLowerCase().includes(q) || r.amount.toString().includes(q);
    const matchStatus = !filterStatus || r.status === filterStatus;
    return matchQ && matchStatus;
  });

  const paginatedFiltered = filtered.slice(page * itemsPerPage, (page + 1) * itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1200px' } }}>
      <Box sx={{ position: 'relative', mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Bank Paragonów</Typography>
          <Button variant="outlined">Dodaj paragon</Button>
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
            placeholder="Szukaj (sklep, kwota, tag)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Stack>
      </Box>

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Chip label="Wszystkie" onClick={() => setFilterStatus(null)} clickable color={filterStatus ? undefined : 'primary'} />
        <Chip label="Zweryfikowane" onClick={() => setFilterStatus('verified')} clickable color={filterStatus === 'verified' ? 'primary' : undefined} />
        <Chip label="Wymaga korekty" onClick={() => setFilterStatus('needs_correction')} clickable color={filterStatus === 'needs_correction' ? 'warning' : undefined} />
        <Chip label="Archiwum" onClick={() => setFilterStatus('archived')} clickable color={filterStatus === 'archived' ? 'default' : undefined} />
      </Stack>

      <Grid container spacing={2}>
        {paginatedFiltered.map((r) => (
          <Grid key={r.id} item xs={12} sm={6} md={4}>
            <Card>
              <CardContent sx={{ display: 'flex', gap: 1 }}>
                <CardMedia
                  component="img"
                  sx={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 1 }}
                  image={`https://via.placeholder.com/220x220.png?text=${encodeURIComponent(r.shop)}`}
                  alt={`Receipt ${r.id}`}
                />
                <Box sx={{ flex: 1 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="subtitle1">{r.shop}</Typography>
                    <Chip label={r.status === 'verified' ? 'Zweryfikowany' : r.status === 'needs_correction' ? 'Wymaga korekty' : 'Archiwum'} size="small" color={r.status === 'verified' ? 'success' : r.status === 'needs_correction' ? 'warning' : 'default'} />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">{new Date(r.date).toLocaleDateString('pl-PL')}</Typography>
                  <Typography variant="h6" sx={{ mt: 1 }}>{r.amount.toFixed(2)} zł</Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <IconButton size="small" aria-label="view"><VisibilityIcon fontSize="small" /></IconButton>
                    <IconButton size="small" aria-label="edit"><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" aria-label="delete"><DeleteIcon fontSize="small" /></IconButton>
                    <IconButton size="small" aria-label="restore"><RestoreFromTrashIcon fontSize="small" /></IconButton>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Stack direction="row" justifyContent="center" alignItems="center" spacing={1} sx={{ mt: 2 }}>
        <IconButton disabled={page === 0} onClick={() => setPage(p => p - 1)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="body2">Strona {page + 1} z {totalPages || 1}</Typography>
        <IconButton disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
          <ArrowForwardIcon />
        </IconButton>
      </Stack>
    </Box>
  );
}
