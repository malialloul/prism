import React from "react";
import { Box, Skeleton } from "@mui/material";
import { ApisContent } from "./BuildQuery.styles";
import QueryWizardWrapper from "./QueryWizardWrapper";
import { useDashboard } from "../../DashboardPage/DashboardLayout";
import { useApisContext } from "../ApisLayout";
import { usePermissions, AccessRestricted } from "../../../components";

export default function BuildQuery() {
  const { connectedDatabase, isSwitchingDatabase } = useDashboard();
  const { triggerOpenApiRefresh } = useApisContext();
  const { canCreateApi } = usePermissions();

  // Show loading skeleton while switching databases - matching wizard design
  if (isSwitchingDatabase) {
    return (
      <ApisContent>
        <Box sx={{ display: 'flex', height: '100%', width: '100%', backgroundColor: '#0a0a0f' }}>
          {/* Main section - WizardMain */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {/* Stepper - StepperContainer */}
            <Box sx={{
              p: '16px 24px',
              borderBottom: '1px solid #1e1e2e',
              backgroundColor: '#0d0d14',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {[
                  { label: 'Table', width: 50 },
                  { label: 'Joins', width: 45 },
                  { label: 'Fields', width: 50 },
                  { label: 'Filters', width: 55 },
                  { label: 'Aggregate', width: 75 },
                  { label: 'Sort', width: 40 },
                  { label: 'Review', width: 60 },
                ].map((step, i) => (
                  <React.Fragment key={i}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      p: '8px 12px',
                      borderRadius: '8px',
                      backgroundColor: i === 0 ? 'rgba(102, 126, 234, 0.15)' : 'transparent',
                    }}>
                      <Skeleton
                        variant="circular"
                        width={28}
                        height={28}
                        sx={{ bgcolor: i === 0 ? '#667eea' : '#2a2a3a' }}
                      />
                      <Skeleton
                        variant="text"
                        width={step.width}
                        height={20}
                        sx={{ bgcolor: 'rgba(255,255,255,0.08)' }}
                      />
                    </Box>
                    {i < 6 && (
                      <Skeleton
                        variant="rectangular"
                        width={24}
                        height={2}
                        sx={{ bgcolor: '#2a2a3a', flexShrink: 0 }}
                      />
                    )}
                  </React.Fragment>
                ))}
              </Box>
            </Box>

            {/* Step Content */}
            <Box sx={{ flex: 1, overflow: 'auto', p: '24px' }}>
              {/* Step Header */}
              <Box sx={{ mb: '24px' }}>
                <Skeleton variant="text" width={280} height={36} sx={{ bgcolor: 'rgba(255,255,255,0.08)', mb: '8px' }} />
                <Skeleton variant="text" width={450} height={20} sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
              </Box>

              {/* Instructions box */}
              <Box sx={{
                p: '12px 16px',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderRadius: '8px',
                mb: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}>
                <Skeleton variant="circular" width={20} height={20} sx={{ bgcolor: 'rgba(165, 180, 252, 0.3)' }} />
                <Skeleton variant="text" width={400} height={18} sx={{ bgcolor: 'rgba(165, 180, 252, 0.2)' }} />
              </Box>

              {/* Search field */}
              <Skeleton
                variant="rectangular"
                height={48}
                sx={{ bgcolor: '#12121a', borderRadius: '8px', mb: '20px', border: '1px solid #2a2a3a' }}
              />

              {/* Grid of table cards */}
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '12px'
              }}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <Box
                    key={i}
                    sx={{
                      p: '16px',
                      backgroundColor: '#12121a',
                      border: '1px solid #2a2a3a',
                      borderRadius: '10px',
                    }}
                  >
                    <Skeleton variant="text" width={120} height={22} sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: '4px' }} />
                    <Skeleton variant="text" width={80} height={16} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                    <Box sx={{ display: 'flex', gap: '12px', mt: '8px' }}>
                      <Skeleton variant="text" width={60} height={14} sx={{ bgcolor: 'rgba(255,255,255,0.04)' }} />
                      <Skeleton variant="text" width={50} height={14} sx={{ bgcolor: 'rgba(255,255,255,0.04)' }} />
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Navigation Bar */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: '16px 24px',
              borderTop: '1px solid #1e1e2e',
              backgroundColor: '#0d0d14',
            }}>
              <Skeleton variant="rectangular" width={70} height={40} sx={{ borderRadius: '8px', bgcolor: 'rgba(255,255,255,0.05)' }} />
              <Skeleton variant="rectangular" width={70} height={40} sx={{ borderRadius: '8px', bgcolor: '#667eea' }} />
            </Box>
          </Box>

          {/* SQL Preview Sidebar - WizardSidebar */}
          <Box sx={{
            width: '360px',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            borderLeft: '1px solid #1e1e2e',
            backgroundColor: '#0d0d14',
          }}>
            {/* Preview Header */}
            <Box sx={{
              p: '16px',
              borderBottom: '1px solid #1e1e2e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <Skeleton variant="text" width={90} height={22} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
              <Skeleton variant="circular" width={28} height={28} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
            </Box>

            {/* Preview Content */}
            <Box sx={{ flex: 1, overflow: 'auto', p: '16px' }}>
              <Box sx={{
                p: '16px',
                backgroundColor: '#0a0a0f',
                borderRadius: '8px',
                minHeight: 150,
              }}>
                <Skeleton variant="text" width="90%" height={16} sx={{ bgcolor: 'rgba(255,255,255,0.06)', mb: 1 }} />
                <Skeleton variant="text" width="70%" height={16} sx={{ bgcolor: 'rgba(255,255,255,0.06)', mb: 1 }} />
                <Skeleton variant="text" width="80%" height={16} sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
              </Box>
            </Box>
          </Box>
        </Box>
      </ApisContent>
    );
  }

  if (!connectedDatabase) return null;

  // Show permission warning if not allowed
  if (!canCreateApi) {
    return (
      <ApisContent>
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AccessRestricted
            message="Build Query Restricted"
            description="You don't have permission to create APIs in the Query Builder. Please contact the account owner to request access."
            permission="createApiInQueryBuilder"
          />
        </Box>
      </ApisContent>
    );
  }

  return (
    <ApisContent>
      <QueryWizardWrapper
        connectedDatabase={connectedDatabase}
        onApiSaved={triggerOpenApiRefresh}
      />
    </ApisContent>
  );
}
