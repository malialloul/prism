import { ButtonLoadingSkeleton } from '../../../../../components';
import WarningIcon from '@mui/icons-material/Warning';
import {
    StyledDialog,
    DialogHeader,
    DialogTitle,
    DialogSubtitle,
    DialogContent,
    DialogFooter,
    CancelButton,
    DeleteButton,
    WarningBox,
} from './ConfirmDialog.styles';

interface ConfirmDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    subtitle?: string;
    message: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
    variant?: 'danger' | 'warning';
}

export default function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    title,
    subtitle = 'This action cannot be undone',
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isLoading = false,
    variant = 'danger',
}: ConfirmDialogProps) {
    return (
        <StyledDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                {subtitle && <DialogSubtitle>{subtitle}</DialogSubtitle>}
            </DialogHeader>

            <DialogContent>
                <WarningBox>
                    <WarningIcon color={variant === 'danger' ? 'error' : 'warning'} />
                    <p>{message}</p>
                </WarningBox>
            </DialogContent>

            <DialogFooter>
                <CancelButton onClick={onClose}>{cancelText}</CancelButton>
                <DeleteButton onClick={onConfirm} disabled={isLoading}>
                    {isLoading ? <ButtonLoadingSkeleton size="small" /> : confirmText}
                </DeleteButton>
            </DialogFooter>
        </StyledDialog>
    );
}
