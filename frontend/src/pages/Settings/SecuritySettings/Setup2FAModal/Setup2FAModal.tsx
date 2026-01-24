import { useState, useEffect } from 'react';
import { IconButton, InputAdornment, CircularProgress } from '@mui/material';
import { Close, Visibility, VisibilityOff, Check, ContentCopy, Download } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSetup2FA, useVerify2FA } from '../../../../api/entities/auth';
import {
  StyledDialog,
  StyledDialogTitle,
  ModalTitle,
  CloseButton,
  StyledStepper,
  StyledStep,
  StyledStepLabel,
  StyledDialogContent,
  StepContent,
  StepDescription,
  StyledTextField,
  QRCodeContainer,
  SecretKeyContainer,
  SecretKeyLabel,
  SecretKeyValue,
  CopyButton,
  VerificationInput,
  SuccessContent,
  SuccessIcon,
  SuccessTitle,
  SuccessMessage,
  BackupCodesContainer,
  BackupCodesTitle,
  BackupCodesDescription,
  BackupCodesGrid,
  BackupCode,
  BackupCodesActions,
  StyledDialogActions,
  CancelButton,
  SubmitButton,
  SecondaryButton,
} from './Setup2FAModal.styles';

interface Setup2FAModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const steps = ['Verify Password', 'Scan QR Code', 'Complete Setup'];

const passwordSchema = Yup.object({
  password: Yup.string().required('Password is required'),
});

const verificationSchema = Yup.object({
  code: Yup.string()
    .required('Verification code is required')
    .matches(/^\d{6}$/, 'Code must be 6 digits'),
});

const Setup2FAModal = ({ open, onClose, onSuccess }: Setup2FAModalProps) => {
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedSecret, setCopiedSecret] = useState(false);

  const { 
    setup2FA, 
    isLoading: isSetupLoading, 
    isSuccess: isSetupSuccess, 
    isError: isSetupError, 
    error: setupError,
    data: setupData,
    reset: resetSetup 
  } = useSetup2FA();

  const {
    verify2FA,
    isLoading: isVerifyLoading,
    isSuccess: isVerifySuccess,
    isError: isVerifyError,
    error: verifyError,
    data: verifyData,
    reset: resetVerify,
  } = useVerify2FA();

  const passwordFormik = useFormik({
    initialValues: { password: '' },
    validationSchema: passwordSchema,
    onSubmit: (values) => {
      setup2FA({ password: values.password });
    },
  });

  const verificationFormik = useFormik({
    initialValues: { code: '' },
    validationSchema: verificationSchema,
    onSubmit: (values) => {
      verify2FA({ code: values.code });
    },
  });

  // Handle setup success
  useEffect(() => {
    if (isSetupSuccess && setupData?.data) {
      setQrCode(setupData.data.qrCode);
      setSecret(setupData.data.secret);
      setActiveStep(1);
    }
  }, [isSetupSuccess, setupData]);

  // Handle setup error
  useEffect(() => {
    if (isSetupError && setupError) {
      const errorMessage = setupError.body?.message || 'Failed to setup 2FA';
      passwordFormik.setFieldError('password', errorMessage);
    }
  }, [isSetupError, setupError]);

  // Handle verify success
  useEffect(() => {
    if (isVerifySuccess && verifyData?.data) {
      setBackupCodes(verifyData.data.backupCodes);
      setActiveStep(2);
    }
  }, [isVerifySuccess, verifyData]);

  // Handle verify error
  useEffect(() => {
    if (isVerifyError && verifyError) {
      const errorMessage = verifyError.body?.message || 'Invalid verification code';
      verificationFormik.setFieldError('code', errorMessage);
    }
  }, [isVerifyError, verifyError]);

  const handleClose = () => {
    // Only allow closing on success step, otherwise ask for confirmation
    if (activeStep === 2) {
      handleFinish();
    } else {
      resetAll();
      onClose();
    }
  };

  const resetAll = () => {
    setActiveStep(0);
    setQrCode(null);
    setSecret(null);
    setBackupCodes([]);
    setShowPassword(false);
    setCopiedSecret(false);
    passwordFormik.resetForm();
    verificationFormik.resetForm();
    resetSetup();
    resetVerify();
  };

  const handleFinish = () => {
    resetAll();
    onSuccess();
    onClose();
  };

  const copySecret = () => {
    if (secret) {
      navigator.clipboard.writeText(secret);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  const copyBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    navigator.clipboard.writeText(codesText);
  };

  const downloadBackupCodes = () => {
    const codesText = `Prism 2FA Backup Codes\n${'='.repeat(25)}\n\nStore these codes in a safe place. Each code can only be used once.\n\n${backupCodes.join('\n')}\n\nGenerated: ${new Date().toLocaleString()}`;
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prism-2fa-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <form onSubmit={passwordFormik.handleSubmit}>
            <StepContent>
              <StepDescription>
                To enable two-factor authentication, please verify your identity by entering your current password.
              </StepDescription>
              <StyledTextField
                fullWidth
                id="password"
                name="password"
                label="Current Password"
                type={showPassword ? 'text' : 'password'}
                value={passwordFormik.values.password}
                onChange={passwordFormik.handleChange}
                onBlur={passwordFormik.handleBlur}
                error={passwordFormik.touched.password && Boolean(passwordFormik.errors.password)}
                helperText={passwordFormik.touched.password && passwordFormik.errors.password}
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
            </StepContent>
            <StyledDialogActions>
              <CancelButton onClick={handleClose}>Cancel</CancelButton>
              <SubmitButton
                type="submit"
                variant="contained"
                disabled={isSetupLoading || !passwordFormik.isValid || !passwordFormik.dirty}
              >
                {isSetupLoading ? <CircularProgress size={20} color="inherit" /> : 'Continue'}
              </SubmitButton>
            </StyledDialogActions>
          </form>
        );

      case 1:
        return (
          <form onSubmit={verificationFormik.handleSubmit}>
            <StepContent>
              <StepDescription>
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.), then enter the 6-digit code shown in the app.
              </StepDescription>
              
              {qrCode && (
                <QRCodeContainer>
                  <img src={qrCode} alt="2FA QR Code" width={180} height={180} />
                </QRCodeContainer>
              )}

              <SecretKeyContainer>
                <SecretKeyLabel>
                  Can't scan? Enter this key manually:
                </SecretKeyLabel>
                <SecretKeyValue>
                  <span style={{ flex: 1 }}>{secret}</span>
                  <CopyButton onClick={copySecret}>
                    {copiedSecret ? <Check fontSize="small" /> : <ContentCopy fontSize="small" />}
                  </CopyButton>
                </SecretKeyValue>
              </SecretKeyContainer>

              <VerificationInput
                fullWidth
                id="code"
                name="code"
                label="6-digit code"
                placeholder="000000"
                value={verificationFormik.values.code}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  verificationFormik.setFieldValue('code', value);
                }}
                onBlur={verificationFormik.handleBlur}
                error={verificationFormik.touched.code && Boolean(verificationFormik.errors.code)}
                helperText={verificationFormik.touched.code && verificationFormik.errors.code}
                inputProps={{
                  maxLength: 6,
                  autoComplete: 'one-time-code',
                }}
              />
            </StepContent>
            <StyledDialogActions>
              <CancelButton onClick={handleClose}>Cancel</CancelButton>
              <SubmitButton
                type="submit"
                variant="contained"
                disabled={isVerifyLoading || !verificationFormik.isValid || !verificationFormik.dirty}
              >
                {isVerifyLoading ? <CircularProgress size={20} color="inherit" /> : 'Verify & Enable'}
              </SubmitButton>
            </StyledDialogActions>
          </form>
        );

      case 2:
        return (
          <>
            <SuccessContent>
              <SuccessIcon>
                <Check />
              </SuccessIcon>
              <SuccessTitle>2FA Enabled Successfully!</SuccessTitle>
              <SuccessMessage>
                Your account is now protected with two-factor authentication.
              </SuccessMessage>

              <BackupCodesContainer>
                <BackupCodesTitle>Save Your Backup Codes</BackupCodesTitle>
                <BackupCodesDescription>
                  These codes can be used to access your account if you lose your authenticator device. Each code can only be used once. Store them somewhere safe!
                </BackupCodesDescription>
                <BackupCodesGrid>
                  {backupCodes.map((code, index) => (
                    <BackupCode key={index}>{code}</BackupCode>
                  ))}
                </BackupCodesGrid>
                <BackupCodesActions>
                  <SecondaryButton
                    variant="outlined"
                    startIcon={<ContentCopy />}
                    onClick={copyBackupCodes}
                  >
                    Copy
                  </SecondaryButton>
                  <SecondaryButton
                    variant="outlined"
                    startIcon={<Download />}
                    onClick={downloadBackupCodes}
                  >
                    Download
                  </SecondaryButton>
                </BackupCodesActions>
              </BackupCodesContainer>
            </SuccessContent>
            <StyledDialogActions>
              <SubmitButton variant="contained" onClick={handleFinish}>
                Done
              </SubmitButton>
            </StyledDialogActions>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <StyledDialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <StyledDialogTitle>
        <ModalTitle>Enable Two-Factor Authentication</ModalTitle>
        <CloseButton onClick={handleClose}>
          <Close fontSize="small" />
        </CloseButton>
      </StyledDialogTitle>

      <StyledStepper activeStep={activeStep}>
        {steps.map((label) => (
          <StyledStep key={label}>
            <StyledStepLabel>{label}</StyledStepLabel>
          </StyledStep>
        ))}
      </StyledStepper>

      <StyledDialogContent>
        {renderStepContent()}
      </StyledDialogContent>
    </StyledDialog>
  );
};

export default Setup2FAModal;
