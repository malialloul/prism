import React, { useState, useMemo } from 'react';
import { Box, TextField, CircularProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import TableChartIcon from '@mui/icons-material/TableChart';
import LinkIcon from '@mui/icons-material/Link';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FunctionsIcon from '@mui/icons-material/Functions';
import SortIcon from '@mui/icons-material/Sort';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SaveIcon from '@mui/icons-material/Save';
import CodeIcon from '@mui/icons-material/Code';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import FilterNoneIcon from '@mui/icons-material/FilterNone';

import {
  WizardState,
  ValidationMessage,
  JOIN_TYPE_OPTIONS,
  AGGREGATION_OPTIONS,
  extractParameters,
  operatorNeedsMultipleValues,
  operatorNeedsTwoValues,
} from '../types';
import {
  StepContent,
  StepHeader,
  StepTitle,
  StepDescription,
  StepInstructions,
  ListContainer,
  Badge,
  NavButton,
  SqlCode,
  ValidationItem,
  FormField,
} from '../QueryWizard.styles';
import { alpha, styled } from '@mui/material/styles';

// Additional styles
const SummarySection = styled(Box)({
  marginBottom: '24px',
});

const SummarySectionHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '12px',
  color: '#a1a1aa',
  fontSize: '0.9rem',
  fontWeight: 600,
});

const SummaryCard = styled(Box)({
  padding: '16px',
  backgroundColor: '#12121a',
  borderRadius: '10px',
  border: '1px solid #2a2a3a',
});

const SummaryRow = styled(Box)({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
  padding: '8px 0',
  borderBottom: '1px solid #1e1e2e',
  '&:last-child': {
    borderBottom: 'none',
  },
});

const SummaryLabel = styled(Box)({
  width: '140px',
  flexShrink: 0,
  fontSize: '0.85rem',
  color: '#71717a',
});

const SummaryValue = styled(Box)({
  flex: 1,
  fontSize: '0.85rem',
  color: '#e4e4e7',
});

const ValidationBox = styled(Box)({
  marginBottom: '24px',
});

const ActionBar = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '16px',
  backgroundColor: '#12121a',
  borderRadius: '10px',
  border: '1px solid #2a2a3a',
  marginTop: '24px',
});

const SqlPreviewBox = styled(Box)({
  marginTop: '24px',
});

const ParameterSection = styled(Box)({
  marginTop: '24px',
  padding: '20px',
  backgroundColor: alpha('#667eea', 0.05),
  borderRadius: '10px',
  border: '1px solid #2a2a3a',
});

const ParameterGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
  gap: '16px',
  marginTop: '16px',
});

const ParameterField = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
});

const ParameterLabel = styled(Box)({
  fontSize: '0.8rem',
  fontWeight: 600,
  color: '#a5b4fc',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
});

const ParameterHint = styled(Box)({
  fontSize: '0.7rem',
  color: '#71717a',
  marginTop: '2px',
});

interface ReviewStepProps {
  state: WizardState;
  sql: string;
  validation: ValidationMessage[];
  onCopySQL: () => void;
  onExecute: (parameterValues: Record<string, string>) => void;
  onSave: () => void;
  onGoToStep: (step: number) => void;
  isExecuting?: boolean;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  state,
  sql,
  validation,
  onCopySQL,
  onExecute,
  onSave,
  onGoToStep,
  isExecuting = false,
}) => {
  const hasErrors = validation.some((v) => v.severity === 'error');

  // Extract parameters from filters
  const parameters = useMemo(() => extractParameters(state), [state]);
  
  // State for parameter values
  const [parameterValues, setParameterValues] = useState<Record<string, string>>({});
  const [parameterErrors, setParameterErrors] = useState<Record<string, boolean>>({});

  const handleParameterChange = (paramName: string, value: string) => {
    setParameterValues((prev) => ({ ...prev, [paramName]: value }));
    // Clear error when user types
    if (parameterErrors[paramName]) {
      setParameterErrors((prev) => ({ ...prev, [paramName]: false }));
    }
  };

  // Generate SQL preview with parameter values substituted
  const sqlPreview = useMemo(() => {
    if (!sql) return sql;
    
    let preview = sql;
    // Replace $1, $2, etc. placeholders with entered values
    // Parameters are in the same order as $N placeholders
    parameters.forEach((param, index) => {
      const value = parameterValues[param.name] || '';
      // Escape single quotes in the value
      const escapedValue = value.replace(/'/g, "''");
      // Replace the $N placeholder with the quoted value
      const placeholder = `$${index + 1}`;
      // Use a more careful replacement that handles whole-word matching
      const placeholderRegex = new RegExp(`\\$${index + 1}(?!\\d)`, 'g');
      preview = preview.replace(placeholderRegex, `'${escapedValue}'`);
    });
    
    return preview;
  }, [sql, parameterValues, parameters]);

  // Check if all required parameters are filled
  const getMissingRequiredParams = () => {
    return parameters.filter(
      (param) => param.isRequired && !parameterValues[param.name]?.trim()
    );
  };

  const handleExecute = () => {
    // Validate required parameters
    const missingParams = getMissingRequiredParams();
    if (missingParams.length > 0) {
      const errors: Record<string, boolean> = {};
      missingParams.forEach((p) => {
        errors[p.name] = true;
      });
      setParameterErrors(errors);
      return;
    }
    // Build full parameter values including empty strings for optional params
    const fullParamValues: Record<string, string> = {};
    parameters.forEach((param) => {
      fullParamValues[param.name] = parameterValues[param.name] || '';
    });
    onExecute(fullParamValues);
  };

  const handleCopySQL = () => {
    if (sqlPreview) {
      navigator.clipboard.writeText(sqlPreview);
    }
  };

  const getJoinTypeLabel = (type: string): string => {
    const opt = JOIN_TYPE_OPTIONS.find((o) => o.value === type);
    return opt?.label || type;
  };

  const getAggLabel = (func: string): string => {
    const opt = AGGREGATION_OPTIONS.find((o) => o.value === func);
    return opt?.label || func;
  };

  const getValidationIcon = (severity: 'error' | 'warning' | 'info') => {
    switch (severity) {
      case 'error':
        return <ErrorIcon fontSize="small" sx={{ color: '#ef4444' }} />;
      case 'warning':
        return <WarningIcon fontSize="small" sx={{ color: '#f59e0b' }} />;
      case 'info':
        return <InfoIcon fontSize="small" sx={{ color: '#667eea' }} />;
    }
  };

  const getFilterDisplayValue = (filter: typeof state.filters[0]): string => {
    if (filter.valueType === 'parameter') {
      return `{${filter.parameterName || filter.column}}`;
    }
    if (operatorNeedsMultipleValues(filter.operator)) {
      return filter.values.join(', ') || filter.value;
    }
    if (operatorNeedsTwoValues(filter.operator)) {
      return `${filter.value} - ${filter.value2}`;
    }
    return filter.value;
  };

  return (
    <StepContent>
      <StepHeader>
        <StepTitle>
          Review Your Query
          {!hasErrors && (
            <CheckCircleIcon
              sx={{ ml: 1, fontSize: '1.2rem', color: '#22c55e', verticalAlign: 'middle' }}
            />
          )}
        </StepTitle>
        <StepDescription>
          Review your query configuration and execute when ready.
        </StepDescription>
      </StepHeader>

      {/* Validation Messages */}
      {validation.length > 0 && (
        <ValidationBox>
          <ListContainer sx={{ gap: '8px' }}>
            {validation.map((msg, idx) => (
              <ValidationItem key={idx} severity={msg.severity}>
                {getValidationIcon(msg.severity)}
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ fontWeight: 600, mb: 0.5 }}>{msg.message}</Box>
                  {msg.fix && (
                    <Box
                      sx={{
                        fontSize: '0.75rem',
                        color: '#667eea',
                        cursor: 'pointer',
                        '&:hover': { textDecoration: 'underline' },
                      }}
                      onClick={() => onGoToStep(msg.step)}
                    >
                      → Go to Step {msg.step + 1} to fix
                    </Box>
                  )}
                </Box>
              </ValidationItem>
            ))}
          </ListContainer>
        </ValidationBox>
      )}

      {/* Summary */}
      <SummarySection>
        <SummarySectionHeader>
          <TableChartIcon fontSize="small" />
          Base Table
        </SummarySectionHeader>
        <SummaryCard>
          <SummaryRow>
            <SummaryLabel>Table</SummaryLabel>
            <SummaryValue>
              <Badge colorVariant="primary" label={state.baseTable?.name || 'Not selected'} />
            </SummaryValue>
          </SummaryRow>
        </SummaryCard>
      </SummarySection>

      {state.joins.length > 0 && (
        <SummarySection>
          <SummarySectionHeader>
            <LinkIcon fontSize="small" />
            Linked Tables ({state.joins.length})
          </SummarySectionHeader>
          <SummaryCard>
            {state.joins.map((join) => (
              <SummaryRow key={join.id}>
                <SummaryLabel>{getJoinTypeLabel(join.joinType)}</SummaryLabel>
                <SummaryValue>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{join.fromTable}.{join.fromColumn}</span>
                    <span style={{ color: '#52525b' }}>→</span>
                    <span>{join.toTable}.{join.toColumn}</span>
                  </Box>
                </SummaryValue>
              </SummaryRow>
            ))}
          </SummaryCard>
        </SummarySection>
      )}

      <SummarySection>
        <SummarySectionHeader>
          <ViewColumnIcon fontSize="small" />
          Selected Fields ({state.selectedFields.length})
        </SummarySectionHeader>
        <SummaryCard>
          {state.selectedFields.length > 0 ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {state.selectedFields.map((field) => (
                <Badge
                  key={field.id}
                  colorVariant="neutral"
                  label={`${field.table}.${field.column}`}
                />
              ))}
            </Box>
          ) : (
            <Box sx={{ color: '#71717a', fontSize: '0.85rem' }}>
              All columns from selected tables
            </Box>
          )}
        </SummaryCard>
      </SummarySection>

      {/* Uniqueness Summary */}
      {state.uniqueness?.enabled && state.aggregates.length === 0 && (
        <SummarySection>
          <SummarySectionHeader>
            <FilterNoneIcon fontSize="small" />
            Uniqueness
          </SummarySectionHeader>
          <SummaryCard>
            <SummaryRow>
              <SummaryLabel>Mode</SummaryLabel>
              <SummaryValue>
                {state.uniqueness.mode === 'distinctOn' ? (
                  <>
                    <Badge colorVariant="primary" label="DISTINCT ON" size="small" />
                    <Box sx={{ ml: 1, color: '#71717a', fontSize: '0.8rem' }}>
                      (PostgreSQL specific - returns first row per unique combination)
                    </Box>
                  </>
                ) : (
                  <>
                    <Badge colorVariant="success" label="DISTINCT" size="small" />
                    <Box sx={{ ml: 1, color: '#71717a', fontSize: '0.8rem' }}>
                      (Removes duplicate rows)
                    </Box>
                  </>
                )}
              </SummaryValue>
            </SummaryRow>
            {state.uniqueness.mode === 'distinctOn' && state.uniqueness.distinctOnColumns.length > 0 && (
              <SummaryRow>
                <SummaryLabel>Distinct By</SummaryLabel>
                <SummaryValue>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {state.uniqueness.distinctOnColumns.map((col, idx) => (
                      <Badge
                        key={idx}
                        colorVariant="primary"
                        label={col.direction ? `${col.table}.${col.column} ${col.direction}` : `${col.table}.${col.column}`}
                        size="small"
                      />
                    ))}
                  </Box>
                </SummaryValue>
              </SummaryRow>
            )}
          </SummaryCard>
        </SummarySection>
      )}

      {state.filters.length > 0 && (
        <SummarySection>
          <SummarySectionHeader>
            <FilterAltIcon fontSize="small" />
            Filters ({state.filters.length})
          </SummarySectionHeader>
          <SummaryCard>
            {state.filters.map((filter, idx) => (
              <SummaryRow key={filter.id}>
                <SummaryLabel>
                  {idx > 0 && (
                    <Badge
                      colorVariant={state.filterLogic === 'AND' ? 'primary' : 'warning'}
                      label={state.filterLogic}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                  )}
                  {filter.table}.{filter.column}
                </SummaryLabel>
                <SummaryValue>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{filter.operator}</span>
                    {filter.valueType === 'parameter' ? (
                      <Badge colorVariant="success" label={`{${filter.parameterName || filter.column}}`} size="small" />
                    ) : (
                      <span>"{getFilterDisplayValue(filter)}"</span>
                    )}
                  </Box>
                </SummaryValue>
              </SummaryRow>
            ))}
          </SummaryCard>
        </SummarySection>
      )}

      {(state.groupByFields.length > 0 || state.aggregates.length > 0) && (
        <SummarySection>
          <SummarySectionHeader>
            <FunctionsIcon fontSize="small" />
            Aggregation
          </SummarySectionHeader>
          <SummaryCard>
            {state.groupByFields.length > 0 && (
              <SummaryRow>
                <SummaryLabel>Group By</SummaryLabel>
                <SummaryValue>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {state.groupByFields.map((g) => (
                      <Badge
                        key={g.id}
                        colorVariant="neutral"
                        label={`${g.table}.${g.column}`}
                        size="small"
                      />
                    ))}
                  </Box>
                </SummaryValue>
              </SummaryRow>
            )}
            {state.aggregates.map((agg) => (
              <SummaryRow key={agg.id}>
                <SummaryLabel>{getAggLabel(agg.function)}</SummaryLabel>
                <SummaryValue>
                  {agg.table}.{agg.column}
                  {agg.alias && <span style={{ color: '#71717a' }}> as "{agg.alias}"</span>}
                </SummaryValue>
              </SummaryRow>
            ))}
          </SummaryCard>
        </SummarySection>
      )}

      {state.sortFields.length > 0 && (
        <SummarySection>
          <SummarySectionHeader>
            <SortIcon fontSize="small" />
            Sorting
          </SummarySectionHeader>
          <SummaryCard>
            {state.sortFields.map((sort, idx) => (
              <SummaryRow key={sort.id}>
                <SummaryLabel>#{idx + 1}</SummaryLabel>
                <SummaryValue>
                  {'aggregateId' in sort && sort.aggregateId
                    ? (() => {
                        const agg = state.aggregates.find((a) => a.id === sort.aggregateId);
                        return agg ? `${agg.function}(${agg.column})` : 'Unknown';
                      })()
                    : `${sort.table}.${sort.column}`}
                  <Badge
                    colorVariant={sort.direction === 'ASC' ? 'success' : 'warning'}
                    label={sort.direction === 'ASC' ? '↑ Low to High' : '↓ High to Low'}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </SummaryValue>
              </SummaryRow>
            ))}
            {(state.limit || state.offset) && (
              <SummaryRow>
                <SummaryLabel>Limit</SummaryLabel>
                <SummaryValue>
                  {state.limit && `Max ${state.limit} rows`}
                  {state.offset && ` (skip first ${state.offset})`}
                </SummaryValue>
              </SummaryRow>
            )}
          </SummaryCard>
        </SummarySection>
      )}

      {/* SQL Preview */}
      <SqlPreviewBox>
        <SummarySectionHeader>
          Generated SQL
          {Object.keys(parameterValues).some(k => parameterValues[k]) && (
            <Box component="span" sx={{ ml: 1, fontSize: '0.7rem', color: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.1)', px: 1, py: 0.25, borderRadius: '4px' }}>
              Live Preview
            </Box>
          )}
        </SummarySectionHeader>
        <SqlCode>{sqlPreview || '-- Select a table to generate SQL'}</SqlCode>
      </SqlPreviewBox>

      {/* Parameter Input Section */}
      {parameters.length > 0 && (
        <ParameterSection>
          <SummarySectionHeader>
            <CodeIcon fontSize="small" />
            Query Parameters ({parameters.length})
          </SummarySectionHeader>
          
          <StepInstructions sx={{ mt: 1, mb: 2 }}>
            <LightbulbIcon fontSize="small" />
            <span>
              Enter values for the dynamic parameters below. <span style={{ color: '#ef4444' }}>* Required fields</span> must be filled before executing.
            </span>
          </StepInstructions>

          <ParameterGrid>
            {parameters.map((param) => {
              const filter = state.filters.find((f) => f.id === param.filterId);
              const having = state.havingConditions.find((h) => h.id === param.filterId);
              const isMultiple = filter && operatorNeedsMultipleValues(filter.operator);
              const hasError = parameterErrors[param.name];
              const isHavingParam = !!having;
              const isPaginationParam = param.name === 'pagesize' || param.name === 'pagecount';
              
              return (
                <ParameterField key={param.name}>
                  <ParameterLabel>
                    <CodeIcon sx={{ fontSize: '0.9rem' }} />
                    {param.name}
                    {param.isRequired && (
                      <Box component="span" sx={{ color: '#ef4444', ml: 0.5 }}>*</Box>
                    )}
                    {isHavingParam && (
                      <Box component="span" sx={{ ml: 1, fontSize: '0.7rem', color: '#667eea', backgroundColor: 'rgba(102, 126, 234, 0.1)', px: 0.5, py: 0.25, borderRadius: '4px' }}>HAVING</Box>
                    )}
                    {isPaginationParam && (
                      <Box component="span" sx={{ ml: 1, fontSize: '0.7rem', color: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.1)', px: 0.5, py: 0.25, borderRadius: '4px' }}>PAGINATION</Box>
                    )}
                  </ParameterLabel>
                  <FormField
                    size="small"
                    type={isPaginationParam ? 'number' : 'text'}
                    value={parameterValues[param.name] || ''}
                    onChange={(e) => handleParameterChange(param.name, e.target.value)}
                    placeholder={isPaginationParam ? (param.name === 'pagesize' ? '100' : '1') : (isMultiple ? "value1, value2, value3" : "Enter value...")}
                    error={hasError}
                    sx={{ 
                      mt: 0.5,
                      '& .MuiOutlinedInput-root': hasError ? {
                        '& fieldset': { borderColor: '#ef4444' },
                      } : {},
                    }}
                  />
                  <ParameterHint sx={hasError ? { color: '#ef4444' } : {}}>
                    {hasError ? 'This field is required' : param.description}
                    {!hasError && isMultiple && ' (comma-separated)'}
                  </ParameterHint>
                </ParameterField>
              );
            })}
          </ParameterGrid>
        </ParameterSection>
      )}

      {/* Actions */}
      <ActionBar>
        <NavButton
          variant="outlined"
          onClick={handleCopySQL}
          startIcon={<ContentCopyIcon />}
          disabled={!sql}
        >
          Copy SQL
        </NavButton>
        <NavButton
          variant="outlined"
          onClick={onSave}
          startIcon={<SaveIcon />}
          disabled={hasErrors || !sql}
          sx={{ 
            borderColor: '#22c55e',
            color: '#22c55e',
            '&:hover': {
              borderColor: '#16a34a',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
            },
          }}
        >
          Save API
        </NavButton>
        <Box sx={{ flex: 1 }} />
        <NavButton
          variant="contained"
          onClick={handleExecute}
          startIcon={isExecuting ? <CircularProgress size={16} color="inherit" /> : <PlayArrowIcon />}
          disabled={hasErrors || !sql || isExecuting || getMissingRequiredParams().length > 0}
        >
          {isExecuting ? 'Executing...' : 'Execute Query'}
        </NavButton>
      </ActionBar>
    </StepContent>
  );
};

export default ReviewStep;
