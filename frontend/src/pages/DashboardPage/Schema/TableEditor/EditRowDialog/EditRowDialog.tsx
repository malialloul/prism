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
    const { canEditTableData } = usePermissions();
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

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <MuiDialogTitle>Edit Row</MuiDialogTitle>
            {canEditTableData ? (
                <>
                    <DialogContent>
                        {columns
                            .filter((col) => !primaryKeyColumns.includes(col))
                            .map((column) => (
                                <FormGroup key={column}>
                                    <FormLabel>{column}</FormLabel>
                                    <StyledTextField
                                        fullWidth
                                        value={editedRow[column] ?? ''}
                                        onChange={(e) => handleChange(column, e.target.value || null)}
                                        placeholder="NULL"
                                        disabled={primaryKeyColumns.includes(column)}
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
                            Save
                        </SubmitButton>
                    </DialogActions>
                </>
            ) : (
                <>
                    <AccessRestricted
                        message="Edit Access Restricted"
                        description="You don't have permission to edit table data. Please contact the account owner to request access."
                        permission="editTableData"
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
