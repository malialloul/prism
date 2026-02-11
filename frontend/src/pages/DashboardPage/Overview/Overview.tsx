import { Box, Skeleton } from "@mui/material";
import { useWorkspace } from "../DashboardLayout";
import { ROUTES } from "../../../constants";
import {
  ContentHeader,
  ContentTitle,
  DashboardGrid,
  QuickActionsBar,
  QuickActionButton,
  StyledTabs,
  StyledTab,
  TabPanel,
  TabsContainer,
} from "./Overview.styles";
import ActiveDatabaseSummary from "./ActiveDatabaseSummary/ActiveDatabaseSummary";
import OverviewStatsCards from "./OverviewStatsCards/OverviewStatsCards";
import UsageCharts from "./UsageCharts/UsageCharts";
import { useNavigate } from "react-router-dom";

// Icons
import AddIcon from "@mui/icons-material/Add";
import LinkIcon from "@mui/icons-material/Link";

export default function Overview() {
  const navigate = useNavigate();
  const workspace = useWorkspace();

  // Show loading skeleton while context is loading
  if (!workspace) {
    return (
      <>
        <ContentHeader>
          <ContentTitle>Dashboard Overview</ContentTitle>
          <QuickActionsBar>
            <Skeleton variant="rectangular" width={140} height={36} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={140} height={36} sx={{ borderRadius: 1 }} />
          </QuickActionsBar>
        </ContentHeader>
        <TabsContainer>
          <StyledTabs value={0}>
            <StyledTab label="Overview" />
            <StyledTab label="Schema" disabled />
            <StyledTab label="Query" disabled />
            <StyledTab label="ER Diagram" disabled />
          </StyledTabs>
        </TabsContainer>
        <TabPanel>
          <DashboardGrid>
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
          </DashboardGrid>
        </TabPanel>
      </>
    );
  }

  const {
    databases,
    selectedDatabaseId,
    selectedDatabase,
    connectedDatabase,
    isSwitchingDatabase,
    handleRefresh,
    handleDisconnect,
    handleCreateDatabase,
    handleConnectDatabase,
  } = useWorkspace()!;

  const handleDeleteDatabase = (id: number) => {
    // This is handled by the layout, but we can trigger refresh
    handleRefresh(id);
  };

  // Show loading skeleton while switching databases
  if (isSwitchingDatabase) {
    return (
      <>
        <ContentHeader>
          <ContentTitle>Dashboard Overview</ContentTitle>
          <QuickActionsBar>
            <Skeleton variant="rectangular" width={140} height={36} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={140} height={36} sx={{ borderRadius: 1 }} />
          </QuickActionsBar>
        </ContentHeader>
        <TabsContainer>
          <StyledTabs value={0}>
            <StyledTab label="Overview" />
            <StyledTab label="Schema" disabled />
            <StyledTab label="Query" disabled />
            <StyledTab label="ER Diagram" disabled />
          </StyledTabs>
        </TabsContainer>
        <TabPanel>
          {/* Active Database Summary Skeleton */}
          <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2, mb: 2 }} />
          {/* Stats Cards Skeleton */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 2 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
            ))}
          </Box>
          {/* Charts Skeleton */}
          <DashboardGrid>
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
          </DashboardGrid>
        </TabPanel>
      </>
    );
  }

  return (
    <>
      <ContentHeader>
        <ContentTitle>Dashboard Overview</ContentTitle>
        <QuickActionsBar>
          <QuickActionButton
            variant="primary"
            onClick={() => handleCreateDatabase()}
          >
            <AddIcon sx={{ fontSize: "1rem" }} />
            Create Database
          </QuickActionButton>
          <QuickActionButton
            onClick={handleConnectDatabase}
          >
            <LinkIcon sx={{ fontSize: "1rem" }} />
            Connect Existing
          </QuickActionButton>
        </QuickActionsBar>
      </ContentHeader>

      <TabsContainer>
        <StyledTabs value={0} onChange={(_e, newValue) => {
          if (newValue === 1) navigate(ROUTES.DASHBOARD.SCHEMA);
          if (newValue === 2) navigate(ROUTES.DASHBOARD.QUERY);
          if (newValue === 3) navigate(ROUTES.DASHBOARD.ER_DIAGRAM);
        }}>
          <StyledTab label="Overview" />
          <StyledTab label="Schema" disabled={!connectedDatabase || isSwitchingDatabase} />
          <StyledTab label="Query" disabled={!connectedDatabase || isSwitchingDatabase} />
          <StyledTab label="ER Diagram" disabled={!connectedDatabase || isSwitchingDatabase} />
        </StyledTabs>
      </TabsContainer>

      <TabPanel>
        {selectedDatabase && selectedDatabase.status === 'connected' && (
          <ActiveDatabaseSummary
            database={selectedDatabase}
            onDisconnect={() => handleDisconnect(selectedDatabase.id)}
            onRefresh={() => handleRefresh(selectedDatabase.id)}
            onDelete={() => handleDeleteDatabase(selectedDatabase.id)}
          />
        )}

        <OverviewStatsCards
          databases={databases}
          selectedDatabaseId={selectedDatabase?.status === 'connected' ? selectedDatabaseId : null}
        />

        <DashboardGrid>
          <UsageCharts selectedDatabaseId={selectedDatabaseId} />
        </DashboardGrid>
      </TabPanel>
    </>
  );
}
