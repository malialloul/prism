import { useState, useEffect } from 'react';
import { IconButton, InputAdornment, Box } from '@mui/material';
import { ButtonLoadingSkeleton } from '../../../../components';
import { Close, Visibility, VisibilityOff, Check, Warning } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDisable2FA } from '../../../../api/entities/auth';
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
  VerificationInput,
  SuccessContent,
  SuccessIcon,
  SuccessTitle,
  SuccessMessage,
  StyledDialogActions,
  CancelButton,
  DisableButton,
} from './Disable2FAModal.styles';

interface Disable2FAModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const validationSchema = Yup.object({
  password: Yup.string().required('Password is required'),
  code: Yup.string()
    .required('Verification code is required')
    .matches(/^\d{6}$/, 'Code must be 6 digits'),
});

const Disable2FAModal = ({ open, onClose, onSuccess }: Disable2FAModalProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const { disable2FA, isLoading, isSuccess, isError, error, reset } = useDisable2FA();

  const formik = useFormik({
    initialValues: {
      password: '',
      code: '',
    },
    validationSchema,
    onSubmit: (values) => {
      disable2FA({
        password: values.password,
        code: values.code,
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
      const errorMessage = error.body?.message || 'Failed to disable 2FA';
      if (errorMessage.toLowerCase().includes('password')) {
        formik.setFieldError('password', errorMessage);
      } else if (errorMessage.toLowerCase().includes('code') || errorMessage.toLowerCase().includes('verification')) {
        formik.setFieldError('code', errorMessage);
      }
    }
  }, [isError, error]);

  // Handle success
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        handleClose();
        onSuccess();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  return (
    <StyledDialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <StyledDialogTitle>
        <ModalTitle>Disable Two-Factor Authentication</ModalTitle>
        <CloseButton onClick={handleClose}>
          <Close fontSize="small" />
        </CloseButton>
      </StyledDialogTitle>

      {isSuccess ? (
        <SuccessContent>
          <SuccessIcon>
            <Check />
          </SuccessIcon>
          <SuccessTitle>2FA Disabled</SuccessTitle>
          <SuccessMessage>
            Two-factor authentication has been disabled for your account.
          </SuccessMessage>
        </SuccessContent>
      ) : (
        <form onSubmit={formik.handleSubmit}>
          <StyledDialogContent>
            <WarningBox>
              <WarningTitle>
                <Warning fontSize="small" />
                Security Warning
              </WarningTitle>
              <WarningText>
                Disabling two-factor authentication will make your account less secure. 
                You'll only need your password to sign in, which is more vulnerable to attacks.
              </WarningText>
            </WarningBox>

            <StyledTextField
              fullWidth
              id="password"
              name="password"
              label="Current Password"
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
              <VerificationInput
                fullWidth
                id="code"
                name="code"
                label="6-digit code from authenticator app"
                placeholder="000000"
                value={formik.values.code}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  formik.setFieldValue('code', value);
                }}
                onBlur={formik.handleBlur}
                error={formik.touched.code && Boolean(formik.errors.code)}
                helperText={formik.touched.code && formik.errors.code}
                inputProps={{
                  maxLength: 6,
                  autoComplete: 'one-time-code',
                }}
              />
            </Box>
          </StyledDialogContent>

          <StyledDialogActions>
            <CancelButton onClick={handleClose}>Cancel</CancelButton>
            <DisableButton
              type="submit"
              variant="contained"
              disabled={isLoading || !formik.isValid || !formik.dirty}
            >
              {isLoading ? <ButtonLoadingSkeleton size="small" /> : 'Disable 2FA'}
            </DisableButton>
          </StyledDialogActions>
        </form>
      )}
    </StyledDialog>
  );
};

export default Disable2FAModal;
