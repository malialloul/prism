import React, { useMemo, useState } from 'react';
import { Box, Checkbox, FormControlLabel, InputAdornment, Collapse, FormControl, InputLabel, MenuItem, Switch, Chip, IconButton, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import KeyIcon from '@mui/icons-material/VpnKey';
import LinkIcon from '@mui/icons-material/Link';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AddIcon from '@mui/icons-material/Add';
import CalculateIcon from '@mui/icons-material/Calculate';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FilterNoneIcon from '@mui/icons-material/FilterNone';
import TuneIcon from '@mui/icons-material/Tune';

import {
  SchemaTable,
  SchemaColumn,
  SelectedTable,
  TableJoin,
  SelectedField,
  ComputedField,
  ComputedOperator,
  DatabaseEngine,
  UniquenessSettings,
  COMPUTED_OPERATORS,
  getJoinedTables,
  generateId,
  getColumnCategory,
} from '../types';
import {
  StepContent,
  StepHeader,
  StepTitle,
  StepDescription,
  StepInstructions,
  SearchField,
  ListContainer,
  TypeBadge,
  Badge,
  Divider,
  StyledSelect,
  FormField,
  RemoveButton,
} from '../QueryWizard.styles';
import { alpha, styled } from '@mui/material/styles';

// Additional styles for this step
const TableSection = styled(Box)({
  border: '1px solid #2a2a3a',
  borderRadius: '10px',
  overflow: 'hidden',
  backgroundColor: '#12121a',
});

const TableHeader = styled(Box)<{ isExpanded?: boolean }>(({ isExpanded }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 16px',
  cursor: 'pointer',
  backgroundColor: isExpanded ? alpha('#667eea', 0.1) : 'transparent',
  transition: 'background-color 0.2s ease',
  '&:hover': {
    backgroundColor: alpha('#667eea', 0.08),
  },
}));

const TableName = styled(Box)({
  fontSize: '0.95rem',
  fontWeight: 600,
  color: '#e4e4e7',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

const ColumnList = styled(Box)({
  padding: '8px 0',
  borderTop: '1px solid #2a2a3a',
});

const ColumnItem = styled(Box)<{ isSelected?: boolean }>(({ isSelected }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 16px',
  cursor: 'pointer',
  backgroundColor: isSelected ? alpha('#667eea', 0.1) : 'transparent',
  transition: 'background-color 0.15s ease',
  '&:hover': {
    backgroundColor: isSelected ? alpha('#667eea', 0.15) : alpha('#ffffff', 0.03),
  },
}));

const ColumnInfo = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

const ColumnName = styled(Box)({
  fontSize: '0.85rem',
  color: '#e4e4e7',
});

const ColumnMeta = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

const SelectAllButton = styled(Box)({
  fontSize: '0.8rem',
  color: '#667eea',
  cursor: 'pointer',
  padding: '4px 8px',
  borderRadius: '4px',
  '&:hover': {
    backgroundColor: alpha('#667eea', 0.1),
  },
});

const ComputedSection = styled(Box)({
  marginTop: '24px',
  padding: '20px',
  backgroundColor: alpha('#f59e0b', 0.05),
  borderRadius: '10px',
  border: '1px solid #2a2a3a',
});

const ComputedCard = styled(Box)({
  padding: '16px',
  backgroundColor: '#12121a',
  borderRadius: '10px',
  border: '1px solid #2a2a3a',
  marginBottom: '12px',
});

const ComputedRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  flexWrap: 'wrap',
});

const AddComputedRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '12px',
  backgroundColor: '#0a0a0f',
  borderRadius: '8px',
  border: '1px dashed #2a2a3a',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  color: '#71717a',
  '&:hover': {
    borderColor: '#f59e0b',
    backgroundColor: alpha('#f59e0b', 0.05),
    color: '#fbbf24',
  },
});

// Uniqueness section styles
const UniquenessSection = styled(Box)({
  marginBottom: '20px',
  padding: '16px',
  backgroundColor: '#12121a',
  borderRadius: '10px',
  border: '1px solid #2a2a3a',
});

const UniquenessHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '12px',
});

const UniquenessTitle = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontSize: '0.9rem',
  fontWeight: 600,
  color: '#e4e4e7',
});

const UniquenessHelperText = styled(Box)({
  fontSize: '0.8rem',
  color: '#71717a',
  marginTop: '8px',
});

const DistinctOnSection = styled(Box)({
  marginTop: '16px',
  padding: '12px',
  backgroundColor: alpha('#667eea', 0.05),
  borderRadius: '8px',
  border: '1px solid #2a2a3a',
});

const DistinctOnChips = styled(Box)({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  marginTop: '12px',
});

const ModeToggle = styled(ToggleButtonGroup)({
  '& .MuiToggleButton-root': {
    padding: '4px 12px',
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'none',
    color: '#71717a',
    borderColor: '#2a2a3a',
    '&.Mui-selected': {
      backgroundColor: alpha('#667eea', 0.2),
      color: '#a5b4fc',
      borderColor: '#667eea',
      '&:hover': {
        backgroundColor: alpha('#667eea', 0.3),
      },
    },
    '&:hover': {
      backgroundColor: alpha('#ffffff', 0.05),
    },
  },
});

interface FieldsStepProps {
  tables: SchemaTable[];
  baseTable: SelectedTable;
  joins: TableJoin[];
  selectedFields: SelectedField[];
  computedFields: ComputedField[];
  uniqueness: UniquenessSettings;
  engine: DatabaseEngine;
  hasAggregations: boolean;
  onFieldsChange: (fields: SelectedField[]) => void;
  onComputedFieldsChange: (fields: ComputedField[]) => void;
  onUniquenessChange: (uniqueness: UniquenessSettings) => void;
}

export const FieldsStep: React.FC<FieldsStepProps> = ({
  tables,
  baseTable,
  joins,
  selectedFields,
  computedFields,
  uniqueness,
  engine,
  hasAggregations,
  onFieldsChange,
  onComputedFieldsChange,
  onUniquenessChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set([baseTable.name]));

  // Get all available tables
  const availableTables = useMemo(() => {
    const tableNames = getJoinedTables(baseTable, joins, tables);
    return tableNames
      .map((name) => tables.find((t) => t.name === name))
      .filter((t): t is SchemaTable => !!t);
  }, [baseTable, joins, tables]);

  // Filter columns by search
  const filteredTables = useMemo(() => {
    if (!searchQuery.trim()) return availableTables;
    const query = searchQuery.toLowerCase();
    return availableTables
      .map((table) => ({
        ...table,
        columns: table.columns.filter(
          (col) =>
            col.name.toLowerCase().includes(query) ||
            col.type.toLowerCase().includes(query)
        ),
      }))
      .filter((table) => table.columns.length > 0);
  }, [availableTables, searchQuery]);

  const isFieldSelected = (tableName: string, columnName: string): boolean => {
    return selectedFields.some((f) => f.table === tableName && f.column === columnName);
  };

  const getTableSelectedCount = (tableName: string): number => {
    return selectedFields.filter((f) => f.table === tableName).length;
  };

  const toggleField = (table: SchemaTable, column: SchemaColumn) => {
    const isSelected = isFieldSelected(table.name, column.name);
    if (isSelected) {
      onFieldsChange(
        selectedFields.filter((f) => !(f.table === table.name && f.column === column.name))
      );
    } else {
      onFieldsChange([
        ...selectedFields,
        {
          id: generateId(),
          table: table.name,
          column: column.name,
          alias: null,
        },
      ]);
    }
  };

  const selectAllFromTable = (table: SchemaTable) => {
    const currentTableFields = selectedFields.filter((f) => f.table === table.name);
    const allSelected = currentTableFields.length === table.columns.length;

    if (allSelected) {
      // Deselect all from this table
      onFieldsChange(selectedFields.filter((f) => f.table !== table.name));
    } else {
      // Select all from this table
      const otherFields = selectedFields.filter((f) => f.table !== table.name);
      const newFields = table.columns.map((col) => ({
        id: generateId(),
        table: table.name,
        column: col.name,
        alias: null,
      }));
      onFieldsChange([...otherFields, ...newFields]);
    }
  };

  const toggleExpanded = (tableName: string) => {
    const newExpanded = new Set(expandedTables);
    if (newExpanded.has(tableName)) {
      newExpanded.delete(tableName);
    } else {
      newExpanded.add(tableName);
    }
    setExpandedTables(newExpanded);
  };

  const getColumnIcon = (column: SchemaColumn) => {
    if (column.isPrimaryKey) {
      return <KeyIcon sx={{ fontSize: '0.9rem', color: '#f59e0b' }} />;
    }
    if (column.foreignKey) {
      return <LinkIcon sx={{ fontSize: '0.9rem', color: '#667eea' }} />;
    }
    return null;
  };

  // Get all numeric columns for computed fields
  const numericColumns = useMemo(() => {
    const columns: Array<{ table: string; column: string; type: string }> = [];
    availableTables.forEach((table) => {
      table.columns.forEach((col) => {
        if (getColumnCategory(col.type) === 'number') {
          columns.push({ table: table.name, column: col.name, type: col.type });
        }
      });
    });
    return columns;
  }, [availableTables]);

  const handleAddComputedField = () => {
    if (numericColumns.length < 2) return;
    const first = numericColumns[0];
    const second = numericColumns[1] || first;
    
    const newField: ComputedField = {
      id: generateId(),
      leftTable: first.table,
      leftColumn: first.column,
      operator: '*',
      rightTable: second.table,
      rightColumn: second.column,
      alias: `computed_${computedFields.length + 1}`,
    };
    onComputedFieldsChange([...computedFields, newField]);
  };

  const handleRemoveComputedField = (fieldId: string) => {
    onComputedFieldsChange(computedFields.filter((f) => f.id !== fieldId));
  };

  const handleComputedFieldChange = (
    fieldId: string,
    updates: Partial<ComputedField>
  ) => {
    onComputedFieldsChange(
      computedFields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f))
    );
  };

  // Get all available columns for DISTINCT ON
  const allColumns = useMemo(() => {
    const columns: Array<{ table: string; column: string }> = [];
    availableTables.forEach((table) => {
      table.columns.forEach((col) => {
        columns.push({ table: table.name, column: col.name });
      });
    });
    return columns;
  }, [availableTables]);

  // Uniqueness handlers
  const handleUniquenessToggle = (enabled: boolean) => {
    onUniquenessChange({
      ...uniqueness,
      enabled,
      // Reset mode to simple when enabling
      mode: enabled ? 'simple' : uniqueness.mode,
    });
  };

  const handleUniquenessMode = (mode: 'simple' | 'distinctOn') => {
    onUniquenessChange({
      ...uniqueness,
      mode,
      distinctOnColumns: mode === 'simple' ? [] : uniqueness.distinctOnColumns,
    });
  };

  const handleToggleDistinctOnColumn = (table: string, column: string) => {
    const exists = uniqueness.distinctOnColumns.some(
      (c) => c.table === table && c.column === column
    );
    if (exists) {
      onUniquenessChange({
        ...uniqueness,
        distinctOnColumns: uniqueness.distinctOnColumns.filter(
          (c) => !(c.table === table && c.column === column)
        ),
      });
    } else {
      onUniquenessChange({
        ...uniqueness,
        distinctOnColumns: [...uniqueness.distinctOnColumns, { table, column }],
      });
    }
  };

  const handleDistinctOnDirectionChange = (table: string, column: string, direction: 'ASC' | 'DESC' | null) => {
    onUniquenessChange({
      ...uniqueness,
      distinctOnColumns: uniqueness.distinctOnColumns.map((c) =>
        c.table === table && c.column === column 
          ? { table: c.table, column: c.column, ...(direction ? { direction } : {}) } 
          : c
      ),
    });
  };

  const isDistinctOnColumnSelected = (table: string, column: string): boolean => {
    return uniqueness.distinctOnColumns.some(
      (c) => c.table === table && c.column === column
    );
  };

  // Disable uniqueness when aggregations are enabled
  const uniquenessDisabled = hasAggregations;

  return (
    <StepContent>
      <StepHeader>
        <StepTitle>Select Data Fields</StepTitle>
        <StepDescription>
          Choose which columns you want to include in your results.
          You can select fields from any of the linked tables.
        </StepDescription>
      </StepHeader>

      <StepInstructions>
        <LightbulbIcon fontSize="small" />
        <span>
          <strong>Tip:</strong> Select only the fields you need for better performance. 
          Selecting all fields from large tables may slow down your query.
        </span>
      </StepInstructions>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <SearchField
          fullWidth
          placeholder="Search columns..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#52525b' }} />
              </InputAdornment>
            ),
          }}
        />
        <Badge
          colorVariant={selectedFields.length > 0 ? 'primary' : 'neutral'}
          label={`${selectedFields.length} selected`}
        />
      </Box>

      {/* Uniqueness Section */}
      <UniquenessSection sx={{ opacity: uniquenessDisabled ? 0.5 : 1 }}>
        <UniquenessHeader>
          <UniquenessTitle>
            <FilterNoneIcon sx={{ fontSize: '1.1rem', color: '#667eea' }} />
            Remove Duplicate Rows
          </UniquenessTitle>
          <Switch
            checked={uniqueness.enabled && !uniquenessDisabled}
            onChange={(e) => handleUniquenessToggle(e.target.checked)}
            disabled={uniquenessDisabled}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: '#667eea',
                '& + .MuiSwitch-track': {
                  backgroundColor: '#667eea',
                },
              },
            }}
          />
        </UniquenessHeader>
        <UniquenessHelperText>
          {uniquenessDisabled
            ? 'Cannot use uniqueness when aggregations are enabled (calculations automatically group data)'
            : 'Returns only unique combinations of the selected fields'}
        </UniquenessHelperText>

        {/* PostgreSQL DISTINCT ON option - only available for PostgreSQL */}
        {uniqueness.enabled && !uniquenessDisabled && engine === 'postgres' && (
          <DistinctOnSection>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Tooltip title="DISTINCT ON is PostgreSQL only. It returns the first row for each unique combination based on ORDER BY." arrow>
                <Box sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#a5b4fc', cursor: 'help' }}>
                  <TuneIcon sx={{ fontSize: '0.9rem', mr: 0.5, verticalAlign: 'middle' }} />
                  Uniqueness Mode
                </Box>
              </Tooltip>
            </Box>
            <ModeToggle
              value={uniqueness.mode}
              exclusive
              onChange={(_, val) => val && handleUniquenessMode(val)}
              size="small"
            >
              <ToggleButton value="simple">Simple (DISTINCT)</ToggleButton>
              <Tooltip title="Returns first row per unique combination. Columns selected here must appear first in ORDER BY." arrow>
                <ToggleButton value="distinctOn">By Specific Fields (DISTINCT ON)</ToggleButton>
              </Tooltip>
            </ModeToggle>

            {uniqueness.mode === 'distinctOn' && (
              <>
                <UniquenessHelperText sx={{ mt: 2 }}>
                  Select columns to determine uniqueness. First row for each unique combination will be returned.
                  <br />
                  <span style={{ color: '#f59e0b' }}>Note:</span> The sort direction determines which row is kept for duplicates.
                </UniquenessHelperText>
                <DistinctOnChips>
                  {allColumns.slice(0, 30).map((col) => (
                    <Chip
                      key={`${col.table}.${col.column}`}
                      label={`${col.table}.${col.column}`}
                      size="small"
                      variant={isDistinctOnColumnSelected(col.table, col.column) ? 'filled' : 'outlined'}
                      onClick={() => handleToggleDistinctOnColumn(col.table, col.column)}
                      sx={{
                        backgroundColor: isDistinctOnColumnSelected(col.table, col.column)
                          ? alpha('#667eea', 0.3)
                          : 'transparent',
                        borderColor: isDistinctOnColumnSelected(col.table, col.column)
                          ? '#667eea'
                          : '#2a2a3a',
                        color: isDistinctOnColumnSelected(col.table, col.column)
                          ? '#e4e4e7'
                          : '#71717a',
                        '&:hover': {
                          backgroundColor: alpha('#667eea', 0.2),
                          borderColor: '#667eea',
                        },
                      }}
                    />
                  ))}
                  {allColumns.length > 30 && (
                    <Box sx={{ fontSize: '0.75rem', color: '#71717a', alignSelf: 'center' }}>
                      +{allColumns.length - 30} more
                    </Box>
                  )}
                </DistinctOnChips>
                {/* Selected columns with direction toggles */}
                {uniqueness.distinctOnColumns.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ fontSize: '0.8rem', color: '#71717a', mb: 1 }}>
                      Selected columns (click to toggle sort direction):
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {uniqueness.distinctOnColumns.map((col) => (
                        <Box
                          key={`selected-${col.table}.${col.column}`}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            backgroundColor: alpha('#667eea', 0.15),
                            border: '1px solid',
                            borderColor: '#667eea',
                          }}
                        >
                          <Box sx={{ fontSize: '0.85rem', color: '#e4e4e7' }}>
                            {col.table}.{col.column}
                          </Box>
                          <ToggleButtonGroup
                            size="small"
                            exclusive
                            value={col.direction || null}
                            onChange={(_, val) => handleDistinctOnDirectionChange(col.table, col.column, val)}
                            sx={{
                              '& .MuiToggleButton-root': {
                                padding: '2px 10px',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                borderColor: '#3a3a4a',
                                color: '#71717a',
                                '&.Mui-selected': {
                                  backgroundColor: alpha('#667eea', 0.3),
                                  color: '#a5b4fc',
                                  borderColor: '#667eea',
                                  '&:hover': {
                                    backgroundColor: alpha('#667eea', 0.4),
                                  },
                                },
                                '&:hover': {
                                  backgroundColor: alpha('#667eea', 0.15),
                                },
                              },
                            }}
                          >
                            <ToggleButton value="ASC">ASC</ToggleButton>
                            <ToggleButton value="DESC">DESC</ToggleButton>
                          </ToggleButtonGroup>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
                {uniqueness.distinctOnColumns.length === 0 && (
                  <Box sx={{ mt: 1, fontSize: '0.75rem', color: '#f59e0b' }}>
                    Select at least one column for DISTINCT ON
                  </Box>
                )}
              </>
            )}
          </DistinctOnSection>
        )}
      </UniquenessSection>

      <ListContainer sx={{ gap: '12px' }}>
        {filteredTables.map((table) => {
          const isExpanded = expandedTables.has(table.name);
          const selectedCount = getTableSelectedCount(table.name);
          const allSelected = selectedCount === table.columns.length;

          return (
            <TableSection key={table.name}>
              <TableHeader isExpanded={isExpanded} onClick={() => toggleExpanded(table.name)}>
                <TableName>
                  <ViewColumnIcon sx={{ fontSize: '1.1rem', color: '#667eea' }} />
                  {table.name}
                  {selectedCount > 0 && (
                    <Badge
                      colorVariant="success"
                      label={`${selectedCount}/${table.columns.length}`}
                      size="small"
                    />
                  )}
                </TableName>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <SelectAllButton
                    onClick={(e) => {
                      e.stopPropagation();
                      selectAllFromTable(table);
                    }}
                  >
                    {allSelected ? 'Deselect All' : 'Select All'}
                  </SelectAllButton>
                  {isExpanded ? (
                    <ExpandLessIcon sx={{ color: '#71717a' }} />
                  ) : (
                    <ExpandMoreIcon sx={{ color: '#71717a' }} />
                  )}
                </Box>
              </TableHeader>

              <Collapse in={isExpanded}>
                <ColumnList>
                  {table.columns.map((column) => {
                    const isSelected = isFieldSelected(table.name, column.name);
                    return (
                      <ColumnItem
                        key={column.name}
                        isSelected={isSelected}
                        onClick={() => toggleField(table, column)}
                      >
                        <ColumnInfo>
                          <Checkbox
                            checked={isSelected}
                            size="small"
                            icon={<CheckBoxOutlineBlankIcon sx={{ color: '#52525b' }} />}
                            checkedIcon={<CheckBoxIcon sx={{ color: '#667eea' }} />}
                            sx={{ padding: 0 }}
                          />
                          {getColumnIcon(column)}
                          <ColumnName>{column.name}</ColumnName>
                        </ColumnInfo>
                        <ColumnMeta>
                          <TypeBadge>{column.type}</TypeBadge>
                          {!column.nullable && (
                            <Badge colorVariant="warning" label="required" size="small" />
                          )}
                        </ColumnMeta>
                      </ColumnItem>
                    );
                  })}
                </ColumnList>
              </Collapse>
            </TableSection>
          );
        })}
      </ListContainer>

      {filteredTables.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4, color: '#71717a' }}>
          No columns match your search
        </Box>
      )}

      {/* Computed Fields Section */}
      {numericColumns.length >= 2 && (
        <ComputedSection>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', mb: 2 }}>
            <CalculateIcon sx={{ color: '#f59e0b' }} />
            <Box sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#fbbf24' }}>
              Computed Fields
            </Box>
            {computedFields.length > 0 && (
              <Badge colorVariant="warning" label={`${computedFields.length}`} size="small" />
            )}
          </Box>

          <StepInstructions sx={{ mb: 2 }}>
            <LightbulbIcon fontSize="small" />
            <span>
              Create calculated columns by combining two numeric fields (e.g., quantity × price = total).
            </span>
          </StepInstructions>

          {computedFields.map((field) => (
            <ComputedCard key={field.id}>
              <ComputedRow>
                <FormControl size="small" sx={{ minWidth: '180px', flex: 1 }}>
                  <InputLabel sx={{ color: '#71717a' }}>Left Column</InputLabel>
                  <StyledSelect
                    value={`${field.leftTable}.${field.leftColumn}`}
                    onChange={(e) => {
                      const [t, c] = (e.target.value as string).split('.');
                      handleComputedFieldChange(field.id, { leftTable: t, leftColumn: c });
                    }}
                    label="Left Column"
                  >
                    {numericColumns.map((col) => (
                      <MenuItem key={`${col.table}.${col.column}`} value={`${col.table}.${col.column}`}>
                        {col.table}.{col.column}
                      </MenuItem>
                    ))}
                  </StyledSelect>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: '100px', flex: 'none' }}>
                  <InputLabel sx={{ color: '#71717a' }}>Operator</InputLabel>
                  <StyledSelect
                    value={field.operator}
                    onChange={(e) =>
                      handleComputedFieldChange(field.id, { operator: e.target.value as ComputedOperator })
                    }
                    label="Operator"
                  >
                    {COMPUTED_OPERATORS.map((op) => (
                      <MenuItem key={op.value} value={op.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ color: '#f59e0b', fontWeight: 700, fontSize: '1rem' }}>{op.value}</Box>
                          <Box sx={{ color: '#71717a', fontSize: '0.8rem' }}>{op.label}</Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </StyledSelect>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: '180px', flex: 1 }}>
                  <InputLabel sx={{ color: '#71717a' }}>Right Column</InputLabel>
                  <StyledSelect
                    value={`${field.rightTable}.${field.rightColumn}`}
                    onChange={(e) => {
                      const [t, c] = (e.target.value as string).split('.');
                      handleComputedFieldChange(field.id, { rightTable: t, rightColumn: c });
                    }}
                    label="Right Column"
                  >
                    {numericColumns.map((col) => (
                      <MenuItem key={`${col.table}.${col.column}`} value={`${col.table}.${col.column}`}>
                        {col.table}.{col.column}
                      </MenuItem>
                    ))}
                  </StyledSelect>
                </FormControl>

                <FormField
                  size="small"
                  label="Alias"
                  value={field.alias}
                  onChange={(e) => handleComputedFieldChange(field.id, { alias: e.target.value })}
                  placeholder="result_name"
                  sx={{ minWidth: '140px', flex: 'none' }}
                />

                <RemoveButton onClick={() => handleRemoveComputedField(field.id)}>
                  <DeleteOutlineIcon fontSize="small" />
                </RemoveButton>
              </ComputedRow>
            </ComputedCard>
          ))}

          <AddComputedRow onClick={handleAddComputedField}>
            <AddIcon sx={{ mr: 1 }} />
            <span>Add computed field</span>
          </AddComputedRow>
        </ComputedSection>
      )}
    </StepContent>
  );
};

export default FieldsStep;
