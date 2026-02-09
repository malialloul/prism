import React, { useState, useMemo } from 'react';
import {
  ExpandMore as ExpandIcon,
  ViewColumn as SelectIcon,
  FilterList as FilterIcon,
  Functions as AggIcon,
  GroupWork as GroupIcon,
  BarChart as HavingIcon,
  Sort as SortIcon,
} from '@mui/icons-material';
import {
  PanelContainer,
  PanelHeader,
  PanelTitle,
  PanelContent,
  Section,
  SectionHeader,
  SectionIcon,
  SectionTitle,
  SectionBadge,
  SectionContent,
} from './QueryConfigPanel.styles';
import SelectFields from './SelectFields';
import FiltersSection from './FiltersSection';
import AggregationsSection from './AggregationsSection';
import GroupBySection from './GroupBySection';
import HavingSection from './HavingSection';
import SortingLimitSection from './SortingLimitSection';
import type {
  CanvasTable,
  SelectedField,
  FilterCondition,
  GroupByField,
  HavingCondition,
  SchemaColumn,
} from '../types';

interface QueryConfigPanelProps {
  canvasTables: CanvasTable[];
  selectedFields: SelectedField[];
  filters: FilterCondition[];
  groupByFields: GroupByField[];
  havingConditions: HavingCondition[];
  limit: number | null;
  offset: number | null;
  onFieldToggle: (tableId: string, column: SchemaColumn) => void;
  onFieldUpdate: (fieldId: string, updates: Partial<SelectedField>) => void;
  onFieldRemove: (fieldId: string) => void;
  onFieldsReorder: (fields: SelectedField[]) => void;
  onFilterAdd: (filter: Omit<FilterCondition, 'id'>) => void;
  onFilterUpdate: (filterId: string, updates: Partial<FilterCondition>) => void;
  onFilterRemove: (filterId: string) => void;
  onGroupByAdd: (field: Omit<GroupByField, 'id'>) => void;
  onGroupByRemove: (fieldId: string) => void;
  onHavingAdd: (condition: Omit<HavingCondition, 'id'>) => void;
  onHavingUpdate: (conditionId: string, updates: Partial<HavingCondition>) => void;
  onHavingRemove: (conditionId: string) => void;
  onLimitChange: (limit: number | null) => void;
  onOffsetChange: (offset: number | null) => void;
}

export default function QueryConfigPanel({
  canvasTables,
  selectedFields,
  filters,
  groupByFields,
  havingConditions,
  limit,
  offset,
  onFieldToggle,
  onFieldUpdate,
  onFieldRemove,
  onFieldsReorder,
  onFilterAdd,
  onFilterUpdate,
  onFilterRemove,
  onGroupByAdd,
  onGroupByRemove,
  onHavingAdd,
  onHavingUpdate,
  onHavingRemove,
  onLimitChange,
  onOffsetChange,
}: QueryConfigPanelProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['select', 'filters']);

  const handleSectionChange = (section: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedSections((prev) =>
      isExpanded ? [...prev, section] : prev.filter((s) => s !== section)
    );
  };

  // Count aggregated fields
  const aggregationCount = selectedFields.filter((f) => f.aggregation).length;

  // Count sorted fields
  const sortCount = selectedFields.filter((f) => f.sortOrder).length;

  // Check if HAVING should be disabled
  const havingDisabled = aggregationCount === 0;

  // Calculate suggested group by fields (non-aggregated selected fields when aggregations exist)
  const suggestedGroupBy = useMemo(() => {
    if (aggregationCount === 0) return [];
    
    return selectedFields
      .filter((f) => !f.aggregation)
      .map((f) => ({
        id: f.id,
        tableId: f.tableId,
        tableName: f.tableName,
        columnName: f.columnName,
      }));
  }, [selectedFields, aggregationCount]);

  return (
    <PanelContainer elevation={0}>
      <PanelHeader>
        <PanelTitle>Query Options</PanelTitle>
      </PanelHeader>

      <PanelContent>
        {/* Select Fields Section */}
        <Section
          expanded={expandedSections.includes('select')}
          onChange={handleSectionChange('select')}
        >
          <SectionHeader expandIcon={<ExpandIcon sx={{ color: '#71717a' }} />}>
            <SectionIcon>
              <SelectIcon />
            </SectionIcon>
            <SectionTitle>Fields to Show</SectionTitle>
            {selectedFields.length > 0 && (
              <SectionBadge label={selectedFields.length} size="small" />
            )}
          </SectionHeader>
          <SectionContent>
            <SelectFields
              canvasTables={canvasTables}
              selectedFields={selectedFields}
              onFieldToggle={onFieldToggle}
              onFieldUpdate={onFieldUpdate}
              onFieldRemove={onFieldRemove}
              onFieldsReorder={onFieldsReorder}
            />
          </SectionContent>
        </Section>

        {/* Filters Section */}
        <Section
          expanded={expandedSections.includes('filters')}
          onChange={handleSectionChange('filters')}
        >
          <SectionHeader expandIcon={<ExpandIcon sx={{ color: '#71717a' }} />}>
            <SectionIcon>
              <FilterIcon />
            </SectionIcon>
            <SectionTitle>Filter Results</SectionTitle>
            {filters.length > 0 && (
              <SectionBadge label={filters.length} size="small" />
            )}
          </SectionHeader>
          <SectionContent>
            <FiltersSection
              canvasTables={canvasTables}
              filters={filters}
              onFilterAdd={onFilterAdd}
              onFilterUpdate={onFilterUpdate}
              onFilterRemove={onFilterRemove}
            />
          </SectionContent>
        </Section>

        {/* Aggregations Section */}
        <Section
          expanded={expandedSections.includes('aggregations')}
          onChange={handleSectionChange('aggregations')}
        >
          <SectionHeader expandIcon={<ExpandIcon sx={{ color: '#71717a' }} />}>
            <SectionIcon>
              <AggIcon />
            </SectionIcon>
            <SectionTitle>Calculations</SectionTitle>
            {aggregationCount > 0 && (
              <SectionBadge label={aggregationCount} size="small" />
            )}
          </SectionHeader>
          <SectionContent>
            <AggregationsSection
              selectedFields={selectedFields}
              onFieldUpdate={onFieldUpdate}
            />
          </SectionContent>
        </Section>

        {/* Group By Section */}
        <Section
          expanded={expandedSections.includes('groupby')}
          onChange={handleSectionChange('groupby')}
        >
          <SectionHeader expandIcon={<ExpandIcon sx={{ color: '#71717a' }} />}>
            <SectionIcon>
              <GroupIcon />
            </SectionIcon>
            <SectionTitle>Organize Results By</SectionTitle>
            {groupByFields.length > 0 && (
              <SectionBadge label={groupByFields.length} size="small" />
            )}
          </SectionHeader>
          <SectionContent>
            <GroupBySection
              canvasTables={canvasTables}
              selectedFields={selectedFields}
              groupByFields={groupByFields}
              onGroupByAdd={onGroupByAdd}
              onGroupByRemove={onGroupByRemove}
              suggestedGroupBy={suggestedGroupBy}
            />
          </SectionContent>
        </Section>

        {/* Having Section */}
        <Section
          expanded={expandedSections.includes('having')}
          onChange={handleSectionChange('having')}
          disabled={havingDisabled}
        >
          <SectionHeader
            expandIcon={<ExpandIcon sx={{ color: '#71717a' }} />}
            sx={{ opacity: havingDisabled ? 0.5 : 1 }}
          >
            <SectionIcon>
              <HavingIcon />
            </SectionIcon>
            <SectionTitle>Calculation Filters</SectionTitle>
            {havingConditions.length > 0 && (
              <SectionBadge label={havingConditions.length} size="small" />
            )}
          </SectionHeader>
          <SectionContent>
            <HavingSection
              selectedFields={selectedFields}
              havingConditions={havingConditions}
              onHavingAdd={onHavingAdd}
              onHavingUpdate={onHavingUpdate}
              onHavingRemove={onHavingRemove}
              disabled={havingDisabled}
            />
          </SectionContent>
        </Section>

        {/* Sorting & Limit Section */}
        <Section
          expanded={expandedSections.includes('sorting')}
          onChange={handleSectionChange('sorting')}
        >
          <SectionHeader expandIcon={<ExpandIcon sx={{ color: '#71717a' }} />}>
            <SectionIcon>
              <SortIcon />
            </SectionIcon>
            <SectionTitle>Sort & Limit</SectionTitle>
            {(sortCount > 0 || limit !== null) && (
              <SectionBadge
                label={sortCount > 0 ? `${sortCount} sorted` : `max ${limit}`}
                size="small"
              />
            )}
          </SectionHeader>
          <SectionContent>
            <SortingLimitSection
              selectedFields={selectedFields}
              onFieldUpdate={onFieldUpdate}
              limit={limit}
              offset={offset}
              onLimitChange={onLimitChange}
              onOffsetChange={onOffsetChange}
            />
          </SectionContent>
        </Section>
      </PanelContent>
    </PanelContainer>
  );
}
