import { useState } from 'react';
import { IconButton, InputAdornment } from '@mui/material';
import { Close, Visibility, VisibilityOff, Check } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTheme } from '@mui/material/styles';
import { getWorkspaceColors } from '../../../../styles/theme';
import { useChangePassword } from '../../../../api/entities/auth';
import {
  StyledDialog,
  StyledDialogTitle,
  ModalTitle,
  CloseButton,
  StyledDialogContent,
  SuccessContent,
  SuccessIcon,
  SuccessTitle,
  SuccessMessage,
  StyledTextField,
  PasswordStrengthContainer,
  StrengthBarContainer,
  StyledLinearProgress,
  StrengthLabel,
  RequirementsContainer,
  RequirementItem,
  StyledDialogActions,
  CancelButton,
  SubmitButton,
} from './ChangePasswordModal.styles';

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

const validationSchema = Yup.object({
  currentPassword: Yup.string()
    .required('Current password is required'),
  newPassword: Yup.string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .notOneOf([Yup.ref('currentPassword')], 'New password must be different from current password'),
  confirmPassword: Yup.string()
    .required('Please confirm your new password')
    .oneOf([Yup.ref('newPassword')], 'Passwords do not match'),
});

const ChangePasswordModal = ({ open, onClose }: ChangePasswordModalProps) => {
  const theme = useTheme();
  const colors = getWorkspaceColors(theme.palette.mode === 'dark');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { changePassword, isLoading, isSuccess, reset } = useChangePassword();

  const formik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: (values) => {
      changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
    },
  });

  const handleClose = () => {
    formik.resetForm();
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    reset();
    onClose();
  };

  // Close modal on success after a short delay
  if (isSuccess) {
    setTimeout(() => {
      handleClose();
    }, 1500);
  }

  const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
    let score = 0;
    if (password.length >= 8) score += 25;
    if (password.length >= 12) score += 15;
    if (/[A-Z]/.test(password)) score += 20;
    if (/[a-z]/.test(password)) score += 10;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^A-Za-z0-9]/.test(password)) score += 15;

    if (score < 40) return { score, label: 'Weak', color: colors.error };
    if (score < 70) return { score, label: 'Medium', color: colors.warning };
    return { score, label: 'Strong', color: colors.success };
  };

  const passwordStrength = getPasswordStrength(formik.values.newPassword);

  const requirements = [
    { met: formik.values.newPassword.length >= 8, text: 'At least 8 characters' },
    { met: /[A-Z]/.test(formik.values.newPassword), text: 'One uppercase letter' },
    { met: /[0-9]/.test(formik.values.newPassword), text: 'One number' },
  ];

  return (
    <StyledDialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <StyledDialogTitle>
        <ModalTitle>Change Password</ModalTitle>
        <CloseButton onClick={handleClose}>
          <Close fontSize="small" />
        </CloseButton>
      </StyledDialogTitle>

      {isSuccess ? (
        <SuccessContent>
          <SuccessIcon>
            <Check />
          </SuccessIcon>
          <SuccessTitle>Password Updated</SuccessTitle>
          <SuccessMessage>Your password has been changed successfully.</SuccessMessage>
        </SuccessContent>
      ) : (
        <form onSubmit={formik.handleSubmit}>
          <StyledDialogContent>
            <StyledTextField
              fullWidth
              id="currentPassword"
              name="currentPassword"
              label="Current Password"
              type={showCurrentPassword ? 'text' : 'password'}
              value={formik.values.currentPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.currentPassword && Boolean(formik.errors.currentPassword)}
              helperText={formik.touched.currentPassword && formik.errors.currentPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      edge="end"
                      size="small"
                    >
                      {showCurrentPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <StyledTextField
              fullWidth
              id="newPassword"
              name="newPassword"
              label="New Password"
              type={showNewPassword ? 'text' : 'password'}
              value={formik.values.newPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.newPassword && Boolean(formik.errors.newPassword)}
              helperText={formik.touched.newPassword && formik.errors.newPassword}
              sx={{ mb: formik.values.newPassword ? 1 : 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                      size="small"
                    >
                      {showNewPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {formik.values.newPassword && (
              <PasswordStrengthContainer>
                <StrengthBarContainer>
                  <StyledLinearProgress
                    variant="determinate"
                    value={passwordStrength.score}
                    sx={{
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: passwordStrength.color,
                      },
                    }}
                  />
                  <StrengthLabel style={{ color: passwordStrength.color }}>
                    {passwordStrength.label}
                  </StrengthLabel>
                </StrengthBarContainer>
                <RequirementsContainer>
                  {requirements.map((req, index) => (
                    <RequirementItem key={index} met={req.met}>
                      {req.met ? <Check /> : '○'} {req.text}
                    </RequirementItem>
                  ))}
                </RequirementsContainer>
              </PasswordStrengthContainer>
            )}

            <StyledTextField
              fullWidth
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
              helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
              sx={{ mb: 0 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                      size="small"
                    >
                      {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </StyledDialogContent>

          <StyledDialogActions>
            <CancelButton onClick={handleClose}>Cancel</CancelButton>
            <SubmitButton
              type="submit"
              variant="contained"
              disabled={isLoading || !formik.isValid || !formik.dirty}
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </SubmitButton>
          </StyledDialogActions>
        </form>
      )}
    </StyledDialog>
  );
};

export default ChangePasswordModal;
