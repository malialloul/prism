import { Box } from "@mui/material";
import { ApisContent } from "./OpenApi.styles";
import { OpenApiPanel } from "./OpenApiPanel";
import { useWorkspace } from "../../DashboardPage/DashboardLayout";
import { useApisContext } from "../ApisLayout";
import { usePermissions, AccessRestricted, OpenApiSkeleton } from "../../../components";

export default function OpenApi() {
  const workspace = useWorkspace();
  const { openApiRefreshKey } = useApisContext();
  const { canTryOpenApi } = usePermissions();

  // Show loading skeleton while context is loading or switching databases
  if (!workspace || workspace.isSwitchingDatabase) {
    return (
      <ApisContent>
        <OpenApiSkeleton />
      </ApisContent>
    );
  }

  const { connectedDatabase } = workspace;
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
