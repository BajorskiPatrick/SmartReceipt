"use client";
import * as React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { useDrawingArea } from '@mui/x-charts/hooks';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

interface StyledTextProps {
  variant: 'primary' | 'secondary';
}

const StyledText = styled('text', {
  shouldForwardProp: (prop) => prop !== 'variant',
})<StyledTextProps>(({ theme }) => ({
  textAnchor: 'middle',
  dominantBaseline: 'central',
  fill: (theme.vars || theme).palette.text.secondary,
  variants: [
    {
      props: {
        variant: 'primary',
      },
      style: {
        fontSize: theme.typography.h5.fontSize,
        fontWeight: theme.typography.h5.fontWeight,
      },
    },
    {
      props: ({ variant }) => variant !== 'primary',
      style: {
        fontSize: theme.typography.body2.fontSize,
        fontWeight: theme.typography.body2.fontWeight,
      },
    },
  ],
}));

interface PieCenterLabelProps {
  primaryText: string;
  secondaryText: string;
}

function PieCenterLabel({ primaryText, secondaryText }: PieCenterLabelProps) {
  const { width, height, left, top } = useDrawingArea();
  const primaryY = top + height / 2 - 10;
  const secondaryY = primaryY + 24;

  return (
    <>
      <StyledText variant="primary" x={left + width / 2} y={primaryY}>
        {primaryText}
      </StyledText>
      <StyledText variant="secondary" x={left + width / 2} y={secondaryY}>
        {secondaryText}
      </StyledText>
    </>
  );
}

type Slice = { label: string; value: number };

interface ExpenseDonutProps {
  data: Slice[];
  totalLabel?: string;
}

export const CATEGORY_COLORS: Record<string, string> = {
    'Food': '#42A5F5',
    'Groceries': '#66BB6A',
    'Transport': '#FFA726',
    'Taxes and fees': '#EF5350',
    'Cosmetics': '#AB47BC',
    'Household and chemistry': '#26A69A',
    'Entertainment': '#FFCA28',
    'Other': '#78909C',
};

export default function ExpenseDonut({ data, totalLabel = 'Total' }: ExpenseDonutProps) {
  const total = data.reduce((s, d) => s + d.value, 0);

  // map to PieChart series data layout
  const seriesData = data.map((d) => ({ label: d.label, value: d.value }));

  return (
    <Card variant="outlined" sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <CardContent>
        <Typography component="h3" variant="subtitle2" sx={{ mb: 1 }}>
          Expenses by category
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <PieChart
            colors={data.map(d => CATEGORY_COLORS[d.label] || CATEGORY_COLORS['Other'])}
            margin={{ left: 40, right: 40, top: 40, bottom: 40 }}
            series={[
              {
                data: seriesData,
                innerRadius: 60,
                outerRadius: 92,
                paddingAngle: 0,
                highlightScope: { fade: 'global', highlight: 'item' },
              },
            ]}
            height={220}
            width={220}
            hideLegend
          >
            <PieCenterLabel primaryText={`${total}`} secondaryText={totalLabel} />
          </PieChart>
        </Box>
      </CardContent>
    </Card>
  );
}
