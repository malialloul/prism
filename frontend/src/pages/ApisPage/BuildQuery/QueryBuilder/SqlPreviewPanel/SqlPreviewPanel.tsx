import React, { useState, useMemo } from 'react';
import { Tooltip, CircularProgress, TableCell, TableRow } from '@mui/material';
import {
  ContentCopy as CopyIcon,
  PlayArrow as ExecuteIcon,
  Save as SaveIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Code as CodeIcon,
  TableChart as ResultsIcon,
} from '@mui/icons-material';
import {
  PanelContainer,
  PanelHeader,
  PanelTitle,
  PanelActions,
  ActionButton,
  SqlContainer,
  SqlCode,
  ValidationContainer,
  ValidationMessage,
  ValidationIcon,
  ValidationText,
  ParametersContainer,
  ParametersTitle,
  ParameterItem,
  ParameterName,
  ParameterType,
  ActionsContainer,
  ExecuteButton,
  SaveButton,
  ResultsContainer,
  ResultsHeader,
  ResultsTitle,
  ResultsInfo,
  ResultsTable,
  StyledTable,
  StyledTableHead,
  StyledTableBody,
  EmptyState,
  EmptyIcon,
  EmptyText,
  TabsContainer,
  Tab,
} from './SqlPreviewPanel.styles';
import type { GeneratedSQL, QueryResult, SqlPreviewPanelProps } from '../types';

// SQL syntax highlighting function
function highlightSql(sql: string): React.ReactNode[] {
  if (!sql) return [];

  const keywords = [
    'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'BETWEEN', 'LIKE',
    'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER', 'ON', 'AS',
    'GROUP', 'BY', 'HAVING', 'ORDER', 'ASC', 'DESC', 'LIMIT', 'OFFSET',
    'NULL', 'IS', 'DISTINCT', 'ALL', 'UNION', 'EXCEPT', 'INTERSECT',
    'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'CAST', 'COALESCE',
  ];

  const functions = ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'COALESCE', 'IFNULL', 'NULLIF'];

  const parts: React.ReactNode[] = [];
  let remaining = sql;
  let keyIndex = 0;

  while (remaining.length > 0) {
    // Check for keywords
    let matched = false;
    for (const keyword of keywords) {
      const regex = new RegExp(`^(${keyword})(?=\\s|$|,|\\(|\\))`, 'i');
      const match = remaining.match(regex);
      if (match) {
        parts.push(
          <span key={keyIndex++} style={{ color: '#c084fc', fontWeight: 600 }}>
            {match[0]}
          </span>
        );
        remaining = remaining.slice(match[0].length);
        matched = true;
        break;
      }
    }
    if (matched) continue;

    // Check for functions
    for (const func of functions) {
      const regex = new RegExp(`^(${func})(?=\\()`, 'i');
      const match = remaining.match(regex);
      if (match) {
        parts.push(
          <span key={keyIndex++} style={{ color: '#f472b6' }}>
            {match[0]}
          </span>
        );
        remaining = remaining.slice(match[0].length);
        matched = true;
        break;
      }
    }
    if (matched) continue;

    // Check for strings
    const stringMatch = remaining.match(/^'[^']*'/);
    if (stringMatch) {
      parts.push(
        <span key={keyIndex++} style={{ color: '#86efac' }}>
          {stringMatch[0]}
        </span>
      );
      remaining = remaining.slice(stringMatch[0].length);
      continue;
    }

    // Check for numbers
    const numberMatch = remaining.match(/^\d+(\.\d+)?/);
    if (numberMatch) {
      parts.push(
        <span key={keyIndex++} style={{ color: '#fbbf24' }}>
          {numberMatch[0]}
        </span>
      );
      remaining = remaining.slice(numberMatch[0].length);
      continue;
    }

    // Check for parameters (@param)
    const paramMatch = remaining.match(/^@\w+/);
    if (paramMatch) {
      parts.push(
        <span
          key={keyIndex++}
          style={{
            color: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            padding: '0 4px',
            borderRadius: '3px',
          }}
        >
          {paramMatch[0]}
        </span>
      );
      remaining = remaining.slice(paramMatch[0].length);
      continue;
    }

    // Check for operators
    const opMatch = remaining.match(/^[=<>!]+/);
    if (opMatch) {
      parts.push(
        <span key={keyIndex++} style={{ color: '#60a5fa' }}>
          {opMatch[0]}
        </span>
      );
      remaining = remaining.slice(opMatch[0].length);
      continue;
    }

    // Default: take one character
    parts.push(remaining[0]);
    remaining = remaining.slice(1);
  }

  return parts;
}

export default function SqlPreviewPanel({
  generatedSQL,
  isExecuting,
  queryResult,
  onExecute,
  onCopy,
  onSaveApi,
  canSave,
}: SqlPreviewPanelProps) {
  const [activeTab, setActiveTab] = useState<'sql' | 'results'>('sql');

  const hasParameters = generatedSQL.parameters.length > 0;
  const hasValidationMessages = generatedSQL.validationMessages.length > 0;
  const hasResults = queryResult && queryResult.success && queryResult.rows;

  const highlightedSql = useMemo(
    () => highlightSql(generatedSQL.sql),
    [generatedSQL.sql]
  );

  const getValidationIcon = (severity: 'error' | 'warning' | 'info') => {
    switch (severity) {
      case 'error':
        return <ErrorIcon />;
      case 'warning':
        return <WarningIcon />;
      default:
        return <InfoIcon />;
    }
  };

  return (
    <PanelContainer elevation={0}>
      <PanelHeader>
        <PanelTitle>Generated Code</PanelTitle>
        <PanelActions>
          <Tooltip title="Copy Code">
            <ActionButton onClick={onCopy} disabled={!generatedSQL.sql}>
              <CopyIcon />
            </ActionButton>
          </Tooltip>
        </PanelActions>
      </PanelHeader>

      {/* Tabs */}
      <TabsContainer>
        <Tab isActive={activeTab === 'sql'} onClick={() => setActiveTab('sql')}>
          <CodeIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
          Code
        </Tab>
        <Tab
          isActive={activeTab === 'results'}
          onClick={() => setActiveTab('results')}
        >
          <ResultsIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
          Results {hasResults && `(${queryResult.rowCount})`}
        </Tab>
      </TabsContainer>

      {activeTab === 'sql' ? (
        <>
          {/* SQL Code */}
          <SqlContainer>
            {generatedSQL.sql ? (
              <SqlCode>{highlightedSql}</SqlCode>
            ) : (
              <EmptyState>
                <EmptyIcon>
                  <CodeIcon />
                </EmptyIcon>
                <EmptyText>
                  Select tables and fields to generate code
                </EmptyText>
              </EmptyState>
            )}
          </SqlContainer>

          {/* Validation Messages */}
          {hasValidationMessages && (
            <ValidationContainer>
              {generatedSQL.validationMessages.map((msg) => (
                <ValidationMessage key={msg.id} severity={msg.severity}>
                  <ValidationIcon severity={msg.severity}>
                    {getValidationIcon(msg.severity)}
                  </ValidationIcon>
                  <ValidationText>{msg.message}</ValidationText>
                </ValidationMessage>
              ))}
            </ValidationContainer>
          )}

          {/* Parameters */}
          {hasParameters && (
            <ParametersContainer>
              <ParametersTitle>API Parameters</ParametersTitle>
              {generatedSQL.parameters.map((param) => (
                <ParameterItem key={param.name}>
                  <ParameterName>@{param.name}</ParameterName>
                  <ParameterType>{param.columnType}</ParameterType>
                </ParameterItem>
              ))}
            </ParametersContainer>
          )}
        </>
      ) : (
        /* Results Tab */
        <ResultsContainer>
          {isExecuting ? (
            <EmptyState>
              <CircularProgress size={32} sx={{ color: '#667eea', mb: 2 }} />
              <EmptyText>Running...</EmptyText>
            </EmptyState>
          ) : hasResults ? (
            <>
              <ResultsHeader>
                <ResultsTitle>Query Results</ResultsTitle>
                <ResultsInfo>
                  {queryResult.rowCount} rows • {queryResult.executionTimeMs}ms
                </ResultsInfo>
              </ResultsHeader>
              <ResultsTable>
                <StyledTable size="small" stickyHeader>
                  <StyledTableHead>
                    <TableRow>
                      {queryResult.columns?.map((col) => (
                        <TableCell key={col}>{col}</TableCell>
                      ))}
                    </TableRow>
                  </StyledTableHead>
                  <StyledTableBody>
                    {queryResult.rows?.slice(0, 100).map((row, idx) => (
                      <TableRow key={idx}>
                        {queryResult.columns?.map((col) => (
                          <TableCell key={col}>
                            {row[col] === null ? (
                              <span style={{ color: '#6b7280', fontStyle: 'italic' }}>
                                NULL
                              </span>
                            ) : (
                              String(row[col])
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </StyledTableBody>
                </StyledTable>
              </ResultsTable>
            </>
          ) : queryResult?.error ? (
            <EmptyState>
              <EmptyIcon sx={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                <ErrorIcon sx={{ color: '#ef4444' }} />
              </EmptyIcon>
              <EmptyText sx={{ color: '#ef4444' }}>{queryResult.error}</EmptyText>
            </EmptyState>
          ) : (
            <EmptyState>
              <EmptyIcon>
                <ResultsIcon />
              </EmptyIcon>
              <EmptyText>Run to see results</EmptyText>
            </EmptyState>
          )}
        </ResultsContainer>
      )}

      {/* Action Buttons */}
      <ActionsContainer>
        <ExecuteButton
          variant="contained"
          startIcon={isExecuting ? <CircularProgress size={16} color="inherit" /> : <ExecuteIcon />}
          onClick={onExecute}
          disabled={!generatedSQL.isValid || isExecuting}
        >
          {isExecuting ? 'Running...' : 'Run'}
        </ExecuteButton>
        <SaveButton
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={onSaveApi}
          disabled={!canSave || !generatedSQL.isValid}
        >
          Save as API
        </SaveButton>
      </ActionsContainer>
    </PanelContainer>
  );
}
