import React from 'react';
import { Dialog, DialogActions, DialogTitle as MuiDialogTitle } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import type { RowData } from '../TableEditor.types';
import {
    FormGroup,
    FormLabel,
    StyledTextField,
    CancelButton,
    SubmitButton,
} from './EditRowDialog.styles';
import { DialogContent } from './EditRowDialog.styles';
import { AccessRestricted, ButtonLoadingSkeleton, usePermissions } from '../../../../../components';

interface EditRowDialogProps {
    open: boolean;
    row: RowData | null;
    columns: string[];
    primaryKeyColumns: string[];
    onClose: () => void;
    onSave: (updatedRow: RowData) => void;
    isSaving: boolean;
}

export default function EditRowDialog({
    open,
    row,
    columns,
    primaryKeyColumns,
    onClose,
    onSave,
    isSaving,
}: EditRowDialogProps) {
    const { canAddRecord, canEditRecord } = usePermissions();
    const [editedRow, setEditedRow] = React.useState<RowData | null>(null);

    React.useEffect(() => {
        if (row) {
            setEditedRow({ ...row });
        }
    }, [row, open]);

    const handleChange = (column: string, value: unknown) => {
        if (editedRow) {
            setEditedRow({
                ...editedRow,
                [column]: value,
            });
        }
    };

    const handleSave = () => {
        if (editedRow) {
            onSave(editedRow);
        }
    };

    if (!row || !editedRow) return null;

    const isNewRow = row._isNew;
    // Check the appropriate permission based on whether it's a new row or existing row
    const hasPermission = isNewRow ? canAddRecord : canEditRecord;
    // For new rows, show all columns; for existing rows, hide PK columns
    const editableColumns = isNewRow 
        ? columns 
        : columns.filter((col) => !primaryKeyColumns.includes(col));

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <MuiDialogTitle>{isNewRow ? 'Add Row' : 'Edit Row'}</MuiDialogTitle>
            {hasPermission ? (
                <>
                    <DialogContent>
                        {editableColumns.map((column) => (
                                <FormGroup key={column}>
                                    <FormLabel>{column}</FormLabel>
                                    <StyledTextField
                                        fullWidth
                                        value={editedRow[column] ?? ''}
                                        onChange={(e) => handleChange(column, e.target.value || null)}
                                        placeholder="NULL"
                                    />
                                </FormGroup>
                            ))}
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <CancelButton onClick={onClose} disabled={isSaving}>
                            Cancel
                        </CancelButton>
                        <SubmitButton
                            onClick={handleSave}
                            disabled={isSaving}
                            startIcon={
                                isSaving ? <ButtonLoadingSkeleton size="small" /> : <SaveIcon />
                            }
                        >
                            {isNewRow ? 'Add' : 'Save'}
                        </SubmitButton>
                    </DialogActions>
                </>
            ) : (
                <>
                    <AccessRestricted
                        message={isNewRow ? "Add Access Restricted" : "Edit Access Restricted"}
                        description={isNewRow 
                            ? "You don't have permission to add table data. Please contact the account owner to request access."
                            : "You don't have permission to edit table data. Please contact the account owner to request access."
                        }
                        permission={isNewRow ? "addRecord" : "editRecord"}
                    />
                    <DialogActions sx={{ p: 2 }}>
                        <CancelButton onClick={onClose}>
                            Close
                        </CancelButton>
                    </DialogActions>
                </>
            )}
        </Dialog>
    );
}
