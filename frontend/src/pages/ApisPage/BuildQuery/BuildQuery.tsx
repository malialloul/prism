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

  // Show loading skeleton while switching databases
  if (isSwitchingDatabase) {
    return (
      <ApisContent>
        <Box sx={{ display: 'flex', gap: 2, height: '100%', p: 2 }}>
          {/* Left panel skeleton */}
          <Box sx={{ width: 320, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 1 }} />
          </Box>
          {/* Right panel skeleton */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
            </Box>
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 1, flex: 1 }} />
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
