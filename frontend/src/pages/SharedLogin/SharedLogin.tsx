import { useState, useEffect } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Box, Typography, InputAdornment, IconButton } from '@mui/material';
import { ButtonLoadingSkeleton } from '../../components';
import { Api, ArrowBack } from '../../assets/icons';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useSharedLogin } from '../../api/entities/auth';
import { toastService } from '../../services/toastService';
import {
  AuthWrapper,
  LeftPanel,
  LeftPanelContent,
  LeftPanelTitle,
  LeftPanelText,
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
  PrimaryButton,
  FooterText,
  HomeLink,
  BackLinkContainer,
} from './SharedLogin.styles';

const validationSchema = Yup.object().shape({
  ownerEmail: Yup.string()
    .email('Please enter a valid email address')
    .required('Account owner email is required'),
  tempPassword: Yup.string()
    .min(8, 'Temporary password must be at least 8 characters')
    .required('Temporary password is required'),
});

export default function SharedLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const { sharedLogin, isLoading, error: apiError } = useSharedLogin();

  // Show force logout message if redirected from owner account action
  useEffect(() => {
    const forceLogoutMessage = sessionStorage.getItem('forceLogoutMessage');
    if (forceLogoutMessage) {
      toastService.error(forceLogoutMessage);
      sessionStorage.removeItem('forceLogoutMessage');
    }
  }, []);

  const handleSubmit = (values: { ownerEmail: string; tempPassword: string }): void => {
    sharedLogin({
      ownerEmail: values.ownerEmail,
      tempPassword: values.tempPassword,
    });
  };

  // Display the actual error message from the API
  const errorMessage = apiError || '';

  return (
    <AuthWrapper>
      {/* Left Panel - Info */}
      <LeftPanel>
        <LeftPanelContent>
          <LeftPanelTitle>
            Access Shared Accounts
          </LeftPanelTitle>
          <LeftPanelText>
            Use the temporary password provided to you to access a shared account.
            The account owner will have shared their access credentials with you.
          </LeftPanelText>
          <Box sx={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <Typography sx={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
              <strong>How it works:</strong><br/>
              1. The account owner shares their account with you<br/>
              2. You receive a notification with the temporary password<br/>
              3. Enter the owner's email and temporary password here<br/>
              4. You'll be logged in with full access to their account<br/>
            </Typography>
          </Box>
        </LeftPanelContent>
      </LeftPanel>

      {/* Right Panel - Login Form */}
      <RightPanel>
        <BackLinkContainer>
          <RouterLink to="/signin" style={{ textDecoration: 'none' }}>
            <HomeLink>
              <ArrowBack sx={{ fontSize: 18 }} />
              Back to Sign In
            </HomeLink>
          </RouterLink>
        </BackLinkContainer>

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
            <Tagline>Sign in to a shared account using the temporary password.</Tagline>
          </Box>

          <Formik
            initialValues={{ ownerEmail: '', tempPassword: '' }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, handleChange, handleBlur }) => (
              <Form style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {errorMessage && (
                  <Box
                    sx={{
                      padding: '0.875rem 1rem',
                      backgroundColor: 'rgba(211, 47, 47, 0.1)',
                      border: '1px solid rgba(211, 47, 47, 0.3)',
                      borderRadius: '0.5rem',
                      color: '#ef5350',
                      fontSize: '0.875rem',
                    }}
                  >
                    {errorMessage}
                  </Box>
                )}

                <FormGroup>
                  <InputLabel htmlFor="ownerEmail">Account Owner's Email</InputLabel>
                  <StyledTextField
                    fullWidth
                    id="ownerEmail"
                    name="ownerEmail"
                    type="email"
                    value={values.ownerEmail}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={isLoading}
                    placeholder="Enter the owner's email address"
                    error={touched.ownerEmail && Boolean(errors.ownerEmail)}
                  />
                  {touched.ownerEmail && errors.ownerEmail && (
                    <ErrorText>{errors.ownerEmail}</ErrorText>
                  )}
                </FormGroup>

                <FormGroup>
                  <InputLabel htmlFor="tempPassword">Temporary Password</InputLabel>
                  <StyledTextField
                    fullWidth
                    id="tempPassword"
                    name="tempPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={values.tempPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={isLoading}
                    placeholder="Enter the temporary password"
                    error={touched.tempPassword && Boolean(errors.tempPassword)}
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
                  {touched.tempPassword && errors.tempPassword && (
                    <ErrorText>{errors.tempPassword}</ErrorText>
                  )}
                </FormGroup>

                <PrimaryButton
                  fullWidth
                  type="submit"
                  variant="contained"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ButtonLoadingSkeleton size="medium" />
                  ) : (
                    'Access Shared Account'
                  )}
                </PrimaryButton>

                <FooterText>
                  <Typography component="span" sx={{ color: 'inherit' }}>
                    Don't have a shared account?{' '}
                  </Typography>
                  <RouterLink to="/signin" style={{ textDecoration: 'none' }}>
                    <Typography
                      component="span"
                      sx={{
                        color: '#00D4FF',
                        cursor: 'pointer',
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      Sign in normally
                    </Typography>
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
