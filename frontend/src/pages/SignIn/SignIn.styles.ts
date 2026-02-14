import { styled } from '@mui/material/styles';
import { Box, Card, TextField, Button, Link, Checkbox, FormControlLabel } from '@mui/material';
import { motion } from 'motion/react';
import { authColors as colors } from '../../styles/theme';

export const AuthWrapper = styled(Box)({
  minHeight: '100vh',
  display: 'flex',
  background: colors.backgroundAlt,
  overflow: 'auto',
});

export const LeftPanel = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'none',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: '3rem',
  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
  position: 'relative',
  overflow: 'hidden',
  [theme.breakpoints.up('md')]: {
    display: 'flex',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-20%',
    right: '-10%',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.1)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-10%',
    left: '-5%',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.05)',
  },
}));

export const LeftPanelContent = styled(Box)({
  position: 'relative',
  zIndex: 1,
  maxWidth: '480px',
  margin: '0 auto',
});

export const LeftPanelTitle = styled('h1')({
  color: 'white',
  fontSize: '2.5rem',
  fontWeight: 700,
  marginBottom: '1.5rem',
  lineHeight: 1.2,
});

export const LeftPanelText = styled('p')({
  color: 'rgba(255, 255, 255, 0.9)',
  fontSize: '1.125rem',
  lineHeight: 1.7,
  marginBottom: '2rem',
});

export const FeatureList = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
});

export const FeatureItem = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  color: 'rgba(255, 255, 255, 0.95)',
  fontSize: '1rem',
});

export const FeatureIcon = styled(Box)({
  width: '2rem',
  height: '2rem',
  borderRadius: '0.5rem',
  background: 'rgba(255, 255, 255, 0.2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1rem',
  '& svg': {
    width: '100%',
    height: '100%',
    color: 'inherit',
  },
});

export const RightPanel = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
  background: colors.background,
  position: 'relative',
  [theme.breakpoints.up('md')]: {
    padding: '3rem',
  },
}));

export const CardWrapper = styled(motion(Card))({
  borderRadius: '1rem',
  border: `1px solid ${colors.border}`,
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  background: colors.background,
  padding: '2.5rem',
  maxWidth: '440px',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
});

export const LogoBox = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.75rem',
  marginBottom: '0.5rem',
});

export const Tagline = styled('p')({
  margin: '0.5rem 0 0 0',
  fontSize: '0.9375rem',
  color: colors.textSecondary,
  lineHeight: 1.5,
});

export const FormGroup = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.375rem',
});

export const InputLabel = styled('label')({
  fontSize: '0.875rem',
  fontWeight: 500,
  color: colors.text,
  marginBottom: '0.25rem',
});

export const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: '0.5rem',
    backgroundColor: colors.background,
    transition: 'all 0.2s ease',
    '& fieldset': {
      borderColor: colors.border,
      transition: 'all 0.2s ease',
    },
    '&:hover fieldset': {
      borderColor: colors.borderHover,
    },
    '&.Mui-focused fieldset': {
      borderColor: colors.primary,
      borderWidth: '2px',
      boxShadow: `0 0 0 3px ${colors.accentLight}`,
    },
  },
  '& .MuiInputBase-input': {
    fontSize: '0.9375rem',
    padding: '0.75rem 1rem',
    color: colors.text,
    '&::placeholder': {
      color: colors.textMuted,
      opacity: 1,
    },
  },
  '& .MuiInputLabel-root': {
    display: 'none',
  },
  '& .MuiInputAdornment-root .MuiIconButton-root': {
    color: colors.textSecondary,
    '&:hover': {
      color: colors.text,
    },
  },
});

export const ErrorText = styled('span')({
  fontSize: '0.75rem',
  color: colors.error,
  fontWeight: 500,
  marginTop: '0.25rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem',
});

export const RememberForgotRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: '-0.5rem',
});

export const StyledCheckbox = styled(Checkbox)({
  padding: '0.25rem',
  color: colors.border,
  '&.Mui-checked': {
    color: colors.primary,
  },
});

export const CheckboxLabel = styled(FormControlLabel)({
  marginLeft: '-0.5rem',
  '& .MuiTypography-root': {
    fontSize: '0.875rem',
    color: colors.textSecondary,
  },
});

export const StyledLink = styled(Link)({
  color: colors.primary,
  textDecoration: 'none',
  fontWeight: 500,
  fontSize: '0.875rem',
  cursor: 'pointer',
  transition: 'color 0.2s ease',
  '&:hover': {
    color: colors.primaryHover,
    textDecoration: 'underline',
  },
});

export const PrimaryButton = styled(Button)({
  borderRadius: '0.5rem',
  padding: '0.75rem 1.5rem',
  fontSize: '0.9375rem',
  fontWeight: 600,
  textTransform: 'none',
  backgroundColor: colors.primary,
  color: 'white',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: colors.primaryHover,
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(74, 144, 217, 0.35)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
  '&:disabled': {
    backgroundColor: colors.border,
    color: colors.textMuted,
  },
});

export const Divider = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  margin: '0.5rem 0',
  '&::before, &::after': {
    content: '""',
    flex: 1,
    height: '1px',
    background: colors.border,
  },
});

export const DividerText = styled('span')({
  fontSize: '0.8125rem',
  color: colors.textMuted,
  fontWeight: 500,
});

export const OAuthButtonsContainer = styled(Box)({
  display: 'flex',
  gap: '0.75rem',
});

export const OAuthButton = styled(Button)({
  flex: 1,
  borderRadius: '0.5rem',
  padding: '0.625rem 1rem',
  fontSize: '0.875rem',
  fontWeight: 500,
  textTransform: 'none',
  border: `1px solid ${colors.border}`,
  backgroundColor: colors.background,
  color: colors.text,
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.borderHover,
  },
  '& .MuiButton-startIcon': {
    marginRight: '0.5rem',
  },
});

export const FooterText = styled(Box)({
  textAlign: 'center',
  fontSize: '0.875rem',
  color: colors.textSecondary,
  marginTop: '0.5rem',
});

export const IllustrationContainer = styled(Box)({
  position: 'absolute',
  bottom: '3rem',
  right: '3rem',
  opacity: 0.15,
  fontSize: '12rem',
  lineHeight: 1,
  zIndex: 0,
});

export const HomeLink = styled(Box)({
  position: 'absolute',
  top: '1.5rem',
  left: '1.5rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  color: colors.textSecondary,
  fontSize: '0.875rem',
  fontWeight: 500,
  cursor: 'pointer',
  zIndex: 10,
  transition: 'all 0.2s ease',
  textDecoration: 'none',
  '&:hover': {
    color: colors.primary,
    transform: 'translateX(-2px)',
  },
});

export const BackLinkContainer = styled(Box)({
  position: 'absolute',
  top: '2rem',
  left: '2rem',
  zIndex: 20,
});
