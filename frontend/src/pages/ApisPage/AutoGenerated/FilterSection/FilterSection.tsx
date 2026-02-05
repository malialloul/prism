import { useState, useMemo } from "react";
import { Box, TextField, MenuItem } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import {
  TryItSection,
  SectionTitle,
  ParameterInput,
  AddFilterButton,
} from "./FilterSection.styles";
import type {
  ColumnInfo,
  FilterCondition,
  FilterOperator,
} from "../../ApisPage.types";
import { getOperatorsForType } from "../../ApisPage.types";

interface FilterSectionProps {
  columns: ColumnInfo[];
  filters: FilterCondition[];
  onFiltersChange: (filters: FilterCondition[]) => void;
  title?: string;
}

export default function FilterSection({
  columns,
  filters,
  onFiltersChange,
  title = "Filters",
}: FilterSectionProps) {
  const [pendingFilter, setPendingFilter] = useState<Partial<FilterCondition>>(
    {},
  );
  const [editingFilterIndex, setEditingFilterIndex] = useState<number | null>(
    null,
  );

  // Get available operators based on selected column
  const availableOperators = useMemo(() => {
    if (!pendingFilter.column) return [];
    const col = columns.find((c) => c.name === pendingFilter.column);
    if (!col) return [];
    return getOperatorsForType(col.type);
  }, [pendingFilter.column, columns]);

  const selectedColumnInfo = useMemo(() => {
    if (!pendingFilter.column) return null;
    return columns.find((c) => c.name === pendingFilter.column) || null;
  }, [pendingFilter.column, columns]);

  const handleColumnSelect = (columnName: string | null) => {
    setPendingFilter({
      column: columnName || undefined,
      operator: undefined,
      value: "",
      value2: "",
    });
  };

  const handleOperatorSelect = (operator: FilterOperator) => {
    setPendingFilter((prev) => ({ ...prev, operator, value: "", value2: "" }));
  };

  const handleValueChange = (value: string) => {
    setPendingFilter((prev) => ({ ...prev, value }));
  };

  const handleValue2Change = (value: string) => {
    setPendingFilter((prev) => ({ ...prev, value2: value }));
  };

  const canAddFilter = useMemo(() => {
    if (!pendingFilter.column || !pendingFilter.operator) return false;
    if (
      pendingFilter.operator === "isNull" ||
      pendingFilter.operator === "isNotNull"
    )
      return true;
    if (!pendingFilter.value) return false;
    if (pendingFilter.operator === "between" && !pendingFilter.value2)
      return false;
    return true;
  }, [pendingFilter]);

  const addFilter = () => {
    if (canAddFilter) {
      if (editingFilterIndex !== null) {
        // Update existing filter
        const newFilters = filters.map((f, i) =>
          i === editingFilterIndex ? (pendingFilter as FilterCondition) : f,
        );
        onFiltersChange(newFilters);
        setEditingFilterIndex(null);
      } else {
        // Add new filter
        onFiltersChange([...filters, pendingFilter as FilterCondition]);
      }
      setPendingFilter({});
    }
  };

  const editFilter = (index: number) => {
    const filter = filters[index];
    setPendingFilter({ ...filter });
    setEditingFilterIndex(index);
  };

  const cancelEdit = () => {
    setPendingFilter({});
    setEditingFilterIndex(null);
  };

  const removeFilter = (index: number) => {
    onFiltersChange(filters.filter((_, i) => i !== index));
    // If we're editing this filter, cancel the edit
    if (editingFilterIndex === index) {
      cancelEdit();
    } else if (editingFilterIndex !== null && index < editingFilterIndex) {
      // Adjust editing index if a filter before it was removed
      setEditingFilterIndex(editingFilterIndex - 1);
    }
  };

  const getOperatorLabel = (op: FilterOperator): string => {
    const labels: Record<FilterOperator, string> = {
      eq: "=",
      neq: "≠",
      contains: "∋",
      startsWith: "starts",
      endsWith: "ends",
      gt: ">",
      gte: "≥",
      lt: "<",
      lte: "≤",
      between: "↔",
      isNull: "null",
      isNotNull: "!null",
    };
    return labels[op] || op;
  };

  const renderValueInput = () => {
    if (!pendingFilter.operator) return null;
    if (
      pendingFilter.operator === "isNull" ||
      pendingFilter.operator === "isNotNull"
    )
      return null;

    const colType = selectedColumnInfo?.type || "string";

    if (colType === "boolean") {
      return (
        <TextField
          select
          size="small"
          value={pendingFilter.value || ""}
          onChange={(e) => handleValueChange(e.target.value)}
          sx={{
            width: 100,
            "& .MuiInputBase-root": { fontSize: "0.75rem" },
            "& .MuiSelect-select": { py: 0.65 },
          }}
          SelectProps={{ displayEmpty: true }}
        >
          <MenuItem value="" disabled>
            <em>Value</em>
          </MenuItem>
          <MenuItem value="true">true</MenuItem>
          <MenuItem value="false">false</MenuItem>
        </TextField>
      );
    }

    if (colType === "enum" && selectedColumnInfo?.enumValues) {
      return (
        <TextField
          select
          size="small"
          value={pendingFilter.value || ""}
          onChange={(e) => handleValueChange(e.target.value)}
          sx={{
            width: 120,
            "& .MuiInputBase-root": { fontSize: "0.75rem" },
            "& .MuiSelect-select": { py: 0.65 },
          }}
          SelectProps={{ displayEmpty: true }}
        >
          <MenuItem value="" disabled>
            <em>Value</em>
          </MenuItem>
          {selectedColumnInfo.enumValues.map((v) => (
            <MenuItem key={v} value={v}>
              {v}
            </MenuItem>
          ))}
        </TextField>
      );
    }

    const inputType =
      colType === "number"
        ? "number"
        : colType === "date"
          ? "date"
          : colType === "datetime"
            ? "datetime-local"
            : "text";

    return (
      <>
        <ParameterInput
          type={inputType}
          placeholder="Value"
          value={pendingFilter.value || ""}
          onChange={(e) => handleValueChange(e.target.value)}
          style={{
            width: pendingFilter.operator === "between" ? "90px" : "120px",
          }}
        />
        {pendingFilter.operator === "between" && (
          <>
            <span style={{ color: "#888", fontSize: "0.75rem" }}>to</span>
            <ParameterInput
              type={inputType}
              placeholder="Value"
              value={pendingFilter.value2 || ""}
              onChange={(e) => handleValue2Change(e.target.value)}
              style={{ width: "90px" }}
            />
          </>
        )}
      </>
    );
  };

  if (columns.length === 0) return null;

  return (
    <TryItSection sx={{ py: 1.5 }}>
      <SectionTitle>{title}</SectionTitle>

      {/* Active filters */}
      {filters.length > 0 && (
        <Box
          sx={{ display: "flex", flexDirection: "column", gap: 0.5, mb: 1.5 }}
        >
          {filters.map((filter, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                py: 0.5,
                px: 0.75,
                bgcolor:
                  editingFilterIndex === index
                    ? "primary.main"
                    : "action.hover",
                color:
                  editingFilterIndex === index
                    ? "primary.contrastText"
                    : "inherit",
                borderRadius: 1,
                fontSize: "0.75rem",
                transition: "all 0.15s ease",
              }}
            >
              <Box sx={{ fontWeight: 600 }}>{filter.column}</Box>
              <Box
                sx={{
                  fontWeight: 500,
                  color:
                    editingFilterIndex === index ? "inherit" : "primary.main",
                }}
              >
                {getOperatorLabel(filter.operator)}
              </Box>
              {filter.operator !== "isNull" &&
                filter.operator !== "isNotNull" && (
                  <Box
                    sx={{
                      fontFamily: "monospace",
                      color:
                        editingFilterIndex === index
                          ? "inherit"
                          : "success.main",
                    }}
                  >
                    {filter.value}
                    {filter.operator === "between" &&
                      filter.value2 &&
                      ` → ${filter.value2}`}
                  </Box>
                )}
              <Box sx={{ ml: "auto", display: "flex", gap: 0.5 }}>
                <Box
                  onClick={() => editFilter(index)}
                  sx={{
                    cursor: "pointer",
                    color:
                      editingFilterIndex === index
                        ? "inherit"
                        : "text.disabled",
                    "&:hover": {
                      color:
                        editingFilterIndex === index
                          ? "inherit"
                          : "primary.main",
                    },
                    display: "flex",
                  }}
                >
                  <EditIcon sx={{ fontSize: "0.9rem" }} />
                </Box>
                <Box
                  onClick={() => removeFilter(index)}
                  sx={{
                    cursor: "pointer",
                    color:
                      editingFilterIndex === index
                        ? "inherit"
                        : "text.disabled",
                    "&:hover": {
                      color:
                        editingFilterIndex === index ? "inherit" : "error.main",
                    },
                    display: "flex",
                  }}
                >
                  <DeleteOutlineIcon sx={{ fontSize: "0.9rem" }} />
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {/* Add new filter */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          flexWrap: "wrap",
        }}
      >
        <TextField
          select
          size="small"
          value={pendingFilter.column || ""}
          onChange={(e) => handleColumnSelect(e.target.value || null)}
          sx={{
            width: 120,
            "& .MuiInputBase-root": { fontSize: "0.75rem" },
            "& .MuiSelect-select": { py: 0.65 },
          }}
          SelectProps={{ displayEmpty: true }}
        >
          <MenuItem value="" disabled>
            <em>Column</em>
          </MenuItem>
          {columns.map((c) => (
            <MenuItem key={c.name} value={c.name} sx={{ fontSize: "0.8rem" }}>
              {c.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          size="small"
          value={pendingFilter.operator || ""}
          onChange={(e) =>
            handleOperatorSelect(e.target.value as FilterOperator)
          }
          disabled={!pendingFilter.column}
          sx={{
            width: 120,
            "& .MuiInputBase-root": { fontSize: "0.75rem" },
            "& .MuiSelect-select": { py: 0.65 },
          }}
          SelectProps={{ displayEmpty: true }}
        >
          <MenuItem value="" disabled>
            <em>Operator</em>
          </MenuItem>
          {availableOperators.map((op) => (
            <MenuItem
              key={op.value}
              value={op.value}
              sx={{ fontSize: "0.8rem" }}
            >
              {op.label}
            </MenuItem>
          ))}
        </TextField>

        {renderValueInput()}

        <AddFilterButton
          onClick={addFilter}
          sx={{
            opacity: canAddFilter ? 1 : 0.4,
            pointerEvents: canAddFilter ? "auto" : "none",
            bgcolor: editingFilterIndex !== null ? "success.main" : undefined,
            "&:hover":
              editingFilterIndex !== null
                ? { bgcolor: "success.dark" }
                : undefined,
          }}
        >
          {editingFilterIndex !== null ? (
            <CheckIcon sx={{ fontSize: "0.9rem" }} />
          ) : (
            <AddIcon sx={{ fontSize: "0.9rem" }} />
          )}
        </AddFilterButton>

        {editingFilterIndex !== null && (
          <AddFilterButton
            onClick={cancelEdit}
            sx={{ bgcolor: "grey.500", "&:hover": { bgcolor: "grey.600" } }}
          >
            <CloseIcon sx={{ fontSize: "0.9rem" }} />
          </AddFilterButton>
        )}
      </Box>
    </TryItSection>
  );
}
