import { useState, useEffect, ChangeEvent } from 'react';
import { ToggleButton, ToggleButtonGroup, Autocomplete } from '@mui/material';
import { ButtonLoadingSkeleton } from '../../../../components';
import FunctionsIcon from '@mui/icons-material/Functions';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { useCreateFunction } from '../../../../api/entities/schema';
import { toastService } from '../../../../services';
import type { FunctionParameterDto, FunctionDetailsDto } from '../../../../api/models/SchemaDto';
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
  AddParameterButton,
  RemoveButton,
  LanguageToggle,
  ReturnTypeSection,
} from './CreateFunctionDialog.styles';

interface CreateFunctionDialogProps {
  open: boolean;
  onClose: () => void;
  databaseId: number;
  engine: 'postgres' | 'mysql';
  onSuccess?: () => void;
  /** If provided, the dialog will be in edit mode with pre-filled data */
  editFunction?: FunctionDetailsDto | null;
  /** List of existing function names to prevent duplicates */
  existingFunctions?: string[];
  /** Explicit flag for edit mode (use when editFunction might not be loaded yet) */
  isEditMode?: boolean;
}

export default function CreateFunctionDialog({
  open,
  onClose,
  databaseId,
  engine,
  onSuccess,
  editFunction,
  existingFunctions = [],
  isEditMode: isEditModeProp,
}: CreateFunctionDialogProps) {
  const [functionName, setFunctionName] = useState('');
  const [parameters, setParameters] = useState<FunctionParameterDto[]>([]);
  const [returnType, setReturnType] = useState('');
  const [body, setBody] = useState('');
  const [language, setLanguage] = useState<'sql' | 'plpgsql'>(engine === 'postgres' ? 'plpgsql' : 'sql');

  // Use explicit prop if provided, otherwise infer from editFunction
  const isEditMode = isEditModeProp ?? !!editFunction;

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
    if (open && editFunction) {
      setFunctionName(editFunction.name);
      setParameters(editFunction.parameters.map(p => ({
        name: p.name,
        type: normalizeType(p.type),
      })));
      setReturnType(normalizeType(editFunction.returnType));
      // Extract body from definition - try to get just the body part
      const definition = editFunction.definition || '';
      // For PL/pgSQL, the body is between $$ or $<identifier>$ markers (e.g., $function$, $BODY$)
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
    } else if (open && !editFunction) {
      // Reset for create mode
      resetForm();
    }
  }, [open, editFunction]);

  const { mutate: createFunction, isPending } = useCreateFunction(databaseId, {
    onSuccess: (message) => {
      toastService.success(isEditMode ? 'Function updated successfully' : message);
      onClose();
      resetForm();
      onSuccess?.();
    },
    onError: (error) => {
      toastService.error(error.message || `Failed to ${isEditMode ? 'update' : 'create'} function`);
    },
  });

  const resetForm = () => {
    setFunctionName('');
    setParameters([]);
    setReturnType('');
    setBody('');
    setLanguage(engine === 'postgres' ? 'plpgsql' : 'sql');
  };

  const handleAddParameter = () => {
    setParameters([...parameters, { name: '', type: '' }]);
  };

  const handleRemoveParameter = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  const handleParameterChange = (index: number, field: keyof FunctionParameterDto, value: string) => {
    const newParams = [...parameters];
    newParams[index] = { ...newParams[index], [field]: value };
    setParameters(newParams);
  };

  const handleSubmit = () => {
    if (!functionName.trim()) {
      toastService.error('Please enter a function name');
      return;
    }

    // Check for duplicate name (only in create mode)
    if (!isEditMode && existingFunctions.some(f => f.toLowerCase() === functionName.trim().toLowerCase())) {
      toastService.error(`A function named "${functionName.trim()}" already exists`);
      return;
    }

    if (!returnType.trim()) {
      toastService.error('Please enter a return type');
      return;
    }

    if (!body.trim()) {
      toastService.error('Please enter the function body');
      return;
    }

    // Validate parameters have both name and type
    const invalidParam = parameters.find(p => !p.name.trim() || !p.type.trim());
    if (invalidParam) {
      toastService.error('All parameters must have a name and type');
      return;
    }

    createFunction({
      name: functionName.trim(),
      parameters,
      returnType: returnType.trim(),
      body: body.trim(),
      language: engine === 'postgres' ? language : undefined,
      isEdit: isEditMode,
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isValid = functionName.trim() && returnType.trim() && body.trim();

  const dataTypes = engine === 'postgres' ? [...POSTGRES_DATA_TYPES] : [...MYSQL_DATA_TYPES];

  const getPlaceholder = () => {
    if (engine === 'postgres') {
      return language === 'plpgsql'
        ? 'BEGIN\n  RETURN param1 + param2;\nEND;'
        : 'SELECT param1 + param2';
    }
    return 'RETURN param1 + param2;';
  };

  return (
    <StyledDialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogHeader>
        <div>
          <DialogTitle>
            <FunctionsIcon sx={{ fontSize: '1.25rem', marginRight: '0.5rem' }} />
            {isEditMode ? 'Edit Function' : 'Create Function'}
          </DialogTitle>
          <DialogSubtitle>
            {isEditMode
              ? 'Modify the function definition'
              : 'Create a reusable function that returns a value'}
          </DialogSubtitle>
        </div>
      </DialogHeader>

      <DialogContent>
        <FormGroup>
          <FormLabel>Function Name *</FormLabel>
          <StyledTextField
            fullWidth
            placeholder="my_function"
            value={functionName}
            onChange={(e) => setFunctionName(e.target.value)}
            size="small"
            disabled={isEditMode} // Can't change name when editing
          />
        </FormGroup>

        <FormGroup>
          <FormLabel>Parameters</FormLabel>
          <ParametersSection>
            {parameters.map((param, index) => (
              <ParameterRow key={index}>
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

        <ReturnTypeSection>
          <FormGroup style={{ flex: 1, marginBottom: 0 }}>
            <FormLabel>Return Type *</FormLabel>
            <Autocomplete
              freeSolo
              options={dataTypes}
              value={returnType}
              onChange={(_, newValue) => setReturnType(newValue || '')}
              onInputChange={(_, newValue) => setReturnType(newValue)}
              renderInput={(params) => (
                <StyledTextField
                  {...params}
                  placeholder="Select return type"
                  size="small"
                />
              )}
            />
          </FormGroup>
        </ReturnTypeSection>

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

        <FormGroup style={{ marginTop: '1rem' }}>
          <FormLabel>Function Body *</FormLabel>
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
            isEditMode ? 'Update Function' : 'Create Function'
          )}
        </SubmitButton>
      </DialogFooter>
    </StyledDialog>
  );
}
