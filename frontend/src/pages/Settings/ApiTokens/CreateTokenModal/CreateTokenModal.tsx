import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Box,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { getWorkspaceColors } from '../../../../styles/theme';
import { useTheme as useMuiTheme } from '@mui/material/styles';

const StyledDialog = styled(Dialog)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    '& .MuiDialog-paper': {
      backgroundColor: colors.background,
      borderRadius: '0.75rem',
      minWidth: '400px',
    },
  };
});

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    color: colors.text,
    fontWeight: 600,
    fontSize: '1rem',
    padding: '1.25rem 1.5rem 0.75rem',
  };
});

const StyledDialogContent = styled(DialogContent)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    padding: '1rem 1.5rem',
    color: colors.textSecondary,
  };
});

const StyledDialogActions = styled(DialogActions)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    padding: '0.75rem 1.5rem 1.25rem',
    borderTop: `1px solid ${colors.border}`,
  };
});

const CancelButton = styled(Box)(({ theme }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: colors.textSecondary,
    backgroundColor: 'transparent',
    border: `1px solid ${colors.border}`,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    '&:hover': {
      backgroundColor: colors.backgroundHover,
      color: colors.text,
    },
  };
});

const CreateButton = styled(Box)<{ disabled?: boolean }>(({ theme, disabled }) => {
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: '#fff',
    backgroundColor: disabled ? colors.textSecondary : colors.primary,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.15s ease',
    '&:hover': {
      backgroundColor: disabled ? colors.textSecondary : colors.primaryHover,
    },
  };
});

const expirationOptions = [
  { value: 0, label: 'Never expires' },
  { value: 7, label: '7 days' },
  { value: 30, label: '30 days' },
  { value: 90, label: '90 days' },
  { value: 365, label: '1 year' },
];

interface CreateTokenModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, expiresInDays?: number) => Promise<void>;
}

const CreateTokenModal = ({ open, onClose, onCreate }: CreateTokenModalProps) => {
  const muiTheme = useMuiTheme();
  const colors = getWorkspaceColors(muiTheme.palette.mode === 'dark');
  
  const [name, setName] = useState('');
  const [expiresInDays, setExpiresInDays] = useState<number>(30);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || loading) return;
    
    setLoading(true);
    try {
      await onCreate(name.trim(), expiresInDays || undefined);
      setName('');
      setExpiresInDays(30);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setName('');
    setExpiresInDays(30);
    onClose();
  };

  return (
    <StyledDialog open={open} onClose={handleClose}>
      <StyledDialogTitle>Create API Token</StyledDialogTitle>
      <StyledDialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
          <TextField
            label="Token Name"
            placeholder="My API Token"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: colors.backgroundTertiary,
                '& fieldset': {
                  borderColor: colors.border,
                },
                '&:hover fieldset': {
                  borderColor: colors.textSecondary,
                },
                '&.Mui-focused fieldset': {
                  borderColor: colors.primary,
                },
              },
              '& .MuiInputLabel-root': {
                color: colors.textSecondary,
              },
              '& .MuiInputBase-input': {
                color: colors.text,
              },
            }}
          />
          <TextField
            select
            label="Expiration"
            value={expiresInDays}
            onChange={(e) => setExpiresInDays(Number(e.target.value))}
            fullWidth
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: colors.backgroundTertiary,
                '& fieldset': {
                  borderColor: colors.border,
                },
                '&:hover fieldset': {
                  borderColor: colors.textSecondary,
                },
                '&.Mui-focused fieldset': {
                  borderColor: colors.primary,
                },
              },
              '& .MuiInputLabel-root': {
                color: colors.textSecondary,
              },
              '& .MuiSelect-select': {
                color: colors.text,
              },
            }}
          >
            {expirationOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </StyledDialogContent>
      <StyledDialogActions>
        <CancelButton onClick={handleClose}>Cancel</CancelButton>
        <CreateButton
          disabled={!name.trim() || loading}
          onClick={handleCreate}
        >
          {loading && <CircularProgress size={14} sx={{ color: 'inherit' }} />}
          Create Token
        </CreateButton>
      </StyledDialogActions>
    </StyledDialog>
  );
};

export default CreateTokenModal;
