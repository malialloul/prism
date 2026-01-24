import { useState, useEffect } from 'react';
import { IconButton, InputAdornment, CircularProgress } from '@mui/material';
import { Close, Visibility, VisibilityOff, PauseCircleOutline, Warning } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDeactivateAccount } from '../../../../api/entities/auth';
import {
  StyledDialog,
  StyledDialogTitle,
  ModalTitle,
  CloseButton,
  StyledDialogContent,
  WarningBox,
  WarningTitle,
  WarningText,
  StyledTextField,
  SuccessContent,
  SuccessIcon,
  SuccessTitle,
  SuccessMessage,
  StyledDialogActions,
  CancelButton,
  DeactivateButton,
} from './DeactivateAccountModal.styles';

interface DeactivateAccountModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const validationSchema = Yup.object({
  password: Yup.string().required('Password is required'),
});

const DeactivateAccountModal = ({ open, onClose, onSuccess }: DeactivateAccountModalProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const { deactivateAccount, isLoading, isSuccess, isError, error, reset } = useDeactivateAccount();

  const formik = useFormik({
    initialValues: {
      password: '',
    },
    validationSchema,
    onSubmit: (values) => {
      deactivateAccount({
        password: values.password,
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
      const errorMessage = error.body?.message || 'Failed to deactivate account';
      if (errorMessage.toLowerCase().includes('password')) {
        formik.setFieldError('password', errorMessage);
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
        <ModalTitle>Deactivate Account</ModalTitle>
        <CloseButton onClick={handleClose}>
          <Close fontSize="small" />
        </CloseButton>
      </StyledDialogTitle>

      {isSuccess ? (
        <SuccessContent>
          <SuccessIcon>
            <PauseCircleOutline />
          </SuccessIcon>
          <SuccessTitle>Account Deactivated</SuccessTitle>
          <SuccessMessage>
            Your account has been deactivated. You can reactivate it anytime by logging in again.
          </SuccessMessage>
        </SuccessContent>
      ) : (
        <form onSubmit={formik.handleSubmit}>
          <StyledDialogContent>
            <WarningBox>
              <WarningTitle>
                <Warning fontSize="small" />
                Temporary Deactivation
              </WarningTitle>
              <WarningText>
                Deactivating your account will temporarily disable it. While deactivated, you won't 
                be able to access your account or its data. You can reactivate it at any time simply 
                by logging in again with your credentials.
              </WarningText>
            </WarningBox>

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
          </StyledDialogContent>

          <StyledDialogActions>
            <CancelButton onClick={handleClose}>
              Cancel
            </CancelButton>
            <DeactivateButton
              type="submit"
              disabled={isLoading || !formik.isValid || !formik.dirty}
            >
              {isLoading ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                'Deactivate Account'
              )}
            </DeactivateButton>
          </StyledDialogActions>
        </form>
      )}
    </StyledDialog>
  );
};

export default DeactivateAccountModal;
