import { Box } from '@mui/material';
import { NavigationBar, NavButton } from '../QueryWizard.styles';
import { WIZARD_STEPS } from '../types';

interface WizardNavigationProps {
  currentStep: number;
  canProceed: boolean;
  onBack: () => void;
  onNext: () => void;
}

export default function WizardNavigation({
  currentStep,
  canProceed,
  onBack,
  onNext,
}: WizardNavigationProps) {
  // Don't render on the Review step (it has its own actions)
  if (currentStep >= WIZARD_STEPS.length - 1) {
    return null;
  }

  return (
    <NavigationBar>
      <NavButton
        variant="text"
        onClick={onBack}
        disabled={currentStep === 0}
      >
        Back
      </NavButton>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {!canProceed && currentStep === 0 && (
          <Box sx={{ fontSize: '0.8rem', color: '#f59e0b' }}>
            Select a table to continue
          </Box>
        )}
        <NavButton
          variant="contained"
          onClick={onNext}
          disabled={!canProceed}
        >
          {currentStep === WIZARD_STEPS.length - 2 ? 'Review' : 'Next'}
        </NavButton>
      </Box>
    </NavigationBar>
  );
}
