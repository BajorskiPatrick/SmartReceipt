import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer, { drawerClasses } from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import MenuButton from './MenuButton';
import MenuContent from './MenuContent';
import CardAlert from './CardAlert';
import Box from '@mui/material/Box';

interface SideMenuMobileProps {
  open: boolean | undefined;
  toggleDrawer: (newOpen: boolean) => () => void;
}

export default function SideMenuMobile({ open, toggleDrawer }: SideMenuMobileProps) {
  const [userData, setUserData] = React.useState({ email: '', name: '' });
  
  React.useEffect(() => {
    // Pobieranie danych po załadowaniu komponentu
    const email = localStorage.getItem("userEmail") || "Nie zalogowano";
    const name = localStorage.getItem("userName") || "Użytkownik";
    setUserData({ email, name });
  }, []);
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={toggleDrawer(false)}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        [`& .${drawerClasses.paper}`]: {
          backgroundImage: 'none',
          backgroundColor: 'background.paper',
        },
      }}
    >
      <Stack
        sx={{
          maxWidth: '70dvw',
          height: '100%',
        }}
      >
        <Stack direction="row" sx={{ p: 2, pb: 0, gap: 1 }}>
          <Stack
            direction="row"
            sx={{ gap: 1, alignItems: 'center', flexGrow: 1, p: 1 }}
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
          </Stack>
          <MenuButton showBadge>
            <NotificationsRoundedIcon />
          </MenuButton>
        </Stack>
        <Divider />
        <Stack sx={{ flexGrow: 1 }}>
          <MenuContent />
          <Divider />
        </Stack>
        
        <Stack sx={{ p: 2 }}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<LogoutRoundedIcon />}
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login"; // albo router.push("/login") jeśli używasz Next.js routera
            }}
          >
            Logout
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
}
