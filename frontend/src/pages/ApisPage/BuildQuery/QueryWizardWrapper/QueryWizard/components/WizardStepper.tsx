import React from 'react';
import CheckIcon from '@mui/icons-material/Check';
import {
  StepperContainer,
  StepperTrack,
  StepItem,
  StepNumber,
  StepLabel,
  StepConnector,
} from '../QueryWizard.styles';
import { WIZARD_STEPS } from '../types';

interface WizardStepperProps {
  onGoToStep: (step: number) => void;
  getStepStatus: (stepIndex: number) => {
    completed: boolean;
    active: boolean;
    clickable: boolean;
  };
}

export default function WizardStepper({
  onGoToStep,
  getStepStatus,
}: WizardStepperProps) {
  return (
    <StepperContainer>
      <StepperTrack>
        {WIZARD_STEPS.map((step, index) => {
          const { completed, active, clickable } = getStepStatus(index);
          return (
            <React.Fragment key={step.id}>
              <StepItem
                isActive={active}
                isCompleted={completed}
                isClickable={clickable}
                onClick={() => clickable && onGoToStep(index)}
              >
                <StepNumber isActive={active} isCompleted={completed}>
                  {completed ? <CheckIcon sx={{ fontSize: '0.9rem' }} /> : index + 1}
                </StepNumber>
                <StepLabel isActive={active}>{step.label}</StepLabel>
              </StepItem>
              {index < WIZARD_STEPS.length - 1 && (
                <StepConnector isCompleted={completed} />
              )}
            </React.Fragment>
          );
        })}
      </StepperTrack>
    </StepperContainer>
  );
}
