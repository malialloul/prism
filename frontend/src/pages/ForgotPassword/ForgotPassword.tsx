import { useState, useRef, useMemo, useEffect } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Box, Typography, InputAdornment, IconButton } from '@mui/material';
import { ButtonLoadingSkeleton } from '../../components';
import { Api, ArrowBack, CheckCircle, Email } from '../../assets/icons';
import { Visibility, VisibilityOff, Check, Close } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { authColors } from '../../styles/theme';
import { useForgotPassword, useVerifyResetCode, useResetPassword } from '../../api/entities/auth';
import { ROUTES } from '../../constants';
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
  StepIndicator,
  StepDot,
  StepLine,
  OTPContainer,
  OTPInput,
  ResendLink,
  Timer,
  EmailDisplay,
} from './ForgotPassword.styles';

// Validation schemas for each step
const emailSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
});

const passwordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
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

export default function ForgotPassword() {
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // API hooks
  const { requestReset, isLoading: isSendingCode } = useForgotPassword();
  const { verifyCode, isLoading: isVerifying, isValid } = useVerifyResetCode();
  const { resetPassword, isLoading: isResetting } = useResetPassword();

  // Combined loading state for email step
  const isEmailStepLoading = isSendingCode;

  // Resend timer
  useEffect(() => {
    if (currentStep === 2 && resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
  }, [currentStep, resendTimer]);

  const handleEmailSubmit = async (
    values: { email: string },
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    try {
      requestReset({ email: values.email });
      setEmail(values.email);
      setCurrentStep(2);
      setResendTimer(60);
      setCanResend(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
      setOtp(newOtp.slice(0, 6));
      otpRefs.current[Math.min(pastedData.length, 5)]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) return;

    verifyCode(
      { email, code: otpValue },
    );
  };

  // Handle verification result
  useEffect(() => {
    if (isValid === true) {
      setCurrentStep(3);
    }
  }, [isValid]);

  const handleResendOtp = async () => {
    if (!canResend) return;
    requestReset({ email });
    setOtp(['', '', '', '', '', '']);
    setResendTimer(60);
    setCanResend(false);
    otpRefs.current[0]?.focus();
  };

  const handlePasswordSubmit = async (
    values: { newPassword: string; confirmPassword: string },
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    try {
      const otpValue = otp.join('');
      resetPassword({
        email,
        code: otpValue,
        newPassword: values.newPassword,
      });
      setIsSuccess(true);
    } finally {
      setSubmitting(false);
    }
  };

  const features = [
    { icon: '📧', text: 'Enter your registered email' },
    { icon: '🔢', text: 'Verify with 6-digit code' },
    { icon: '🔐', text: 'Create a new secure password' },
    { icon: '✅', text: 'Access restored instantly' },
  ];

  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return { title: 'Forgot Password?', subtitle: "No worries! Enter your email and we'll send you a reset code." };
      case 2:
        return { title: 'Verify Your Email', subtitle: `We've sent a 6-digit code to ${email}` };
      case 3:
        return { title: 'Create New Password', subtitle: 'Your new password must be different from previous passwords.' };
      default:
        return { title: '', subtitle: '' };
    }
  };

  const stepContent = getStepContent();

  return (
    <AuthWrapper>
      {/* Left Panel - Features */}
      <LeftPanel>
        <LeftPanelContent>
          <LeftPanelTitle>
            Reset Your Password
          </LeftPanelTitle>
          <LeftPanelText>
            Don't worry, it happens to the best of us. Follow the simple steps
            to regain access to your Cloud API Builder account.
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
        <IllustrationContainer>🔑</IllustrationContainer>
      </LeftPanel>

      {/* Right Panel - Forgot Password Form */}
      <RightPanel>
        <RouterLink to={ROUTES.HOME} style={{ textDecoration: 'none' }}>
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
            <Tagline>{stepContent.subtitle}</Tagline>
          </Box>

          {/* Step Indicator */}
          <StepIndicator>
            <StepDot active={currentStep === 1} completed={currentStep > 1}>
              {currentStep > 1 ? <CheckCircle sx={{ fontSize: 16 }} /> : '1'}
            </StepDot>
            <StepLine completed={currentStep > 1} />
            <StepDot active={currentStep === 2} completed={currentStep > 2}>
              {currentStep > 2 ? <CheckCircle sx={{ fontSize: 16 }} /> : '2'}
            </StepDot>
            <StepLine completed={currentStep > 2} />
            <StepDot active={currentStep === 3} completed={isSuccess}>
              {isSuccess ? <CheckCircle sx={{ fontSize: 16 }} /> : '3'}
            </StepDot>
          </StepIndicator>

          {isSuccess ? (
            <Box sx={{ textAlign: 'center' }}>
              <SuccessMessage sx={{ justifyContent: 'center', mb: 2 }}>
                <CheckCircle sx={{ fontSize: 20 }} />
                Password reset successfully!
              </SuccessMessage>
              <Typography sx={{ color: 'text.secondary', mb: 2 }}>
                You can now sign in with your new password.
              </Typography>
              <RouterLink to={ROUTES.SIGN_IN} style={{ textDecoration: 'none' }}>
                <PrimaryButton fullWidth>
                  Sign In
                </PrimaryButton>
              </RouterLink>
            </Box>
          ) : (
            <>
              {/* Step 1: Email */}
              {currentStep === 1 && (
                <Formik
                  initialValues={{ email: '' }}
                  validationSchema={emailSchema}
                  onSubmit={handleEmailSubmit}
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
                          disabled={isSubmitting || isEmailStepLoading}
                          placeholder="Enter your email address"
                          error={touched.email && Boolean(errors.email)}
                        />
                        {touched.email && errors.email && (
                          <ErrorText>{errors.email}</ErrorText>
                        )}
                      </FormGroup>

                      <PrimaryButton
                        fullWidth
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting || isEmailStepLoading}
                      >
                        {isSubmitting || isEmailStepLoading ? (
                          <ButtonLoadingSkeleton size="medium" />
                        ) : (
                          'Send Reset Code'
                        )}
                      </PrimaryButton>

                      <FooterText>
                        <Typography component="span" sx={{ color: 'inherit' }}>
                          Remember your password?{' '}
                        </Typography>
                        <RouterLink to={ROUTES.SIGN_IN} style={{ textDecoration: 'none' }}>
                          <StyledLink as="span">Sign in</StyledLink>
                        </RouterLink>
                      </FooterText>
                    </Form>
                  )}
                </Formik>
              )}

              {/* Step 2: OTP Verification */}
              {currentStep === 2 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <EmailDisplay>
                    <Email sx={{ fontSize: 18, color: authColors.primary }} />
                    {email}
                  </EmailDisplay>

                  <Box>
                    <InputLabel sx={{ textAlign: 'center', display: 'block', mb: 1 }}>
                      Enter 6-digit code
                    </InputLabel>
                    <OTPContainer onPaste={handleOtpPaste}>
                      {otp.map((digit, index) => (
                        <OTPInput
                          key={index}
                          ref={(el) => { otpRefs.current[index] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          placeholder="•"
                        />
                      ))}
                    </OTPContainer>
                  </Box>

                  <PrimaryButton
                    fullWidth
                    onClick={handleVerifyOtp}
                    disabled={otp.join('').length !== 6 || isVerifying}
                  >
                    {isVerifying ? (
                      <ButtonLoadingSkeleton size="medium" />
                    ) : (
                      'Verify Code'
                    )}
                  </PrimaryButton>

                  <ResendLink>
                    {canResend ? (
                      <StyledLink onClick={handleResendOtp} sx={{ cursor: 'pointer' }}>
                        Resend code
                      </StyledLink>
                    ) : (
                      <>
                        Resend code in <Timer>{resendTimer}s</Timer>
                      </>
                    )}
                  </ResendLink>

                  <SecondaryButton
                    fullWidth
                    onClick={() => {
                      setCurrentStep(1);
                      setOtp(['', '', '', '', '', '']);
                    }}
                  >
                    Change Email
                  </SecondaryButton>
                </Box>
              )}

              {/* Step 3: New Password */}
              {currentStep === 3 && (
                <Formik
                  initialValues={{ newPassword: '', confirmPassword: '' }}
                  validationSchema={passwordSchema}
                  onSubmit={handlePasswordSubmit}
                >
                  {({ values, errors, touched, isSubmitting, handleChange, handleBlur }) => {
                    const passwordStrength = useMemo(
                      () => calculatePasswordStrength(values.newPassword),
                      [values.newPassword]
                    );

                    const passwordsMatch = values.confirmPassword.length > 0 && values.newPassword === values.confirmPassword;

                    return (
                      <Form style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <FormGroup>
                          <InputLabel htmlFor="newPassword">New Password</InputLabel>
                          <StyledTextField
                            fullWidth
                            id="newPassword"
                            name="newPassword"
                            type={showPassword ? 'text' : 'password'}
                            value={values.newPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            disabled={isSubmitting || isResetting}
                            placeholder="Create a strong new password"
                            error={touched.newPassword && Boolean(errors.newPassword)}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() => setShowPassword(!showPassword)}
                                    edge="end"
                                    size="small"
                                  >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                          {touched.newPassword && errors.newPassword && (
                            <ErrorText>{errors.newPassword}</ErrorText>
                          )}
                        </FormGroup>

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
                            disabled={isSubmitting || isResetting}
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

                        <PrimaryButton
                          fullWidth
                          type="submit"
                          variant="contained"
                          disabled={isSubmitting || isResetting}
                        >
                          {isSubmitting || isResetting ? (
                            <ButtonLoadingSkeleton size="medium" />
                          ) : (
                            'Reset Password'
                          )}
                        </PrimaryButton>
                      </Form>
                    );
                  }}
                </Formik>
              )}
            </>
          )}
        </CardWrapper>
      </RightPanel>
    </AuthWrapper>
  );
}
