"use client";
import * as React from 'react';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Breadcrumbs, { breadcrumbsClasses } from '@mui/material/Breadcrumbs';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import Link from 'next/link';
import MuiLink from '@mui/material/Link';
import { usePathname } from 'next/navigation';

const StyledBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  margin: theme.spacing(1, 0),
  [`& .${breadcrumbsClasses.separator}`]: {
    color: (theme.vars || theme).palette.action.disabled,
    margin: 1,
  },
  [`& .${breadcrumbsClasses.ol}`]: {
    alignItems: 'center',
  },
}));

export default function NavbarBreadcrumbs() {
  const pathname = usePathname() || '/';
  const segments = pathname.split('/').filter(Boolean);

  const labelMap: Record<string, string> = {
    statistics: 'Statistics',
    expenses: 'Expenses',
    // fallback labels can be added here
  };

  const crumbs = [{ href: '/', label: 'Dashboard' }];

  let acc = '';
  segments.forEach((seg) => {
    acc += `/${seg}`;
    const label = labelMap[seg] ?? seg.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    crumbs.push({ href: acc, label });
  });

  return (
    <StyledBreadcrumbs aria-label="breadcrumb" separator={<NavigateNextRoundedIcon fontSize="small" />}>
      {crumbs.map((c, idx) => {
        const isLast = idx === crumbs.length - 1;
        if (isLast) {
          return (
            <Typography key={c.href} variant="body1" sx={{ color: 'text.primary', fontWeight: 600 }}>
              {c.label}
            </Typography>
          );
        }

        return (
          <MuiLink key={c.href} component={Link} href={c.href} underline="hover" color="inherit">
            {c.label}
          </MuiLink>
        );
      })}
    </StyledBreadcrumbs>
  );
}
