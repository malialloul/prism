import { Box, Skeleton, Card } from '@mui/material';
import {
  DashboardWrapper,
  DashboardHeader,
  DashboardBody,
  DashboardContent,
  ContentHeader,
  ContentTitle,
} from '../Dashboard.styles';
import Navbar from '../Navbar/Navbar';
import { getDashboardColors } from '../../../styles/theme';
import { useTheme as useMuiTheme } from '@mui/material/styles';

export default function DashboardSkeleton() {
  const muiTheme = useMuiTheme();
  const colors = getDashboardColors(muiTheme.palette.mode === 'dark');

  return (
    <DashboardWrapper>
      <DashboardHeader>
        <Navbar onRefresh={() => {}} />
      </DashboardHeader>
      <DashboardBody>
        {/* Sidebar Skeleton */}
        <Box
          sx={{
            width: '280px',
            flexShrink: 0,
            borderRight: `1px solid ${colors.border}`,
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <Skeleton variant="text" width="80%" height={24} />
          <Skeleton variant="rectangular" height={40} sx={{ borderRadius: '0.5rem' }} />
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              height={56}
              sx={{ borderRadius: '0.5rem' }}
            />
          ))}
        </Box>

        <DashboardContent>
          <ContentHeader>
            <ContentTitle>
              <Skeleton variant="text" width={200} />
            </ContentTitle>
          </ContentHeader>

          {/* Tabs Skeleton */}
          <Box sx={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="text" width={100} height={32} />
            ))}
          </Box>

          {/* Content Cards Skeleton */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {[1, 2, 3].map((i) => (
              <Card
                key={i}
                sx={{
                  padding: '1.5rem',
                  backgroundColor: colors.background,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <Skeleton variant="text" width="30%" height={24} sx={{ marginBottom: '1rem' }} />
                <Skeleton variant="rectangular" height={100} sx={{ borderRadius: '0.25rem' }} />
              </Card>
            ))}
          </Box>
        </DashboardContent>
      </DashboardBody>
    </DashboardWrapper>
  );
}
