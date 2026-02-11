import React, { useMemo, useState } from 'react';
import { Box, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TableChartIcon from '@mui/icons-material/TableChart';
import KeyIcon from '@mui/icons-material/VpnKey';
import LinkIcon from '@mui/icons-material/Link';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

import { SchemaTable, SelectedTable } from '../types';
import {
  StepContent,
  StepHeader,
  StepTitle,
  StepDescription,
  StepInstructions,
  SearchField,
  GridContainer,
  SelectableCard,
  CardTitle,
  CardSubtitle,
  CardMeta,
  TypeBadge,
  EmptyState,
  EmptyIcon,
  EmptyTitle,
  EmptyText,
} from '../QueryWizard.styles';

interface BaseTableStepProps {
  tables: SchemaTable[];
  selectedTable: SelectedTable | null;
  onSelectTable: (table: SelectedTable | null) => void;
}

export const BaseTableStep: React.FC<BaseTableStepProps> = ({
  tables,
  selectedTable,
  onSelectTable,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTables = useMemo(() => {
    if (!searchQuery.trim()) return tables;
    const query = searchQuery.toLowerCase();
    return tables.filter(
      (table) =>
        table.name.toLowerCase().includes(query) ||
        table.columns.some((col) => col.name.toLowerCase().includes(query))
    );
  }, [tables, searchQuery]);

  const handleSelect = (table: SchemaTable) => {
    if (selectedTable?.name === table.name) {
      onSelectTable(null);
    } else {
      onSelectTable({
        name: table.name,
        alias: table.name.charAt(0).toLowerCase(),
      });
    }
  };

  const getTableStats = (table: SchemaTable) => {
    const pkCount = table.columns.filter((c) => c.isPrimaryKey).length;
    const fkCount = table.columns.filter((c) => c.foreignKey).length;
    const totalCols = table.columns.length;
    return { pkCount, fkCount, totalCols };
  };

  if (tables.length === 0) {
    return (
      <StepContent>
        <EmptyState>
          <EmptyIcon>
            <TableChartIcon />
          </EmptyIcon>
          <EmptyTitle>No Tables Found</EmptyTitle>
          <EmptyText>
            This database doesn't have any tables yet. Create some tables first to start building queries.
          </EmptyText>
        </EmptyState>
      </StepContent>
    );
  }

  return (
    <StepContent>
      <StepHeader>
        <StepTitle>Choose Your Starting Table</StepTitle>
        <StepDescription>
          Select the main table you want to get data from. This will be the foundation of your query.
        </StepDescription>
      </StepHeader>

      <StepInstructions>
        <LightbulbIcon fontSize="small" />
        <span>
          <strong>Tip:</strong> Pick the table that contains the main information you need. 
          You can link other tables later to get related data.
        </span>
      </StepInstructions>

      <SearchField
        fullWidth
        placeholder="Search tables by name or column..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: '#52525b' }} />
            </InputAdornment>
          ),
        }}
        sx={{ marginBottom: '20px' }}
      />

      {filteredTables.length === 0 ? (
        <EmptyState>
          <EmptyIcon>
            <SearchIcon />
          </EmptyIcon>
          <EmptyTitle>No Matching Tables</EmptyTitle>
          <EmptyText>
            Try a different search term or clear the search to see all tables.
          </EmptyText>
        </EmptyState>
      ) : (
        <GridContainer>
          {filteredTables.map((table) => {
            const isSelected = selectedTable?.name === table.name;
            const { pkCount, fkCount, totalCols } = getTableStats(table);

            return (
              <SelectableCard
                key={table.name}
                isSelected={isSelected}
                onClick={() => handleSelect(table)}
                elevation={0}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Box>
                    <CardTitle>
                      {table.name}
                      {isSelected && (
                        <CheckCircleIcon
                          sx={{ ml: 1, fontSize: '1rem', color: '#22c55e', verticalAlign: 'middle' }}
                        />
                      )}
                    </CardTitle>
                    <CardSubtitle>{totalCols} columns</CardSubtitle>
                  </Box>
                  <TableChartIcon sx={{ color: isSelected ? '#667eea' : '#52525b', fontSize: '1.2rem' }} />
                </Box>

                <CardMeta>
                  {pkCount > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <KeyIcon sx={{ fontSize: '0.85rem', color: '#f59e0b' }} />
                      <span>{pkCount} primary key{pkCount > 1 ? 's' : ''}</span>
                    </Box>
                  )}
                  {fkCount > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <LinkIcon sx={{ fontSize: '0.85rem', color: '#667eea' }} />
                      <span>{fkCount} link{fkCount > 1 ? 's' : ''}</span>
                    </Box>
                  )}
                </CardMeta>

                {/* Preview of column types */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '4px', mt: 1 }}>
                  {table.columns.slice(0, 4).map((col) => (
                    <TypeBadge key={col.name}>{col.name}</TypeBadge>
                  ))}
                  {table.columns.length > 4 && (
                    <TypeBadge>+{table.columns.length - 4} more</TypeBadge>
                  )}
                </Box>
              </SelectableCard>
            );
          })}
        </GridContainer>
      )}
    </StepContent>
  );
};

export default BaseTableStep;
