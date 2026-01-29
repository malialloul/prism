import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { getDashboardColors } from '../../../../styles/theme';

const StyledDialog = styled(Dialog)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    '& .MuiDialog-paper': {
      backgroundColor: colors.background,
      backgroundImage: 'none',
      minWidth: '500px',
    },
  };
});

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    borderBottom: `1px solid ${colors.border}`,
    color: colors.text,
  };
});

const StyledDialogContent = styled(DialogContent)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    paddingTop: '1.5rem !important',
    color: colors.text,
  };
});

const StyledDialogActions = styled(DialogActions)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    borderTop: `1px solid ${colors.border}`,
    padding: '1rem 1.5rem',
  };
});

const StyledTextField = styled(TextField)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    '& .MuiOutlinedInput-root': {
      backgroundColor: colors.backgroundSecondary,
      '& fieldset': {
        borderColor: colors.border,
      },
      '&:hover fieldset': {
        borderColor: colors.primary,
      },
      '&.Mui-focused fieldset': {
        borderColor: colors.primary,
      },
    },
    '& .MuiInputBase-input': {
      color: colors.text,
    },
    '& .MuiInputLabel-root': {
      color: colors.textSecondary,
    },
  };
});

const SqlPreview = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    marginTop: '1rem',
    padding: '0.75rem',
    backgroundColor: theme.palette.mode === 'dark' ? '#1e1e2e' : '#f8f8f8',
    borderRadius: '0.5rem',
    fontFamily: 'monospace',
    fontSize: '0.8rem',
    overflowX: 'auto',
    border: `1px solid ${colors.border}`,
    color: colors.text,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
  };
});

const ParamsContainer = styled(Box)(({ theme }) => {
  const colors = getDashboardColors(theme.palette.mode === 'dark');
  return {
    marginTop: '1rem',
    padding: '1rem',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: '0.5rem',
    border: `1px solid ${colors.border}`,
  };
});

interface SaveApiDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, description: string, paramNames: string[]) => void;
  sql: string;
  operation: string;
  isSaving: boolean;
}

export default function SaveApiDialog({
  open,
  onClose,
  onSave,
  sql,
  operation,
  isSaving,
}: SaveApiDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [paramNames, setParamNames] = useState<string[]>([]);

  // Extract parameter placeholders from SQL
  const detectedParams = useMemo(() => {
    if (!sql) return [];
    const pgParams = sql.match(/\$\d+/g) || [];
    const mysqlParams = sql.match(/\?/g) || [];
    return pgParams.length > 0 
      ? pgParams.map((_, i) => `param${i + 1}`)
      : mysqlParams.map((_, i) => `param${i + 1}`);
  }, [sql]);

  // Initialize param names from detected params
  useEffect(() => {
    if (open && detectedParams.length > 0) {
      setParamNames(detectedParams);
    }
  }, [open, detectedParams]);

  const handleUpdateParamName = (index: number, newName: string) => {
    setParamNames((prev) => {
      const updated = [...prev];
      updated[index] = newName;
      return updated;
    });
  };

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim(), description.trim(), paramNames);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setParamNames([]);
    onClose();
  };

  return (
    <StyledDialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <StyledDialogTitle>Save as API Endpoint</StyledDialogTitle>
      <StyledDialogContent>
        <StyledTextField
          autoFocus
          margin="dense"
          label="API Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Get Users by Order Total"
          helperText="This will be used to generate the API endpoint slug"
        />

        <StyledTextField
          margin="dense"
          label="Description"
          fullWidth
          multiline
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what this API does"
          sx={{ marginTop: '1rem' }}
        />

        <SqlPreview>
          <Typography variant="caption" color="textSecondary" sx={{ mb: 0.5, display: 'block' }}>
            SQL Query ({operation}):
          </Typography>
          <code>{sql}</code>
        </SqlPreview>

        {detectedParams.length > 0 && (
          <ParamsContainer>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Parameter Names ({detectedParams.length} detected)
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: 'block' }}>
              Define meaningful names for each parameter:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {paramNames.map((param, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ minWidth: '40px', color: 'text.secondary' }}>
                    {index + 1}:
                  </Typography>
                  <StyledTextField
                    size="small"
                    value={param}
                    onChange={(e) => handleUpdateParamName(index, e.target.value)}
                    placeholder={`Parameter ${index + 1}`}
                    sx={{ flex: 1 }}
                  />
                </Box>
              ))}
            </Box>
          </ParamsContainer>
        )}
      </StyledDialogContent>
      <StyledDialogActions>
        <Button onClick={handleClose} color="inherit" disabled={isSaving}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!name.trim() || isSaving}
        >
          {isSaving ? 'Saving...' : 'Save API'}
        </Button>
      </StyledDialogActions>
    </StyledDialog>
  );
}
