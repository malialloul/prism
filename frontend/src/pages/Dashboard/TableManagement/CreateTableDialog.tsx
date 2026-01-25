import { useState } from 'react';
import { MenuItem, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useCreateTable } from '../../../api/entities/schema';
import type { CreateColumnDto } from '../../../api/models/SchemaDto';
import { POSTGRES_DATA_TYPES, MYSQL_DATA_TYPES } from '../../../api/models/SchemaDto';
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
  ColumnDefinitionCard,
  ColumnRow,
  ColumnInput,
  TypeSelect,
  CheckboxLabel,
  RemoveColumnButton,
  AddColumnButton,
  ColumnsHeader,
} from './TableManagement.styles';

interface CreateTableDialogProps {
  open: boolean;
  onClose: () => void;
  databaseId: string;
  engine: 'postgres' | 'mysql';
  onSuccess?: () => void;
}

const defaultColumn: CreateColumnDto = {
  name: '',
  type: 'VARCHAR(255)',
  nullable: true,
  isPrimaryKey: false,
  autoIncrement: false,
};

export default function CreateTableDialog({
  open,
  onClose,
  databaseId,
  engine,
  onSuccess,
}: CreateTableDialogProps) {
  const [tableName, setTableName] = useState('');
  const [columns, setColumns] = useState<CreateColumnDto[]>([
    { name: 'id', type: engine === 'postgres' ? 'SERIAL' : 'INT', nullable: false, isPrimaryKey: true, autoIncrement: engine === 'mysql' },
  ]);

  const types = engine === 'postgres' ? POSTGRES_DATA_TYPES : MYSQL_DATA_TYPES;

  const { mutate: createTable, isPending } = useCreateTable(databaseId, {
    onSuccess: () => {
      onClose();
      resetForm();
      onSuccess?.();
    },
  });

  const resetForm = () => {
    setTableName('');
    setColumns([
      { name: 'id', type: engine === 'postgres' ? 'SERIAL' : 'INT', nullable: false, isPrimaryKey: true, autoIncrement: engine === 'mysql' },
    ]);
  };

  const handleAddColumn = () => {
    setColumns([...columns, { ...defaultColumn }]);
  };

  const handleRemoveColumn = (index: number) => {
    if (columns.length > 1) {
      setColumns(columns.filter((_, i) => i !== index));
    }
  };

  const handleColumnChange = (index: number, field: keyof CreateColumnDto, value: string | boolean) => {
    const newColumns = [...columns];
    newColumns[index] = { ...newColumns[index], [field]: value };
    
    // If setting as primary key, unset other primary keys and set not nullable
    if (field === 'isPrimaryKey' && value === true) {
      newColumns.forEach((col, i) => {
        if (i !== index) col.isPrimaryKey = false;
      });
      newColumns[index].nullable = false;
    }
    
    setColumns(newColumns);
  };

  const handleSubmit = () => {
    if (!tableName.trim() || columns.length === 0) return;
    
    const validColumns = columns.filter(col => col.name.trim());
    if (validColumns.length === 0) return;

    createTable({ name: tableName, columns: validColumns });
  };

  const isValid = tableName.trim() && columns.some(col => col.name.trim());

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogHeader>
        <DialogTitle>Create New Table</DialogTitle>
        <DialogSubtitle>Define the structure for your new table</DialogSubtitle>
      </DialogHeader>
      
      <DialogContent>
        <FormGroup>
          <FormLabel>Table Name</FormLabel>
          <StyledTextField
            fullWidth
            placeholder="users"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            autoFocus
          />
        </FormGroup>

        <FormGroup>
          <FormLabel>Columns</FormLabel>
          <ColumnsHeader>
            <span>Name</span>
            <span>Type</span>
            <span>Nullable</span>
            <span>Primary</span>
            <span></span>
          </ColumnsHeader>
          
          {columns.map((column, index) => (
            <ColumnDefinitionCard key={index}>
              <ColumnRow>
                <ColumnInput
                  placeholder="column_name"
                  value={column.name}
                  onChange={(e) => handleColumnChange(index, 'name', e.target.value)}
                  size="small"
                />
                <TypeSelect
                  size="small"
                  value={column.type}
                  onChange={(e) => handleColumnChange(index, 'type', e.target.value as string)}
                >
                  {types.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </TypeSelect>
                <CheckboxLabel>
                  <input
                    type="checkbox"
                    checked={column.nullable}
                    onChange={(e) => handleColumnChange(index, 'nullable', e.target.checked)}
                    disabled={column.isPrimaryKey}
                  />
                  NULL
                </CheckboxLabel>
                <CheckboxLabel>
                  <input
                    type="checkbox"
                    checked={column.isPrimaryKey}
                    onChange={(e) => handleColumnChange(index, 'isPrimaryKey', e.target.checked)}
                  />
                  PK
                </CheckboxLabel>
                <RemoveColumnButton
                  size="small"
                  onClick={() => handleRemoveColumn(index)}
                  disabled={columns.length === 1}
                >
                  <DeleteIcon sx={{ fontSize: '1rem' }} />
                </RemoveColumnButton>
              </ColumnRow>
            </ColumnDefinitionCard>
          ))}

          <AddColumnButton onClick={handleAddColumn} startIcon={<AddIcon />}>
            Add Column
          </AddColumnButton>
        </FormGroup>
      </DialogContent>

      <DialogFooter>
        <CancelButton onClick={onClose}>Cancel</CancelButton>
        <SubmitButton onClick={handleSubmit} disabled={!isValid || isPending}>
          {isPending ? <CircularProgress size={20} color="inherit" /> : 'Create Table'}
        </SubmitButton>
      </DialogFooter>
    </StyledDialog>
  );
}
