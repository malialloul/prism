import { Dialog, DialogActions, MenuItem, Checkbox } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import type { ColumnDetailsDto, ModifyColumnDto } from '../../../../api/models/SchemaDto';
import {
  FormGroup,
  FormLabel,
  FormRow,
  StyledTextField,
  StyledSelect,
  CancelButton,
  SubmitButton,
  CheckboxLabel,
} from '../shared.styles';
import { DialogTitle, DialogContent } from './EditColumnDialog.styles';
import { ButtonLoadingSkeleton } from '../../../../components';

interface EditColumnDialogProps {
  open: boolean;
  onClose: () => void;
  selectedColumn: ColumnDetailsDto | null;
  columnModifications: ModifyColumnDto;
  onColumnModificationsChange: (modifications: ModifyColumnDto) => void;
  dataTypes: readonly string[];
  onSave: () => void;
  isModifying: boolean;
}

export default function EditColumnDialog({
  open,
  onClose,
  selectedColumn,
  columnModifications,
  onColumnModificationsChange,
  dataTypes,
  onSave,
  isModifying,
}: EditColumnDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Column: {selectedColumn?.name}</DialogTitle>
      <DialogContent>
        <FormGroup>
          <FormLabel>Column Name</FormLabel>
          <StyledTextField
            fullWidth
            value={columnModifications.newName || ''}
            onChange={(e) =>
              onColumnModificationsChange({
                ...columnModifications,
                newName: e.target.value,
              })
            }
          />
        </FormGroup>
        <FormGroup>
          <FormLabel>Data Type</FormLabel>
          <StyledSelect
            fullWidth
            value={columnModifications.type || selectedColumn?.type || ''}
            onChange={(e) =>
              onColumnModificationsChange({
                ...columnModifications,
                type: e.target.value as string,
              })
            }
          >
            {dataTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
            {/* Include current type if not in list */}
            {selectedColumn?.type &&
              !([...dataTypes] as string[]).includes(selectedColumn.type) && (
                <MenuItem value={selectedColumn.type}>{selectedColumn.type}</MenuItem>
              )}
          </StyledSelect>
        </FormGroup>
        <FormRow>
          <FormGroup>
            <FormLabel>Default Value</FormLabel>
            <StyledTextField
              fullWidth
              value={columnModifications.defaultValue || ''}
              onChange={(e) =>
                onColumnModificationsChange({
                  ...columnModifications,
                  defaultValue: e.target.value,
                })
              }
              placeholder="NULL"
            />
          </FormGroup>
          <FormGroup>
            <CheckboxLabel>
              <Checkbox
                checked={columnModifications.nullable ?? selectedColumn?.nullable ?? true}
                onChange={(e) =>
                  onColumnModificationsChange({
                    ...columnModifications,
                    nullable: e.target.checked,
                  })
                }
              />
              <span>Nullable</span>
            </CheckboxLabel>
          </FormGroup>
        </FormRow>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <CancelButton onClick={onClose}>Cancel</CancelButton>
        <SubmitButton
          onClick={onSave}
          disabled={isModifying}
          startIcon={
            isModifying ? <ButtonLoadingSkeleton size="small" /> : <SaveIcon />
          }
        >
          Save Changes
        </SubmitButton>
      </DialogActions>
    </Dialog>
  );
}
