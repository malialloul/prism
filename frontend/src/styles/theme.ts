import { createTheme } from "@mui/material";

// Auth page colors - exported for use in styled components
export const authColors = {
  primary: '#8b5cf6',
  primaryHover: '#7c3aed',
  secondary: '#3b82f6',
  accent: '#3b82f6',
  accentLight: 'rgba(139, 92, 246, 0.1)',
  background: '#FFFFFF',
  backgroundAlt: '#F9FAFB',
  border: '#E2E8F0',
  borderHover: '#CBD5E1',
  text: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  error: '#EF4444',
  success: '#22C55E',
  warning: '#F97316',
  info: '#EAB308',
};

// Dashboard colors - dark theme focused for developers
export const dashboardColorsDark = {
  // Primary palette
  primary: '#8b5cf6',
  primaryHover: '#7c3aed',
  primaryLight: 'rgba(139, 92, 246, 0.15)',
  secondary: '#3b82f6',
  secondaryLight: 'rgba(59, 130, 246, 0.15)',
  
  // Background layers
  background: '#0a0e1a',
  backgroundSecondary: '#0f1629',
  backgroundTertiary: '#1a1f35',
  backgroundCard: '#141825',
  backgroundHover: '#1e2438',
  cardBg: '#141825',
  bgLayer1: '#0f1629',
  bgLayer2: '#1a1f35',
  bgLayer3: '#252b42',
  
  // Borders
  border: '#1e293b',
  borderLight: '#334155',
  borderActive: '#8b5cf6',
  borderSubtle: '#1a2035',
  
  // Text hierarchy
  text: '#f1f5f9',
  textPrimary: '#f1f5f9',
  textSecondary: '#94a3b8',
  textTertiary: '#64748b',
  textMuted: '#475569',
  textInverse: '#0f172a',
  
  // Status colors
  success: '#22c55e',
  successLight: 'rgba(34, 197, 94, 0.15)',
  error: '#ef4444',
  errorLight: 'rgba(239, 68, 68, 0.15)',
  warning: '#f59e0b',
  warningLight: 'rgba(245, 158, 11, 0.15)',
  info: '#06b6d4',
  infoLight: 'rgba(6, 182, 212, 0.15)',
  
  // Database engine colors
  postgres: '#336791',
  postgresLight: 'rgba(51, 103, 145, 0.15)',
  mysql: '#00758f',
  mysqlLight: 'rgba(0, 117, 143, 0.15)',
  
  // Chart colors
  chartPrimary: '#8b5cf6',
  chartSecondary: '#3b82f6',
  chartTertiary: '#06b6d4',
  chartQuaternary: '#22c55e',
  chartError: '#ef4444',
  
  // Gradient
  gradientPrimary: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
  gradientSuccess: 'linear-gradient(135deg, #22c55e 0%, #06b6d4 100%)',
};

// Dashboard colors - light theme
export const dashboardColorsLight = {
  // Primary palette
  primary: '#8b5cf6',
  primaryHover: '#7c3aed',
  primaryLight: 'rgba(139, 92, 246, 0.1)',
  secondary: '#3b82f6',
  secondaryLight: 'rgba(59, 130, 246, 0.1)',
  
  // Background layers
  background: '#ffffff',
  backgroundSecondary: '#f8fafc',
  backgroundTertiary: '#f1f5f9',
  backgroundCard: '#ffffff',
  backgroundHover: '#e2e8f0',
  cardBg: '#ffffff',
  bgLayer1: '#f8fafc',
  bgLayer2: '#f1f5f9',
  bgLayer3: '#e2e8f0',
  
  // Borders
  border: '#e2e8f0',
  borderLight: '#cbd5e1',
  borderActive: '#8b5cf6',
  borderSubtle: '#f1f5f9',
  
  // Text hierarchy
  text: '#0f172a',
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textTertiary: '#64748b',
  textMuted: '#94a3b8',
  textInverse: '#f1f5f9',
  
  // Status colors
  success: '#16a34a',
  successLight: 'rgba(22, 163, 74, 0.1)',
  error: '#dc2626',
  errorLight: 'rgba(220, 38, 38, 0.1)',
  warning: '#d97706',
  warningLight: 'rgba(217, 119, 6, 0.1)',
  info: '#0891b2',
  infoLight: 'rgba(8, 145, 178, 0.1)',
  
  // Database engine colors
  postgres: '#336791',
  postgresLight: 'rgba(51, 103, 145, 0.1)',
  mysql: '#00758f',
  mysqlLight: 'rgba(0, 117, 143, 0.1)',
  
  // Chart colors
  chartPrimary: '#8b5cf6',
  chartSecondary: '#3b82f6',
  chartTertiary: '#06b6d4',
  chartQuaternary: '#22c55e',
  chartError: '#ef4444',
  
  // Gradient
  gradientPrimary: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
  gradientSuccess: 'linear-gradient(135deg, #22c55e 0%, #06b6d4 100%)',
};

// Function to get dashboard colors based on mode
export const getDashboardColors = (darkMode: boolean) => 
  darkMode ? dashboardColorsDark : dashboardColorsLight;

// Keep backward compatibility
export const dashboardColors = dashboardColorsDark;

const createAppTheme = (darkMode = false) =>
    createTheme({
        palette: {
            mode: darkMode ? "dark" : "light",
            primary: {
                main: "#8b5cf6",
            },
            secondary: {
                main: "#3b82f6",
            },
            background: {
                default: darkMode ? "#0a0e1a" : "#ffffff",
                paper: darkMode ? "#1a1f35" : "#f9fafb",
            },
            error: {
                main: authColors.error,
            },
            success: {
                main: authColors.success,
            },
            warning: {
                main: authColors.warning,
            },
        },
        typography: {
            fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        },
        shape: {
            borderRadius: 12,
        },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    // Optional: global scrollbar styles
                    body: {
                        scrollbarWidth: 'thin',
                        scrollbarColor: `${darkMode ? '#475569' : '#94A3B8'} ${darkMode ? '#1E293B' : '#FFFFFF'}`,
                    },
                    '*::-webkit-scrollbar': { height: 10, width: 10 },
                    '*::-webkit-scrollbar-track': { background: darkMode ? '#1E293B' : '#FFFFFF', borderRadius: 8 },
                    '*::-webkit-scrollbar-thumb': { backgroundColor: darkMode ? '#475569' : '#94A3B8', borderRadius: 8, border: `2px solid ${darkMode ? '#1E293B' : '#FFFFFF'}` },
                    '*::-webkit-scrollbar-thumb:hover': { backgroundColor: '#64748B' },
                    '@keyframes pulse': {
                        '0%, 100%': { opacity: 1 },
                        '50%': { opacity: 0.5 },
                    },
                },
            },
            MuiTableContainer: {
                styleOverrides: {
                    root: {
                        backgroundColor: darkMode ? '#1E293B' : '#F8FAFC',
                        border: '1px solid #334155',
                        borderRadius: 0,
                        overflowX: 'auto',
                        scrollbarWidth: 'thin',
                        scrollbarColor: `${darkMode ? '#475569' : '#94A3B8'} ${darkMode ? '#1E293B' : '#FFFFFF'}`,
                    },
                },
            },
        },
    });

export { createAppTheme };