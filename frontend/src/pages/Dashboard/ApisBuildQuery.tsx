import { Box } from "@mui/material";
import { ApisContent } from "./ApisPage/ApisPage.styles";
import QueryBuilderImproved from "./ApisPage/QueryBuilder/QueryBuilderImproved";
import { useDashboard } from "./DashboardLayout";
import { useApisContext } from "./ApisLayout";
import { usePermissions, AccessRestricted } from "../../components";

export default function ApisBuildQuery() {
  const { connectedDatabase } = useDashboard();
  const { triggerOpenApiRefresh } = useApisContext();
  const { canCreateApi } = usePermissions();

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
      <QueryBuilderImproved
        connectedDatabase={connectedDatabase}
        onApiSaved={triggerOpenApiRefresh}
      />
    </ApisContent>
  );
}
