import { Box } from "@mui/material";
import { ApisContent } from "./BuildQuery.styles";
import QueryWizardWrapper from "./QueryWizardWrapper/QueryWizardWrapper";
import { useWorkspace } from "../../DashboardPage/DashboardLayout";
import { useApisContext } from "../ApisLayout";
import { usePermissions, AccessRestricted, QueryWizardSkeleton } from "../../../components";

export default function BuildQuery() {
  const workspace = useWorkspace();
  const { triggerOpenApiRefresh } = useApisContext();
  const { canCreateApi } = usePermissions();

  // Show loading skeleton while context is loading or switching databases
  if (!workspace || workspace.isSwitchingDatabase) {
    return (
      <ApisContent>
        <QueryWizardSkeleton />
      </ApisContent>
    );
  }

  const { connectedDatabase } = workspace;
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
