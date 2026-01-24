import { useState, useEffect } from 'react';
import { IconButton, InputAdornment, Box } from '@mui/material';
import { Close, Visibility, VisibilityOff, Check } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useChangeEmail } from '../../../../api/entities/auth';
import {
  StyledDialog,
  StyledDialogTitle,
  ModalTitle,
  CloseButton,
  StyledDialogContent,
  CurrentEmailLabel,
  CurrentEmailValue,
  StyledTextField,
  HelpText,
  StyledDialogActions,
  CancelButton,
  SubmitButton,
} from './ChangeEmailModal.styles';

interface ChangeEmailModalProps {
  open: boolean;
  onClose: () => void;
  currentEmail: string;
}

const validationSchema = Yup.object({
  newEmail: Yup.string()
    .email('Please enter a valid email address')
    .required('New email is required'),
  password: Yup.string()
    .required('Password is required to change email'),
});

const ChangeEmailModal = ({ open, onClose, currentEmail }: ChangeEmailModalProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const { changeEmail, isLoading, isSuccess, isError, error, reset } = useChangeEmail();

  const formik = useFormik({
    initialValues: {
      newEmail: '',
      password: '',
    },
    validationSchema,
    validate: (values) => {
      const errors: { newEmail?: string } = {};
      if (values.newEmail && values.newEmail.toLowerCase() === currentEmail.toLowerCase()) {
        errors.newEmail = 'New email must be different from current email';
      }
      return errors;
    },
    onSubmit: (values) => {
      changeEmail({
        newEmail: values.newEmail,
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

  // Set API error on form
  useEffect(() => {
    if (isError && error) {
      const errorMessage = error.body?.message || 'Failed to change email';
      if (errorMessage.toLowerCase().includes('password')) {
        formik.setFieldError('password', errorMessage);
      } else if (errorMessage.toLowerCase().includes('email')) {
        formik.setFieldError('newEmail', errorMessage);
      }
    }
  }, [isError, error]);

  // Close modal on success after delay
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        handleClose();
        // Reload page to reflect new email from updated token
        window.location.reload();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  return (
    <StyledDialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <StyledDialogTitle>
        <ModalTitle>Change Email Address</ModalTitle>
        <CloseButton onClick={handleClose}>
          <Close fontSize="small" />
        </CloseButton>
      </StyledDialogTitle>

      {isSuccess ? (
        <StyledDialogContent sx={{ pt: 4, pb: 4, textAlign: 'center' }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <Check sx={{ fontSize: 32, color: '#4caf50' }} />
          </Box>
          <ModalTitle>Email Updated</ModalTitle>
          <HelpText sx={{ mt: 1 }}>Your email has been changed successfully.</HelpText>
        </StyledDialogContent>
      ) : (
        <form onSubmit={formik.handleSubmit}>
          <StyledDialogContent>
            <Box sx={{ mb: 2 }}>
              <CurrentEmailLabel>Current email</CurrentEmailLabel>
              <CurrentEmailValue>{currentEmail}</CurrentEmailValue>
            </Box>

            <StyledTextField
              fullWidth
              id="newEmail"
              name="newEmail"
              label="New Email Address"
              type="email"
              value={formik.values.newEmail}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.newEmail && Boolean(formik.errors.newEmail)}
              helperText={formik.touched.newEmail && formik.errors.newEmail}
            />

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

            <HelpText>Your email will be updated immediately.</HelpText>
          </StyledDialogContent>

          <StyledDialogActions>
            <CancelButton onClick={handleClose}>Cancel</CancelButton>
            <SubmitButton
              type="submit"
              variant="contained"
              disabled={isLoading || !formik.isValid || !formik.dirty}
            >
              {isLoading ? 'Updating...' : 'Update Email'}
            </SubmitButton>
          </StyledDialogActions>
        </form>
      )}
    </StyledDialog>
  );
};

export default ChangeEmailModal;
