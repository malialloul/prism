import ApiIcon from '@mui/icons-material/Api';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Typography,
  Chip,
  TextField,
  InputAdornment,
} from '@mui/material';
import type { OpenApiHeaderProps } from './types';
import { getMethodColor } from './types';

export function OpenApiHeader({
  databaseName,
  apiCount,
  searchQuery,
  onSearchChange,
  filterMethod,
  onFilterChange,
  darkMode,
}: OpenApiHeaderProps) {
  return (
    <Box sx={{
      background: darkMode
        ? 'linear-gradient(135deg, #1a365d 0%, #2d3748 100%)'
        : 'linear-gradient(135deg, #89bf04 0%, #547f00 100%)',
      p: 3,
      color: '#fff',
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
            <ApiIcon /> {databaseName} API
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
            {apiCount} endpoints available • Custom APIs
          </Typography>
        </Box>
        
      </Box>

      {/* Search and Filters */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search APIs..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{
            minWidth: 250,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: '#fff',
              '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
              '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
              '&.Mui-focused fieldset': { borderColor: '#fff' },
            },
            '& .MuiInputAdornment-root': { color: 'rgba(255,255,255,0.7)' },
            '& input::placeholder': { color: 'rgba(255,255,255,0.6)' },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
              </InputAdornment>
            ),
          }}
        />
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {['GET', 'POST', 'PUT', 'DELETE'].map(method => (
            <Chip
              key={method}
              label={method}
              size="small"
              onClick={() => onFilterChange(filterMethod === method ? null : method)}
              sx={{
                fontWeight: 700,
                fontSize: '0.7rem',
                backgroundColor: filterMethod === method
                  ? getMethodColor(method).bg
                  : 'rgba(255,255,255,0.15)',
                color: '#fff',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: filterMethod === method
                    ? getMethodColor(method).bg
                    : 'rgba(255,255,255,0.25)',
                },
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
