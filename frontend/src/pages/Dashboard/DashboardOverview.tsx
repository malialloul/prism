import { useDashboard } from "./DashboardLayout";
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
} from "./Dashboard.styles";
import ActiveDatabaseSummary from "./ActiveDatabaseSummary/ActiveDatabaseSummary";
import OverviewStatsCards from "./OverviewStatsCards/OverviewStatsCards";
import UsageCharts from "./UsageCharts/UsageCharts";
import { useNavigate } from "react-router-dom";

// Icons
import AddIcon from "@mui/icons-material/Add";
import LinkIcon from "@mui/icons-material/Link";

export default function DashboardOverview() {
  const navigate = useNavigate();
  const {
    databases,
    selectedDatabaseId,
    selectedDatabase,
    connectedDatabase,
    handleRefresh,
    handleDisconnect,
    handleCreateDatabase,
    handleConnectDatabase,
  } = useDashboard();

  const handleDeleteDatabase = (id: number) => {
    // This is handled by the layout, but we can trigger refresh
    handleRefresh(id);
  };

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
          if (newValue === 1) navigate('/dashboard/schema');
          if (newValue === 2) navigate('/dashboard/query');
        }}>
          <StyledTab label="Overview" />
          <StyledTab label="Schema" disabled={!connectedDatabase} />
          <StyledTab label="Query" disabled={!connectedDatabase} />
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
