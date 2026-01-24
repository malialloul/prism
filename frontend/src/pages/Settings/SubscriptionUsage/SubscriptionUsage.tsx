import BoltIcon from '@mui/icons-material/Bolt';
import {
  UsageContainer,
  PlanBadge,
  PlanHeader,
  PlanInfo,
  PlanName,
  UpgradeButton,
  UsageStats,
  StatItem,
  StatLabel,
  StatValue,
  StatSubtext,
  ProgressBar,
  ProgressFill,
} from './SubscriptionUsage.styles';

interface SubscriptionUsageProps {
  plan: {
    name: string;
    type: 'free' | 'pro' | 'enterprise';
  };
  usage: {
    apiCalls: {
      used: number;
      limit: number;
    };
    databases: {
      connected: number;
      limit: number;
    };
    storage: {
      used: number;
      limit: number;
    };
  };
  onUpgrade: () => void;
}

const SubscriptionUsage = ({ plan, usage, onUpgrade }: SubscriptionUsageProps) => {
  const getUsageStatus = (used: number, limit: number) => {
    const percentage = (used / limit) * 100;
    if (percentage >= 90) return 'danger';
    if (percentage >= 70) return 'warning';
    return 'normal';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <UsageContainer>
      <PlanHeader>
        <PlanInfo>
          <PlanName>Current Plan:</PlanName>
          <PlanBadge planType={plan.type}>{plan.name}</PlanBadge>
        </PlanInfo>
        {plan.type !== 'enterprise' && (
          <UpgradeButton onClick={onUpgrade}>
            <BoltIcon sx={{ fontSize: 14 }} />
            Upgrade Plan
          </UpgradeButton>
        )}
      </PlanHeader>

      <UsageStats>
        <StatItem>
          <StatLabel>API Calls (This Month)</StatLabel>
          <StatValue>
            {formatNumber(usage.apiCalls.used)} 
            <StatSubtext> / {formatNumber(usage.apiCalls.limit)}</StatSubtext>
          </StatValue>
          <ProgressBar>
            <ProgressFill 
              percentage={(usage.apiCalls.used / usage.apiCalls.limit) * 100}
              status={getUsageStatus(usage.apiCalls.used, usage.apiCalls.limit)}
            />
          </ProgressBar>
        </StatItem>

        <StatItem>
          <StatLabel>Connected Databases</StatLabel>
          <StatValue>
            {usage.databases.connected}
            <StatSubtext> / {usage.databases.limit}</StatSubtext>
          </StatValue>
          <ProgressBar>
            <ProgressFill 
              percentage={(usage.databases.connected / usage.databases.limit) * 100}
              status={getUsageStatus(usage.databases.connected, usage.databases.limit)}
            />
          </ProgressBar>
        </StatItem>

        <StatItem>
          <StatLabel>Storage Used</StatLabel>
          <StatValue>
            {usage.storage.used} GB
            <StatSubtext> / {usage.storage.limit} GB</StatSubtext>
          </StatValue>
          <ProgressBar>
            <ProgressFill 
              percentage={(usage.storage.used / usage.storage.limit) * 100}
              status={getUsageStatus(usage.storage.used, usage.storage.limit)}
            />
          </ProgressBar>
        </StatItem>
      </UsageStats>
    </UsageContainer>
  );
};

export default SubscriptionUsage;
