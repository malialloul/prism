import { useMemo, useState, useEffect } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Box, Typography, InputAdornment, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ButtonLoadingSkeleton } from '../../components';
import { Google, GitHub, Api, ArrowBack, DatabaseIcon, BrushIcon, LightningIcon, DocumentationIcon } from '../../assets/icons';
import { Visibility, VisibilityOff, Check, Close } from '@mui/icons-material';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { authColors } from '../../styles/theme';
import { useSignUp } from '../../api/entities/auth';
import { hashPassword } from '../../utils/crypto';
import { toastService } from '../../services';
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

// Styled components for Terms Dialog
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    maxWidth: '600px',
    maxHeight: '80vh',
  },
}));

const StyledDialogTitle = styled(DialogTitle)({
  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
  color: '#fff',
  fontWeight: 700,
  fontSize: '1.25rem',
  padding: '1.25rem 1.5rem',
});

const StyledDialogContent = styled(DialogContent)({
  padding: '1.5rem',
  color: 'rgba(255, 255, 255, 0.9)',
  fontSize: '0.9rem',
  lineHeight: 1.7,
  '& h3': {
    color: '#667eea',
    fontSize: '1rem',
    fontWeight: 600,
    marginTop: '1.5rem',
    marginBottom: '0.75rem',
    '&:first-of-type': {
      marginTop: 0,
    },
  },
  '& p': {
    margin: '0.5rem 0',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  '& ul': {
    margin: '0.5rem 0',
    paddingLeft: '1.25rem',
  },
  '& li': {
    marginBottom: '0.25rem',
    color: 'rgba(255, 255, 255, 0.75)',
  },
  '& strong': {
    color: '#fff',
  },
});

const StyledDialogActions = styled(DialogActions)({
  padding: '1rem 1.5rem',
  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
});

const AcceptButton = styled(Button)({
  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
  color: '#fff',
  fontWeight: 600,
  padding: '0.5rem 1.5rem',
  borderRadius: '8px',
  textTransform: 'none',
  '&:hover': {
    background: 'linear-gradient(90deg, #5a6fd6 0%, #6a4190 100%)',
  },
});

const CloseButton = styled(Button)({
  color: 'rgba(255, 255, 255, 0.7)',
  textTransform: 'none',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.1)',
  },
});

export default function SignUp() {
  const { signUp, isLoading } = useSignUp();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Check for OAuth error in URL params
  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      toastService.error(decodeURIComponent(error));
      // Clear the error from URL
      searchParams.delete('error');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

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
                      <a 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          setShowTermsDialog(true);
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        Terms of Service & Data Policy
                      </a>
                    </TermsLabel>
                  </TermsContainer>
                  {touched.agreeTerms && errors.agreeTerms && (
                    <ErrorText style={{ marginTop: '-0.75rem' }}>{errors.agreeTerms}</ErrorText>
                  )}

                  {/* Terms & Data Policy Dialog */}
                  <StyledDialog 
                    open={showTermsDialog} 
                    onClose={() => setShowTermsDialog(false)}
                    scroll="paper"
                  >
                    <StyledDialogTitle>Terms of Service & Data Policy</StyledDialogTitle>
                    <StyledDialogContent dividers>
                      <h3>1. Our Commitment to Trust</h3>
                      <p>
                        At Prism, trust is a core principle of our platform. We build tools that help users create, 
                        manage, and expose databases and APIs efficiently. In doing so, we understand the responsibility 
                        that comes with handling user data.
                      </p>
                      <p>
                        Our goal is to provide powerful infrastructure while minimizing unnecessary access and maintaining 
                        transparency about how data is handled.
                      </p>

                      <h3>2. Data Ownership</h3>
                      <p><strong>All data stored in databases created or connected through Prism belongs entirely to the user.</strong></p>
                      <p>Prism does not claim ownership over:</p>
                      <ul>
                        <li>Database records</li>
                        <li>Table schemas</li>
                        <li>API payloads</li>
                        <li>Application data</li>
                      </ul>
                      <p>Users may export their data and schemas at any time.</p>

                      <h3>3. Data Access Policy</h3>
                      <p>
                        Prism does not view, inspect, analyze, or use user data for any purpose other than operating the platform.
                      </p>
                      <p>Access to user databases is:</p>
                      <ul>
                        <li>Restricted to essential system processes</li>
                        <li>Logged and monitored</li>
                        <li>Limited to operational needs</li>
                      </ul>
                      <p>Human access to user data may occur only in the following cases:</p>
                      <ul>
                        <li>When required to provide technical support with explicit user consent</li>
                        <li>When necessary to investigate platform stability or security incidents</li>
                      </ul>

                      <h3>4. Data Isolation & Security</h3>
                      <p>User projects are logically isolated from one another.</p>
                      <p>Prism applies industry-standard security practices to:</p>
                      <ul>
                        <li>Protect databases from unauthorized access</li>
                        <li>Prevent cross-project data exposure</li>
                        <li>Secure infrastructure and access credentials</li>
                      </ul>
                      <p>
                        While no system can guarantee absolute security, Prism continuously works to reduce risk and follow 
                        security best practices appropriate for early-stage platforms.
                      </p>

                      <h3>5. Transparency Over Complexity</h3>
                      <p>Rather than making unverifiable claims, Prism chooses transparency.</p>
                      <p>We believe users should clearly understand:</p>
                      <ul>
                        <li>Where their data is hosted</li>
                        <li>Who can access it</li>
                        <li>Under what circumstances access may occur</li>
                      </ul>
                      <p>If our data handling practices change, users will be informed clearly and promptly.</p>

                      <h3>6. User Responsibility</h3>
                      <p>Users are responsible for:</p>
                      <ul>
                        <li>The data they store in Prism</li>
                        <li>Managing access permissions for collaborators</li>
                        <li>Deciding whether to use Prism for sensitive or regulated data</li>
                      </ul>
                      <p>Prism is designed primarily for development, learning, prototyping, and application backend use cases.</p>

                      <h3>7. No Hidden Use of Data</h3>
                      <p>Prism does not:</p>
                      <ul>
                        <li>Sell user data</li>
                        <li>Analyze user data for advertising</li>
                        <li>Train AI models using user data</li>
                        <li>Share user data with third parties except as required to provide the service</li>
                      </ul>

                      <h3>8. Our Promise</h3>
                      <p><strong>Prism is built by developers, for developers.</strong></p>
                      <p>
                        We treat user data with the same care and respect we expect for our own. Trust is not enforced 
                        by complex systems alone — it is maintained through honesty, restraint, and accountability.
                      </p>
                    </StyledDialogContent>
                    <StyledDialogActions>
                      <CloseButton onClick={() => setShowTermsDialog(false)}>
                        Close
                      </CloseButton>
                      <AcceptButton 
                        onClick={() => {
                          setFieldValue('agreeTerms', true);
                          setShowTermsDialog(false);
                        }}
                      >
                        I Accept
                      </AcceptButton>
                    </StyledDialogActions>
                  </StyledDialog>

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
                      onClick={() => {
                        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
                        window.location.href = `${apiUrl}/auth/oauth/google`;
                      }}
                    >
                      Google
                    </OAuthButton>
                    <OAuthButton
                      variant="outlined"
                      startIcon={<GitHub sx={{ fontSize: 18 }} />}
                      disabled={isLoading}
                      onClick={() => {
                        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
                        window.location.href = `${apiUrl}/auth/oauth/github`;
                      }}
                    >
                      GitHub
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
