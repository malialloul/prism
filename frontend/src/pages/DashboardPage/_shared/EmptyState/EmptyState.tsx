import StorageIcon from '@mui/icons-material/Storage';
import LinkIcon from '@mui/icons-material/Link';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
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
  onCreatePostgres,
  onCreateMySQL,
  onConnect,
}: EmptyStateProps) {
  const features = [
    'Auto-generate REST APIs',
    'Schema exploration',
    'Query analytics',
    'SSL connections',
    'Real-time monitoring',
    'Role-based access',
  ];

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
        <ActionCard cardVariant="postgres" onClick={onCreatePostgres}>
          <ActionCardIcon variant="postgres">
            <StorageIcon />
          </ActionCardIcon>
          <ActionCardTitle variant="postgres">Create PostgreSQL</ActionCardTitle>
          <ActionCardSubtitle>New managed database</ActionCardSubtitle>
        </ActionCard>

        <ActionCard cardVariant="mysql" onClick={onCreateMySQL}>
          <ActionCardIcon variant="mysql">
            <StorageIcon />
          </ActionCardIcon>
          <ActionCardTitle variant="mysql">Create MySQL</ActionCardTitle>
          <ActionCardSubtitle>New managed database</ActionCardSubtitle>
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
