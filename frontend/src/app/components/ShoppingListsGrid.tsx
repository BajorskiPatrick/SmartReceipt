import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Checkbox from '@mui/material/Checkbox';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import AddIcon from '@mui/icons-material/Add';
import ArchiveIcon from '@mui/icons-material/Archive';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

type ShoppingList = {
  id: string;
  name: string;
  createdAt: string;
  archived?: boolean;
  items: { id: string; text: string; bought?: boolean }[];
};

const MOCK_LISTS: ShoppingList[] = [
  {
    id: 'l1',
    name: 'Weekly groceries',
    createdAt: '2025-11-01',
    items: [
      { id: 'i1', text: 'Milk', bought: false },
      { id: 'i2', text: 'Eggs', bought: true },
      { id: 'i3', text: 'Bread', bought: false },
    ],
  },
  {
    id: 'l2',
    name: 'Party',
    createdAt: '2025-10-20',
    items: [
      { id: 'i4', text: 'Chips', bought: false },
      { id: 'i5', text: 'Soda', bought: false },
    ],
  },
  {
    id: 'l3',
    name: 'Hardware store',
    createdAt: '2025-09-15',
    archived: true,
    items: [
      { id: 'i6', text: 'Nails', bought: true },
      { id: 'i7', text: 'Hammer', bought: false },
    ],
  },
];

export default function ShoppingListsGrid() {
  const [lists, setLists] = React.useState<ShoppingList[]>(MOCK_LISTS);
  const [newName, setNewName] = React.useState('');
  const [query, setQuery] = React.useState('');
  const [page, setPage] = React.useState(0);
  const itemsPerPage = 6;

  function addList() {
    if (!newName.trim()) return;
    const newList: ShoppingList = {
      id: `l${Date.now()}`,
      name: newName.trim(),
      createdAt: new Date().toISOString(),
      items: [],
    };
    setLists((s) => [newList, ...s]);
    setNewName('');
  }

  function toggleBought(listId: string, itemId: string) {
    setLists((prev) => prev.map((l) => {
      if (l.id !== listId) return l;
      return {
        ...l,
        items: l.items.map((it) => it.id === itemId ? { ...it, bought: !it.bought } : it),
      };
    }));
  }

  function toggleArchive(listId: string) {
    setLists((prev) => prev.map((l) => l.id === listId ? { ...l, archived: !l.archived } : l));
  }

  const filtered = lists.filter((l) => l.name.toLowerCase().includes(query.toLowerCase()));
  const paginatedLists = filtered.slice(page * itemsPerPage, (page + 1) * itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1200px' } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6">Lista zakupów</Typography>
        <Stack direction="row" spacing={1}>
          <TextField size="small" placeholder="Szukaj listy" value={query} onChange={(e) => { setQuery(e.target.value); setPage(0); }} />
          <TextField size="small" placeholder="Nowa lista" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <Button startIcon={<AddIcon />} variant="contained" onClick={addList}>Nowa lista</Button>
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        {paginatedLists.map((l) => (
          <Grid key={l.id} item xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle1">{l.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{new Date(l.createdAt).toLocaleDateString('pl-PL')}</Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <IconButton size="small" onClick={() => toggleArchive(l.id)} title={l.archived ? 'Przywróć' : 'Archiwizuj'}>
                      {l.archived ? <RestoreFromTrashIcon /> : <ArchiveIcon />}
                    </IconButton>
                    <IconButton size="small" title="Konwertuj na wydatek">
                      <ShoppingCartCheckoutIcon />
                    </IconButton>
                  </Stack>
                </Stack>

                <List dense>
                  {l.items.map((it) => (
                    <ListItem key={it.id} disablePadding>
                      <Checkbox checked={!!it.bought} onChange={() => toggleBought(l.id, it.id)} />
                      <ListItemText primary={it.text} />
                      <ListItemSecondaryAction>
                        {/* placeholder for edit/delete item */}
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination Controls */}
      <Stack direction="row" justifyContent="center" alignItems="center" spacing={1} sx={{ mt: 3 }}>
        <IconButton size="small" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
          <ArrowBackIosIcon fontSize="small" />
        </IconButton>
        <Typography variant="body2">Strona {page + 1} z {totalPages}</Typography>
        <IconButton size="small" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
          <ArrowForwardIosIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Box>
  );
}
