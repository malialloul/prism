import { useNavigate } from "react-router-dom";
import { Box, Skeleton } from "@mui/material";
import { useWorkspace } from "../WorkspaceLayout";
import { ROUTES } from "../../../constants";
import { usePermissions, AccessRestricted } from "../../../components";
import {
  ContentHeader,
  ContentTitle,
  StyledTabs,
  StyledTab,
  TabPanel,
  TabsContainer,
} from "./Query.styles";
import { QueryEditor } from "./QueryEditor";

export default function Query() {
  const navigate = useNavigate();
  const workspace = useWorkspace();
  const { canRunQuery } = usePermissions();

  const connectedDatabase = workspace?.connectedDatabase;
  const isSwitchingDatabase = workspace?.isSwitchingDatabase;
  const schemaVersion = workspace?.schemaVersion;
  const initialQuery = workspace?.initialQuery;

  // Show loading skeleton while context is loading or switching databases
  if (!workspace || isSwitchingDatabase || !connectedDatabase) {
    return (
      <>
        <ContentHeader>
          <ContentTitle>Query Editor</ContentTitle>
        </ContentHeader>
        <TabsContainer>
          <StyledTabs value={2}>
            <StyledTab label="Overview" disabled />
            <StyledTab label="Schema" disabled />
            <StyledTab label="Query" />
            <StyledTab label="ER Diagram" disabled />
          </StyledTabs>
        </TabsContainer>
        <TabPanel>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: 'calc(100vh - 250px)' }}>
            {/* Query editor skeleton */}
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
            {/* Toolbar skeleton */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
            </Box>
            {/* Results skeleton */}
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 1 }} />
          </Box>
        </TabPanel>
      </>
    );
  }

  return (
    <>
      <ContentHeader>
        <ContentTitle>Query Editor</ContentTitle>
      </ContentHeader>

      <TabsContainer>
        <StyledTabs value={2} onChange={(_e, newValue) => {
          if (newValue === 0) navigate(ROUTES.DASHBOARD.OVERVIEW);
          if (newValue === 1) navigate(ROUTES.DASHBOARD.SCHEMA);
          if (newValue === 3) navigate(ROUTES.DASHBOARD.ER_DIAGRAM);
        }}>
          <StyledTab label="Overview" />
          <StyledTab label="Schema" />
          <StyledTab label="Query" />
          <StyledTab label="ER Diagram" />
        </StyledTabs>
      </TabsContainer>

      <TabPanel>
        {canRunQuery ? (
          <QueryEditor
            key={`query-editor-${connectedDatabase.id}-${schemaVersion}`}
            databaseId={connectedDatabase.id}
            engine={connectedDatabase.engine}
            initialQuery={initialQuery}
          />
        ) : (
          <AccessRestricted
            message="Query Access Restricted"
            description="You don't have permission to run queries. Please contact the account owner to request access."
            permission="runQuery"
          />
        )}
      </TabPanel>
    </>
  );
}
