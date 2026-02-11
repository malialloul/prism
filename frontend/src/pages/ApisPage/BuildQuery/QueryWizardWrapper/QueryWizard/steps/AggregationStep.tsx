import React, { useMemo, useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import FunctionsIcon from '@mui/icons-material/Functions';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TuneIcon from '@mui/icons-material/Tune';
import CodeIcon from '@mui/icons-material/Code';

import {
  SchemaTable,
  SelectedTable,
  TableJoin,
  SelectedField,
  GroupByField,
  AggregateField,
  HavingCondition,
  AggregationType,
  DatabaseEngine,
  ComputedField,
  FilterValueType,
  AGGREGATION_OPTIONS,
  FILTER_OPERATORS,
  getJoinedTables,
  generateId,
} from '../types';
import {
  StepContent,
  StepHeader,
  StepTitle,
  StepDescription,
  StepInstructions,
  ListContainer,
  RemoveButton,
  StyledSelect,
  FormField,
  EmptyState,
  EmptyIcon,
  EmptyTitle,
  EmptyText,
  Badge,
  Divider,
} from '../QueryWizard.styles';
import { alpha, styled } from '@mui/material/styles';

// Additional styles
const SectionHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '12px',
});

const SectionTitle = styled(Box)({
  fontSize: '0.9rem',
  fontWeight: 600,
  color: '#a1a1aa',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

const AggregateCard = styled(Box)({
  padding: '16px',
  backgroundColor: '#12121a',
  borderRadius: '10px',
  border: '1px solid #2a2a3a',
});

const AggregateRow = styled(Box)({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
  flexWrap: 'wrap',
});

const FieldChip = styled(Box)<{ isSelected?: boolean }>(({ isSelected }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '8px 12px',
  backgroundColor: isSelected ? alpha('#667eea', 0.15) : '#0a0a0f',
  border: `1px solid ${isSelected ? '#667eea' : '#2a2a3a'}`,
  borderRadius: '6px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  fontSize: '0.85rem',
  color: isSelected ? '#e4e4e7' : '#71717a',
  '&:hover': {
    borderColor: '#667eea',
    backgroundColor: alpha('#667eea', 0.1),
  },
}));

const AddButton = styled(Box)({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '8px 16px',
  backgroundColor: 'transparent',
  border: '1px dashed #2a2a3a',
  borderRadius: '6px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  fontSize: '0.85rem',
  color: '#71717a',
  '&:hover': {
    borderColor: '#667eea',
    backgroundColor: alpha('#667eea', 0.05),
    color: '#a5b4fc',
  },
});

const InfoBanner = styled(Box)({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '10px',
  padding: '12px 16px',
  backgroundColor: alpha('#f59e0b', 0.1),
  borderRadius: '8px',
  fontSize: '0.85rem',
  color: '#fcd34d',
  marginBottom: '20px',
});

const ValueTypeToggle = styled(ToggleButtonGroup)({
  '& .MuiToggleButton-root': {
    padding: '4px 10px',
    fontSize: '0.75rem',
    fontWeight: 500,
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

interface AggregationStepProps {
  tables: SchemaTable[];
  baseTable: SelectedTable;
  joins: TableJoin[];
  selectedFields: SelectedField[];
  computedFields: ComputedField[];
  groupByFields: GroupByField[];
  aggregates: AggregateField[];
  havingConditions: HavingCondition[];
  engine: DatabaseEngine;
  onGroupByChange: (fields: GroupByField[]) => void;
  onAggregatesChange: (aggregates: AggregateField[]) => void;
  onHavingChange: (conditions: HavingCondition[]) => void;
}

export const AggregationStep: React.FC<AggregationStepProps> = ({
  tables,
  baseTable,
  joins,
  selectedFields,
  computedFields,
  groupByFields,
  aggregates,
  havingConditions,
  engine,
  onGroupByChange,
  onAggregatesChange,
  onHavingChange,
}) => {
  const [enableAggregation, setEnableAggregation] = useState(
    groupByFields.length > 0 || aggregates.length > 0
  );
  const [showAllColumns, setShowAllColumns] = useState(false);

  // Get all available columns from tables
  const availableColumns = useMemo(() => {
    const tableNames = getJoinedTables(baseTable, joins, tables);
    const columns: Array<{ table: string; column: string; type: string; isComputed?: boolean }> = [];

    tableNames.forEach((tableName) => {
      const table = tables.find((t) => t.name === tableName);
      if (table) {
        table.columns.forEach((col) => {
          columns.push({
            table: tableName,
            column: col.name,
            type: col.type,
          });
        });
      }
    });

    return columns;
  }, [tables, baseTable, joins]);

  // Computed columns can be wrapped in aggregates
  const computedColumnOptions = useMemo(() => {
    return computedFields.map((cf) => ({
      table: '__computed__',
      column: cf.alias,
      type: 'numeric', // Computed fields are typically numeric expressions
      isComputed: true,
    }));
  }, [computedFields]);

  // All columns including computed for aggregate selection
  const allColumnsForAggregates = useMemo(() => {
    return [...availableColumns, ...computedColumnOptions];
  }, [availableColumns, computedColumnOptions]);

  // Numeric columns for certain aggregations (SUM, AVG)
  const numericColumns = useMemo(() => {
    const numericTypes = ['int', 'integer', 'bigint', 'smallint', 'decimal', 'numeric', 'float', 'double', 'real', 'money'];
    const numericFromTables = availableColumns.filter((col) =>
      numericTypes.some((t) => col.type.toLowerCase().includes(t))
    );
    // Computed columns are always numeric expressions
    return [...numericFromTables, ...computedColumnOptions];
  }, [availableColumns, computedColumnOptions]);

  const handleToggleAggregation = (enabled: boolean) => {
    setEnableAggregation(enabled);
    if (!enabled) {
      onGroupByChange([]);
      onAggregatesChange([]);
      onHavingChange([]);
    }
  };

  const handleToggleGroupBy = (table: string, column: string) => {
    const exists = groupByFields.some((f) => f.table === table && f.column === column);
    if (exists) {
      onGroupByChange(groupByFields.filter((f) => !(f.table === table && f.column === column)));
    } else {
      onGroupByChange([...groupByFields, { id: generateId(), table, column }]);
    }
  };

  const handleAddAggregate = () => {
    const firstCol = numericColumns[0] || availableColumns[0];
    if (!firstCol) return;

    const newAgg: AggregateField = {
      id: generateId(),
      function: 'COUNT',
      table: firstCol.table,
      column: firstCol.column,
      alias: null,
    };
    onAggregatesChange([...aggregates, newAgg]);
  };

  const handleUpdateAggregate = (
    aggId: string,
    field: keyof AggregateField,
    value: string | null
  ) => {
    onAggregatesChange(
      aggregates.map((a) => {
        if (a.id !== aggId) return a;

        if (field === 'column') {
          const parts = (value as string).split('.');
          if (parts.length === 2) {
            return { ...a, table: parts[0], column: parts[1] };
          }
        }

        return { ...a, [field]: value };
      })
    );
  };

  const handleRemoveAggregate = (aggId: string) => {
    onAggregatesChange(aggregates.filter((a) => a.id !== aggId));
    // Also remove any having conditions referencing this aggregate
    onHavingChange(havingConditions.filter((h) => h.aggregateId !== aggId));
  };

  const handleAddHaving = (aggId: string) => {
    const newHaving: HavingCondition = {
      id: generateId(),
      aggregateId: aggId,
      operator: '>',
      value: '0',
      valueType: 'fixed',
      isRequired: true,
    };
    onHavingChange([...havingConditions, newHaving]);
  };

  const handleUpdateHaving = (
    havingId: string,
    updates: Partial<HavingCondition>
  ) => {
    onHavingChange(
      havingConditions.map((h) => (h.id === havingId ? { ...h, ...updates } : h))
    );
  };

  const handleRemoveHaving = (havingId: string) => {
    onHavingChange(havingConditions.filter((h) => h.id !== havingId));
  };

  const isGroupBySelected = (table: string, column: string): boolean => {
    return groupByFields.some((f) => f.table === table && f.column === column);
  };

  const getAggLabel = (func: AggregationType): string => {
    const opt = AGGREGATION_OPTIONS.find((o) => o.value === func);
    return opt?.label || func;
  };

  if (!enableAggregation) {
    return (
      <StepContent>
        <StepHeader>
          <StepTitle>Summarize Data</StepTitle>
          <StepDescription>
            Use aggregation to calculate totals, averages, counts, and group your results.
          </StepDescription>
        </StepHeader>

        <StepInstructions>
          <LightbulbIcon fontSize="small" />
          <span>
            <strong>Optional step:</strong> Enable aggregation to summarize data 
            (e.g., count orders per customer, calculate average prices).
          </span>
        </StepInstructions>

        <EmptyState>
          <EmptyIcon>
            <FunctionsIcon />
          </EmptyIcon>
          <EmptyTitle>Aggregation Disabled</EmptyTitle>
          <EmptyText sx={{ mb: 3 }}>
            Enable aggregation to calculate summaries like counts, totals, and averages.
          </EmptyText>
          <AddButton onClick={() => handleToggleAggregation(true)}>
            <AddIcon fontSize="small" />
            Enable Aggregation
          </AddButton>
        </EmptyState>
      </StepContent>
    );
  }

  return (
    <StepContent>
      <StepHeader>
        <StepTitle>Summarize Data</StepTitle>
        <StepDescription>
          Group your results and calculate aggregated values like counts, totals, and averages.
        </StepDescription>
      </StepHeader>

      <Tooltip 
        title={engine === 'postgres' 
          ? "PostgreSQL requires all selected columns to be either in GROUP BY or wrapped in an aggregate function (COUNT, SUM, etc.)" 
          : "MySQL allows non-aggregated columns not in GROUP BY, but they may return arbitrary values. For predictable results, add columns to GROUP BY."
        } 
        arrow
      >
        <InfoBanner sx={{ cursor: 'help' }}>
          <InfoOutlinedIcon fontSize="small" />
          <span>
            {engine === 'postgres' 
              ? 'Each non-aggregated field must be in "Organize Results By" (strict mode).'
              : 'Non-aggregated fields not in "Organize Results By" may return arbitrary values.'
            }
          </span>
        </InfoBanner>
      </Tooltip>

      {/* Group By Section */}
      <Box sx={{ mb: 4 }}>
        <SectionHeader>
          <SectionTitle>
            <GroupWorkIcon fontSize="small" />
            Organize Results By
          </SectionTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Badge
              colorVariant={groupByFields.length > 0 ? 'primary' : 'neutral'}
              label={`${groupByFields.length} selected`}
            />
            {availableColumns.length > 20 && (
              <Box
                onClick={() => setShowAllColumns(!showAllColumns)}
                sx={{
                  fontSize: '0.75rem',
                  color: '#667eea',
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                {showAllColumns ? 'Show Less' : `Show All (${availableColumns.length})`}
              </Box>
            )}
          </Box>
        </SectionHeader>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: showAllColumns ? 'none' : '200px', overflow: 'auto' }}>
          {(showAllColumns ? availableColumns : availableColumns.slice(0, 20)).map((col) => (
            <FieldChip
              key={`${col.table}.${col.column}`}
              isSelected={isGroupBySelected(col.table, col.column)}
              onClick={() => handleToggleGroupBy(col.table, col.column)}
            >
              <Checkbox
                checked={isGroupBySelected(col.table, col.column)}
                size="small"
                sx={{ p: 0, '& svg': { fontSize: '1rem' } }}
              />
              {col.table}.{col.column}
            </FieldChip>
          ))}
        </Box>
      </Box>

      <Divider />

      {/* Aggregates Section */}
      <Box sx={{ mb: 4 }}>
        <SectionHeader>
          <SectionTitle>
            <FunctionsIcon fontSize="small" />
            Calculations
          </SectionTitle>
          <Badge
            colorVariant={aggregates.length > 0 ? 'success' : 'neutral'}
            label={`${aggregates.length} added`}
          />
        </SectionHeader>

        {aggregates.length > 0 && (
          <ListContainer sx={{ gap: '12px', mb: 2 }}>
            {aggregates.map((agg) => {
              const havingForAgg = havingConditions.filter((h) => h.aggregateId === agg.id);
              return (
                <AggregateCard key={agg.id}>
                  <AggregateRow>
                    <FormControl size="small" sx={{ minWidth: '140px' }}>
                      <InputLabel sx={{ color: '#71717a' }}>Function</InputLabel>
                      <StyledSelect
                        value={agg.function}
                        onChange={(e) =>
                          handleUpdateAggregate(agg.id, 'function', e.target.value as string)
                        }
                        label="Function"
                      >
                        {AGGREGATION_OPTIONS.map((opt) => (
                          <MenuItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </MenuItem>
                        ))}
                      </StyledSelect>
                    </FormControl>

                    <FormControl size="small" sx={{ flex: 1, minWidth: '180px' }}>
                      <InputLabel sx={{ color: '#71717a' }}>Column</InputLabel>
                      <StyledSelect
                        value={`${agg.table}.${agg.column}`}
                        onChange={(e) =>
                          handleUpdateAggregate(agg.id, 'column', e.target.value as string)
                        }
                        label="Column"
                      >
                        {(agg.function === 'SUM' || agg.function === 'AVG'
                          ? numericColumns
                          : allColumnsForAggregates
                        ).map((col) => (
                          <MenuItem key={`${col.table}.${col.column}`} value={`${col.table}.${col.column}`}>
                            {col.isComputed ? `⚡ ${col.column}` : `${col.table}.${col.column}`}
                          </MenuItem>
                        ))}
                      </StyledSelect>
                    </FormControl>

                    <FormField
                      size="small"
                      label="Label (optional)"
                      value={agg.alias || ''}
                      onChange={(e) =>
                        handleUpdateAggregate(agg.id, 'alias', e.target.value || null)
                      }
                      placeholder="e.g., total_orders"
                      sx={{ flex: 1, minWidth: '150px' }}
                    />

                    <RemoveButton onClick={() => handleRemoveAggregate(agg.id)} sx={{ mt: '8px' }}>
                      <DeleteOutlineIcon fontSize="small" />
                    </RemoveButton>
                  </AggregateRow>

                  {/* Having conditions for this aggregate */}
                  {havingForAgg.length > 0 && (
                    <Box sx={{ mt: 2, pl: 2, borderLeft: '2px solid #2a2a3a' }}>
                      <Box sx={{ fontSize: '0.8rem', color: '#71717a', mb: 1 }}>
                        Filter on this calculation:
                      </Box>
                      {havingForAgg.map((having) => {
                        const isParameter = having.valueType === 'parameter';
                        const aggLabel = agg.alias || `${agg.function.toLowerCase()}_${agg.column}`;
                        
                        return (
                          <Box key={having.id} sx={{ mb: 2 }}>
                            {/* Value Type Toggle Row */}
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2, mb: 1 }}>
                              {isParameter && (
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={having.isRequired ?? true}
                                      onChange={(e) => handleUpdateHaving(having.id, { isRequired: e.target.checked })}
                                      size="small"
                                      sx={{
                                        color: '#667eea',
                                        '&.Mui-checked': { color: '#667eea' },
                                      }}
                                    />
                                  }
                                  label="Required"
                                  sx={{ 
                                    color: '#a1a1aa', 
                                    '& .MuiTypography-root': { fontSize: '0.75rem' },
                                    mr: 0,
                                  }}
                                />
                              )}
                              <ValueTypeToggle
                                value={having.valueType}
                                exclusive
                                onChange={(_, val) => val && handleUpdateHaving(having.id, { valueType: val as FilterValueType })}
                                size="small"
                              >
                                <ToggleButton value="fixed">
                                  <TuneIcon sx={{ fontSize: '0.8rem', mr: 0.5 }} />
                                  Fixed
                                </ToggleButton>
                                <ToggleButton value="parameter">
                                  <CodeIcon sx={{ fontSize: '0.8rem', mr: 0.5 }} />
                                  Parameter
                                </ToggleButton>
                              </ValueTypeToggle>
                            </Box>
                            
                            <AggregateRow>
                              <Badge
                                colorVariant="primary"
                                label={`${getAggLabel(agg.function)}(${agg.column})`}
                              />
                              <FormControl size="small" sx={{ minWidth: '120px' }}>
                                <StyledSelect
                                  value={having.operator}
                                  onChange={(e) =>
                                    handleUpdateHaving(having.id, { operator: e.target.value as string })
                                  }
                                >
                                  {FILTER_OPERATORS.filter((op) =>
                                    ['=', '!=', '>', '<', '>=', '<='].includes(op.value)
                                  ).map((op) => (
                                    <MenuItem key={op.value} value={op.value}>
                                      {op.label}
                                    </MenuItem>
                                  ))}
                                </StyledSelect>
                              </FormControl>
                              
                              {isParameter ? (
                                <FormField
                                  size="small"
                                  value={having.parameterName || aggLabel}
                                  onChange={(e) => handleUpdateHaving(having.id, { parameterName: e.target.value })}
                                  placeholder="Param name"
                                  sx={{ width: '150px' }}
                                  InputProps={{
                                    startAdornment: (
                                      <Box component="span" sx={{ color: '#667eea', mr: 0.5 }}>{'{{'}</Box>
                                    ),
                                    endAdornment: (
                                      <Box component="span" sx={{ color: '#667eea', ml: 0.5 }}>{'}}'}</Box>
                                    ),
                                  }}
                                />
                              ) : (
                                <FormField
                                  size="small"
                                  value={having.value}
                                  onChange={(e) => handleUpdateHaving(having.id, { value: e.target.value })}
                                  placeholder="Value"
                                  sx={{ width: '100px' }}
                                />
                              )}
                              
                              <RemoveButton onClick={() => handleRemoveHaving(having.id)}>
                                <DeleteOutlineIcon fontSize="small" />
                              </RemoveButton>
                            </AggregateRow>
                          </Box>
                        );
                      })}
                    </Box>
                  )}

                  {havingForAgg.length === 0 && (
                    <Box sx={{ mt: 2 }}>
                      <AddButton onClick={() => handleAddHaving(agg.id)}>
                        <AddIcon fontSize="small" />
                        Add condition on this result
                      </AddButton>
                    </Box>
                  )}
                </AggregateCard>
              );
            })}
          </ListContainer>
        )}

        <AddButton onClick={handleAddAggregate}>
          <AddIcon fontSize="small" />
          Add calculation
        </AddButton>
      </Box>

      <Box sx={{ textAlign: 'right' }}>
        <AddButton onClick={() => handleToggleAggregation(false)} sx={{ color: '#ef4444' }}>
          Disable Aggregation
        </AddButton>
      </Box>
    </StepContent>
  );
};

export default AggregationStep;
