import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
} from '@mui/material';
import { useState } from 'react';

interface SaveApiDialogProps {
  open: boolean;
  onSave: (name: string, description: string) => Promise<void>;
  onClose: () => void;
  selectedTables: Array<{ id: string; name: string }>;
  selectedFields: Array<{ tableId: string; columnName: string }>;
}

export function SaveApiDialog({
  open,
  onSave,
  onClose,
  selectedTables,
  selectedFields,
}: SaveApiDialogProps) {
  const [apiName, setApiName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!apiName.trim()) {
      setError('Please enter an API name');
      return;
    }

    try {
      setError('');
      setIsSaving(true);
      await onSave(apiName, description);
      setApiName('');
      setDescription('');
    } catch (err: any) {
      setError(err.message || 'Failed to save API');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Save as API Endpoint</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
        {error && (
          <Box sx={{ padding: '0.75rem', backgroundColor: 'rgba(211, 47, 47, 0.08)', borderRadius: '4px', color: '#c62828', fontSize: '0.9rem' }}>
            {error}
          </Box>
        )}

        <Box>
          <Box sx={{ fontSize: '0.9rem', fontWeight: 500, mb: 1 }}>Query Summary</Box>
          <Box
            sx={{
              padding: '1rem',
              backgroundColor: 'rgba(0,0,0,0.04)',
              borderRadius: '6px',
              fontSize: '0.85rem',
              color: 'text.secondary',
            }}
          >
            <Box sx={{ mb: 0.5 }}>
              📊 Tables: {selectedTables.map((t) => t.name).join(', ')}
            </Box>
            <Box sx={{ mb: 0.5 }}>
              ✓ Fields: {selectedFields.length} column{selectedFields.length !== 1 ? 's' : ''}
            </Box>
          </Box>
        </Box>

        <TextField
          fullWidth
          label="API Name"
          placeholder="e.g., Active Users Report"
          value={apiName}
          onChange={(e) => setApiName(e.target.value)}
          disabled={isSaving}
          autoFocus
          helperText="This will be the API endpoint name"
        />

        <TextField
          fullWidth
          label="Description (Optional)"
          placeholder="What does this API do?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isSaving}
          multiline
          rows={3}
          helperText="Help other users understand this query"
        />

        <Box
          sx={{
            padding: '0.75rem',
            backgroundColor: 'rgba(76, 175, 80, 0.08)',
            borderRadius: '4px',
            fontSize: '0.85rem',
            color: '#2e7d32',
          }}
        >
          ✓ Your API will be automatically generated and ready to use
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isSaving || !apiName.trim()}
        >
          {isSaving ? 'Saving...' : 'Save API'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
