import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StorageIcon from '@mui/icons-material/Storage';
import SpeedIcon from '@mui/icons-material/Speed';
import ApiIcon from '@mui/icons-material/Api';
import TableChartIcon from '@mui/icons-material/TableChart';
import PeopleIcon from '@mui/icons-material/People';
import KeyIcon from '@mui/icons-material/Key';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import { Box, IconButton, Skeleton, Tooltip } from '@mui/material';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { getWorkspaceColors } from '../../styles/theme';
import { ThemeToggleButton } from '../../components/ThemeToggle/ThemeToggle';
import { useVersionLimits } from '../../api/entities/auth';
import { ROUTES } from '../../constants';
import {
  LimitsWrapper,
  LimitsHeader,
  LimitsContent,
  PageTitle,
  PageSubtitle,
  VersionBadge,
  LimitsGrid,
  LimitCard,
  LimitHeader,
  LimitTitle,
  LimitValue,
  LimitProgress,
  LimitStats,
  SectionTitle,
} from './Limits.styles';

interface LimitItemProps {
  icon: React.ReactNode;
  title: string;
  current: number;
  max: number;
  formatValue?: (value: number, isMax?: boolean) => string;
  disabled?: boolean;
}

const LimitItem = ({ icon, title, current, max, formatValue, disabled }: LimitItemProps) => {
  const muiTheme = useMuiTheme();
  const colors = getWorkspaceColors(muiTheme.palette.mode === 'dark');
  
  const percentage = max === 0 ? 0 : Math.min((current / max) * 100, 100);
  const isAtLimit = max > 0 && current >= max;
  const isNearLimit = max > 0 && percentage >= 80;
  
  const getProgressColor = () => {
    if (disabled) return colors.textTertiary;
    if (isAtLimit) return colors.error;
    if (isNearLimit) return colors.warning;
    return colors.primary;
  };

  const format = formatValue || ((v: number) => v.toString());

  return (
    <LimitCard sx={{ opacity: disabled ? 0.5 : 1 }}>
      <LimitHeader>
        <LimitTitle>
          {icon}
          {title}
        </LimitTitle>
        <LimitValue>
          {disabled ? 'Disabled' : max === 0 ? 'Unlimited' : `${format(current)} / ${format(max, true)}`}
        </LimitValue>
      </LimitHeader>
      {!disabled && max > 0 && (
        <>
          <LimitProgress
            variant="determinate"
            value={percentage}
            sx={{
              '& .MuiLinearProgress-bar': {
                backgroundColor: getProgressColor(),
              },
            }}
          />
          <LimitStats>
            <span>{percentage.toFixed(0)}% used</span>
            <span style={{ color: isAtLimit ? colors.error : isNearLimit ? colors.warning : undefined }}>
              {isAtLimit ? 'Limit reached' : isNearLimit ? 'Near limit' : `${format(max - current)} remaining`}
            </span>
          </LimitStats>
        </>
      )}
      {!disabled && max === 0 && (
        <LimitStats>
          <span>No limit</span>
        </LimitStats>
      )}
    </LimitCard>
  );
};

const Limits = () => {
  const navigate = useNavigate();
  const muiTheme = useMuiTheme();
  const colors = getWorkspaceColors(muiTheme.palette.mode === 'dark');
  
  const { data: versionData, isLoading } = useVersionLimits();
  
  const limits = versionData?.data?.limits;
  const usage = versionData?.data?.usage;
  const version = versionData?.data?.version || 'v1.0.0';
  const versionName = versionData?.data?.versionName || 'Testing Release';

  const formatStorage = (mb: number, isMax?: boolean) => {
    if (mb >= 1024) return `${(mb / 1024).toFixed(isMax ? 0 : 1)}GB`;
    return `${mb.toFixed(isMax ? 0 : 1)}MB`;
  };

  const formatRequests = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}K`;
    return count.toString();
  };

  return (
    <LimitsWrapper>
      <LimitsHeader>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            maxWidth: '900px',
            width: '100%',
            margin: '0 auto',
            padding: '0.75rem 2rem',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Tooltip title="Go back">
              <IconButton
                onClick={() => navigate(-1)}
                size="small"
                sx={{ color: colors.textSecondary }}
              >
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
            <Box sx={{ fontSize: '1rem', fontWeight: 600, color: colors.text }}>
              Usage & Limits
            </Box>
          </Box>
          <ThemeToggleButton />
        </Box>
      </LimitsHeader>

      <LimitsContent>
        <Box>
          <PageTitle>Your Plan Limits</PageTitle>
          <PageSubtitle>
            View your current usage and plan limits. Upgrade to increase limits.
          </PageSubtitle>
          <VersionBadge>
            <RocketLaunchIcon sx={{ fontSize: '1rem' }} />
            {version} - {versionName}
          </VersionBadge>
        </Box>

        {isLoading ? (
          <LimitsGrid>
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <Skeleton key={i} variant="rounded" height={120} />
            ))}
          </LimitsGrid>
        ) : (
          <>
            <Box>
              <SectionTitle>Database Limits</SectionTitle>
              <LimitsGrid>
                <LimitItem
                  icon={<StorageIcon />}
                  title="Databases"
                  current={usage?.databases || 0}
                  max={limits?.maxDatabases || 0}
                />
                <LimitItem
                  icon={<DataUsageIcon />}
                  title="Storage"
                  current={usage?.storageMB || 0}
                  max={limits?.maxStorageMB || 0}
                  formatValue={formatStorage}
                />
                <LimitItem
                  icon={<TableChartIcon />}
                  title="Tables"
                  current={usage?.tables || 0}
                  max={limits?.maxTablesPerDatabase || 0}
                />
              </LimitsGrid>
            </Box>

            <Box>
              <SectionTitle>API Limits</SectionTitle>
              <LimitsGrid>
                <LimitItem
                  icon={<ApiIcon />}
                  title="Saved APIs"
                  current={usage?.savedApis || 0}
                  max={limits?.maxSavedApis || 0}
                />
                <LimitItem
                  icon={<SpeedIcon />}
                  title="Requests / Month"
                  current={usage?.requestsThisMonth || 0}
                  max={limits?.maxRequestsPerMonth || 0}
                  formatValue={formatRequests}
                />
                <LimitItem
                  icon={<KeyIcon />}
                  title="API Tokens"
                  current={usage?.apiTokens || 0}
                  max={limits?.maxApiTokens || 0}
                />
              </LimitsGrid>
            </Box>

            <Box>
              <SectionTitle>Account Limits</SectionTitle>
              <LimitsGrid>
                <LimitItem
                  icon={<PeopleIcon />}
                  title="Shared Accounts"
                  current={usage?.sharedAccounts || 0}
                  max={limits?.maxSharedAccounts || 0}
                  disabled={limits?.maxSharedAccounts === 0}
                />
              </LimitsGrid>
            </Box>
          </>
        )}
      </LimitsContent>
    </LimitsWrapper>
  );
};

export default Limits;
