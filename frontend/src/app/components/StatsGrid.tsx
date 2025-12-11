"use client";
import * as React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ExpenseDonut from './ExpenseDonut';
import PageViewsBarChart from './PageViewsBarChart';
import SessionsChart from './SessionsChart';
import StatCard from './StatCard';

export default function StatsGrid() {
  const now = new Date();
  const [current, setCurrent] = React.useState(() => new Date(now.getFullYear(), now.getMonth(), 1));

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

  const monthLabel = current.toLocaleString(undefined, { month: 'long', year: 'numeric' });

  const barData = null; // placeholder - PageViewsBarChart uses its own mock data

  const donutSlices = [
    { label: 'Food', value: 320.5 },
    { label: 'Transport', value: 140.0 },
    { label: 'Shopping', value: 220.0 },
    { label: 'Entertainment', value: 90.0 },
  ];

  const statCards = [
    { title: 'Annual total', value: '9,420', interval: 'Year', trend: 'up' as const, data: [10, 40, 20, 60, 30, 80, 40] },
    { title: 'Average month', value: '785', interval: '12 mo', trend: 'neutral' as const, data: [40, 60, 30, 70, 50, 90, 60] },
    { title: 'Most expensive', value: 'March', interval: '2025', trend: 'down' as const, data: [50, 30, 40, 20, 10, 60, 30] },
  ];

  // heatmap mock: 30 days with intensity 0-1
  const heat = new Array(30).fill(0).map((_, i) => ({ day: i + 1, value: Math.round(Math.random() * 100) }));

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      <Box sx={{ position: 'relative', mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography component="h2" variant="h6">Statystyki</Typography>
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
          }}
        >
          <IconButton aria-label="previous month" onClick={prevMonth}>
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
          <Paper sx={{ px: 2, py: 0.5, textAlign: 'center' }}>{monthLabel}</Paper>
          <IconButton aria-label="next month" onClick={nextMonth}>
            <ArrowForwardIosIcon fontSize="small" />
          </IconButton>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: { xs: 0, md: 2 } }}>
            <Button variant="outlined">Export CSV</Button>
            <Button variant="contained">Export PDF</Button>
          </Stack>
        </Stack>
      </Box>

      <Grid container spacing={2} sx={{ mb: 2 }} columns={12}>
        {statCards.map((s, idx) => (
          <Grid key={idx} size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard {...s} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} columns={12}>
        <Grid size={{ xs: 12, md: 7 }}>
          <PageViewsBarChart />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <ExpenseDonut data={donutSlices} totalLabel="Month" />
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <SessionsChart />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>Heatmap - most expensive days</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
                {heat.map((h) => (
                  <Box
                    key={h.day}
                    sx={{
                      height: 28,
                      borderRadius: 1,
                      background: `rgba(220,20,60, ${Math.min(1, h.value / 100)})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: 12,
                    }}
                  >
                    {h.day}
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>Budget suggestions</Typography>
              <ul>
                <li>Reduce dining out by 20% — save ~120 PLN/month</li>
                <li>Review subscriptions — cancel unused services</li>
                <li>Consider a weekly grocery plan to lower overspend</li>
              </ul>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>Annual Summary</Typography>
              <Typography variant="h5">9,420 PLN</Typography>
              <Typography variant="caption" color="text.secondary">Average: 785 PLN / month</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
