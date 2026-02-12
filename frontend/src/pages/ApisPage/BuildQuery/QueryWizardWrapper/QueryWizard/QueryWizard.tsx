import React, { useState, useMemo, useCallback } from 'react';

import {
  WizardState,
  SchemaTable,
  DatabaseEngine,
  SelectedTable,
  TableJoin,
  SelectedField,
  ComputedField,
  FilterCondition,
  GroupByField,
  AggregateField,
  HavingCondition,
  SortField,
  UniquenessSettings,
  PaginationSettings,
  generateSqlWithNamedParams,
} from './types';
import { WizardContainer, WizardMain } from './QueryWizard.styles';
import {
  BaseTableStep,
  JoinsStep,
  FieldsStep,
  FiltersStep,
  AggregationStep,
  SortingStep,
  ReviewStep,
} from './steps';
import { WizardStepper, WizardNavigation, SqlPreviewSidebar } from './components';
import { generateSQL, validateState, isStepValid } from './sqlGenerator';

interface QueryWizardProps {
  tables: SchemaTable[];
  engine: DatabaseEngine;
  onExecute: (sql: string, params: (string | number | null)[], parameterValues: Record<string, string>) => void;
  onSave: (sql: string, params: (string | number | null)[], state: WizardState) => void;
  isExecuting?: boolean;
}

const initialState: WizardState = {
  baseTable: null,
  joins: [],
  selectedFields: [],
  computedFields: [],
  uniqueness: {
    enabled: false,
    mode: 'simple',
    distinctOnColumns: [],
  },
  filters: [],
  filterLogic: 'AND',
  groupByFields: [],
  aggregates: [],
  havingConditions: [],
  sortFields: [],
  limit: null,
  offset: null,
  pagination: {
    enabled: false,
    pageSizeRequired: false,
    pageCountRequired: false,
    defaultPageSize: 100,
  },
};

export const QueryWizard: React.FC<QueryWizardProps> = ({
  tables,
  engine,
  onExecute,
  onSave,
  isExecuting = false,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [state, setState] = useState<WizardState>(initialState);
  const [copied, setCopied] = useState(false);

  // Generate SQL
  const generatedSQL = useMemo(() => {
    return generateSQL(state, engine);
  }, [state, engine]);

  // Convert SQL to :paramName format (same as saved in API and displayed in OpenAPI tab)
  const sqlWithNamedParams = useMemo(() => {
    return generateSqlWithNamedParams(generatedSQL.query, state);
  }, [generatedSQL.query, state]);

  // Validate state
  const validation = useMemo(() => {
    return validateState(state, engine);
  }, [state, engine]);

  const hasErrors = validation.some((v) => v.severity === 'error');

  // Check for warnings/errors on current step
  const currentStepHasWarnings = useMemo(() => {
    return validation.some(
      (v) => v.step === currentStep && (v.severity === 'warning' || v.severity === 'error')
    );
  }, [validation, currentStep]);

  // Check if a step is completed (all steps up to and including it are valid)
  const isStepCompleted = useCallback(
    (step: number): boolean => {
      for (let i = 0; i <= step; i++) {
        if (!isStepValid(state, i, engine)) {
          return false;
        }
      }
      return true;
    },
    [state, engine]
  );

  // Check if can proceed to next step - must be valid AND no warnings
  const canProceed = useMemo(() => {
    return isStepValid(state, currentStep, engine) && !currentStepHasWarnings;
  }, [state, currentStep, currentStepHasWarnings, engine]);

  // Navigation
  const handleNext = useCallback(() => {
    if (currentStep < 6 && canProceed) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, canProceed]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const handleGoToStep = useCallback((step: number) => {
    // Allow going back to any previous step, or forward to completed steps
    if (step < currentStep || isStepCompleted(step - 1)) {
      setCurrentStep(step);
    }
  }, [currentStep, isStepCompleted]);

  // State updaters
  const setBaseTable = useCallback((table: SelectedTable | null) => {
    setState((prev) => ({
      ...prev,
      baseTable: table,
      // Reset dependent state when base table changes
      joins: [],
      selectedFields: [],
      computedFields: [],
      uniqueness: { enabled: false, mode: 'simple', distinctOnColumns: [] },
      groupByFields: [],
    }));
  }, []);

  const setJoins = useCallback((joins: TableJoin[]) => {
    setState((prev) => ({ ...prev, joins }));
  }, []);

  const setSelectedFields = useCallback((selectedFields: SelectedField[]) => {
    setState((prev) => ({ ...prev, selectedFields }));
  }, []);

  const setComputedFields = useCallback((computedFields: ComputedField[]) => {
    setState((prev) => ({ ...prev, computedFields }));
  }, []);

  const setUniqueness = useCallback((uniqueness: UniquenessSettings) => {
    setState((prev) => ({ ...prev, uniqueness }));
  }, []);

  const setFilters = useCallback((filters: FilterCondition[]) => {
    setState((prev) => ({ ...prev, filters }));
  }, []);

  const setFilterLogic = useCallback((filterLogic: 'AND' | 'OR') => {
    setState((prev) => ({ ...prev, filterLogic }));
  }, []);

  const setGroupByFields = useCallback((groupByFields: GroupByField[]) => {
    setState((prev) => ({ ...prev, groupByFields }));
  }, []);

  const setAggregates = useCallback((aggregates: AggregateField[]) => {
    setState((prev) => ({ ...prev, aggregates }));
  }, []);

  const setHavingConditions = useCallback((havingConditions: HavingCondition[]) => {
    setState((prev) => ({ ...prev, havingConditions }));
  }, []);

  const setSortFields = useCallback((sortFields: SortField[]) => {
    setState((prev) => ({ ...prev, sortFields }));
  }, []);

  const setLimit = useCallback((limit: number | null) => {
    setState((prev) => ({ ...prev, limit }));
  }, []);

  const setOffset = useCallback((offset: number | null) => {
    setState((prev) => ({ ...prev, offset }));
  }, []);

  const setPagination = useCallback((pagination: PaginationSettings) => {
    setState((prev) => ({ ...prev, pagination }));
  }, []);

  // Copy SQL (with :paramName format, same as saved API)
  const handleCopySQL = useCallback(() => {
    navigator.clipboard.writeText(sqlWithNamedParams);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [sqlWithNamedParams]);

  // Execute with parameters
  const handleExecute = useCallback((parameterValues: Record<string, string>) => {
    if (!hasErrors && generatedSQL.query) {
      // Create modified state with parameter values substituted as fixed values
      // and optional params without values removed entirely
      const modifiedFilters = state.filters
        .map((filter) => {
          if (filter.valueType === 'parameter') {
            const paramName = filter.parameterName || `${filter.table}_${filter.column}`;
            const value = parameterValues[paramName] ?? '';

            // Optional filter with no value - skip it entirely
            if (!filter.isRequired && !value.trim()) {
              return null;
            }

            // Convert parameter to fixed with actual value
            return { ...filter, valueType: 'fixed' as const, value };
          }
          return filter;
        })
        .filter((f): f is FilterCondition => f !== null);

      const modifiedHavingConditions = state.havingConditions
        .map((having) => {
          if (having.valueType === 'parameter') {
            const agg = state.aggregates.find((a) => a.id === having.aggregateId);
            const aggLabel = agg
              ? (agg.alias || `${agg.function.toLowerCase()}_${agg.column}`)
              : 'calculation';
            const paramName = having.parameterName || aggLabel;
            const value = parameterValues[paramName] ?? '';

            // Optional HAVING with no value - skip it entirely
            if (!having.isRequired && !value.trim()) {
              return null;
            }

            // Convert parameter to fixed with actual value
            return { ...having, valueType: 'fixed' as const, value };
          }
          return having;
        })
        .filter((h): h is HavingCondition => h !== null);

      // Handle pagination parameters
      let modifiedLimit = state.limit;
      let modifiedOffset = state.offset;
      let modifiedPagination = state.pagination;

      if (state.pagination?.enabled) {
        const pageSize = parameterValues['pagesize']
          ? parseInt(parameterValues['pagesize'], 10)
          : state.pagination.defaultPageSize;
        const pageCount = parameterValues['pagecount']
          ? parseInt(parameterValues['pagecount'], 10)
          : 1;

        modifiedLimit = pageSize;
        modifiedOffset = (pageCount - 1) * pageSize;
        // Disable pagination mode since we're using fixed values now
        modifiedPagination = { ...state.pagination, enabled: false };
      }

      const modifiedState: WizardState = {
        ...state,
        filters: modifiedFilters,
        havingConditions: modifiedHavingConditions,
        limit: modifiedLimit,
        offset: modifiedOffset,
        pagination: modifiedPagination,
      };

      // Regenerate SQL with values substituted - no params needed
      const finalSQL = generateSQL(modifiedState, engine);
      onExecute(finalSQL.query, finalSQL.params, parameterValues);
    }
  }, [hasErrors, generatedSQL, state, engine, onExecute]);

  // Save API
  const handleSave = useCallback(() => {
    if (generatedSQL.query) {
      onSave(generatedSQL.query, generatedSQL.params, state);
    }
  }, [generatedSQL.query, generatedSQL.params, state, onSave]);

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <BaseTableStep
            tables={tables}
            selectedTable={state.baseTable}
            onSelectTable={setBaseTable}
          />
        );
      case 1:
        if (!state.baseTable) return null;
        return (
          <JoinsStep
            tables={tables}
            baseTable={state.baseTable}
            joins={state.joins}
            onJoinsChange={setJoins}
          />
        );
      case 2:
        if (!state.baseTable) return null;
        return (
          <FieldsStep
            tables={tables}
            baseTable={state.baseTable}
            joins={state.joins}
            selectedFields={state.selectedFields}
            computedFields={state.computedFields}
            uniqueness={state.uniqueness}
            engine={engine}
            hasAggregations={state.aggregates.length > 0}
            onFieldsChange={setSelectedFields}
            onComputedFieldsChange={setComputedFields}
            onUniquenessChange={setUniqueness}
          />
        );
      case 3:
        if (!state.baseTable) return null;
        return (
          <FiltersStep
            tables={tables}
            baseTable={state.baseTable}
            joins={state.joins}
            selectedFields={state.selectedFields}
            filters={state.filters}
            filterLogic={state.filterLogic}
            onFiltersChange={setFilters}
            onFilterLogicChange={setFilterLogic}
          />
        );
      case 4:
        if (!state.baseTable) return null;
        return (
          <AggregationStep
            tables={tables}
            baseTable={state.baseTable}
            joins={state.joins}
            selectedFields={state.selectedFields}
            computedFields={state.computedFields}
            groupByFields={state.groupByFields}
            aggregates={state.aggregates}
            havingConditions={state.havingConditions}
            engine={engine}
            onGroupByChange={setGroupByFields}
            onAggregatesChange={setAggregates}
            onHavingChange={setHavingConditions}
          />
        );
      case 5:
        if (!state.baseTable) return null;
        return (
          <SortingStep
            tables={tables}
            baseTable={state.baseTable}
            joins={state.joins}
            selectedFields={state.selectedFields}
            groupByFields={state.groupByFields}
            aggregates={state.aggregates}
            sortFields={state.sortFields}
            limit={state.limit}
            offset={state.offset}
            pagination={state.pagination}
            onSortFieldsChange={setSortFields}
            onLimitChange={setLimit}
            onOffsetChange={setOffset}
            onPaginationChange={setPagination}
          />
        );
      case 6:
        return (
          <ReviewStep
            state={state}
            sql={generatedSQL.query}
            validation={validation}
            onCopySQL={handleCopySQL}
            onExecute={handleExecute}
            onSave={handleSave}
            onGoToStep={handleGoToStep}
            isExecuting={isExecuting}
          />
        );
      default:
        return null;
    }
  };

  // Check which steps are completed
  const getStepStatus = useCallback((stepIndex: number): { completed: boolean; active: boolean; clickable: boolean } => {
    const active = stepIndex === currentStep;
    const completed = stepIndex < currentStep;
    // Can click to go back, or forward to steps that have all prerequisites completed
    const clickable = stepIndex < currentStep || (stepIndex > currentStep && isStepCompleted(stepIndex - 1));
    return { completed, active, clickable };
  }, [currentStep, isStepCompleted]);

  return (
    <WizardContainer>
      <WizardMain>
        <WizardStepper
          onGoToStep={handleGoToStep}
          getStepStatus={getStepStatus}
        />

        {renderStepContent()}

        <WizardNavigation
          currentStep={currentStep}
          canProceed={canProceed}
          onBack={handleBack}
          onNext={handleNext}
        />
      </WizardMain>

      <SqlPreviewSidebar
        sql={sqlWithNamedParams}
        validation={validation}
        copied={copied}
        onCopy={handleCopySQL}
      />
    </WizardContainer>
  );
};

export default QueryWizard;
