import { Box } from "@mui/material";
import { ApisContent } from "./ApisPage/ApisPage.styles";
import { OpenApiPanel } from "./ApisPage/OpenApiPanel";
import { useDashboard } from "./DashboardLayout";
import { useApisContext } from "./ApisLayout";
import { usePermissions, AccessRestricted } from "../../components";

export default function ApisOpenApi() {
  const { connectedDatabase } = useDashboard();
  const { openApiRefreshKey } = useApisContext();
  const { canTryOpenApi } = usePermissions();

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
