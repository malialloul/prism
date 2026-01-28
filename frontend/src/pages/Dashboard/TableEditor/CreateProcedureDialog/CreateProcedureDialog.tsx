import { useState, useEffect, ChangeEvent } from 'react';
import { ToggleButton, ToggleButtonGroup, MenuItem, Autocomplete } from '@mui/material';
import { ButtonLoadingSkeleton } from '../../../../components';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { useCreateProcedure } from '../../../../api/entities/schema';
import { toastService } from '../../../../services';
import type { ProcedureParameterDto, ProcedureDetailsDto } from '../../../../api/models/SchemaDto';
import { POSTGRES_DATA_TYPES, MYSQL_DATA_TYPES } from '../../../../api/models/SchemaDto';
import {
  StyledDialog,
  DialogHeader,
  DialogTitle,
  DialogSubtitle,
  DialogContent,
  DialogFooter,
  FormGroup,
  FormLabel,
  StyledTextField,
  CancelButton,
  SubmitButton,
} from '../shared.styles';
import {
  SqlEditorWrapper,
  SqlTextArea,
  ParametersSection,
  ParameterRow,
  ModeSelect,
  AddParameterButton,
  RemoveButton,
  LanguageToggle,
} from './CreateProcedureDialog.styles';

interface CreateProcedureDialogProps {
  open: boolean;
  onClose: () => void;
  databaseId: number;
  engine: 'postgres' | 'mysql';
  onSuccess?: () => void;
  /** If provided, the dialog will be in edit mode with pre-filled data */
  editProcedure?: ProcedureDetailsDto | null;
  /** List of existing procedure names to prevent duplicates */
  existingProcedures?: string[];
  /** Explicit flag for edit mode (use when editProcedure might not be loaded yet) */
  isEditMode?: boolean;
}

export default function CreateProcedureDialog({
  open,
  onClose,
  databaseId,
  engine,
  onSuccess,
  editProcedure,
  existingProcedures = [],
  isEditMode: isEditModeProp,
}: CreateProcedureDialogProps) {
  const [procedureName, setProcedureName] = useState('');
  const [parameters, setParameters] = useState<ProcedureParameterDto[]>([]);
  const [body, setBody] = useState('');
  const [language, setLanguage] = useState<'sql' | 'plpgsql'>(engine === 'postgres' ? 'plpgsql' : 'sql');

  // Use explicit prop if provided, otherwise infer from editProcedure
  const isEditMode = isEditModeProp ?? !!editProcedure;

  // Helper to normalize type names from PostgreSQL format to our format
  const normalizeType = (type: string): string => {
    const typeMap: Record<string, string> = {
      'character varying': 'VARCHAR(255)',
      'character': 'CHAR(1)',
      'timestamp without time zone': 'TIMESTAMP',
      'timestamp with time zone': 'TIMESTAMPTZ',
      'time without time zone': 'TIME',
      'time with time zone': 'TIMETZ',
      'double precision': 'DOUBLE PRECISION',
    };
    const lower = type.toLowerCase();
    return typeMap[lower] || type.toUpperCase();
  };

  // Pre-fill form when editing
  useEffect(() => {
    if (open && editProcedure) {
      setProcedureName(editProcedure.name);
      setParameters(editProcedure.parameters.map(p => ({
        name: p.name,
        type: normalizeType(p.type),
        mode: p.mode,
      })));
      // Extract body from definition - try to get just the body part
      const definition = editProcedure.definition || '';
      // For PL/pgSQL, the body is between $$ or $<identifier>$ markers (e.g., $procedure$, $BODY$)
      let extractedBody = definition;
      // Match both $$ and $identifier$ patterns
      const dollarMatch = definition.match(/\$(\w*)\$\s*([\s\S]*?)\s*\$\1\$/);
      if (dollarMatch) {
        extractedBody = dollarMatch[2].trim();
      }
      setBody(extractedBody);
      // Detect language from definition
      if (definition.toLowerCase().includes('language plpgsql')) {
        setLanguage('plpgsql');
      } else if (definition.toLowerCase().includes('language sql')) {
        setLanguage('sql');
      }
    } else if (open && !editProcedure) {
      // Reset for create mode
      resetForm();
    }
  }, [open, editProcedure]);

  const { mutate: createProcedure, isPending } = useCreateProcedure(databaseId, {
    onSuccess: (message) => {
      toastService.success(isEditMode ? 'Procedure updated successfully' : message);
      onClose();
      resetForm();
      onSuccess?.();
    },
    onError: (error) => {
      toastService.error(error.message || `Failed to ${isEditMode ? 'update' : 'create'} procedure`);
    },
  });

  const resetForm = () => {
    setProcedureName('');
    setParameters([]);
    setBody('');
    setLanguage(engine === 'postgres' ? 'plpgsql' : 'sql');
  };

  const handleAddParameter = () => {
    setParameters([...parameters, { name: '', type: '', mode: 'IN' }]);
  };

  const handleRemoveParameter = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  const handleParameterChange = (index: number, field: keyof ProcedureParameterDto, value: string) => {
    const newParams = [...parameters];
    newParams[index] = { ...newParams[index], [field]: value };
    setParameters(newParams);
  };

  const handleSubmit = () => {
    if (!procedureName.trim()) {
      toastService.error('Please enter a procedure name');
      return;
    }

    // Check for duplicate name (only in create mode)
    if (!isEditMode && existingProcedures.some(p => p.toLowerCase() === procedureName.trim().toLowerCase())) {
      toastService.error(`A procedure named "${procedureName.trim()}" already exists`);
      return;
    }

    if (!body.trim()) {
      toastService.error('Please enter the procedure body');
      return;
    }

    // Validate parameters have both name and type
    const invalidParam = parameters.find(p => !p.name.trim() || !p.type.trim());
    if (invalidParam) {
      toastService.error('All parameters must have a name and type');
      return;
    }

    createProcedure({
      name: procedureName.trim(),
      parameters,
      body: body.trim(),
      language: engine === 'postgres' ? language : undefined,
      isEdit: isEditMode,
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isValid = procedureName.trim() && body.trim();

  const dataTypes = engine === 'postgres' ? [...POSTGRES_DATA_TYPES] : [...MYSQL_DATA_TYPES];

  const getPlaceholder = () => {
    if (engine === 'postgres') {
      return language === 'plpgsql'
        ? 'BEGIN\n  -- Your procedure logic here\n  INSERT INTO logs (message) VALUES (param1);\nEND;'
        : 'INSERT INTO logs (message) VALUES (param1);';
    }
    return '-- Your procedure logic here\nINSERT INTO logs (message) VALUES (param1);';
  };

  return (
    <StyledDialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogHeader>
        <div>
          <DialogTitle>
            <AccountTreeIcon sx={{ fontSize: '1.25rem', marginRight: '0.5rem' }} />
            {isEditMode ? 'Edit Procedure' : 'Create Procedure'}
          </DialogTitle>
          <DialogSubtitle>
            {isEditMode
              ? 'Modify the stored procedure definition'
              : 'Create a stored procedure for reusable database operations'}
          </DialogSubtitle>
        </div>
      </DialogHeader>

      <DialogContent>
        <FormGroup>
          <FormLabel>Procedure Name *</FormLabel>
          <StyledTextField
            fullWidth
            placeholder="my_procedure"
            value={procedureName}
            onChange={(e) => setProcedureName(e.target.value)}
            size="small"
            disabled={isEditMode} // Can't change name when editing
          />
        </FormGroup>

        <FormGroup>
          <FormLabel>Parameters</FormLabel>
          <ParametersSection>
            {parameters.map((param, index) => (
              <ParameterRow key={index}>
                <ModeSelect
                  value={param.mode}
                  onChange={(e) => handleParameterChange(index, 'mode', e.target.value as string)}
                  size="small"
                >
                  <MenuItem value="IN">IN</MenuItem>
                  <MenuItem value="OUT">OUT</MenuItem>
                  <MenuItem value="INOUT">INOUT</MenuItem>
                </ModeSelect>
                <StyledTextField
                  placeholder="Parameter name"
                  value={param.name}
                  onChange={(e) => handleParameterChange(index, 'name', e.target.value)}
                  size="small"
                />
                <Autocomplete
                  freeSolo
                  options={dataTypes}
                  value={param.type}
                  onChange={(_, newValue) => handleParameterChange(index, 'type', newValue || '')}
                  onInputChange={(_, newValue) => handleParameterChange(index, 'type', newValue)}
                  renderInput={(params) => (
                    <StyledTextField
                      {...params}
                      placeholder="Select data type"
                      size="small"
                    />
                  )}
                  sx={{ flex: 1 }}
                />
                <RemoveButton onClick={() => handleRemoveParameter(index)}>
                  <CloseIcon sx={{ fontSize: '1rem' }} />
                </RemoveButton>
              </ParameterRow>
            ))}
            <AddParameterButton onClick={handleAddParameter}>
              <AddIcon sx={{ fontSize: '1rem' }} />
              Add Parameter
            </AddParameterButton>
          </ParametersSection>
        </FormGroup>

        {engine === 'postgres' && (
          <LanguageToggle>
            <FormLabel style={{ marginBottom: 0 }}>Language:</FormLabel>
            <ToggleButtonGroup
              value={language}
              exclusive
              onChange={(_, newLang) => newLang && setLanguage(newLang)}
              size="small"
            >
              <ToggleButton value="plpgsql">PL/pgSQL</ToggleButton>
              <ToggleButton value="sql">SQL</ToggleButton>
            </ToggleButtonGroup>
          </LanguageToggle>
        )}

        <FormGroup>
          <FormLabel>Procedure Body *</FormLabel>
          <SqlEditorWrapper>
            <SqlTextArea
              placeholder={getPlaceholder()}
              value={body}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setBody(e.target.value)}
              rows={10}
            />
          </SqlEditorWrapper>
        </FormGroup>
      </DialogContent>

      <DialogFooter>
        <CancelButton onClick={handleClose}>Cancel</CancelButton>
        <SubmitButton
          onClick={handleSubmit}
          disabled={!isValid || isPending}
        >
          {isPending ? (
            <>
              <ButtonLoadingSkeleton size="small" />
              {isEditMode ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            isEditMode ? 'Update Procedure' : 'Create Procedure'
          )}
        </SubmitButton>
      </DialogFooter>
    </StyledDialog>
  );
}
