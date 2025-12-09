import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';

export type ExpenseItemData = {
  expenseItemId?: string;
  productName: string;
  price: number; // Zmieniamy typ na number | string w formularzu, żeby obsłużyć pusty input, ale w typie zostawiamy number
  quantity: number;
  categoryId: string;
};

export type ExpenseFormData = {
  id?: string;
  description: string;
  transactionDate: string;
  items: ExpenseItemData[];
};

interface ExpenseDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseFormData) => void;
  initialData?: ExpenseFormData | null;
  categories: { id: string; name: string }[];
}

export default function ExpenseDialog({ open, onClose, onSubmit, initialData, categories }: ExpenseDialogProps) {
  // Stan formularza
  const [formData, setFormData] = React.useState<ExpenseFormData>({
    description: '',
    transactionDate: new Date().toISOString().slice(0, 16),
    items: []
  });

  // Stan walidacji - czy pokazać błędy (czerwone ramki)
  const [showErrors, setShowErrors] = React.useState(false);

  // Resetowanie formularza przy otwarciu
  React.useEffect(() => {
    if (open) {
      setShowErrors(false); // Reset błędów przy otwarciu
      if (initialData) {
        setFormData({
          ...initialData,
          transactionDate: initialData.transactionDate ? initialData.transactionDate.slice(0, 16) : new Date().toISOString().slice(0, 16)
        });
      } else {
        // Domyślny stan przy dodawaniu
        setFormData({
          description: '',
          transactionDate: new Date().toISOString().slice(0, 16),
          items: [{ productName: '', price: 0, quantity: 1, categoryId: '' }]
        });
      }
    }
  }, [open, initialData]);

  const handleDetailsChange = (field: keyof ExpenseFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: keyof ExpenseItemData, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { productName: '', price: 0, quantity: 1, categoryId: '' }]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // --- GŁÓWNA LOGIKA "LAZY UX" ---
  const handleSubmit = () => {
    // 1. Walidacja: Sprawdź czy ceny są uzupełnione (> 0)
    // Jeśli cena jest 0 lub pusta, blokujemy zapis i pokazujemy błędy
    const hasInvalidPrice = formData.items.some(item => !item.price || item.price <= 0);
    
    if (hasInvalidPrice) {
      setShowErrors(true); // To zapali czerwone lampki przy polach Price
      return; // Stop, nie wysyłamy
    }

    // 2. Znajdź kategorię domyślną ("Other", "Inne" lub po prostu pierwszą z listy)
    // Żeby backend nie krzyczał, że kategoria jest pusta
    const defaultCategory = categories.find(c => c.name === "Other" || c.name === "Inne") || categories[0];
    const defaultCategoryId = defaultCategory ? defaultCategory.id : ""; 

    // 3. Przygotuj dane z "Lazy Defaults" (wypełnij puste pola automatami)
    const finalData: ExpenseFormData = {
      ...formData,
      // Jeśli opis pusty -> "Expense RRRR-MM-DD"
      description: formData.description.trim() || `Expense ${formData.transactionDate.slice(0, 10)}`,
      items: formData.items.map((item, index) => ({
        ...item,
        // Jeśli produkt pusty -> "Product 1", "Product 2"...
        productName: item.productName.trim() || `Product ${index + 1}`,
        // Jeśli kategoria pusta -> Domyślna (Other lub pierwsza)
        categoryId: item.categoryId || defaultCategoryId
      }))
    };

    onSubmit(finalData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{initialData ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {/* DESCRIPTION - z placeholderem mówiącym co się stanie jak nie wpiszesz */}
          <TextField
            label="Description"
            placeholder={`e.g. Expense ${formData.transactionDate.slice(0, 10)}`}
            fullWidth
            value={formData.description}
            onChange={(e) => handleDetailsChange('description', e.target.value)}
          />
          <TextField
            label="Date & Time"
            type="datetime-local"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formData.transactionDate}
            onChange={(e) => handleDetailsChange('transactionDate', e.target.value)}
          />

          <Divider sx={{ my: 2 }}>ITEMS</Divider>
          
          {formData.items.map((item, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 1 }}>
              {/* PRODUCT NAME - z placeholderem */}
              <TextField
                label="Product"
                placeholder={`Product ${index + 1}`}
                size="small"
                sx={{ flex: 2 }}
                value={item.productName}
                onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
              />
              
              {/* PRICE - Walidacja Required */}
              <TextField
                label="Price"
                type="number"
                size="small"
                sx={{ flex: 1 }}
                value={item.price === 0 ? '' : item.price} // Żeby nie wyświetlało "0" tylko puste pole dla wygody
                onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value))}
                error={showErrors && (!item.price || item.price <= 0)} // Czerwona ramka
                helperText={showErrors && (!item.price || item.price <= 0) ? "Required" : ""}
              />
              
               <TextField
                label="Qty"
                type="number"
                size="small"
                sx={{ width: '80px' }}
                value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
              />
              
              {/* CATEGORY - z placeholderem "Default: Other" */}
              <TextField
                select
                label="Category"
                size="small"
                sx={{ flex: 1.5 }}
                value={item.categoryId}
                onChange={(e) => handleItemChange(index, 'categoryId', e.target.value)}
              >
                {/* Opcja "Wyczyść wybór" (opcjonalnie, żeby zadziałał automat) */}
                <MenuItem value="">
                  <em>Auto (Other)</em>
                </MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </TextField>
              
              <IconButton color="error" onClick={() => removeItem(index)} sx={{ mt: 0.5 }}>
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          
          <Button startIcon={<AddIcon />} onClick={addItem} variant="outlined" size="small">
            Add Item
          </Button>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {/* Save wywołuje naszą nową logikę handleSubmit */}
        <Button onClick={handleSubmit} variant="contained">
          {initialData ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}