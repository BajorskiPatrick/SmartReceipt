import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import Divider from '@mui/material/Divider';

// Importujemy typy z Twojego API
import { Category, MonthlyBudget, NewCategoryBudget } from '@/api-client/models';

interface BudgetDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (totalBudget: number, categoryBudgets: NewCategoryBudget[]) => void;
  categories: Category[];
  currentBudget: MonthlyBudget | null;
}

export default function BudgetDialog({ open, onClose, onSave, categories, currentBudget }: BudgetDialogProps) {
  // Przechowujemy kwoty jako mapa: { "id_kategorii": kwota }
  const [inputs, setInputs] = React.useState<Record<string, number>>({});

  // Resetowanie i ładowanie danych przy otwarciu
  React.useEffect(() => {
    if (open) {
      const initialInputs: Record<string, number> = {};
      
      // 1. Jeśli mamy już ustawiony budżet, pobieramy wartości dla kategorii
      if (currentBudget && currentBudget.categoryBudgets) {
        currentBudget.categoryBudgets.forEach((cb) => {
          if (cb.categoryId && cb.budget !== undefined) {
            initialInputs[cb.categoryId] = cb.budget;
          }
        });
      }
      setInputs(initialInputs);
    }
  }, [open, currentBudget, categories]);

  // Obsługa zmiany w inpucie
  const handleChange = (categoryId: string, value: string) => {
    const numValue = parseFloat(value);
    setInputs((prev) => ({
      ...prev,
      [categoryId]: isNaN(numValue) || numValue < 0 ? 0 : numValue,
    }));
  };

  // Obliczanie sumy całkowitej na żywo
  const totalSum = Object.values(inputs).reduce((sum, val) => sum + val, 0);

  const handleSave = () => {
    // Przygotowujemy listę w formacie, którego oczekuje API (NewCategoryBudget)
    const categoryBudgetsPayload: NewCategoryBudget[] = categories.map(cat => ({
      categoryId: cat.categoryId!, // Wykrzyknik bo zakładamy że ID istnieje
      budget: inputs[cat.categoryId!] || 0
    }));

    // Wysyłamy sumę oraz listę szczegółową
    onSave(totalSum, categoryBudgetsPayload);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Set Category Budgets</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Assign budgets to specific categories. The total monthly budget will be calculated automatically.
          </Typography>

          {categories.map((cat) => (
            <Box key={cat.categoryId} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ flex: 1, fontWeight: 500 }}>{cat.name}</Typography>
              <TextField
                type="number"
                size="small"
                sx={{ width: '140px' }}
                value={inputs[cat.categoryId!] || ''}
                onChange={(e) => handleChange(cat.categoryId!, e.target.value)}
                placeholder="0"
                InputProps={{
                  endAdornment: <InputAdornment position="end">PLN</InputAdornment>,
                }}
              />
            </Box>
          ))}
        </Box>
      </DialogContent>
      
      {/* Podsumowanie na dole */}
      <Box sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'action.hover' }}>
        <Typography variant="subtitle1" fontWeight="bold">Total Budget:</Typography>
        <Typography variant="h6" color="primary">{totalSum.toFixed(2)} PLN</Typography>
      </Box>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save Budgets</Button>
      </DialogActions>
    </Dialog>
  );
}