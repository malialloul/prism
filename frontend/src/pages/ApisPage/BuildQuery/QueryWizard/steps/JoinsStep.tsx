import React, { useMemo, useState } from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select as MuiSelect, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

import {
  SchemaTable,
  SelectedTable,
  TableJoin,
  JoinType,
  JOIN_TYPE_OPTIONS,
  getJoinableTables,
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
  SelectableCard,
  CardTitle,
  CardSubtitle,
  JoinVisual,
  JoinTable,
  JoinTableName,
  JoinArrow,
  Badge,
  EmptyState,
  EmptyIcon,
  EmptyTitle,
  EmptyText,
  NavButton,
  RemoveButton,
  Divider,
  StyledSelect,
} from '../QueryWizard.styles';

interface JoinsStepProps {
  tables: SchemaTable[];
  baseTable: SelectedTable;
  joins: TableJoin[];
  onJoinsChange: (joins: TableJoin[]) => void;
}

export const JoinsStep: React.FC<JoinsStepProps> = ({
  tables,
  baseTable,
  joins,
  onJoinsChange,
}) => {
  const [addingJoin, setAddingJoin] = useState(false);

  // Get all tables that are currently part of the query (base + joined)
  const joinedTableNames = useMemo(() => {
    return getJoinedTables(baseTable, joins, tables);
  }, [baseTable, joins, tables]);

  // Get all joinable tables from any joined table
  const availableJoins = useMemo(() => {
    const available: Array<{
      sourceTable: string;
      targetTable: SchemaTable;
      sourceColumn: string;
      targetColumn: string;
    }> = [];

    joinedTableNames.forEach((sourceTableName) => {
      const sourceTable = tables.find((t) => t.name === sourceTableName);
      if (!sourceTable) return;

      const joinable = getJoinableTables(sourceTable, tables);
      joinable.forEach(({ table, localColumn, foreignColumn }) => {
        // Don't show tables already joined
        if (!joinedTableNames.includes(table.name)) {
          available.push({
            sourceTable: sourceTableName,
            targetTable: table,
            sourceColumn: localColumn,
            targetColumn: foreignColumn,
          });
        }
      });
    });

    return available;
  }, [tables, joinedTableNames]);

  const handleAddJoin = (
    sourceTable: string,
    targetTable: SchemaTable,
    sourceColumn: string,
    targetColumn: string
  ) => {
    const newJoin: TableJoin = {
      id: generateId(),
      fromTable: sourceTable,
      toTable: targetTable.name,
      toTableAlias: targetTable.name.charAt(0).toLowerCase() + (joins.length + 1),
      fromColumn: sourceColumn,
      toColumn: targetColumn,
      joinType: 'INNER',
    };
    onJoinsChange([...joins, newJoin]);
    setAddingJoin(false);
  };

  const handleRemoveJoin = (joinId: string) => {
    const joinToRemove = joins.find((j) => j.id === joinId);
    if (!joinToRemove) return;

    // Check if any other joins depend on the removed table
    const dependentJoins = joins.filter(
      (j) => j.id !== joinId && j.fromTable === joinToRemove.toTable
    );

    if (dependentJoins.length > 0) {
      // Remove dependent joins too (cascade)
      const toRemove = new Set([joinId, ...dependentJoins.map((j) => j.id)]);
      onJoinsChange(joins.filter((j) => !toRemove.has(j.id)));
    } else {
      onJoinsChange(joins.filter((j) => j.id !== joinId));
    }
  };

  const handleJoinTypeChange = (joinId: string, newType: JoinType) => {
    onJoinsChange(
      joins.map((j) => (j.id === joinId ? { ...j, joinType: newType } : j))
    );
  };

  const getJoinTypeDescription = (type: JoinType): string => {
    switch (type) {
      case 'INNER':
        return 'Only shows rows that have matching data in both tables';
      case 'LEFT':
        return 'Shows all rows from the first table, even if no match exists';
      case 'RIGHT':
        return 'Shows all rows from the second table, even if no match exists';
      case 'FULL':
        return 'Shows all rows from both tables, with nulls where no match';
      default:
        return '';
    }
  };

  return (
    <StepContent>
      <StepHeader>
        <StepTitle>Link Related Tables</StepTitle>
        <StepDescription>
          Connect additional tables to include their data in your query. Tables are linked through their relationships.
        </StepDescription>
      </StepHeader>

      <StepInstructions>
        <LightbulbIcon fontSize="small" />
        <span>
          <strong>Optional step:</strong> You can skip this if you only need data from the starting table.
          Links are automatically detected based on table relationships.
        </span>
      </StepInstructions>

      {/* Current joins */}
      {joins.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#a1a1aa', mb: 2 }}>
            Linked Tables ({joins.length})
          </Box>
          <ListContainer>
            {joins.map((join) => (
              <JoinVisual key={join.id}>
                <JoinTable>
                  <JoinTableName>{join.fromTable}</JoinTableName>
                  <Badge colorVariant="neutral" label={join.fromColumn} size="small" />
                </JoinTable>

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <FormControl size="small" sx={{ minWidth: 160 }}>
                    <StyledSelect
                      value={join.joinType}
                      onChange={(e) => handleJoinTypeChange(join.id, e.target.value as JoinType)}
                      size="small"
                    >
                      {JOIN_TYPE_OPTIONS.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </StyledSelect>
                  </FormControl>
                  <Tooltip title={getJoinTypeDescription(join.joinType)}>
                    <HelpOutlineIcon sx={{ fontSize: '0.9rem', color: '#52525b', cursor: 'help' }} />
                  </Tooltip>
                </Box>

                <JoinArrow>
                  <ArrowForwardIcon />
                </JoinArrow>

                <JoinTable>
                  <JoinTableName>{join.toTable}</JoinTableName>
                  <Badge colorVariant="neutral" label={join.toColumn} size="small" />
                </JoinTable>

                <RemoveButton onClick={() => handleRemoveJoin(join.id)}>
                  <DeleteOutlineIcon fontSize="small" />
                </RemoveButton>
              </JoinVisual>
            ))}
          </ListContainer>
        </Box>
      )}

      {/* Available joins to add */}
      {availableJoins.length > 0 ? (
        <Box>
          <Box sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#a1a1aa', mb: 2 }}>
            Available Tables to Link
          </Box>
          <ListContainer>
            {availableJoins.map((avail, idx) => (
              <SelectableCard
                key={`${avail.sourceTable}-${avail.targetTable.name}-${idx}`}
                elevation={0}
                onClick={() =>
                  handleAddJoin(
                    avail.sourceTable,
                    avail.targetTable,
                    avail.sourceColumn,
                    avail.targetColumn
                  )
                }
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <CardTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{avail.targetTable.name}</span>
                      <Badge 
                        colorVariant="primary" 
                        label={`via ${avail.sourceTable}`} 
                        size="small" 
                      />
                    </CardTitle>
                    <CardSubtitle>
                      Link {avail.sourceTable}.{avail.sourceColumn} →{' '}
                      {avail.targetTable.name}.{avail.targetColumn}
                    </CardSubtitle>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinkIcon sx={{ color: '#667eea' }} />
                    <AddIcon sx={{ color: '#22c55e' }} />
                  </Box>
                </Box>
              </SelectableCard>
            ))}
          </ListContainer>
        </Box>
      ) : joins.length === 0 ? (
        <EmptyState>
          <EmptyIcon>
            <LinkOffIcon />
          </EmptyIcon>
          <EmptyTitle>No Related Tables Found</EmptyTitle>
          <EmptyText>
            The selected table doesn't have any defined relationships with other tables.
            You can still proceed with just the base table.
          </EmptyText>
        </EmptyState>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4, color: '#71717a' }}>
          <LinkIcon sx={{ fontSize: '2rem', mb: 1, opacity: 0.5 }} />
          <Box>All available tables have been linked</Box>
        </Box>
      )}
    </StepContent>
  );
};

export default JoinsStep;
