import { useState, useEffect, useRef } from "react";
import {
  DashboardWrapper,
  DashboardHeader,
  DashboardBody,
  DashboardContent,
  ContentHeader,
  ContentTitle,
  DashboardGrid,
  QuickActionsBar,
  QuickActionButton,
} from "./Dashboard.styles";
import Navbar from "./Navbar/Navbar";
import Sidebar from "./Sidebar/Sidebar";
import DatabaseActionsPanel from "./DatabaseActionsPanel/DatabaseActionsPanel";
import ActiveDatabaseSummary from "./ActiveDatabaseSummary/ActiveDatabaseSummary";
import OverviewStatsCards from "./OverviewStatsCards/OverviewStatsCards";
import UsageCharts from "./UsageCharts/UsageCharts";
import EmptyState from "./EmptyState/EmptyState";
import DeleteDatabaseDialog from "./DeleteDatabaseDialog/DeleteDatabaseDialog";
import SwitchDatabaseDialog from "./SwitchDatabaseDialog/SwitchDatabaseDialog";
import { useDatabases, useRefreshDatabase, useDisconnectDatabase, useReconnectDatabase } from "../../api/entities/databases";

// Icons
import AddIcon from "@mui/icons-material/Add";
import LinkIcon from "@mui/icons-material/Link";
import { DatabaseDto } from "../../api/models/DatabaseDto";

export default function Dashboard() {
  // Fetch databases from API
  const { data: databasesData, refetch: refetchDatabases } = useDatabases();

  // Refresh database mutation
  const { mutate: refreshDatabase } = useRefreshDatabase();

  // Disconnect database mutation
  const { mutate: disconnectDatabase } = useDisconnectDatabase();

  // Reconnect database mutation
  const { mutate: reconnectDatabase } = useReconnectDatabase();

  // Get databases from API
  const databases: DatabaseDto[] = databasesData?.databases || [];

  const [selectedDatabaseId, setSelectedDatabaseId] = useState<string>("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [databaseToDelete, setDatabaseToDelete] = useState<DatabaseDto | null>(
    null,
  );
  const [isSwitchDialogOpen, setIsSwitchDialogOpen] = useState(false);
  const [databaseToSwitchTo, setDatabaseToSwitchTo] = useState<DatabaseDto | null>(
    null,
  );
  const [initialCreateEngine, setInitialCreateEngine] = useState<
    DatabaseDto['engine'] | undefined
  >(undefined);

  // Track if we've already auto-refreshed on mount
  const hasAutoRefreshed = useRef(false);

  // Get the currently connected database
  const connectedDatabase = databases.find((db) => db.status === 'connected') || null;

  // Auto-refresh connected databases on mount to get fresh stats
  useEffect(() => {
    if (!hasAutoRefreshed.current && databases.length > 0) {
      hasAutoRefreshed.current = true;
      // Refresh all connected databases to get latest stats
      databases
        .filter((db) => db.status === 'connected')
        .forEach((db) => refreshDatabase(db.id));
    }
  }, [databases, refreshDatabase]);

  // Auto-select last connected database when data loads
  useEffect(() => {
    if (databases.length > 0 && !selectedDatabaseId) {
      // Find the most recently connected database
      const lastConnected = databases.reduce((latest, db) => {
        if (!latest) return db;
        return db.lastConnectedAt > latest.lastConnectedAt ? db : latest;
      }, databases[0]);
      setSelectedDatabaseId(lastConnected.id);
    }
  }, [databases, selectedDatabaseId]);

  const selectedDatabase =
    databases.find((db) => db.id === selectedDatabaseId) || null;

  const handleSelectDatabase = (id: string) => {
    const targetDb = databases.find((db) => db.id === id);
    if (!targetDb) return;

    // If selecting a different database and one is already connected, show switch dialog
    if (connectedDatabase && connectedDatabase.id !== id && targetDb.status !== 'connected') {
      setDatabaseToSwitchTo(targetDb);
      setIsSwitchDialogOpen(true);
    } else if (targetDb.status !== 'connected') {
      // No database connected, just connect to the selected one
      reconnectDatabase(id);
      setSelectedDatabaseId(id);
    } else {
      // Already connected to this database, just select it
      setSelectedDatabaseId(id);
    }
  };

  const handleDisconnect = (id: string) => {
    disconnectDatabase(id);
  };

  const handleConnect = (id: string) => {
    const targetDb = databases.find((db) => db.id === id);
    if (!targetDb) return;

    // If another database is already connected, show switch dialog
    if (connectedDatabase && connectedDatabase.id !== id) {
      setDatabaseToSwitchTo(targetDb);
      setIsSwitchDialogOpen(true);
    } else {
      reconnectDatabase(id);
      setSelectedDatabaseId(id);
    }
  };

  const handleSwitched = (newDatabaseId: string) => {
    setSelectedDatabaseId(newDatabaseId);
    setDatabaseToSwitchTo(null);
  };

  const handleCreateDatabase = (engine?: DatabaseDto['engine']) => {
    setInitialCreateEngine(engine);
    setIsCreateDialogOpen(true);
  };

  const handleConnectDatabase = () => {
    setIsConnectDialogOpen(true);
  };

  const handleDatabaseConnected = (databaseId: string) => {
    setSelectedDatabaseId(databaseId);
  };

  const handleDeleteDatabase = (id?: string) => {
    const dbId = id || selectedDatabaseId;
    const dbToDelete = databases.find((db) => db.id === dbId);
    if (dbToDelete) {
      setDatabaseToDelete(dbToDelete);
      setIsDeleteDialogOpen(true);
    }
  };

  const handleDatabaseDeleted = () => {
    // After deletion, select the last connected database or clear selection
    const deletedId = databaseToDelete?.id;
    const remainingDatabases = databases.filter((db) => db.id !== deletedId);
    if (remainingDatabases.length > 0) {
      const lastConnected = remainingDatabases.reduce((latest, db) => {
        if (!latest) return db;
        return db.lastConnectedAt > latest.lastConnectedAt ? db : latest;
      }, remainingDatabases[0]);
      setSelectedDatabaseId(lastConnected.id);
    } else {
      setSelectedDatabaseId("");
    }
    setDatabaseToDelete(null);
  };

  const handleRefresh = (databaseId?: string) => {
    const idToRefresh = databaseId || selectedDatabaseId;
    if (idToRefresh) {
      refreshDatabase(idToRefresh);
    } else {
      refetchDatabases();
    }
  };

  const hasNoDatabases = databases.length === 0;

  if (hasNoDatabases) {
    return (
      <DashboardWrapper>
        <DashboardHeader>
          <Navbar onRefresh={handleRefresh} />
        </DashboardHeader>
        <DashboardBody>
          <Sidebar
            databases={databases}
            selectedId={selectedDatabaseId}
            onSelect={handleSelectDatabase}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            onDelete={handleDeleteDatabase}
            onAddDatabase={handleCreateDatabase}
          />
          <DashboardContent>
            <EmptyState
              onCreatePostgres={() => handleCreateDatabase("postgres")}
              onCreateMySQL={() => handleCreateDatabase("mysql")}
              onConnect={handleConnectDatabase}
            />
          </DashboardContent>
        </DashboardBody>
        <DatabaseActionsPanel
          isCreateDialogOpen={isCreateDialogOpen}
          isConnectDialogOpen={isConnectDialogOpen}
          initialCreateEngine={initialCreateEngine}
          onOpenCreateDialog={() => setIsCreateDialogOpen(true)}
          onCloseCreateDialog={() => {
            setIsCreateDialogOpen(false);
            setInitialCreateEngine(undefined);
          }}
          onOpenConnectDialog={() => setIsConnectDialogOpen(true)}
          onCloseConnectDialog={() => setIsConnectDialogOpen(false)}
          onDatabaseConnected={handleDatabaseConnected}
        />
      </DashboardWrapper>
    );
  }

  return (
    <DashboardWrapper>
      <DashboardHeader>
        <Navbar onRefresh={handleRefresh} />
      </DashboardHeader>
      <DashboardBody>
        <Sidebar
          databases={databases}
          selectedId={selectedDatabaseId}
          onSelect={handleSelectDatabase}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          onDelete={handleDeleteDatabase}
          onAddDatabase={handleCreateDatabase}
        />
        <DashboardContent>
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
              <QuickActionButton onClick={handleConnectDatabase}>
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
            selectedDatabaseId={selectedDatabase?.status === 'connected' ? selectedDatabaseId : ''}
          />

          <DashboardGrid>
            <UsageCharts selectedDatabaseId={selectedDatabaseId} />
          </DashboardGrid>
        </DashboardContent>
      </DashboardBody>
      <DatabaseActionsPanel
        isCreateDialogOpen={isCreateDialogOpen}
        isConnectDialogOpen={isConnectDialogOpen}
        initialCreateEngine={initialCreateEngine}
        onOpenCreateDialog={() => setIsCreateDialogOpen(true)}
        onCloseCreateDialog={() => {
          setIsCreateDialogOpen(false);
          setInitialCreateEngine(undefined);
        }}
        onOpenConnectDialog={() => setIsConnectDialogOpen(true)}
        onCloseConnectDialog={() => setIsConnectDialogOpen(false)}
        onDatabaseConnected={handleDatabaseConnected}
      />
      <DeleteDatabaseDialog
        open={isDeleteDialogOpen}
        database={databaseToDelete}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setDatabaseToDelete(null);
        }}
        onDeleted={handleDatabaseDeleted}
      />
      <SwitchDatabaseDialog
        open={isSwitchDialogOpen}
        currentDatabase={connectedDatabase}
        targetDatabase={databaseToSwitchTo}
        onClose={() => {
          setIsSwitchDialogOpen(false);
          setDatabaseToSwitchTo(null);
        }}
        onSwitched={handleSwitched}
      />
    </DashboardWrapper>
  );
}
