import { Box, Alert } from "@mui/material";
import { Link } from "react-router-dom";
import { ApisContent } from "./BuildQuery.styles";
import QueryWizardWrapper from "./QueryWizardWrapper/QueryWizardWrapper";
import { useWorkspace } from "../../../layout";
import { useApisContext } from "../../../layout";
import { usePermissions, AccessRestricted } from "../../../components";
import { useVersionLimits } from "../../../api/entities/auth";
import { ROUTES } from "../../../constants";

export default function BuildQuery() {
  const workspace = useWorkspace();
  const { triggerOpenApiRefresh } = useApisContext();
  const { canCreateApi } = usePermissions();
  const { data: versionData } = useVersionLimits();

  const limits = versionData?.data?.limits;
  const usage = versionData?.data?.usage;
  const isApiLimitReached = limits?.maxSavedApis && limits.maxSavedApis > 0 && usage && usage.savedApis >= limits.maxSavedApis;

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
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {isApiLimitReached && (
          <Alert 
            severity="warning" 
            sx={{ 
              borderRadius: 0,
              '& .MuiAlert-message': { width: '100%' }
            }}
          >
            You've reached your saved API limit ({usage?.savedApis}/{limits?.maxSavedApis}). 
            <Link to={ROUTES.LIMITS} style={{ marginLeft: 4, color: 'inherit', fontWeight: 600 }}>
              View Limits
            </Link>
          </Alert>
        )}
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <QueryWizardWrapper
            connectedDatabase={connectedDatabase}
            onApiSaved={triggerOpenApiRefresh}
          />
        </Box>
      </Box>
    </ApisContent>
  );
}
