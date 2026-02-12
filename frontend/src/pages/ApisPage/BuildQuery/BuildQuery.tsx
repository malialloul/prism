import { Box } from "@mui/material";
import { ApisContent } from "./BuildQuery.styles";
import QueryWizardWrapper from "./QueryWizardWrapper/QueryWizardWrapper";
import { useWorkspace } from "../../../layout";
import { useApisContext } from "../../../layout";
import { usePermissions, AccessRestricted } from "../../../components";

export default function BuildQuery() {
  const workspace = useWorkspace();
  const { triggerOpenApiRefresh } = useApisContext();
  const { canCreateApi } = usePermissions();

  if (!workspace) return null;

  const { connectedDatabase } = workspace;

  // TypeScript safety - WorkspaceLayout handles redirect if no connected database
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
