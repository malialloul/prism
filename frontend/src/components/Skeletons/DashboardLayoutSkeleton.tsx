import { Box, Skeleton } from '@mui/material';

/**
 * Skeleton for Dashboard Layout (with sidebar)
 */
export default function DashboardLayoutSkeleton() {
  return (
    <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#0a0a0f' }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: '280px',
          flexShrink: 0,
          borderRight: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0d0d14',
        }}
      >
        {/* Logo */}
        <Box sx={{ p: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Skeleton variant="circular" width={32} height={32} sx={{ bgcolor: '#667eea' }} />
            <Skeleton variant="text" width={80} height={24} sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} />
          </Box>
        </Box>

        {/* Database Selector */}
        <Box sx={{ p: '1rem' }}>
          <Skeleton variant="text" width={100} height={16} sx={{ bgcolor: 'rgba(255,255,255,0.05)', mb: 1 }} />
          <Skeleton variant="rectangular" height={44} sx={{ bgcolor: 'rgba(255,255,255,0.04)', borderRadius: '8px' }} />
        </Box>

        {/* Navigation Items */}
        <Box sx={{ flex: 1, p: '0.5rem 1rem' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Box
              key={i}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                p: '0.75rem',
                mb: '0.25rem',
                borderRadius: '8px',
                bgcolor: i === 1 ? 'rgba(102,126,234,0.15)' : 'transparent',
              }}
            >
              <Skeleton
                variant="circular"
                width={20}
                height={20}
                sx={{ bgcolor: i === 1 ? 'rgba(102,126,234,0.4)' : 'rgba(255,255,255,0.08)' }}
              />
              <Skeleton
                variant="text"
                width={100 + i * 10}
                height={20}
                sx={{ bgcolor: i === 1 ? 'rgba(102,126,234,0.3)' : 'rgba(255,255,255,0.06)' }}
              />
            </Box>
          ))}
        </Box>

        {/* User Profile */}
        <Box sx={{ p: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Skeleton variant="circular" width={36} height={36} sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width={100} height={18} sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} />
              <Skeleton variant="text" width={140} height={14} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: '1rem 1.5rem',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <Skeleton variant="text" width={180} height={32} sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} />
          <Box sx={{ display: 'flex', gap: '1rem' }}>
            <Skeleton variant="rectangular" width={140} height={36} sx={{ borderRadius: '8px', bgcolor: 'rgba(255,255,255,0.06)' }} />
            <Skeleton variant="rectangular" width={140} height={36} sx={{ borderRadius: '8px', bgcolor: '#667eea' }} />
          </Box>
        </Box>

        {/* Tabs */}
        <Box sx={{ p: '0 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <Box sx={{ display: 'flex', gap: '2rem' }}>
            {['Overview', 'Schema', 'Query', 'ER Diagram'].map((tab, i) => (
              <Skeleton
                key={tab}
                variant="text"
                width={80}
                height={40}
                sx={{ bgcolor: i === 0 ? 'rgba(102,126,234,0.3)' : 'rgba(255,255,255,0.06)' }}
              />
            ))}
          </Box>
        </Box>

        {/* Content Area */}
        <Box sx={{ flex: 1, p: '1.5rem', overflow: 'auto' }}>
          {/* Stats Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', mb: 2 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Box
                key={i}
                sx={{
                  p: '1.5rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  bgcolor: 'rgba(255,255,255,0.02)',
                }}
              >
                <Skeleton variant="text" width={80} height={16} sx={{ bgcolor: 'rgba(255,255,255,0.06)', mb: 1 }} />
                <Skeleton variant="text" width={60} height={32} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
              </Box>
            ))}
          </Box>

          {/* Charts */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            {[1, 2].map((i) => (
              <Box
                key={i}
                sx={{
                  p: '1.5rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  bgcolor: 'rgba(255,255,255,0.02)',
                }}
              >
                <Skeleton variant="text" width={120} height={24} sx={{ bgcolor: 'rgba(255,255,255,0.08)', mb: 2 }} />
                <Skeleton variant="rectangular" height={200} sx={{ bgcolor: 'rgba(255,255,255,0.04)', borderRadius: '8px' }} />
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
