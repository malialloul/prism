import { useState, useEffect } from 'react';
import { IconButton, InputAdornment, Box } from '@mui/material';
import { ButtonLoadingSkeleton } from '../../../../components';
import { Close, Visibility, VisibilityOff, DeleteForever, Warning } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDeleteAccount } from '../../../../api/entities/auth';
import {
  StyledDialog,
  StyledDialogTitle,
  ModalTitle,
  CloseButton,
  StyledDialogContent,
  DangerBox,
  DangerTitle,
  DangerText,
  DangerList,
  StyledTextField,
  ConfirmationInput,
  ConfirmationHint,
  SuccessContent,
  SuccessIcon,
  SuccessTitle,
  SuccessMessage,
  StyledDialogActions,
  CancelButton,
  DeleteButton,
} from './DeleteAccountModal.styles';

interface DeleteAccountModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const validationSchema = Yup.object({
  password: Yup.string().required('Password is required'),
  confirmation: Yup.string()
    .required('Please type DELETE to confirm')
    .oneOf(['DELETE'], 'Please type DELETE to confirm'),
});

const DeleteAccountModal = ({ open, onClose, onSuccess }: DeleteAccountModalProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const { deleteAccount, isLoading, isSuccess, isError, error, reset } = useDeleteAccount();

  const formik = useFormik({
    initialValues: {
      password: '',
      confirmation: '',
    },
    validationSchema,
    onSubmit: (values) => {
      deleteAccount({
        password: values.password,
        confirmation: values.confirmation,
      });
    },
  });

  const handleClose = () => {
    formik.resetForm();
    setShowPassword(false);
    reset();
    onClose();
  };

  // Handle error
  useEffect(() => {
    if (isError && error) {
      const errorMessage = error.body?.message || 'Failed to delete account';
      if (errorMessage.toLowerCase().includes('password')) {
        formik.setFieldError('password', errorMessage);
      } else if (errorMessage.toLowerCase().includes('confirmation') || errorMessage.toLowerCase().includes('delete')) {
        formik.setFieldError('confirmation', errorMessage);
      }
    }
  }, [isError, error]);

  // Handle success
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        // Call onSuccess first to logout and redirect before closing modal
        onSuccess();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, onSuccess]);

  return (
    <StyledDialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <StyledDialogTitle>
        <ModalTitle>Delete Account Permanently</ModalTitle>
        <CloseButton onClick={handleClose}>
          <Close fontSize="small" />
        </CloseButton>
      </StyledDialogTitle>

      {isSuccess ? (
        <SuccessContent>
          <SuccessIcon>
            <DeleteForever />
          </SuccessIcon>
          <SuccessTitle>Account Deleted</SuccessTitle>
          <SuccessMessage>
            Your account and all associated data have been permanently deleted.
          </SuccessMessage>
        </SuccessContent>
      ) : (
        <form onSubmit={formik.handleSubmit}>
          <StyledDialogContent>
            <DangerBox>
              <DangerTitle>
                <Warning fontSize="small" />
                This action is irreversible
              </DangerTitle>
              <DangerText>
                Deleting your account will permanently remove:
              </DangerText>
              <DangerList>
                <li>All your personal data and settings</li>
                <li>Your authentication credentials</li>
                <li>All active sessions</li>
                <li>Two-factor authentication configuration</li>
              </DangerList>
            </DangerBox>

            <StyledTextField
              fullWidth
              id="password"
              name="password"
              label="Confirm your password"
              type={showPassword ? 'text' : 'password'}
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ mt: 1 }}>
              <ConfirmationHint>
                Type <strong>DELETE</strong> to confirm account deletion
              </ConfirmationHint>
              <ConfirmationInput
                fullWidth
                id="confirmation"
                name="confirmation"
                label="Type DELETE"
                value={formik.values.confirmation}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.confirmation && Boolean(formik.errors.confirmation)}
                helperText={formik.touched.confirmation && formik.errors.confirmation}
              />
            </Box>
          </StyledDialogContent>

          <StyledDialogActions>
            <CancelButton onClick={handleClose}>
              Cancel
            </CancelButton>
            <DeleteButton
              type="submit"
              disabled={isLoading || !formik.isValid || !formik.dirty}
            >
              {isLoading ? (
                <ButtonLoadingSkeleton size="small" />
              ) : (
                'Delete Account'
              )}
            </DeleteButton>
          </StyledDialogActions>
        </form>
      )}
    </StyledDialog>
  );
};

export default DeleteAccountModal;
