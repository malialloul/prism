import { Box, TextField, MenuItem, Tooltip } from '@mui/material';
import KeyIcon from '@mui/icons-material/Key';
import {
  TryItSection,
  SectionTitle,
  ParameterRow,
  ParameterLabel,
  ParameterInput,
  ParameterType,
} from './ApisPage.styles';
import type { ColumnInfo } from './ApisPage.types';

interface ColumnInputFormProps {
  columns: ColumnInfo[];
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
  title?: string;
  description?: string;
  /** Hide auto-increment PKs (for POST) */
  hideAutoIncrementPK?: boolean;
  /** Disable PK columns (for PUT/PATCH) */
  disablePrimaryKeys?: boolean;
  /** Disable FK columns */
  disableForeignKeys?: boolean;
}

export default function ColumnInputForm({
  columns,
  values,
  onChange,
  title = 'Data',
  description,
  hideAutoIncrementPK = false,
  disablePrimaryKeys = false,
  disableForeignKeys = false,
}: ColumnInputFormProps) {
  const handleChange = (columnName: string, value: string) => {
    onChange({ ...values, [columnName]: value });
  };

  const getInputType = (colType: string): string => {
    switch (colType) {
      case 'number':
        return 'number';
      case 'date':
        return 'date';
      case 'datetime':
        return 'datetime-local';
      default:
        return 'text';
    }
  };

  const getPlaceholder = (col: ColumnInfo): string => {
    switch (col.type) {
      case 'string':
        return `Enter ${col.name}`;
      case 'number':
        return '0';
      case 'boolean':
        return 'true/false';
      case 'date':
        return 'YYYY-MM-DD';
      case 'datetime':
        return 'YYYY-MM-DDTHH:mm';
      default:
        return `Enter ${col.name}`;
    }
  };

  // Filter columns based on settings
  const visibleColumns = columns.filter(col => {
    // Hide auto-increment PKs for POST
    if (hideAutoIncrementPK && col.isPrimaryKey && col.isAutoIncrement) {
      return false;
    }
    return true;
  });

  // Check if column should be disabled
  const isColumnDisabled = (col: ColumnInfo): boolean => {
    if (disablePrimaryKeys && col.isPrimaryKey) return true;
    if (disableForeignKeys && col.isForeignKey) return true;
    return false;
  };

  // Get tooltip for disabled column
  const getDisabledTooltip = (col: ColumnInfo): string => {
    if (col.isPrimaryKey) return 'Primary key cannot be modified';
    if (col.isForeignKey) return 'Foreign key cannot be modified';
    return '';
  };

  if (visibleColumns.length === 0) return null;

  return (
    <TryItSection sx={{ py: 1.5 }}>
      <SectionTitle>{title}</SectionTitle>
      {description && (
        <Box sx={{ fontSize: '0.7rem', color: 'text.secondary', mb: 1 }}>
          {description}
        </Box>
      )}
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {visibleColumns.map((col) => {
          const disabled = isColumnDisabled(col);
          const tooltip = getDisabledTooltip(col);
          
          return (
            <ParameterRow key={col.name} style={{ opacity: disabled ? 0.6 : 1 }}>
              <ParameterLabel sx={{ minWidth: '100px', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {col.name}
                {col.isPrimaryKey && (
                  <Tooltip title="Primary Key">
                    <KeyIcon sx={{ fontSize: '0.85rem', color: 'warning.main' }} />
                  </Tooltip>
                )}
                {col.isForeignKey && (
                  <Tooltip title="Foreign Key">
                    <KeyIcon sx={{ fontSize: '0.85rem', color: 'info.main' }} />
                  </Tooltip>
                )}
              </ParameterLabel>
              
              <Tooltip title={tooltip} disableHoverListener={!disabled}>
                <Box sx={{ flex: 1, display: 'flex' }}>
                  {col.type === 'boolean' ? (
                    <TextField
                      select
                      size="small"
                      disabled={disabled}
                      value={values[col.name] || ''}
                      onChange={(e) => handleChange(col.name, e.target.value)}
                      sx={{ 
                        flex: 1,
                        '& .MuiInputBase-root': { fontSize: '0.8rem' },
                        '& .MuiSelect-select': { py: 0.75 }
                      }}
                      SelectProps={{ displayEmpty: true }}
                    >
                      <MenuItem value=""><em>Not set</em></MenuItem>
                      <MenuItem value="true">true</MenuItem>
                      <MenuItem value="false">false</MenuItem>
                    </TextField>
                  ) : col.type === 'enum' && col.enumValues ? (
                    <TextField
                      select
                      size="small"
                      disabled={disabled}
                      value={values[col.name] || ''}
                      onChange={(e) => handleChange(col.name, e.target.value)}
                      sx={{ 
                        flex: 1,
                        '& .MuiInputBase-root': { fontSize: '0.8rem' },
                        '& .MuiSelect-select': { py: 0.75 }
                      }}
                      SelectProps={{ displayEmpty: true }}
                    >
                      <MenuItem value=""><em>Select {col.name}</em></MenuItem>
                      {col.enumValues.map(v => (
                        <MenuItem key={v} value={v}>{v}</MenuItem>
                      ))}
                    </TextField>
                  ) : (
                    <ParameterInput
                      type={getInputType(col.type)}
                      placeholder={disabled ? 'Cannot be modified' : getPlaceholder(col)}
                      disabled={disabled}
                      value={values[col.name] || ''}
                      onChange={(e) => handleChange(col.name, e.target.value)}
                      style={{ flex: 1 }}
                    />
                  )}
                </Box>
              </Tooltip>
              
              <ParameterType>{col.type}</ParameterType>
            </ParameterRow>
          );
        })}
      </Box>
    </TryItSection>
  );
}
