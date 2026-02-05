import { useState } from 'react';
import { MenuItem } from '@mui/material';
import { ButtonLoadingSkeleton, usePermissions, AccessRestricted } from '../../../../../components';
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
} from './AddColumnDialog.styles';
import { AddColumnDto, MYSQL_DATA_TYPES, POSTGRES_DATA_TYPES } from '../../../../../api/models/SchemaDto';
import { useAddColumn } from '../../../../../api/entities/schema';
import { DatabaseDto } from '../../../../../api/models/DatabaseDto';

interface AddColumnDialogProps {
  open: boolean;
  onClose: () => void;
  databaseId: number;
  tableName: string;
  engine: DatabaseDto['engine'];
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
  const { canAddColumn } = usePermissions();
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
      {canAddColumn ? (
        <>
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
        </>
      ) : (
        <>
          <DialogHeader>
            <DialogTitle>Add Column to {tableName}</DialogTitle>
          </DialogHeader>
          <DialogContent>
            <AccessRestricted
              message="Add Column Restricted"
              description="You don't have permission to add columns. Please contact the account owner to request access."
              permission="addColumn"
            />
          </DialogContent>
          <DialogFooter>
            <CancelButton onClick={handleClose}>Close</CancelButton>
          </DialogFooter>
        </>
      )}
    </StyledDialog>
  );
}
