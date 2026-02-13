import StorageIcon from '@mui/icons-material/Storage';
import LinkIcon from '@mui/icons-material/Link';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { toastService } from '../../../../services';
import {
  EmptyStateContainer,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateActions,
  ActionCard,
  ActionCardIcon,
  ActionCardTitle,
  ActionCardSubtitle,
  FeaturesList,
  FeatureItem,
} from './EmptyState.styles';

interface EmptyStateProps {
  onCreatePostgres: () => void;
  onCreateMySQL: () => void;
  onConnect: () => void;
}

export default function EmptyState({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onCreatePostgres,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onCreateMySQL,
  onConnect,
}: EmptyStateProps) {
  const features = [
    'Auto-generate REST APIs',
    'Schema exploration',
    'Query analytics',
    'SSL connections',
    'Real-time monitoring',
  ];

  const handleComingSoon = () => {
    toastService.info('Create Database - Coming Soon! Use "Connect Existing" for now.');
  };

  return (
    <EmptyStateContainer>
      <EmptyStateIcon>
        <StorageIcon />
      </EmptyStateIcon>
      
      <EmptyStateTitle>No databases yet</EmptyStateTitle>
      <EmptyStateDescription>
        Create a new PostgreSQL or MySQL database, or connect your existing 
        database instance to start generating APIs automatically.
      </EmptyStateDescription>

      <EmptyStateActions>
        {/* TODO: Re-enable when create database feature is ready */}
        {/* <ActionCard cardVariant="postgres" onClick={onCreatePostgres}> */}
        <ActionCard cardVariant="postgres" onClick={handleComingSoon}>
          <ActionCardIcon variant="postgres">
            <StorageIcon />
          </ActionCardIcon>
          <ActionCardTitle variant="postgres">Create PostgreSQL</ActionCardTitle>
          <ActionCardSubtitle>Coming Soon</ActionCardSubtitle>
        </ActionCard>

        {/* TODO: Re-enable when create database feature is ready */}
        {/* <ActionCard cardVariant="mysql" onClick={onCreateMySQL}> */}
        <ActionCard cardVariant="mysql" onClick={handleComingSoon}>
          <ActionCardIcon variant="mysql">
            <StorageIcon />
          </ActionCardIcon>
          <ActionCardTitle variant="mysql">Create MySQL</ActionCardTitle>
          <ActionCardSubtitle>Coming Soon</ActionCardSubtitle>
        </ActionCard>

        <ActionCard cardVariant="connect" onClick={onConnect}>
          <ActionCardIcon variant="connect">
            <LinkIcon />
          </ActionCardIcon>
          <ActionCardTitle variant="connect">Connect Existing</ActionCardTitle>
          <ActionCardSubtitle>Your own database</ActionCardSubtitle>
        </ActionCard>
      </EmptyStateActions>

      <FeaturesList>
        {features.map((feature) => (
          <FeatureItem key={feature}>
            <CheckCircleIcon />
            {feature}
          </FeatureItem>
        ))}
      </FeaturesList>
    </EmptyStateContainer>
  );
}
