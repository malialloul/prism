import { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Box, Typography, CircularProgress } from '@mui/material';
import { Google, Microsoft, Api, ArrowBack } from '../../assets/icons';
import { Link as RouterLink } from 'react-router-dom';
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
  RememberForgotRow,
  StyledCheckbox,
  CheckboxLabel,
  StyledLink,
  PrimaryButton,
  Divider,
  DividerText,
  OAuthButtonsContainer,
  OAuthButton,
  FooterText,
  IllustrationContainer,
  HomeLink,
} from './SignIn.styles';

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export default function SignIn() {
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (values: { email: string; password: string }, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
    try {
      console.log('Sign in values:', values, 'Remember me:', rememberMe);
      await new Promise(resolve => setTimeout(resolve, 1500));
    } finally {
      setSubmitting(false);
    }
  };

  const features = [
    { icon: '�', text: 'Connect any database in seconds' },
    { icon: '✨', text: 'Visual schema designer - no coding required' },
    { icon: '🚀', text: 'Generate production-ready APIs instantly' },
    { icon: '🔒', text: 'Enterprise-grade security built-in' },
  ];

  return (
    <AuthWrapper>
      {/* Left Panel - Features */}
      <LeftPanel>
        <LeftPanelContent>
          <LeftPanelTitle>
            Build APIs Without Writing Code
          </LeftPanelTitle>
          <LeftPanelText>
            Connect your database, design schemas visually, and generate 
            production-ready APIs in minutes — not months.
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
        <IllustrationContainer>⚡</IllustrationContainer>
      </LeftPanel>

      {/* Right Panel - Login Form */}
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
            <Tagline>Welcome back! Sign in to continue building your APIs.</Tagline>
          </Box>

          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, isSubmitting, handleChange, handleBlur }) => (
              <Form style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
                    disabled={isSubmitting}
                    placeholder="Enter your email address"
                    error={touched.email && Boolean(errors.email)}
                  />
                  {touched.email && errors.email && (
                    <ErrorText>{errors.email}</ErrorText>
                  )}
                </FormGroup>

                <FormGroup>
                  <InputLabel htmlFor="password">Password</InputLabel>
                  <StyledTextField
                    fullWidth
                    id="password"
                    name="password"
                    type="password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={isSubmitting}
                    placeholder="Enter your password"
                    error={touched.password && Boolean(errors.password)}
                  />
                  {touched.password && errors.password && (
                    <ErrorText>{errors.password}</ErrorText>
                  )}
                </FormGroup>

                <RememberForgotRow>
                  <CheckboxLabel
                    control={
                      <StyledCheckbox
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        size="small"
                      />
                    }
                    label="Remember me"
                  />
                  <RouterLink to="/forgot-password" style={{ textDecoration: 'none' }}>
                    <StyledLink as="span">Forgot password?</StyledLink>
                  </RouterLink>
                </RememberForgotRow>

                <PrimaryButton
                  fullWidth
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <CircularProgress size={20} sx={{ color: 'white' }} />
                  ) : (
                    'Sign In'
                  )}
                </PrimaryButton>

                <Divider>
                  <DividerText>or continue with</DividerText>
                </Divider>

                <OAuthButtonsContainer>
                  <OAuthButton
                    variant="outlined"
                    startIcon={<Google sx={{ fontSize: 18, color: '#DB4437' }} />}
                    disabled={isSubmitting}
                  >
                    Google
                  </OAuthButton>
                  <OAuthButton
                    variant="outlined"
                    startIcon={<Microsoft sx={{ fontSize: 18, color: '#00A4EF' }} />}
                    disabled={isSubmitting}
                  >
                    Microsoft
                  </OAuthButton>
                </OAuthButtonsContainer>

                <FooterText>
                  <Typography component="span" sx={{ color: 'inherit' }}>
                    Don't have an account?{' '}
                  </Typography>
                  <RouterLink to="/signup" style={{ textDecoration: 'none' }}>
                    <StyledLink as="span">Create an account</StyledLink>
                  </RouterLink>
                </FooterText>
              </Form>
            )}
          </Formik>
        </CardWrapper>
      </RightPanel>
    </AuthWrapper>
  );
}
