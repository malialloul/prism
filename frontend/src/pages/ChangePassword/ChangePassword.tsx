import { useMemo, useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Box, Typography, CircularProgress } from '@mui/material';
import { Api, ArrowBack, CheckCircle } from '../../assets/icons';
import { Link as RouterLink } from 'react-router-dom';
import { authColors } from '../../styles/theme';
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
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting, resetForm }: { setSubmitting: (isSubmitting: boolean) => void; resetForm: () => void }
  ) => {
    try {
      console.log('Change password values:', values);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSuccess(true);
      resetForm();
    } finally {
      setSubmitting(false);
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

              return (
                <Form style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Current Password */}
                  <FormGroup>
                    <InputLabel htmlFor="currentPassword">Current Password</InputLabel>
                    <StyledTextField
                      fullWidth
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={values.currentPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={isSubmitting}
                      placeholder="Enter your current password"
                      error={touched.currentPassword && Boolean(errors.currentPassword)}
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
                      type="password"
                      value={values.newPassword}
                      onChange={(e) => {
                        handleChange(e);
                        setIsSuccess(false);
                      }}
                      onBlur={handleBlur}
                      disabled={isSubmitting}
                      placeholder="Create a strong new password"
                      error={touched.newPassword && Boolean(errors.newPassword)}
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
                      type="password"
                      value={values.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={isSubmitting}
                      placeholder="Confirm your new password"
                      error={touched.confirmPassword && Boolean(errors.confirmPassword)}
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
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <CircularProgress size={20} sx={{ color: 'white' }} />
                      ) : (
                        'Change Password'
                      )}
                    </PrimaryButton>
                    <RouterLink to="/signin" style={{ textDecoration: 'none' }}>
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
