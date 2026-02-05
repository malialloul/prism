import { Box, Skeleton } from "@mui/material";
import { ApisContent } from "./OpenApi.styles";
import { OpenApiPanel } from "./OpenApiPanel";
import { useDashboard } from "../../DashboardPage/DashboardLayout";
import { useApisContext } from "../ApisLayout";
import { usePermissions, AccessRestricted } from "../../../components";

export default function OpenApi() {
  const { connectedDatabase, isSwitchingDatabase } = useDashboard();
  const { openApiRefreshKey } = useApisContext();
  const { canTryOpenApi } = usePermissions();

  // Show loading skeleton while switching databases
  if (isSwitchingDatabase) {
    return (
      <ApisContent>
        <Box sx={{ display: 'flex', height: '100%', p: 2 }}>
          {/* Left sidebar skeleton */}
          <Box sx={{ width: 280, display: 'flex', flexDirection: 'column', gap: 1, pr: 2, borderRight: '1px solid', borderColor: 'divider' }}>
            <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} variant="rectangular" height={36} sx={{ borderRadius: 1 }} />
            ))}
          </Box>
          {/* Main content skeleton */}
          <Box sx={{ flex: 1, pl: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 1 }} />
          </Box>
        </Box>
      </ApisContent>
    );
  }

  if (!connectedDatabase) return null;

  // Show permission warning if not allowed
  if (!canTryOpenApi) {
    return (
      <ApisContent>
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AccessRestricted
            message="Open API Restricted"
            description="You don't have permission to access OpenAPI documentation. Please contact the account owner to request access."
            permission="tryOpenApi"
          />
        </Box>
      </ApisContent>
    );
  }

  return (
    <ApisContent key={openApiRefreshKey}>
      <OpenApiPanel connectedDatabase={connectedDatabase} />
    </ApisContent>
  );
}
