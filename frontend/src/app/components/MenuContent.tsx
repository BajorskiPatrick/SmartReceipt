'use client';
import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import HelpRoundedIcon from '@mui/icons-material/HelpRounded';

const mainListItems = [
  { text: 'Home', icon: <HomeRoundedIcon />, href: '/' },
  { text: 'Statystyki', icon: <AnalyticsRoundedIcon />, href: '/statistics' },
  { text: 'Paragony', icon: <ReceiptLongIcon />, href: '/receipts' },
  { text: 'Listy zakupów', icon: <ShoppingCartIcon />, href: '/shopping-lists' },
  { text: 'Wydatki', icon: <PaymentsRoundedIcon />, href: '/expenses' },
];

const secondaryListItems = [
  { text: 'Ustawienia', icon: <SettingsRoundedIcon />, href: '/settings' },
];

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MenuContent() {
  const pathname = usePathname() || '/';

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {mainListItems.map((item, index) => {
          const selected = item.href ? pathname === item.href : false;
          return (
            <ListItem key={index} disablePadding sx={{ display: 'block' }}>
              <ListItemButton component={Link} href={item.href || '#'} selected={selected}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <List dense>
        {secondaryListItems.map((item, index) => {
          const selected = item.href ? pathname === item.href : false;
          return (
            <ListItem key={index} disablePadding sx={{ display: 'block' }}>
              <ListItemButton component={item.href ? Link : 'button'} href={item.href || undefined} selected={selected}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Stack>
  );
}
