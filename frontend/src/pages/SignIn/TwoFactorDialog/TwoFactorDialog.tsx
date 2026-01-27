import { useEffect } from 'react';
import { Close, Shield } from '@mui/icons-material';
import { ButtonLoadingSkeleton } from '../../../components';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useLogin2FA } from '../../../api/entities/auth';
import { setAuthToken } from '../../../api/httpClient';
import {
  StyledDialog,
  StyledDialogTitle,
  ModalTitle,
  CloseButton,
  StyledDialogContent,
  IconContainer,
  Description,
  EmailDisplay,
  VerificationInput,
  HelpText,
  StyledDialogActions,
  CancelButton,
  SubmitButton,
} from './TwoFactorDialog.styles';

interface TwoFactorDialogProps {
  open: boolean;
  onClose: () => void;
  email: string;
  tempToken: string;
  rememberMe: boolean;
}

const validationSchema = Yup.object({
  code: Yup.string()
    .required('Code is required')
    .matches(/^\d{6}$/, 'Code must be 6 digits'),
});

const TwoFactorDialog = ({ open, onClose, email, tempToken, rememberMe }: TwoFactorDialogProps) => {
  const navigate = useNavigate();
  const { login2FA, isLoading, isSuccess, isError, error, data, reset } = useLogin2FA();

  const formik = useFormik({
    initialValues: { code: '' },
    validationSchema,
    onSubmit: (values) => {
      login2FA({
        email,
        code: values.code,
        tempToken,
      });
    },
  });

  const handleClose = () => {
    formik.resetForm();
    reset();
    onClose();
  };

  // Handle success - set token and redirect
  useEffect(() => {
    if (isSuccess && data?.data?.token) {
      setAuthToken(data.data.token, rememberMe);
      navigate('/dashboard');
    }
  }, [isSuccess, data, rememberMe, navigate]);

  // Handle error
  useEffect(() => {
    if (isError && error) {
      const errorMessage = error.body?.message || 'Invalid verification code';
      formik.setFieldError('code', errorMessage);
    }
  }, [isError, error]);

  // Auto-submit when 6 digits entered
  useEffect(() => {
    if (formik.values.code.length === 6 && !formik.errors.code) {
      formik.handleSubmit();
    }
  }, [formik.values.code]);

  return (
    <StyledDialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <StyledDialogTitle>
        <ModalTitle>Two-Factor Authentication</ModalTitle>
        <CloseButton onClick={handleClose}>
          <Close fontSize="small" />
        </CloseButton>
      </StyledDialogTitle>

      <form onSubmit={formik.handleSubmit}>
        <StyledDialogContent>
          <IconContainer>
            <Shield />
          </IconContainer>

          <Description>
            Enter the 6-digit code from your authenticator app to sign in as{' '}
            <EmailDisplay>{email}</EmailDisplay>
          </Description>

          <VerificationInput
            fullWidth
            id="code"
            name="code"
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
              autoFocus: true,
            }}
          />

          <HelpText>
            Open your authenticator app (Google Authenticator, Authy, etc.) to view your code.
          </HelpText>
        </StyledDialogContent>

        <StyledDialogActions>
          <CancelButton onClick={handleClose}>Cancel</CancelButton>
          <SubmitButton
            type="submit"
            variant="contained"
            disabled={isLoading || formik.values.code.length !== 6}
          >
            {isLoading ? <ButtonLoadingSkeleton size="small" /> : 'Verify'}
          </SubmitButton>
        </StyledDialogActions>
      </form>
    </StyledDialog>
  );
};

export default TwoFactorDialog;
