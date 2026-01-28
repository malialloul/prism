import { useState } from 'react';
import { MenuItem } from '@mui/material';
import { ButtonLoadingSkeleton } from '../../../../components';
import { useAddColumn } from '../../../../api/entities/schema';
import type { AddColumnDto } from '../../../../api/models/SchemaDto';
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
  FormRow,
  StyledTextField,
  StyledSelect,
  CancelButton,
  SubmitButton,
  CheckboxLabel,
} from '../shared.styles';

interface AddColumnDialogProps {
  open: boolean;
  onClose: () => void;
  databaseId: number;
  tableName: string;
  engine: 'postgres' | 'mysql';
  onSuccess?: () => void;
}

export default function AddColumnDialog({
  open,
  onClose,
  databaseId,
  tableName,
  engine,
  onSuccess,
}: AddColumnDialogProps) {
  const [column, setColumn] = useState<AddColumnDto>({
    name: '',
    type: 'VARCHAR(255)',
    nullable: true,
  });

  const types = engine === 'postgres' ? POSTGRES_DATA_TYPES : MYSQL_DATA_TYPES;

  const { mutate: addColumn, isPending } = useAddColumn(databaseId, tableName, {
    onSuccess: () => {
      onClose();
      resetForm();
      onSuccess?.();
    },
  });

  const resetForm = () => {
    setColumn({
      name: '',
      type: 'VARCHAR(255)',
      nullable: true,
    });
  };

  const handleSubmit = () => {
    if (!column.name.trim()) return;
    addColumn(column);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const isValid = column.name.trim() && column.type;

  return (
    <StyledDialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogHeader>
        <DialogTitle>Add Column to {tableName}</DialogTitle>
        <DialogSubtitle>Define a new column for the table</DialogSubtitle>
      </DialogHeader>

      <DialogContent>
        <FormGroup>
          <FormLabel>Column Name</FormLabel>
          <StyledTextField
            fullWidth
            placeholder="email"
            value={column.name}
            onChange={(e) => setColumn({ ...column, name: e.target.value })}
            autoFocus
          />
        </FormGroup>

        <FormRow>
          <FormGroup>
            <FormLabel>Data Type</FormLabel>
            <StyledSelect
              fullWidth
              value={column.type}
              onChange={(e) => setColumn({ ...column, type: e.target.value as string })}
            >
              {types.map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </StyledSelect>
          </FormGroup>

          <FormGroup>
            <FormLabel>Default Value</FormLabel>
            <StyledTextField
              fullWidth
              placeholder="NULL"
              value={column.defaultValue || ''}
              onChange={(e) => setColumn({ ...column, defaultValue: e.target.value || undefined })}
            />
          </FormGroup>
        </FormRow>

        <FormGroup>
          <CheckboxLabel>
            <input
              type="checkbox"
              checked={column.nullable}
              onChange={(e) => setColumn({ ...column, nullable: e.target.checked })}
            />
            Allow NULL values
          </CheckboxLabel>
        </FormGroup>
      </DialogContent>

      <DialogFooter>
        <CancelButton onClick={handleClose}>Cancel</CancelButton>
        <SubmitButton onClick={handleSubmit} disabled={!isValid || isPending}>
          {isPending ? <ButtonLoadingSkeleton size="small" /> : 'Add Column'}
        </SubmitButton>
      </DialogFooter>
    </StyledDialog>
  );
}
