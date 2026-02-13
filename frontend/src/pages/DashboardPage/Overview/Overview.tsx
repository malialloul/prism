import { useWorkspace } from "../../../layout";
import {
  ContentHeader,
  ContentTitle,
  DashboardGrid,
  QuickActionsBar,
  QuickActionButton,
} from "./Overview.styles";
import ActiveDatabaseSummary from "./ActiveDatabaseSummary/ActiveDatabaseSummary";
import OverviewStatsCards from "./OverviewStatsCards/OverviewStatsCards";
import UsageCharts from "./UsageCharts/UsageCharts";

// Icons
import AddIcon from "@mui/icons-material/Add";
import LinkIcon from "@mui/icons-material/Link";
import { OverviewSkeleton } from "../../../components/Skeletons";

export default function Overview() {
  const workspace = useWorkspace();

  if (!workspace) {
    return <OverviewSkeleton />;
  }

  const {
    databases,
    selectedDatabaseId,
    selectedDatabase,
    isLoading,
    handleRefresh,
    handleDisconnect,
    handleConnectDatabase,
  } = workspace;

  const handleDeleteDatabase = (id: number) => {
    // This is handled by the layout, but we can trigger refresh
    handleRefresh(id);
  };

  if (isLoading) {
    return <OverviewSkeleton />;
  }

  return (
    <>
      <ContentHeader>
        <ContentTitle>Dashboard Overview</ContentTitle>
        <QuickActionsBar>
          <QuickActionButton
            variant="primary"
            onClick={() => toastService.info('Coming Soon')}
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
    </>
  );
}
