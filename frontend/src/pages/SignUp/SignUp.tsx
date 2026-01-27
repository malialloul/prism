import { useMemo, useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Box, Typography, InputAdornment, IconButton } from '@mui/material';
import { ButtonLoadingSkeleton } from '../../components';
import { Google, Microsoft, Api, ArrowBack, DatabaseIcon, BrushIcon, LightningIcon, DocumentationIcon } from '../../assets/icons';
import { Visibility, VisibilityOff, Check, Close } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { authColors } from '../../styles/theme';
import { useSignUp } from '../../api/entities/auth';
import { hashPassword } from '../../utils/crypto';
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
  TermsContainer,
  StyledCheckbox,
  TermsLabel,
  PrimaryButton,
  Divider,
  DividerText,
  OAuthButtonsContainer,
  OAuthButton,
  FooterText,
  StyledLink,
  IllustrationContainer,
  HomeLink,
} from './SignUp.styles';

const validationSchema = Yup.object().shape({
  fullName: Yup.string()
    .min(2, 'Full name must be at least 2 characters')
    .required('Full name is required'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  agreeTerms: Yup.boolean()
    .oneOf([true], 'You must agree to the terms'),
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
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

export default function SignUp() {
  const { signUp, isLoading } = useSignUp();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (values: FormValues): Promise<void> => {
    const hashedPassword = await hashPassword(values.password);
    signUp({
      fullName: values.fullName,
      email: values.email,
      password: hashedPassword,
    });
  };

  const features = [
    { icon: DatabaseIcon, text: 'Connect PostgreSQL and MySQL' },
    { icon: BrushIcon, text: 'Visual drag-and-drop schema builder' },
    { icon: LightningIcon, text: 'Auto-generate REST & GraphQL endpoints' },
    { icon: DocumentationIcon, text: 'Interactive API documentation included' },
  ];

  return (
    <AuthWrapper>
      {/* Left Panel - Features */}
      <LeftPanel>
        <LeftPanelContent>
          <LeftPanelTitle>
            Start Building APIs in Minutes
          </LeftPanelTitle>
          <LeftPanelText>
            Join thousands of developers who are shipping faster with 
            Cloud API Builder's no-code API generation platform.
          </LeftPanelText>
          <FeatureList>
            {features.map((feature, index) => (
              <FeatureItem key={index}>
                <FeatureIcon as={feature.icon} />
                {feature.text}
              </FeatureItem>
            ))}
          </FeatureList>
        </LeftPanelContent>
        <IllustrationContainer>🚀</IllustrationContainer>
      </LeftPanel>

      {/* Right Panel - Sign Up Form */}
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
            <Tagline>Create your account and start building APIs today!</Tagline>
          </Box>

          <Formik
            initialValues={{
              fullName: '',
              email: '',
              password: '',
              confirmPassword: '',
              agreeTerms: false,
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              setFieldValue,
            }) => {
              const passwordStrength = useMemo(
                () => calculatePasswordStrength(values.password),
                [values.password]
              );

              return (
                <Form style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Full Name */}
                  <FormGroup>
                    <InputLabel htmlFor="fullName">Full Name</InputLabel>
                    <StyledTextField
                      fullWidth
                      id="fullName"
                      name="fullName"
                      type="text"
                      value={values.fullName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={isLoading}
                      placeholder="Enter your full name"
                      error={touched.fullName && Boolean(errors.fullName)}
                    />
                    {touched.fullName && errors.fullName && (
                      <ErrorText>{errors.fullName}</ErrorText>
                    )}
                  </FormGroup>

                  {/* Email */}
                  <FormGroup>
                    <InputLabel htmlFor="email">Email Address</InputLabel>
                    <StyledTextField
                      fullWidth
                      id="email"
                      name="email"
                      type="email"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={isLoading}
                      placeholder="Enter your email address"
                      error={touched.email && Boolean(errors.email)}
                    />
                    {touched.email && errors.email && (
                      <ErrorText>{errors.email}</ErrorText>
                    )}
                  </FormGroup>

                  {/* Password */}
                  <FormGroup>
                    <InputLabel htmlFor="password">Password</InputLabel>
                    <StyledTextField
                      fullWidth
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={isLoading}
                      placeholder="Create a strong password"
                      error={touched.password && Boolean(errors.password)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              size="small"
                              sx={{ color: 'rgba(255,255,255,0.5)' }}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    {touched.password && errors.password && (
                      <ErrorText>{errors.password}</ErrorText>
                    )}
                  </FormGroup>

                  {/* Password Strength Indicator */}
                  {values.password && (
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

                  {/* Confirm Password */}
                  <FormGroup>
                    <InputLabel htmlFor="confirmPassword">Confirm Password</InputLabel>
                    <StyledTextField
                      fullWidth
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={values.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={isLoading}
                      placeholder="Confirm your password"
                      error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            {values.confirmPassword && values.password && (
                              values.confirmPassword === values.password ? (
                                <Check sx={{ color: authColors.success, mr: 1 }} />
                              ) : (
                                <Close sx={{ color: authColors.error, mr: 1 }} />
                              )
                            )}
                            <IconButton
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                              size="small"
                              sx={{ color: 'rgba(255,255,255,0.5)' }}
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
                    {values.confirmPassword && values.password && values.confirmPassword === values.password && (
                      <Typography sx={{ color: authColors.success, fontSize: '0.75rem', mt: 0.5 }}>
                        Passwords match
                      </Typography>
                    )}
                  </FormGroup>

                  {/* Terms & Conditions */}
                  <TermsContainer>
                    <StyledCheckbox
                      checked={values.agreeTerms}
                      onChange={(e) => setFieldValue('agreeTerms', e.target.checked)}
                      disabled={isLoading}
                      size="small"
                    />
                    <TermsLabel>
                      I agree to the{' '}
                      <a href="#" onClick={(e) => e.preventDefault()}>
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="#" onClick={(e) => e.preventDefault()}>
                        Privacy Policy
                      </a>
                    </TermsLabel>
                  </TermsContainer>
                  {touched.agreeTerms && errors.agreeTerms && (
                    <ErrorText style={{ marginTop: '-0.75rem' }}>{errors.agreeTerms}</ErrorText>
                  )}

                  {/* Create Account Button */}
                  <PrimaryButton
                    fullWidth
                    type="submit"
                    variant="contained"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ButtonLoadingSkeleton size="medium" />
                    ) : (
                      'Create Account'
                    )}
                  </PrimaryButton>

                  {/* Divider */}
                  <Divider>
                    <DividerText>or sign up with</DividerText>
                  </Divider>

                  {/* OAuth Buttons */}
                  <OAuthButtonsContainer>
                    <OAuthButton
                      variant="outlined"
                      startIcon={<Google sx={{ fontSize: 18, color: '#DB4437' }} />}
                      disabled={isLoading}
                    >
                      Google
                    </OAuthButton>
                    <OAuthButton
                      variant="outlined"
                      startIcon={<Microsoft sx={{ fontSize: 18, color: '#00A4EF' }} />}
                      disabled={isLoading}
                    >
                      Microsoft
                    </OAuthButton>
                  </OAuthButtonsContainer>

                  {/* Sign In Link */}
                  <FooterText>
                    <Typography component="span" sx={{ color: 'inherit' }}>
                      Already have an account?{' '}
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
