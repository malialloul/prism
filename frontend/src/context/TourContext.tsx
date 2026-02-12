import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import Joyride, { CallBackProps, STATUS, Step, ACTIONS, EVENTS } from 'react-joyride';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material';
import { ROUTES } from '../constants';

const DEMO_MODE_KEY = 'prism-demo-mode';

interface TourContextType {
  startTour: () => void;
  stopTour: () => void;
  enterDemoMode: () => void;
  isRunning: boolean;
  isDemoMode: boolean;
  exitDemoMode: () => void;
}

const TourContext = createContext<TourContextType | null>(null);

export const useTour = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within TourProvider');
  }
  return context;
};

// Check if demo mode is active (can be used outside of React components)
export const isDemoModeActive = () => {
  return sessionStorage.getItem(DEMO_MODE_KEY) === 'true';
};

// Tour step configuration with navigation info
interface TourStepConfig extends Step {
  navigateTo?: string;
  waitForElement?: boolean;
}

// Tour steps targeting real UI elements across all pages
const tourSteps: TourStepConfig[] = [
  // Dashboard Overview steps
  {
    target: '[data-tour="sidebar"]',
    content: 'This is your database sidebar. Here you can see all your connected databases and switch between them.',
    placement: 'right',
    title: 'Database Sidebar',
    disableBeacon: true,
    navigateTo: ROUTES.DASHBOARD.OVERVIEW,
  },
  {
    target: '[data-tour="add-database"]',
    content: 'Click here to connect a new database. We support PostgreSQL, MySQL, SQL Server, and more.',
    placement: 'right',
    title: 'Connect Database',
  },
  {
    target: '[data-tour="dashboard-tabs"]',
    content: 'Navigate between different views: Overview for stats, Schema to explore tables, Query to run SQL, and ER Diagram for relationships.',
    placement: 'bottom',
    title: 'Navigation Tabs',
  },
  // Schema page steps
  {
    target: '[data-tour="schema-tab"]',
    content: 'Let\'s explore the Schema tab to see your database structure.',
    placement: 'bottom',
    title: 'Schema Explorer',
    navigateTo: ROUTES.DASHBOARD.SCHEMA,
  },
  {
    target: '[data-tour="schema-explorer-area"]',
    content: 'The Schema Explorer shows all your tables. Click on any table to view its columns, indexes, and foreign key relationships.',
    placement: 'right',
    title: 'Explore Your Schema',
    waitForElement: true,
  },
  // Query page steps
  {
    target: '[data-tour="query-tab"]',
    content: 'Now let\'s check out the Query Editor.',
    placement: 'bottom',
    title: 'Query Editor',
    navigateTo: ROUTES.DASHBOARD.QUERY,
  },
  {
    target: '[data-tour="query-editor-area"]',
    content: 'Write and execute SQL queries directly. Features include syntax highlighting, auto-complete, and result visualization.',
    placement: 'top',
    title: 'SQL Query Editor',
    waitForElement: true,
  },
  // ER Diagram steps
  {
    target: '[data-tour="er-diagram-tab"]',
    content: 'The ER Diagram provides a visual representation of your database.',
    placement: 'bottom',
    title: 'ER Diagram',
    navigateTo: ROUTES.DASHBOARD.ER_DIAGRAM,
  },
  {
    target: '[data-tour="er-diagram-area"]',
    content: 'View your database schema as an interactive diagram. See relationships between tables and understand your data model at a glance.',
    placement: 'top',
    title: 'Visual Database Relationships',
    waitForElement: true,
  },
  // APIs section
  {
    target: '[data-tour="navbar-apis"]',
    content: 'Let\'s explore the API generation features.',
    placement: 'bottom',
    title: 'API Generation',
    navigateTo: ROUTES.APIS.AUTO,
  },
  {
    target: '[data-tour="apis-tabs"]',
    content: 'Build custom queries, view auto-generated REST APIs, or explore the OpenAPI specification.',
    placement: 'bottom',
    title: 'API Explorer Tabs',
    waitForElement: true,
  },
  {
    target: '[data-tour="auto-apis-tab"]',
    content: 'Auto-generated APIs provide instant CRUD operations for all your tables - no coding required!',
    placement: 'bottom',
    title: 'Auto-Generated APIs',
  },
  // Final step
  {
    target: '[data-tour="user-menu"]',
    content: 'Access your profile settings, change password, and manage your account. Ready to get started? Sign up for free!',
    placement: 'bottom-end',
    title: 'Your Account',
  },
];

interface TourProviderProps {
  children: ReactNode;
}

export function TourProvider({ children }: TourProviderProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [isDemoMode, setIsDemoMode] = useState(() => isDemoModeActive());
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const pendingStepRef = useRef<number | null>(null);

  // Sync demo mode state with sessionStorage
  useEffect(() => {
    if (isDemoMode) {
      sessionStorage.setItem(DEMO_MODE_KEY, 'true');
    } else {
      sessionStorage.removeItem(DEMO_MODE_KEY);
    }
  }, [isDemoMode]);

  // Enter demo mode without starting the guided tour - allows free navigation
  const enterDemoMode = useCallback(() => {
    setIsDemoMode(true);
    sessionStorage.setItem(DEMO_MODE_KEY, 'true');
    
    // Navigate to dashboard
    if (!location.pathname.startsWith(ROUTES.DASHBOARD.ROOT)) {
      navigate(ROUTES.DASHBOARD.OVERVIEW);
    }
  }, [navigate, location.pathname]);

  // Start the guided tour (optionally can be called when already in demo mode)
  const startTour = useCallback(() => {
    // Enable demo mode if not already active
    if (!isDemoMode) {
      setIsDemoMode(true);
      sessionStorage.setItem(DEMO_MODE_KEY, 'true');
    }
    
    // Navigate to dashboard start point
    if (!location.pathname.startsWith(ROUTES.DASHBOARD.ROOT)) {
      navigate(ROUTES.DASHBOARD.OVERVIEW);
    }
    // Small delay to let navigation complete
    setTimeout(() => {
      setStepIndex(0);
      setIsRunning(true);
    }, 500);
  }, [navigate, location.pathname, isDemoMode]);

  const exitDemoMode = useCallback(() => {
    setIsDemoMode(false);
    sessionStorage.removeItem(DEMO_MODE_KEY);
    navigate(ROUTES.HOME);
  }, [navigate]);

  const stopTour = useCallback(() => {
    setIsRunning(false);
    setStepIndex(0);
    pendingStepRef.current = null;
  }, []);

  // Handle pending navigation - when location changes, advance to pending step
  useEffect(() => {
    if (pendingStepRef.current !== null && isRunning) {
      const targetStep = pendingStepRef.current;
      pendingStepRef.current = null;
      // Wait for page to render
      setTimeout(() => {
        setStepIndex(targetStep);
      }, 400);
    }
  }, [location.pathname, isRunning]);

  const handleJoyrideCallback = useCallback((data: CallBackProps) => {
    const { status, action, index, type } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      stopTour();
      return;
    }
    
    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      const nextIndex = index + (action === ACTIONS.PREV ? -1 : 1);
      
      // Check if next step requires navigation
      if (nextIndex >= 0 && nextIndex < tourSteps.length) {
        const nextStep = tourSteps[nextIndex];
        if (nextStep.navigateTo && !location.pathname.includes(nextStep.navigateTo.split('/').pop() || '')) {
          // Navigate first, then advance step after navigation completes
          pendingStepRef.current = nextIndex;
          navigate(nextStep.navigateTo);
          return;
        }
      }
      
      setStepIndex(nextIndex);
    }
  }, [stopTour, navigate, location.pathname]);

  return (
    <TourContext.Provider value={{ startTour, stopTour, enterDemoMode, isRunning, isDemoMode, exitDemoMode }}>
      {children}
      <Joyride
        steps={tourSteps}
        run={isRunning}
        stepIndex={stepIndex}
        continuous
        showProgress
        showSkipButton
        scrollToFirstStep
        spotlightClicks
        disableOverlayClose
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: theme.palette.primary.main,
            backgroundColor: theme.palette.background.paper,
            textColor: theme.palette.text.primary,
            arrowColor: theme.palette.background.paper,
            overlayColor: 'rgba(0, 0, 0, 0.6)',
            zIndex: 10000,
          },
          tooltip: {
            borderRadius: 12,
            padding: 20,
          },
          tooltipTitle: {
            fontSize: 18,
            fontWeight: 600,
            marginBottom: 8,
          },
          tooltipContent: {
            fontSize: 14,
            lineHeight: 1.6,
          },
          buttonNext: {
            backgroundColor: theme.palette.primary.main,
            borderRadius: 8,
            padding: '8px 16px',
            fontSize: 14,
            fontWeight: 500,
          },
          buttonBack: {
            color: theme.palette.text.secondary,
            marginRight: 8,
            fontSize: 14,
          },
          buttonSkip: {
            color: theme.palette.text.secondary,
            fontSize: 13,
          },
          spotlight: {
            borderRadius: 8,
          },
        }}
        locale={{
          back: 'Back',
          close: 'Close',
          last: 'Finish',
          next: 'Next',
          skip: 'Skip Tour',
        }}
      />
    </TourContext.Provider>
  );
}
