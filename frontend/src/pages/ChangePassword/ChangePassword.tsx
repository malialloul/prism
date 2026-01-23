import { useMemo, useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Box, Typography, CircularProgress, InputAdornment, IconButton } from '@mui/material';
import { Api, ArrowBack, CheckCircle } from '../../assets/icons';
import { Visibility, VisibilityOff, Check, Close } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { authColors } from '../../styles/theme';
import { useChangePassword } from '../../api/entities/auth';
import {
  AuthWrapper,
  LeftPanel,
  LeftPanelContent,
  LeftPanelTitle,
  LeftPanelText,
  FeatureList,
  FeatureItem,
  FeatureIcon,
  RightPanel,
  CardWrapper,
  LogoBox,
  LogoIcon,
  BrandName,
  Tagline,
  FormGroup,
  InputLabel,
  StyledTextField,
  ErrorText,
  PasswordStrengthContainer,
  StrengthBar,
  StrengthText,
  PrimaryButton,
  SecondaryButton,
  FooterText,
  StyledLink,
  IllustrationContainer,
  HomeLink,
  SuccessMessage,
} from './ChangePassword.styles';

const validationSchema = Yup.object().shape({
  currentPassword: Yup.string()
    .required('Current password is required'),
  newPassword: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .notOneOf([Yup.ref('currentPassword')], 'New password must be different from current password')
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your new password'),
});

function calculatePasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  const checks = [
    password.length >= 8,
    password.length >= 12,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[!@#$%^&*]/.test(password),
  ];

  score = checks.filter(Boolean).length;

  if (score <= 1) return { score: 25, label: 'Weak', color: authColors.error };
  if (score === 2) return { score: 50, label: 'Fair', color: authColors.warning };
  if (score === 3) return { score: 75, label: 'Good', color: authColors.info };
  return { score: 100, label: 'Strong', color: authColors.success };
}

interface FormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ChangePassword() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { changePassword, isLoading, isSuccess } = useChangePassword();

  const handleSubmit = async (
    values: FormValues,
    { resetForm }: { setSubmitting: (isSubmitting: boolean) => void; resetForm: () => void }
  ) => {
    changePassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
    if (isSuccess) {
      resetForm();
    }
  };

  const features = [
    { icon: '🔐', text: 'Use a strong, unique password' },
    { icon: '🔄', text: 'Change passwords regularly' },
    { icon: '🚫', text: 'Never share your password' },
    { icon: '✅', text: 'Enable two-factor authentication' },
  ];

  return (
    <AuthWrapper>
      {/* Left Panel - Features */}
      <LeftPanel>
        <LeftPanelContent>
          <LeftPanelTitle>
            Keep Your Account Secure
          </LeftPanelTitle>
          <LeftPanelText>
            A strong password is your first line of defense. Follow these 
            best practices to protect your Cloud API Builder account.
          </LeftPanelText>
          <FeatureList>
            {features.map((feature, index) => (
              <FeatureItem key={index}>
                <FeatureIcon>{feature.icon}</FeatureIcon>
                {feature.text}
              </FeatureItem>
            ))}
          </FeatureList>
        </LeftPanelContent>
        <IllustrationContainer>🔒</IllustrationContainer>
      </LeftPanel>

      {/* Right Panel - Change Password Form */}
      <RightPanel>
        <RouterLink to="/" style={{ textDecoration: 'none' }}>
          <HomeLink>
            <ArrowBack sx={{ fontSize: 18 }} />
            Back to Home
          </HomeLink>
        </RouterLink>
        <CardWrapper
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box>
            <LogoBox>
              <LogoIcon>
                <Api sx={{ fontSize: 20 }} />
              </LogoIcon>
              <BrandName>Cloud API Builder</BrandName>
            </LogoBox>
            <Tagline>Update your password to keep your account secure.</Tagline>
          </Box>

          {isSuccess && (
            <SuccessMessage>
              <CheckCircle sx={{ fontSize: 20 }} />
              Password changed successfully!
            </SuccessMessage>
          )}

          <Formik
            initialValues={{
              currentPassword: '',
              newPassword: '',
              confirmPassword: '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({
              values,
              errors,
              touched,
              isSubmitting,
              handleChange,
              handleBlur,
            }) => {
              const passwordStrength = useMemo(
                () => calculatePasswordStrength(values.newPassword),
                [values.newPassword]
              );

              const passwordsMatch = values.confirmPassword.length > 0 && values.newPassword === values.confirmPassword;

              return (
                <Form style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Current Password */}
                  <FormGroup>
                    <InputLabel htmlFor="currentPassword">Current Password</InputLabel>
                    <StyledTextField
                      fullWidth
                      id="currentPassword"
                      name="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={values.currentPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={isSubmitting || isLoading}
                      placeholder="Enter your current password"
                      error={touched.currentPassword && Boolean(errors.currentPassword)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              edge="end"
                              size="small"
                            >
                              {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    {touched.currentPassword && errors.currentPassword && (
                      <ErrorText>{errors.currentPassword}</ErrorText>
                    )}
                  </FormGroup>

                  {/* New Password */}
                  <FormGroup>
                    <InputLabel htmlFor="newPassword">New Password</InputLabel>
                    <StyledTextField
                      fullWidth
                      id="newPassword"
                      name="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={values.newPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={isSubmitting || isLoading}
                      placeholder="Create a strong new password"
                      error={touched.newPassword && Boolean(errors.newPassword)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              edge="end"
                              size="small"
                            >
                              {showNewPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    {touched.newPassword && errors.newPassword && (
                      <ErrorText>{errors.newPassword}</ErrorText>
                    )}
                  </FormGroup>

                  {/* Password Strength Indicator */}
                  {values.newPassword && (
                    <PasswordStrengthContainer>
                      <StrengthBar
                        variant="determinate"
                        value={passwordStrength.score}
                        sx={{
                          '& .MuiLinearProgress-bar': {
                            background: passwordStrength.color,
                            transition: 'all 0.3s ease',
                          },
                        }}
                      />
                      <StrengthText sx={{ color: passwordStrength.color }}>
                        Password strength: {passwordStrength.label}
                      </StrengthText>
                    </PasswordStrengthContainer>
                  )}

                  {/* Confirm New Password */}
                  <FormGroup>
                    <InputLabel htmlFor="confirmPassword">Confirm New Password</InputLabel>
                    <StyledTextField
                      fullWidth
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={values.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={isSubmitting || isLoading}
                      placeholder="Confirm your new password"
                      error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            {values.confirmPassword && (
                              <Box sx={{ mr: 0.5, display: 'flex', alignItems: 'center' }}>
                                {passwordsMatch ? (
                                  <Check sx={{ color: authColors.success, fontSize: 20 }} />
                                ) : (
                                  <Close sx={{ color: authColors.error, fontSize: 20 }} />
                                )}
                              </Box>
                            )}
                            <IconButton
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                              size="small"
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    {touched.confirmPassword && errors.confirmPassword && (
                      <ErrorText>{errors.confirmPassword}</ErrorText>
                    )}
                  </FormGroup>

                  {/* Buttons */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <PrimaryButton
                      fullWidth
                      type="submit"
                      variant="contained"
                      disabled={isSubmitting || isLoading}
                    >
                      {isSubmitting || isLoading ? (
                        <CircularProgress size={20} sx={{ color: 'white' }} />
                      ) : (
                        'Change Password'
                      )}
                    </PrimaryButton>
                    <RouterLink to="/" style={{ textDecoration: 'none' }}>
                      <SecondaryButton fullWidth variant="outlined">
                        Cancel
                      </SecondaryButton>
                    </RouterLink>
                  </Box>

                  {/* Back to Sign In Link */}
                  <FooterText>
                    <Typography component="span" sx={{ color: 'inherit' }}>
                      Remember your password?{' '}
                    </Typography>
                    <RouterLink to="/signin" style={{ textDecoration: 'none' }}>
                      <StyledLink as="span">Sign in</StyledLink>
                    </RouterLink>
                  </FooterText>
                </Form>
              );
            }}
          </Formik>
        </CardWrapper>
      </RightPanel>
    </AuthWrapper>
  );
}
