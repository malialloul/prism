import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip,
} from '@mui/material';
import { useState, useEffect } from 'react';
import type { SQLParameter } from '../types';

interface SaveApiDialogProps {
  open: boolean;
  onSave: (name: string, description: string, method: string, isPublic: boolean) => void | Promise<void>;
  onClose: () => void;
  defaultName?: string;
  parameters?: SQLParameter[];
}

export function SaveApiDialog({
  open,
  onSave,
  onClose,
  defaultName = '',
  parameters = [],
}: SaveApiDialogProps) {
  const [apiName, setApiName] = useState(defaultName);
  const [description, setDescription] = useState('');
  const [method, setMethod] = useState('GET');
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setApiName(defaultName);
      setDescription('');
      setMethod('GET');
      setIsPublic(false);
      setError('');
    }
  }, [open, defaultName]);

  const handleSave = async () => {
    if (!apiName.trim()) {
      setError('Please enter an API name');
      return;
    }

    try {
      setError('');
      setIsSaving(true);
      await onSave(apiName, description, method, isPublic);
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
      <DialogTitle sx={{ color: '#e0e0e0', backgroundColor: '#12121a' }}>
        Save as API Endpoint
      </DialogTitle>
      <DialogContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          pt: 2,
          backgroundColor: '#12121a',
        }}
      >
        {error && (
          <Box
            sx={{
              padding: '0.75rem',
              backgroundColor: 'rgba(211, 47, 47, 0.15)',
              borderRadius: '4px',
              color: '#ef5350',
              fontSize: '0.9rem',
            }}
          >
            {error}
          </Box>
        )}

        {/* Parameters Summary */}
        {parameters.length > 0 && (
          <Box>
            <Box sx={{ fontSize: '0.9rem', fontWeight: 500, mb: 1, color: '#b0b0b0' }}>
              API Parameters
            </Box>
            <Box
              sx={{
                padding: '1rem',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderRadius: '6px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
              }}
            >
              {parameters.map((param) => (
                <Chip
                  key={param.name}
                  label={`@${param.name}`}
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(102, 126, 234, 0.2)',
                    color: '#667eea',
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        <TextField
          fullWidth
          label="API Name"
          placeholder="e.g., get-active-users"
          value={apiName}
          onChange={(e) => setApiName(e.target.value)}
          disabled={isSaving}
          autoFocus
          helperText="This will be used in the API endpoint URL"
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
              '&:hover fieldset': { borderColor: 'rgba(102, 126, 234, 0.3)' },
              '&.Mui-focused fieldset': { borderColor: '#667eea' },
            },
            '& .MuiInputBase-input': { color: '#e0e0e0' },
            '& .MuiInputLabel-root': { color: '#808080' },
            '& .MuiFormHelperText-root': { color: '#666' },
          }}
        />

        <TextField
          fullWidth
          label="Description (Optional)"
          placeholder="What does this API do?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isSaving}
          multiline
          rows={2}
          helperText="Help other users understand this query"
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
              '&:hover fieldset': { borderColor: 'rgba(102, 126, 234, 0.3)' },
              '&.Mui-focused fieldset': { borderColor: '#667eea' },
            },
            '& .MuiInputBase-input': { color: '#e0e0e0' },
            '& .MuiInputLabel-root': { color: '#808080' },
            '& .MuiFormHelperText-root': { color: '#666' },
          }}
        />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel sx={{ color: '#808080' }}>Method</InputLabel>
            <Select
              value={method}
              label="Method"
              onChange={(e) => setMethod(e.target.value)}
              disabled={isSaving}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                color: '#e0e0e0',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(102, 126, 234, 0.3)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#667eea',
                },
                '& .MuiSvgIcon-root': { color: '#808080' },
              }}
            >
              <MenuItem value="GET">GET</MenuItem>
              <MenuItem value="POST">POST</MenuItem>
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                disabled={isSaving}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#667eea',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#667eea',
                  },
                }}
              />
            }
            label="Public API"
            sx={{
              color: '#b0b0b0',
              '& .MuiFormControlLabel-label': { fontSize: '0.9rem' },
            }}
          />
        </Box>

        <Box
          sx={{
            padding: '0.75rem',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            borderRadius: '4px',
            fontSize: '0.85rem',
            color: '#8fa4ee',
          }}
        >
          {isPublic
            ? '🌐 This API will be accessible without authentication'
            : '🔒 This API will require authentication'}
        </Box>
      </DialogContent>
      <DialogActions sx={{ backgroundColor: '#12121a', p: 2 }}>
        <Button
          onClick={onClose}
          disabled={isSaving}
          sx={{ color: '#808080' }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isSaving || !apiName.trim()}
          sx={{
            backgroundColor: '#667eea',
            '&:hover': { backgroundColor: '#5a6fd6' },
          }}
        >
          {isSaving ? 'Saving...' : 'Save API'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
