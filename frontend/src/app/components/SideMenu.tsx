'use client';
import * as React from 'react';
import { styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MenuContent from './MenuContent';
import OptionsMenu from './OptionsMenu';
import Button from '@mui/material/Button';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'; // Ikona paragonu

const drawerWidth = 240;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: 'border-box',
  mt: 10,
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: 'border-box',
  },
});

export default function SideMenu() {
  const [userData, setUserData] = React.useState({ email: '', name: '' });

  React.useEffect(() => {
    // Pobieranie danych po załadowaniu komponentu
    const email = localStorage.getItem("userEmail") || "Nie zalogowano";
    const name = localStorage.getItem("userName") || "Użytkownik";
    setUserData({ email, name });
  }, []);

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: 'background.paper',
        },
      }}
    >
      {/* NAGŁÓWEK Z TYTUŁEM PROJEKTU */}
      <Box sx={{ p: 2, mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <ReceiptLongIcon color="primary" />
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1 }}>
          Smart Receipt
        </Typography>
      </Box>
      
      <Divider sx={{ my: 1 }} />
      
      <Box sx={{ overflow: 'auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <MenuContent />
      </Box>

      {/* PROFIL UŻYTKOWNIKA */}
      <Stack
        direction="row"
        sx={{
          p: 2,
          gap: 1,
          alignItems: 'center',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Avatar
          sizes="small"
          alt={userData.name}
          sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '1rem' }}
        >
          {userData.name.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ mr: 'auto', overflow: 'hidden' }}>
          <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: '16px' }}>
            {userData.name}
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ color: 'text.secondary', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {userData.email}
          </Typography>
        </Box>
        <OptionsMenu />
      </Stack>

      {/* PRZYCISK WYLOGUJ */}
      <Stack sx={{ p: 2 }}>
        <Button
          variant="outlined"
          fullWidth
          startIcon={<LogoutRoundedIcon />}
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
        >
          Logout
        </Button>
      </Stack>
    </Drawer>
  );
}