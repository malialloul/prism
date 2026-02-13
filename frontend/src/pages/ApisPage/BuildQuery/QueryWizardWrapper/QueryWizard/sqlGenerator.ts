import {
  WizardState,
  DatabaseEngine,
  GeneratedSQL,
  ValidationMessage,
  quoteId,
  AGGREGATION_OPTIONS,
  getColumnCategory,
} from './types';

/**
 * Generate SQL from wizard state
 */
export function generateSQL(state: WizardState, engine: DatabaseEngine): GeneratedSQL {
  if (!state.baseTable) {
    return { query: '', params: [] };
  }

  const q = (name: string) => quoteId(name, engine);
  const params: (string | number | null)[] = [];
  let paramIndex = 1;

  // Helper to add parameter and return placeholder (only for runtime parameters)
  const addParam = (value: string | number | null): string => {
    params.push(value);
    if (engine === 'postgres') {
      return `$${paramIndex++}`;
    }
    return '?';
  };

  // Helper to quote a literal value for inline SQL (for fixed values)
  const quoteLiteral = (value: string, columnType?: string): string => {
    // Escape single quotes by doubling them
    const escaped = value.replace(/'/g, "''");
    
    // Handle UUID type casting for PostgreSQL
    if (columnType && engine === 'postgres') {
      const category = getColumnCategory(columnType);
      if (category === 'uuid') {
        return `'${escaped}'::uuid`;
      }
    }
    
    return `'${escaped}'`;
  };

  // Helper to get column expression (handles computed fields)
  const getColumnExpr = (table: string, column: string): string => {
    if (table === '__computed__') {
      // Find the computed field by alias and return its expression
      const cf = state.computedFields.find((c) => c.alias === column);
      if (cf) {
        return `(${q(cf.leftTable)}.${q(cf.leftColumn)} ${cf.operator} ${q(cf.rightTable)}.${q(cf.rightColumn)})`;
      }
      // Fallback - shouldn't happen
      return q(column);
    }
    return `${q(table)}.${q(column)}`;
  };

  // Build SELECT clause
  let selectParts: string[] = [];
  let distinctClause = '';

  // Handle DISTINCT / DISTINCT ON
  const useDistinct = state.uniqueness?.enabled && state.aggregates.length === 0;
  if (useDistinct) {
    if (state.uniqueness.mode === 'distinctOn' && engine === 'postgres' && state.uniqueness.distinctOnColumns.length > 0) {
      const distinctCols = state.uniqueness.distinctOnColumns
        .map((c) => `${q(c.table)}.${q(c.column)}`)
        .join(', ');
      distinctClause = `DISTINCT ON (${distinctCols}) `;
    } else {
      distinctClause = 'DISTINCT ';
    }
  }

  // If aggregates exist, include them
  if (state.aggregates.length > 0) {
    // Add group by fields to select
    state.groupByFields.forEach((g) => {
      selectParts.push(`${q(g.table)}.${q(g.column)}`);
    });

    // Add aggregates
    state.aggregates.forEach((agg) => {
      const aggFunc = agg.function;
      const col = getColumnExpr(agg.table, agg.column);
      let expr = '';

      switch (aggFunc) {
        case 'COUNT':
          expr = `COUNT(${col})`;
          break;
        case 'SUM':
          expr = `SUM(${col})`;
          break;
        case 'AVG':
          expr = `AVG(${col})`;
          break;
        case 'MIN':
          expr = `MIN(${col})`;
          break;
        case 'MAX':
          expr = `MAX(${col})`;
          break;
        case 'COUNT_DISTINCT':
          expr = `COUNT(DISTINCT ${col})`;
          break;
        default:
          expr = `${aggFunc}(${col})`;
      }

      if (agg.alias) {
        expr += ` AS ${q(agg.alias)}`;
      }
      selectParts.push(expr);
    });
  } else if (state.selectedFields.length > 0 || state.computedFields.length > 0) {
    // Regular field selection
    state.selectedFields.forEach((f) => {
      let expr = `${q(f.table)}.${q(f.column)}`;
      if (f.alias) {
        expr += ` AS ${q(f.alias)}`;
      }
      selectParts.push(expr);
    });
    
    // Add computed fields
    state.computedFields.forEach((cf) => {
      const leftCol = `${q(cf.leftTable)}.${q(cf.leftColumn)}`;
      const rightCol = `${q(cf.rightTable)}.${q(cf.rightColumn)}`;
      let expr = `(${leftCol} ${cf.operator} ${rightCol})`;
      if (cf.alias) {
        expr += ` AS ${q(cf.alias)}`;
      }
      selectParts.push(expr);
    });
  } else {
    // Default: select all
    selectParts.push('*');
  }

  // Build FROM clause (no aliases)
  const fromClause = q(state.baseTable.name);

  // Build JOIN clauses (no aliases)
  const joinClauses: string[] = [];
  state.joins.forEach((join) => {
    let joinType = '';
    switch (join.joinType) {
      case 'INNER':
        joinType = 'INNER JOIN';
        break;
      case 'LEFT':
        joinType = 'LEFT JOIN';
        break;
      case 'RIGHT':
        joinType = 'RIGHT JOIN';
        break;
      case 'FULL':
        joinType = 'FULL OUTER JOIN';
        break;
      default:
        joinType = 'INNER JOIN';
    }

    const joinClause = `${joinType} ${q(join.toTable)} ON ${q(join.fromTable)}.${q(join.fromColumn)} = ${q(join.toTable)}.${q(join.toColumn)}`;
    joinClauses.push(joinClause);
  });

  // Build WHERE clause
  const whereParts: string[] = [];
  state.filters.forEach((filter) => {
    const col = `${q(filter.table)}.${q(filter.column)}`;
    let condition = '';

    // For parameter mode, we add placeholders that will be filled at runtime
    const isParam = filter.valueType === 'parameter';
    const isOptional = isParam && filter.isRequired === false;
    const paramPlaceholder = `{{${filter.parameterName || filter.column}}}`;

    // Check if column is numeric type
    const colType = (filter.columnType || '').toLowerCase();
    const numericTypes = ['int', 'integer', 'smallint', 'bigint', 'decimal', 'numeric', 'float', 'double', 'real', 'serial', 'bigserial'];
    const isNumericColumn = numericTypes.some(t => colType === t || colType.startsWith(t + '('));

    // Helper to wrap optional conditions - if param is empty, condition is skipped
    const wrapOptional = (cond: string, placeholder: string): string => {
      if (!isOptional) return cond;
      // For optional params: if the placeholder value is empty, treat as TRUE (skip filter)
      return `(${placeholder} = '' OR ${cond})`;
    };

    // Helper to safely cast placeholder for numeric columns
    const safeNumericPlaceholder = (placeholder: string): string => {
      if (isOptional && isNumericColumn) {
        // MySQL uses DECIMAL or SIGNED, PostgreSQL uses NUMERIC
        const castType = engine === 'mysql' ? 'DECIMAL' : 'NUMERIC';
        return `CAST(NULLIF(${placeholder}, '') AS ${castType})`;
      }
      return placeholder;
    };

    switch (filter.operator) {
      case '=':
      case '!=':
      case '>':
      case '<':
      case '>=':
      case '<=':
        if (isParam) {
          const placeholder = addParam(paramPlaceholder);
          const safePlaceholder = safeNumericPlaceholder(placeholder);
          condition = wrapOptional(`${col} ${filter.operator} ${safePlaceholder}`, placeholder);
        } else {
          condition = `${col} ${filter.operator} ${quoteLiteral(filter.value, filter.columnType)}`;
        }
        break;
      case 'LIKE':
        if (isParam) {
          const placeholder = addParam(paramPlaceholder);
          condition = wrapOptional(`${col} LIKE ${placeholder}`, placeholder);
        } else {
          condition = `${col} LIKE ${quoteLiteral(filter.value)}`;
        }
        break;
      case 'NOT LIKE':
        if (isParam) {
          const placeholder = addParam(paramPlaceholder);
          condition = wrapOptional(`${col} NOT LIKE ${placeholder}`, placeholder);
        } else {
          condition = `${col} NOT LIKE ${quoteLiteral(filter.value)}`;
        }
        break;
      case 'IN':
        if (isParam) {
          // For parameter mode, single placeholder with comma-separated values
          const placeholder = addParam(paramPlaceholder);
          condition = wrapOptional(`${col} IN (${placeholder})`, placeholder);
        } else {
          // Use the values array for fixed values
          const inValues = filter.values.length > 0 ? filter.values : filter.value.split(',').map((v) => v.trim()).filter(Boolean);
          if (inValues.length === 0) {
            condition = `${col} IN (NULL)`; // Fallback for empty
          } else {
            const inPlaceholders = inValues.map((v) => quoteLiteral(v, filter.columnType)).join(', ');
            condition = `${col} IN (${inPlaceholders})`;
          }
        }
        break;
      case 'NOT IN':
        if (isParam) {
          const placeholder = addParam(paramPlaceholder);
          condition = wrapOptional(`${col} NOT IN (${placeholder})`, placeholder);
        } else {
          const notInValues = filter.values.length > 0 ? filter.values : filter.value.split(',').map((v) => v.trim()).filter(Boolean);
          if (notInValues.length === 0) {
            condition = `${col} NOT IN (NULL)`;
          } else {
            const notInPlaceholders = notInValues.map((v) => quoteLiteral(v, filter.columnType)).join(', ');
            condition = `${col} NOT IN (${notInPlaceholders})`;
          }
        }
        break;
      case 'CONTAINS ALL':
        // Array/JSON contains all values
        if (isParam) {
          const placeholder = addParam(paramPlaceholder);
          if (engine === 'postgres') {
            condition = wrapOptional(`${col} @> ${placeholder}`, placeholder);
          } else {
            condition = wrapOptional(`JSON_CONTAINS(${col}, ${placeholder})`, placeholder);
          }
        } else {
          const allValues = filter.values.length > 0 ? filter.values : filter.value.split(',').map((v) => v.trim()).filter(Boolean);
          if (allValues.length === 0) {
            condition = '1=1'; // No constraint if empty
          } else if (engine === 'postgres') {
            const arrayLiteral = `ARRAY[${allValues.map((v) => quoteLiteral(v)).join(', ')}]`;
            condition = `${col} @> ${arrayLiteral}`;
          } else {
            // MySQL JSON_CONTAINS
            const jsonArray = JSON.stringify(allValues);
            condition = `JSON_CONTAINS(${col}, '${jsonArray.replace(/'/g, "''")}')`;
          }
        }
        break;
      case 'IS NULL':
        condition = `${col} IS NULL`;
        break;
      case 'IS NOT NULL':
        condition = `${col} IS NOT NULL`;
        break;
      case 'BETWEEN':
        if (isParam) {
          const paramName = filter.parameterName || filter.column;
          const fromPlaceholder = addParam(`{{${paramName}_from}}`);
          const toPlaceholder = addParam(`{{${paramName}_to}}`);
          let betweenCond: string;
          if (isOptional && isNumericColumn) {
            const castType = engine === 'mysql' ? 'DECIMAL' : 'NUMERIC';
            betweenCond = `${col} BETWEEN CAST(NULLIF(${fromPlaceholder}, '') AS ${castType}) AND CAST(NULLIF(${toPlaceholder}, '') AS ${castType})`;
          } else {
            betweenCond = `${col} BETWEEN ${fromPlaceholder} AND ${toPlaceholder}`;
          }
          condition = isOptional ? `(${fromPlaceholder} = '' OR ${betweenCond})` : betweenCond;
        } else {
          const start = filter.value || '';
          const end = filter.value2 || '';
          condition = `${col} BETWEEN ${quoteLiteral(start)} AND ${quoteLiteral(end)}`;
        }
        break;
      default:
        if (isParam) {
          const placeholder = addParam(paramPlaceholder);
          const safePlaceholder = safeNumericPlaceholder(placeholder);
          condition = wrapOptional(`${col} = ${safePlaceholder}`, placeholder);
        } else {
          condition = `${col} = ${quoteLiteral(filter.value, filter.columnType)}`;
        }
    }

    whereParts.push(condition);
  });

  // Build GROUP BY clause
  const groupByParts: string[] = [];
  state.groupByFields.forEach((g) => {
    groupByParts.push(`${q(g.table)}.${q(g.column)}`);
  });

  // Build HAVING clause
  const havingParts: string[] = [];
  state.havingConditions.forEach((having) => {
    const agg = state.aggregates.find((a) => a.id === having.aggregateId);
    if (!agg) return;

    const aggFunc = agg.function;
    const col = getColumnExpr(agg.table, agg.column);
    let aggExpr = '';

    switch (aggFunc) {
      case 'COUNT':
        aggExpr = `COUNT(${col})`;
        break;
      case 'SUM':
        aggExpr = `SUM(${col})`;
        break;
      case 'AVG':
        aggExpr = `AVG(${col})`;
        break;
      case 'MIN':
        aggExpr = `MIN(${col})`;
        break;
      case 'MAX':
        aggExpr = `MAX(${col})`;
        break;
      case 'COUNT_DISTINCT':
        aggExpr = `COUNT(DISTINCT ${col})`;
        break;
      default:
        aggExpr = `${aggFunc}(${col})`;
    }

    // Handle fixed vs parameter values
    const isParam = having.valueType === 'parameter';
    const isOptional = isParam && having.isRequired === false;
    const aggLabel = agg.alias || `${agg.function.toLowerCase()}_${agg.column}`;
    const paramName = having.parameterName || aggLabel;
    
    if (isParam) {
      // Parameter - add placeholder for runtime substitution
      const placeholder = addParam(`{{${paramName}}}`);
      if (isOptional) {
        // For optional HAVING params, use pattern that works with empty string
        // When param is empty: ('' = '' OR ...) evaluates to TRUE, skipping the condition
        // Use NULLIF to safely handle the empty string for numeric comparison
        const castType = engine === 'mysql' ? 'DECIMAL' : 'NUMERIC';
        havingParts.push(`(${placeholder} = '' OR ${aggExpr} ${having.operator} CAST(NULLIF(${placeholder}, '') AS ${castType}))`);
      } else {
        havingParts.push(`${aggExpr} ${having.operator} ${placeholder}`);
      }
    } else {
      // Fixed value - inline in query
      havingParts.push(`${aggExpr} ${having.operator} ${quoteLiteral(having.value)}`);
    }
  });

  // Build ORDER BY clause
  const orderByParts: string[] = [];

  // For PostgreSQL DISTINCT ON, the columns must appear first in ORDER BY
  if (
    state.uniqueness?.enabled &&
    state.uniqueness.mode === 'distinctOn' &&
    state.uniqueness.distinctOnColumns.length > 0 &&
    engine === 'postgres'
  ) {
    // Add DISTINCT ON columns first with their specified direction
    state.uniqueness.distinctOnColumns.forEach((col) => {
      const direction = col.direction || 'ASC';
      orderByParts.push(`${q(col.table)}.${q(col.column)} ${direction}`);
    });
  }

  state.sortFields.forEach((sort) => {
    // Skip if already added by DISTINCT ON
    if (
      state.uniqueness?.enabled &&
      state.uniqueness.mode === 'distinctOn' &&
      engine === 'postgres' &&
      sort.table &&
      sort.column
    ) {
      const isDistinctOnCol = state.uniqueness.distinctOnColumns.some(
        (d) => d.table === sort.table && d.column === sort.column
      );
      if (isDistinctOnCol) return; // Skip, already added
    }

    let sortExpr = '';

    if ('aggregateId' in sort && sort.aggregateId) {
      const agg = state.aggregates.find((a) => a.id === sort.aggregateId);
      if (agg) {
        if (agg.alias) {
          sortExpr = q(agg.alias);
        } else {
          const col = getColumnExpr(agg.table, agg.column);
          switch (agg.function) {
            case 'COUNT':
              sortExpr = `COUNT(${col})`;
              break;
            case 'SUM':
              sortExpr = `SUM(${col})`;
              break;
            case 'AVG':
              sortExpr = `AVG(${col})`;
              break;
            case 'MIN':
              sortExpr = `MIN(${col})`;
              break;
            case 'MAX':
              sortExpr = `MAX(${col})`;
              break;
            case 'COUNT_DISTINCT':
              sortExpr = `COUNT(DISTINCT ${col})`;
              break;
            default:
              sortExpr = `${agg.function}(${col})`;
          }
        }
      }
    } else if (sort.table && sort.column) {
      sortExpr = `${q(sort.table)}.${q(sort.column)}`;
    }

    if (sortExpr) {
      orderByParts.push(`${sortExpr} ${sort.direction}`);
    }
  });

  // Assemble query
  let query = `SELECT ${distinctClause}${selectParts.join(',\n       ')}\n`;
  query += `FROM ${fromClause}`;

  if (joinClauses.length > 0) {
    query += '\n' + joinClauses.join('\n');
  }

  if (whereParts.length > 0) {
    const whereJoin = state.filterLogic === 'OR' ? ' OR ' : ' AND ';
    query += `\nWHERE ${whereParts.join(whereJoin)}`;
  }

  if (groupByParts.length > 0) {
    query += `\nGROUP BY ${groupByParts.join(', ')}`;
  }

  if (havingParts.length > 0) {
    query += `\nHAVING ${havingParts.join(' AND ')}`;
  }

  if (orderByParts.length > 0) {
    query += `\nORDER BY ${orderByParts.join(', ')}`;
  }

  // Handle pagination (either fixed LIMIT/OFFSET or parameterized)
  if (state.pagination?.enabled) {
    // Pagination mode - use parameters
    // Use :pagesize and :offset placeholders that backend will replace
    const pageSizePlaceholder = addParam('{{pagesize}}');
    const offsetPlaceholder = addParam('{{offset}}');
    query += `\nLIMIT ${pageSizePlaceholder}`;
    query += `\nOFFSET ${offsetPlaceholder}`;
  } else {
    // Fixed mode
    if (state.limit) {
      query += `\nLIMIT ${state.limit}`;
    }

    if (state.offset) {
      query += `\nOFFSET ${state.offset}`;
    }
  }

  return { query, params };
}

/**
 * Validate wizard state against database-specific rules
 */
export function validateState(state: WizardState, engine: DatabaseEngine = 'postgres'): ValidationMessage[] {
  const messages: ValidationMessage[] = [];

  // Step 0: Base table required
  if (!state.baseTable) {
    messages.push({
      step: 0,
      severity: 'error',
      message: 'Please select a starting table',
      fix: 'Select a table in Step 1',
    });
  }

  // Step 2: Fields - warning if no fields selected
  if (state.selectedFields.length === 0 && state.aggregates.length === 0) {
    messages.push({
      step: 2,
      severity: 'info',
      message: 'No specific fields selected - all columns will be returned',
    });
  }

  // ============================================================================
  // DISTINCT ON VALIDATION (PostgreSQL only)
  // ============================================================================

  // DISTINCT ON is PostgreSQL-only - error if used with MySQL
  if (state.uniqueness?.enabled && state.uniqueness.mode === 'distinctOn' && engine === 'mysql') {
    messages.push({
      step: 2,
      severity: 'error',
      message: 'DISTINCT ON is not supported in MySQL',
      fix: 'Switch to Simple DISTINCT mode or use GROUP BY instead',
      autoFix: { type: 'removeDistinctOn' },
    });
  }

  // DISTINCT ON requires columns selected
  if (
    state.uniqueness?.enabled &&
    state.uniqueness.mode === 'distinctOn' &&
    state.uniqueness.distinctOnColumns.length === 0 &&
    engine === 'postgres'
  ) {
    messages.push({
      step: 2,
      severity: 'warning',
      message: 'DISTINCT ON mode requires at least one column selected for uniqueness',
      fix: 'Select columns in "By Specific Fields" or switch to Simple mode',
    });
  }

  // DISTINCT ON columns must appear first in ORDER BY (PostgreSQL)
  // Note: DISTINCT ON is automatically disabled when aggregates exist, so no need to validate that combination
  if (
    state.uniqueness?.enabled &&
    state.uniqueness.mode === 'distinctOn' &&
    state.uniqueness.distinctOnColumns.length > 0 &&
    state.sortFields.length > 0 &&
    state.aggregates.length === 0 &&
    engine === 'postgres'
  ) {
    // Check if the first N ORDER BY columns match the DISTINCT ON columns
    for (let i = 0; i < state.uniqueness.distinctOnColumns.length; i++) {
      const distinctCol = state.uniqueness.distinctOnColumns[i];
      const sortField = state.sortFields[i];

      // If there's no sort field at this position, or it doesn't match
      if (!sortField || sortField.table !== distinctCol.table || sortField.column !== distinctCol.column) {
        // Not an error - we auto-add these columns to ORDER BY in SQL generation
        // But warn the user about the implicit ordering
        messages.push({
          step: 5,
          severity: 'info',
          message: `DISTINCT ON columns will be automatically added to ORDER BY: ${state.uniqueness.distinctOnColumns.map(c => `${c.table}.${c.column}`).join(', ')}`,
        });
        break; // Only show this once
      }
    }
  }

  // ============================================================================
  // ORDER BY WITH AGGREGATION VALIDATION
  // ============================================================================

  // When using aggregation, ORDER BY columns must be either:
  // 1. In the GROUP BY clause
  // 2. An aggregate expression
  const aggregationActive = state.groupByFields.length > 0 || state.aggregates.length > 0;
  
  if (aggregationActive && state.sortFields.length > 0) {
    const groupByKeys = new Set(
      state.groupByFields.map((g) => `${g.table}.${g.column}`)
    );

    const invalidSortFields: Array<{ table: string; column: string }> = [];
    
    state.sortFields.forEach((sort) => {
      // If it's sorting by an aggregate, that's always valid
      if ('aggregateId' in sort && sort.aggregateId) {
        return;
      }
      
      // Otherwise it must be in GROUP BY
      if (sort.table && sort.column) {
        const key = `${sort.table}.${sort.column}`;
        if (!groupByKeys.has(key)) {
          invalidSortFields.push({ table: sort.table, column: sort.column });
        }
      }
    });

    if (invalidSortFields.length > 0) {
      if (engine === 'postgres') {
        messages.push({
          step: 5,
          severity: 'error',
          message: `Sort column(s) must be in GROUP BY or be an aggregate when using aggregation: ${invalidSortFields.map(f => `${f.table}.${f.column}`).join(', ')}`,
          fix: 'Add these columns to "Organize Results By" in Aggregation step, or sort by an aggregate instead',
        });
      } else {
        messages.push({
          step: 5,
          severity: 'warning',
          message: `Sort column(s) not in GROUP BY may cause unpredictable ordering: ${invalidSortFields.map(f => `${f.table}.${f.column}`).join(', ')}`,
          fix: 'Consider adding to GROUP BY or sorting by an aggregate',
        });
      }
    }
  }

  // ============================================================================
  // GROUP BY VALIDATION
  // ============================================================================

  // When using GROUP BY (aggregation mode enabled), check that all selected fields are either:
  // 1. In GROUP BY, or
  // 2. Wrapped in an aggregate function
  // Note: Check activates when GROUP BY has fields OR when aggregates exist
  const aggregationEnabled = state.groupByFields.length > 0 || state.aggregates.length > 0;
  
  // Only validate selectedFields when GROUP BY exists but no aggregates
  // (When aggregates exist, selectedFields are NOT included in SELECT - only groupByFields + aggregates are)
  const validateSelectedFields = state.groupByFields.length > 0 && state.aggregates.length === 0;
  
  if (validateSelectedFields && state.selectedFields.length > 0) {
    const groupByKeys = new Set(
      state.groupByFields.map((g) => `${g.table}.${g.column}`)
    );

    const missingFields: Array<{ table: string; column: string }> = [];
    state.selectedFields.forEach((field) => {
      const key = `${field.table}.${field.column}`;
      if (!groupByKeys.has(key)) {
        missingFields.push({ table: field.table, column: field.column });
      }
    });

    if (missingFields.length > 0) {
      if (engine === 'postgres') {
        // PostgreSQL: strict mode - this is an error
        messages.push({
          step: 4,
          severity: 'error',
          message: `Field(s) must be in "Organize Results By" when using aggregation: ${missingFields.map(f => `${f.table}.${f.column}`).join(', ')}`,
          fix: 'Add these fields to GROUP BY or remove from selected fields',
          autoFix: { type: 'addToGroupBy', columns: missingFields },
        });
      } else {
        // MySQL: lenient by default - warning about arbitrary values
        messages.push({
          step: 4,
          severity: 'warning',
          message: `Non-aggregated field(s) not in GROUP BY may return arbitrary values: ${missingFields.map(f => `${f.table}.${f.column}`).join(', ')}`,
          fix: 'Add to GROUP BY for predictable results, or wrap in an aggregate function',
          autoFix: { type: 'addToGroupBy', columns: missingFields },
        });
      }
    }
  }

  // ============================================================================
  // COMPUTED COLUMNS VALIDATION
  // ============================================================================

  // Computed columns in GROUP BY queries need special handling
  if (aggregationEnabled && state.computedFields.length > 0) {
    // Check which computed columns are already wrapped in aggregates
    const aggregatedComputedAliases = new Set(
      state.aggregates
        .filter((agg) => agg.table === '__computed__')
        .map((agg) => agg.column)
    );

    // Computed columns are not in GROUP BY (they can't be directly), so they need aggregation
    state.computedFields.forEach((computed) => {
      // Skip if already wrapped in an aggregate
      if (aggregatedComputedAliases.has(computed.alias)) {
        return;
      }

      if (engine === 'postgres') {
        // PostgreSQL: computed columns without aggregation in GROUP BY query is an error
        messages.push({
          step: 4,
          severity: 'error',
          message: `Computed column "${computed.alias}" must be wrapped in an aggregate function (SUM, MAX, MIN, etc.) when using GROUP BY`,
          fix: 'Remove the computed column or wrap it in an aggregate',
          autoFix: { type: 'wrapInAggregate', aggregateFunction: 'MAX' },
        });
      } else {
        // MySQL: warning about arbitrary values
        messages.push({
          step: 4,
          severity: 'warning',
          message: `Computed column "${computed.alias}" is not aggregated in GROUP BY query - may return arbitrary values`,
          fix: 'Consider wrapping in an aggregate function for predictable results',
        });
      }
    });
  }

  // Step 3: Filters - check for empty values (only for fixed values, not parameters)
  state.filters.forEach((filter) => {
    // Skip NULL operators - they don't need values
    if (['IS NULL', 'IS NOT NULL'].includes(filter.operator)) {
      return;
    }
    
    // Skip parameter-type filters - values are provided at runtime
    if (filter.valueType === 'parameter') {
      return;
    }
    
    // For multi-value operators (IN, NOT IN, CONTAINS ALL), check the values array
    if (['IN', 'NOT IN', 'CONTAINS ALL'].includes(filter.operator)) {
      if (filter.values.length === 0 && !filter.value) {
        messages.push({
          step: 3,
          severity: 'warning',
          message: `Filter on ${filter.table}.${filter.column} has no values`,
          fix: 'Enter values or remove the filter',
        });
      }
    } else if (!filter.value) {
      messages.push({
        step: 3,
        severity: 'warning',
        message: `Filter on ${filter.table}.${filter.column} has no value`,
        fix: 'Enter a value or remove the filter',
      });
    }
  });

  // Having conditions need aggregates
  state.havingConditions.forEach((having) => {
    const agg = state.aggregates.find((a) => a.id === having.aggregateId);
    if (!agg) {
      messages.push({
        step: 4,
        severity: 'error',
        message: 'Having condition references a deleted calculation',
        fix: 'Remove the having condition',
      });
    }
    
    // Check for empty values in fixed mode
    if (having.valueType === 'fixed' && !having.value) {
      const aggLabel = agg ? `${agg.function}(${agg.column})` : 'calculation';
      messages.push({
        step: 4,
        severity: 'warning',
        message: `Filter on ${aggLabel} has no value`,
        fix: 'Enter a value or remove the condition',
      });
    }
  });

  return messages;
}
/**
 * Check if current step is valid to proceed
 */
export function isStepValid(state: WizardState, step: number, engine: DatabaseEngine = 'postgres'): boolean {
  switch (step) {
    case 0: // Base table
      return !!state.baseTable;
    case 1: // Joins - optional
      return true;
    case 2: // Fields - optional (defaults to *)
      // Check DISTINCT ON is not used with MySQL
      if (state.uniqueness?.enabled && state.uniqueness.mode === 'distinctOn' && engine === 'mysql') {
        return false;
      }
      return true;
    case 3: // Filters - optional
      return state.filters.every((f) => {
        if (['IS NULL', 'IS NOT NULL'].includes(f.operator)) {
          return true;
        }
        // Parameter-type filters don't need values here - provided at runtime
        if (f.valueType === 'parameter') {
          return true;
        }
        if (['IN', 'NOT IN', 'CONTAINS ALL'].includes(f.operator)) {
          return f.values.length > 0 || !!f.value;
        }
        return !!f.value;
      });
    case 4: // Aggregation - check consistency (PostgreSQL strict, MySQL lenient)
      const aggregationActive = state.groupByFields.length > 0 || state.aggregates.length > 0;
      if (aggregationActive && engine === 'postgres') {
        // When aggregates exist, selectedFields are not in the query output (only groupByFields + aggregates)
        // So only validate selectedFields when GROUP BY without aggregates
        if (state.aggregates.length === 0 && state.selectedFields.length > 0) {
          const groupByKeys = new Set(
            state.groupByFields.map((g) => `${g.table}.${g.column}`)
          );
          const fieldsOk = state.selectedFields.every((f) =>
            groupByKeys.has(`${f.table}.${f.column}`)
          );
          if (!fieldsOk) return false;
        }
        
        // Check computed fields - they're OK if wrapped in an aggregate
        if (state.computedFields.length > 0) {
          const aggregatedComputedAliases = new Set(
            state.aggregates
              .filter((agg) => agg.table === '__computed__')
              .map((agg) => agg.column)
          );
          const allComputedAggregated = state.computedFields.every(
            (cf) => aggregatedComputedAliases.has(cf.alias)
          );
          if (!allComputedAggregated) return false;
        }
      }
      return true;
    case 5: // Sorting - validate ORDER BY with aggregation
      const sortAggregationActive = state.groupByFields.length > 0 || state.aggregates.length > 0;
      if (sortAggregationActive && state.sortFields.length > 0 && engine === 'postgres') {
        const groupByKeys = new Set(
          state.groupByFields.map((g) => `${g.table}.${g.column}`)
        );
        
        const allSortValid = state.sortFields.every((sort) => {
          // Aggregate sorts are always valid
          if ('aggregateId' in sort && sort.aggregateId) {
            return true;
          }
          // Column sorts must be in GROUP BY
          if (sort.table && sort.column) {
            return groupByKeys.has(`${sort.table}.${sort.column}`);
          }
          return true;
        });
        
        if (!allSortValid) return false;
      }
      return true;
    case 6: // Review
      return !validateState(state, engine).some((v) => v.severity === 'error');
    default:
      return true;
  }
}
