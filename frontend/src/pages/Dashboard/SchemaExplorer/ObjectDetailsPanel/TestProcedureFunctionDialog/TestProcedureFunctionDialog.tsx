import { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogTitle, DialogContent, Box, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import type { ProcedureDetailsDto, FunctionDetailsDto } from '../../../../../api/models/SchemaDto';
import { CancelButton, SubmitButton, FormGroup, FormLabel, StyledTextField } from '../../../TableEditor/shared.styles';
import { ButtonLoadingSkeleton } from '../../../../../components';

interface TestProcedureFunctionDialogProps {
    open: boolean;
    objectName: string | null;
    objectType: 'procedure' | 'function' | null;
    details: ProcedureDetailsDto | FunctionDetailsDto | null;
    onClose: () => void;
    onTest: (query: string) => void;
    isLoading?: boolean;
}

export default function TestProcedureFunctionDialog({
    open,
    objectName,
    objectType,
    details,
    onClose,
    onTest,
    isLoading = false,
}: TestProcedureFunctionDialogProps) {
    const [parameterValues, setParameterValues] = useState<Record<string, string>>({});

    useEffect(() => {
        if (open && details && details.parameters) {
            // Initialize parameter values
            const initialValues: Record<string, string> = {};
            details.parameters.forEach((param: any) => {
                initialValues[param.name] = '';
            });
            setParameterValues(initialValues);
        }
    }, [open, details]);

    const handleParameterChange = (paramName: string, value: string) => {
        setParameterValues((prev) => ({
            ...prev,
            [paramName]: value,
        }));
    };

    const handleTest = () => {
        if (!objectName || !objectType || !details) return;

        const hasParameters = details.parameters && details.parameters.length > 0;

        if (objectType === 'procedure') {
            const procedure = details as ProcedureDetailsDto;

            if (!hasParameters) {
                const query = `CALL ${objectName}();`;
                onTest(query);
                return;
            }

            // Build CALL statement with parameters
            const params = procedure.parameters
                .filter((param: ProcedureDetailsDto['parameters'][number]) => !param.mode || param.mode === 'IN' || param.mode === 'INOUT')
                .map((param: ProcedureDetailsDto['parameters'][number]) => {
                    const value = parameterValues[param.name] || '';
                    // For string parameters, wrap in quotes. For NULL, use NULL keyword
                    return value ? `'${value}'` : 'NULL';
                })
                .join(', ');

            const query = params ? `CALL ${objectName}(${params});` : `CALL ${objectName}();`;
            onTest(query);
        } else {
            const func = details as FunctionDetailsDto;

            if (!hasParameters) {
                const query = `SELECT ${objectName}();`;
                onTest(query);
                return;
            }

            // Build SELECT statement with parameters
            const params = func.parameters
                .map((param: FunctionDetailsDto['parameters'][number]) => {
                    const value = parameterValues[param.name] || '';
                    // For string parameters, wrap in quotes. For NULL, use NULL keyword
                    return value ? `'${value}'` : 'NULL';
                })
                .join(', ');

            const query = params ? `SELECT ${objectName}(${params});` : `SELECT ${objectName}();`;
            onTest(query);
        }
    };

    if (!objectName || !objectType || !details) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                Test {objectType === 'procedure' ? 'Procedure' : 'Function'}: {objectName}
            </DialogTitle>
            <DialogContent>
                {details.parameters.length === 0 ? (
                    <Box sx={{ py: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            This {objectType} has no parameters.
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', mt: 2 }}>
                        {details.parameters.map((param: any) => (
                            <FormGroup key={param.name}>
                                <FormLabel>
                                    {param.name}
                                    <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#6b7280' }}>
                                        ({param.type})
                                        {objectType === 'procedure' && (
                                            <span style={{ marginLeft: '0.5rem' }}>
                                                [{param.mode || 'IN'}]
                                            </span>
                                        )}
                                    </span>
                                </FormLabel>
                                <StyledTextField
                                    fullWidth
                                    placeholder={`Enter ${param.name}...`}
                                    value={parameterValues[param.name] || ''}
                                    onChange={(e: any) => handleParameterChange(param.name, e.target.value)}
                                    disabled={isLoading}
                                />
                            </FormGroup>
                        ))}
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <CancelButton onClick={onClose} disabled={isLoading}>
                    Cancel
                </CancelButton>
                <SubmitButton
                    onClick={handleTest}
                    disabled={isLoading}
                    startIcon={
                        isLoading ? <ButtonLoadingSkeleton size="small" /> : <SaveIcon />
                    }
                >
                    Test
                </SubmitButton>
            </DialogActions>
        </Dialog>
    );
}
