import { useState, useEffect } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Box, Typography, InputAdornment, IconButton } from "@mui/material";
import { ButtonLoadingSkeleton } from "../../components";
import {
  Google,
  GitHub,
  Api,
  ArrowBack,
  DatabaseIcon,
  SparklesIcon,
  RocketIcon,
  SecurityIcon,
} from "../../assets/icons";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import { useSignIn } from "../../api/entities/auth";
import { hashPassword } from "../../utils/crypto";
import { toastService } from "../../services";
import { ROUTES } from "../../constants";
import TwoFactorDialog from "./TwoFactorDialog";
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
} from "./SignIn.styles";
import logo from "../../../public/prism.png";

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export default function SignIn() {
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorData, setTwoFactorData] = useState<{
    email: string;
    tempToken: string;
  } | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const { signIn, isLoading } = useSignIn({
    on2FARequired: (data) => {
      setTwoFactorData(data);
    },
  });

  // Check for OAuth error in URL params
  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      toastService.error(decodeURIComponent(error));
      // Clear the error from URL
      searchParams.delete("error");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Check for force logout message from previous session
  useEffect(() => {
    const forceLogoutMessage = sessionStorage.getItem("forceLogoutMessage");
    if (forceLogoutMessage) {
      toastService.error(forceLogoutMessage);
      sessionStorage.removeItem("forceLogoutMessage");
    }
  }, []);

  const handleSubmit = async (values: {
    email: string;
    password: string;
  }): Promise<void> => {
    const hashedPassword = await hashPassword(values.password);
    signIn({ email: values.email, password: hashedPassword }, rememberMe);
  };

  const features = [
    { icon: DatabaseIcon, text: "Connect any database in seconds" },
    { icon: SparklesIcon, text: "Visual schema designer - no coding required" },
    { icon: RocketIcon, text: "Generate production-ready APIs instantly" },
    { icon: SecurityIcon, text: "Enterprise-grade security built-in" },
  ];

  return (
    <AuthWrapper>
      {/* Left Panel - Features */}
      <LeftPanel>
        <LeftPanelContent>
          <LeftPanelTitle>Build APIs Without Writing Code</LeftPanelTitle>
          <LeftPanelText>
            Connect your database, design schemas visually, and generate
            production-ready APIs in minutes — not months.
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
        <IllustrationContainer>⚡</IllustrationContainer>
      </LeftPanel>

      {/* Right Panel - Login Form */}
      <RightPanel>
        <RouterLink to={ROUTES.HOME} style={{ textDecoration: "none" }}>
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
              <img
                src={logo}
                alt="Prism Logo"
                style={{ width: 75, height: 75 }}
              />
            </LogoBox>
            <Tagline>
              Welcome back! Sign in to continue building your APIs.
            </Tagline>
          </Box>

          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, handleChange, handleBlur }) => (
              <Form
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.25rem",
                }}
              >
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

                <FormGroup>
                  <InputLabel htmlFor="password">Password</InputLabel>
                  <StyledTextField
                    fullWidth
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={isLoading}
                    placeholder="Enter your password"
                    error={touched.password && Boolean(errors.password)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            size="small"
                            sx={{ color: "rgba(255,255,255,0.5)" }}
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
                  <RouterLink
                    to={ROUTES.FORGOT_PASSWORD}
                    style={{ textDecoration: "none" }}
                  >
                    <StyledLink as="span">Forgot password?</StyledLink>
                  </RouterLink>
                </RememberForgotRow>

                <PrimaryButton
                  fullWidth
                  type="submit"
                  variant="contained"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ButtonLoadingSkeleton size="medium" />
                  ) : (
                    "Sign In"
                  )}
                </PrimaryButton>

                <Divider>
                  <DividerText>or continue with</DividerText>
                </Divider>

                <OAuthButtonsContainer>
                  <OAuthButton
                    variant="outlined"
                    startIcon={
                      <Google sx={{ fontSize: 18, color: "#DB4437" }} />
                    }
                    disabled={isLoading}
                    onClick={() => {
                      const apiUrl =
                        import.meta.env.VITE_API_URL || "http://localhost:4000";
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
                      const apiUrl =
                        import.meta.env.VITE_API_URL || "http://localhost:4000";
                      window.location.href = `${apiUrl}/auth/oauth/github`;
                    }}
                  >
                    GitHub
                  </OAuthButton>
                </OAuthButtonsContainer>

                <FooterText>
                  <Typography component="span" sx={{ color: "inherit" }}>
                    Don't have an account?{" "}
                  </Typography>
                  <RouterLink
                    to={ROUTES.SIGN_UP}
                    style={{ textDecoration: "none" }}
                  >
                    <StyledLink as="span">Create an account</StyledLink>
                  </RouterLink>
                </FooterText>

                {/* <Box sx={{ textAlign: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <Typography sx={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem' }}>
                    Have a shared account?
                  </Typography>
                  <RouterLink to={ROUTES.SHARED_LOGIN} style={{ textDecoration: 'none' }}>
                    <StyledLink as="span">Sign in with shared access</StyledLink>
                  </RouterLink>
                </Box> */}
              </Form>
            )}
          </Formik>
        </CardWrapper>
      </RightPanel>

      {/* 2FA Verification Dialog */}
      {twoFactorData && (
        <TwoFactorDialog
          open={!!twoFactorData}
          onClose={() => setTwoFactorData(null)}
          email={twoFactorData.email}
          tempToken={twoFactorData.tempToken}
          rememberMe={rememberMe}
        />
      )}
    </AuthWrapper>
  );
}
