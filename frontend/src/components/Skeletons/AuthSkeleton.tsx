import { Box, Skeleton } from '@mui/material';

/**
 * Skeleton for Auth pages (SignIn, SignUp, ForgotPassword, ChangePassword, SharedLogin)
 */
export default function AuthSkeleton() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        backgroundColor: '#0a0a0f',
      }}
    >
      {/* Left Panel - Branding */}
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '3rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <Skeleton variant="text" width={300} height={48} sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 2 }} />
        <Skeleton variant="text" width={400} height={24} sx={{ bgcolor: 'rgba(255,255,255,0.15)', mb: 4 }} />
        {[1, 2, 3, 4].map((i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: '1rem', mb: 2 }}>
            <Skeleton variant="circular" width={40} height={40} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height={20} sx={{ bgcolor: 'rgba(255,255,255,0.15)' }} />
              <Skeleton variant="text" width="80%" height={16} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
            </Box>
          </Box>
        ))}
      </Box>

      {/* Right Panel - Form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: '400px' }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.75rem', mb: 3 }}>
            <Skeleton variant="circular" width={40} height={40} sx={{ bgcolor: '#667eea' }} />
            <Skeleton variant="text" width={100} height={32} sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} />
          </Box>

          {/* Title */}
          <Skeleton variant="text" width={200} height={36} sx={{ bgcolor: 'rgba(255,255,255,0.08)', mb: 1 }} />
          <Skeleton variant="text" width={280} height={20} sx={{ bgcolor: 'rgba(255,255,255,0.05)', mb: 3 }} />

          {/* Form Fields */}
          {[1, 2].map((i) => (
            <Box key={i} sx={{ mb: 2 }}>
              <Skeleton variant="text" width={80} height={20} sx={{ bgcolor: 'rgba(255,255,255,0.06)', mb: 0.5 }} />
              <Skeleton variant="rectangular" height={48} sx={{ bgcolor: 'rgba(255,255,255,0.04)', borderRadius: '8px' }} />
            </Box>
          ))}

          {/* Remember me & Forgot password */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Skeleton variant="rectangular" width={20} height={20} sx={{ bgcolor: 'rgba(255,255,255,0.06)', borderRadius: '4px' }} />
              <Skeleton variant="text" width={100} height={18} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
            </Box>
            <Skeleton variant="text" width={120} height={18} sx={{ bgcolor: 'rgba(102,126,234,0.3)' }} />
          </Box>

          {/* Submit Button */}
          <Skeleton variant="rectangular" height={48} sx={{ bgcolor: '#667eea', borderRadius: '8px', mb: 3 }} />

          {/* Divider */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem', mb: 3 }}>
            <Box sx={{ flex: 1, height: '1px', bgcolor: 'rgba(255,255,255,0.1)' }} />
            <Skeleton variant="text" width={80} height={18} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
            <Box sx={{ flex: 1, height: '1px', bgcolor: 'rgba(255,255,255,0.1)' }} />
          </Box>

          {/* OAuth Buttons */}
          <Box sx={{ display: 'flex', gap: '1rem', mb: 3 }}>
            <Skeleton variant="rectangular" height={44} sx={{ flex: 1, bgcolor: 'rgba(255,255,255,0.04)', borderRadius: '8px' }} />
            <Skeleton variant="rectangular" height={44} sx={{ flex: 1, bgcolor: 'rgba(255,255,255,0.04)', borderRadius: '8px' }} />
          </Box>

          {/* Footer Link */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
            <Skeleton variant="text" width={150} height={18} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
            <Skeleton variant="text" width={60} height={18} sx={{ bgcolor: 'rgba(102,126,234,0.3)' }} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
