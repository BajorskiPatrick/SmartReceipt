import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';

export default function SettingsGrid() {
  const [name, setName] = React.useState('Riley Carter');
  const [email, setEmail] = React.useState('riley@email.com');
  const [darkMode, setDarkMode] = React.useState(false);
  const [currency, setCurrency] = React.useState('PLN');
  const [locale, setLocale] = React.useState('pl-PL');

  const mockCategories = [
    { id: 'c1', name: 'Food', color: '#f97316', icon: '🍔' },
    { id: 'c2', name: 'Transport', color: '#06b6d4', icon: '🚌' },
    { id: 'c3', name: 'Shopping', color: '#a78bfa', icon: '🛍️' },
  ];

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1100px' } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6">Ustawienia</Typography>
        <Stack direction="row" spacing={1}>
          <Button startIcon={<UploadFileIcon />}>Import</Button>
          <Button variant="outlined" startIcon={<DownloadIcon />}>Export</Button>
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>Ustawienia konta</Typography>
              <Stack spacing={2}>
                <TextField label="Nazwa" size="small" value={name} onChange={(e) => setName(e.target.value)} />
                <TextField label="Email" size="small" value={email} onChange={(e) => setEmail(e.target.value)} />
                <TextField label="Hasło" type="password" size="small" placeholder="Nowe hasło" />
                <Stack direction="row" spacing={1}>
                  <Button variant="contained">Zapisz</Button>
                  <Button color="error">Usuń konto</Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>Wygląd</Typography>
              <FormControlLabel
                control={<Switch checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} />}
                label="Tryb ciemny"
              />
              <Divider sx={{ my: 2 }} />
              <FormControl fullWidth size="small">
                <InputLabel id="currency-label">Waluta</InputLabel>
                <Select labelId="currency-label" value={currency} label="Waluta" onChange={(e) => setCurrency(String(e.target.value))}>
                  <MenuItem value="PLN">PLN</MenuItem>
                  <MenuItem value="EUR">EUR</MenuItem>
                  <MenuItem value="USD">USD</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth size="small" sx={{ mt: 2 }}>
                <InputLabel id="locale-label">Język / Format</InputLabel>
                <Select labelId="locale-label" value={locale} label="Język / Format" onChange={(e) => setLocale(String(e.target.value))}>
                  <MenuItem value="pl-PL">Polski (pl-PL)</MenuItem>
                  <MenuItem value="en-US">English (en-US)</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1">Kategorie</Typography>
                <IconButton size="small"><AddIcon /></IconButton>
              </Stack>
              <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {mockCategories.map((c) => (
                  <Chip key={c.id} label={c.name} avatar={undefined} sx={{ background: c.color, color: 'white' }} />
                ))}
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">Kliknij kategorię, aby edytować (mock)</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1">Powiadomienia</Typography>
              <Stack spacing={1} sx={{ mt: 1 }}>
                <FormControlLabel control={<Switch defaultChecked />} label="Alert przy przekroczeniu budżetu" />
                <FormControlLabel control={<Switch />} label="Powiadomienia e-mail" />
                <Typography variant="caption" color="text.secondary">Konfiguracja mock - nie wysyła rzeczywistych powiadomień.</Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1">Dane i import / export</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Button startIcon={<UploadFileIcon />}>Import danych</Button>
                <Button startIcon={<DownloadIcon />}>Export CSV</Button>
                <Button color="error">Reset danych testowych</Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
