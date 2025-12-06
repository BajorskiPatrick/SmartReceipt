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
import ExpenseDonut from './ExpenseDonut';
import { useDashboard } from '@/hooks/useDashboard';
import { useExpanses } from '@/hooks/useExpanses';
type ExpenseRow = {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  note?: string;
};
/*
const MOCK_EXPENSES: ExpenseRow[] = [
  { id: '1', date: '2025-11-10', description: 'Grocery', category: 'Food', amount: 45.5, note: 'Weekly shopping' },
  { id: '2', date: '2025-11-08', description: 'Train ticket', category: 'Transport', amount: 12.0 },
  { id: '3', date: '2025-11-02', description: 'Coffee', category: 'Food', amount: 4.3 },
  { id: '4', date: '2025-11-01', description: 'Office supplies', category: 'Work', amount: 18.75 },
];*/

export default function MainGrid() {
  const [current, setCurrent] = React.useState(() => new Date()); // November 2025
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
  /*
  const donutData = [
    { label: 'Food', value: 120.8 },
    { label: 'Transport', value: 48.5 },
    { label: 'Work', value: 18.75 },
    { label: 'Other', value: 30.0 },
  ];*/
  const year = current.getFullYear();
  const month = current.getMonth() + 1;

  const { kpi, categorySummary, trendSummary, loading: dashLoading } = useDashboard(year, month);
  const { data: expenses, page, setPage, totalPages } = useExpanses(year, month, undefined);

  const donutData = (categorySummary || []).map((c) => ({
    label: c.categoryName,
    value: c.totalSpendingMonth,
  }));

  const totalThisMonth = (donutData.reduce((s, d) => s + (d.value || 0), 0) as number) || kpi?.totalSpendingMonth || 0;

  function prevMonth() {
    const d = new Date(current);
    d.setMonth(d.getMonth() - 1);
    setCurrent(d);
  }

  function nextMonth() {
    const d = new Date(current);
    d.setMonth(d.getMonth() + 1);
    setCurrent(d);
  }

  function toggleRow(id: string) {
    setExpanded((s) => ({ ...s, [id]: !s[id] }));
  }

  const monthLabel = current.toLocaleString(undefined, { month: 'long', year: 'numeric' });

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      <Box sx={{ position: 'relative', mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography component="h2" variant="h6">
            Dashboard
          </Typography>
          {/* empty box to keep spacing */}
          <Box />
        </Stack>

        {/* Centered month navigation on md+ */}
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
          }}
        >
          <IconButton aria-label="previous month" onClick={prevMonth}>
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
          <Paper sx={{ px: 2, py: 0.5, textAlign: 'center' }}>{monthLabel}</Paper>
          <IconButton aria-label="next month" onClick={nextMonth}>
            <ArrowForwardIosIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      {/* KPI cards and quick actions */}
      <Grid container spacing={2} sx={{ mb: 2 }} columns={12}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="caption">This month</Typography>
              <Typography variant="h6">{(kpi?.totalSpendingMonth ?? totalThisMonth).toFixed(2)} PLN</Typography>
              <Typography variant="body2" color="text.secondary">Budget: {(kpi?.budget ?? "-") } PLN</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="caption">Remaining budget</Typography>
              <Typography variant="h6">{kpi ? Math.max(0, (kpi.budget ?? 0) - (kpi.totalSpendingMonth ?? 0)).toFixed(2) : "—"} PLN</Typography>
              <Typography variant="body2" color="text.secondary">You are within limits</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="caption">Avg per day</Typography>
              <Typography variant="h6">{( (kpi?.totalSpendingMonth ?? totalThisMonth) / (new Date().getDate() || 1) ).toFixed(2)} PLN</Typography>
              <Typography variant="body2" color="text.secondary">Projected end of month</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Stack direction="row" spacing={1} sx={{ height: '100%' }} alignItems="center">
            <Button variant="contained">Add expense</Button>
            <Button variant="outlined">Add from receipt</Button>
          </Stack>
        </Grid>
      </Grid>

      {/* Main area: donut + expenses list */}
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
                    <TableRow hover>
                      <TableCell>{new Date(row.transactionDate).toLocaleDateString('pl-PL')}</TableCell>
                      <TableCell>{row.description || '—'}</TableCell>
                      <TableCell>{row.categoryName || '—'}</TableCell>
                      <TableCell align="right">{(row.totalAmount ?? 0).toFixed(2)} PLN</TableCell>
                      <TableCell>
                        <Button size="small" href={`/expenses/${row.expenseId}`}>Details</Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                        <Collapse in={!!expanded[row.expenseId]} timeout="auto" unmountOnExit>
                          <BoxUnstyled sx={{ margin: 1 }}>
                            <Typography variant="body2">Items: {row.itemCount ?? 0}</Typography>
                            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                              <Button size="small">Edit</Button>
                              <Button size="small">Receipt</Button>
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
