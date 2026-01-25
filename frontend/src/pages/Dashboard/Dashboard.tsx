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
  StyledTabs,
  StyledTab,
  TabPanel,
  TabsContainer,
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
import { SchemaExplorer, ObjectDetailsPanel } from "./SchemaExplorer";
import { QueryEditor } from "./QueryEditor";
import { CreateTableDialog, CreateViewDialog, AddColumnDialog, DeleteTableDialog, TableEditor } from "./TableEditor";
import { useDatabases, useRefreshDatabase, useDisconnectDatabase, useReconnectDatabase } from "../../api/entities/databases";
import { toastService } from "../../services";

// Icons
import AddIcon from "@mui/icons-material/Add";
import LinkIcon from "@mui/icons-material/Link";
import TableViewIcon from "@mui/icons-material/TableView";
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
  
  // Dashboard tab state
  const [activeTab, setActiveTab] = useState(0);
  
  // Schema Explorer state
  const [selectedObjectName, setSelectedObjectName] = useState<string | null>(null);
  const [selectedObjectType, setSelectedObjectType] = useState<'table' | 'view' | 'index' | 'procedure' | 'function'>('table');
  
  // Table Management state
  const [isCreateTableDialogOpen, setIsCreateTableDialogOpen] = useState(false);
  const [isCreateViewDialogOpen, setIsCreateViewDialogOpen] = useState(false);
  const [isAddColumnDialogOpen, setIsAddColumnDialogOpen] = useState(false);
  const [isDeleteTableDialogOpen, setIsDeleteTableDialogOpen] = useState(false);
  const [isTableEditorOpen, setIsTableEditorOpen] = useState(false);
  const [tableToModify, setTableToModify] = useState<string | null>(null);

  // Schema version to trigger query result refresh when schema changes
  const [schemaVersion, setSchemaVersion] = useState(0);

  // Initial query to populate in QueryEditor (e.g., from "Query View" action)
  const [initialQuery, setInitialQuery] = useState<string>('');

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

    // Clear selected schema object when switching databases
    setSelectedObjectName(null);

    // If selecting a different database that's not connected
    if (targetDb.status !== 'connected') {
      // If another database is already connected, show switch dialog
      if (connectedDatabase && connectedDatabase.id !== id) {
        setDatabaseToSwitchTo(targetDb);
        setIsSwitchDialogOpen(true);
      } else {
        // No database connected, just connect directly
        setSelectedDatabaseId(id);
        reconnectDatabase(id, {
          onSuccess: () => {
            refreshDatabase(id);
          }
        });
      }
    } else {
      // Already connected, just select it
      setSelectedDatabaseId(id);
    }
  };

  const handleDisconnect = (id: string) => {
    disconnectDatabase(id);
    setActiveTab(0); // Go back to Overview tab
    setSelectedObjectName(null); // Clear any selected object
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
    setInitialCreateEngine(engine || 'postgres');
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
    
    // Reset schema states and go to Overview tab
    setSelectedObjectName(null);
    setActiveTab(0);
  };

  const handleRefresh = (databaseId?: string) => {
    const idToRefresh = databaseId || selectedDatabaseId;
    if (idToRefresh) {
      refreshDatabase(idToRefresh);
    } else {
      refetchDatabases();
    }
  };

  // Schema Explorer handlers
  const handleSelectObject = (name: string, type: 'table' | 'view' | 'index' | 'procedure' | 'function') => {
    setSelectedObjectName(name);
    setSelectedObjectType(type);
  };

  const handleCloseObjectDetails = () => {
    setSelectedObjectName(null);
  };

  // Table Management handlers
  const handleCreateTable = () => {
    setIsCreateTableDialogOpen(true);
  };

  const handleAddColumn = (tableName: string) => {
    setTableToModify(tableName);
    setIsAddColumnDialogOpen(true);
  };

  const handleDeleteTable = (tableName: string) => {
    setTableToModify(tableName);
    setIsDeleteTableDialogOpen(true);
  };

  const handleEditTable = (tableName: string) => {
    setTableToModify(tableName);
    setIsTableEditorOpen(true);
  };

  const handleTableDataChanged = () => {
    setSchemaVersion(v => v + 1); // Invalidate query results
  };

  const handleTableCreated = () => {
    // Refresh schema and show success
    setSelectedObjectName(null);
    setSchemaVersion(v => v + 1); // Invalidate query results
  };

  const handleColumnAdded = () => {
    // Refresh to update object details
    if (selectedObjectName) {
      handleSelectObject(selectedObjectName, selectedObjectType);
    }
    setSchemaVersion(v => v + 1); // Invalidate query results
  };

  const handleTableDeleted = () => {
    setSelectedObjectName(null);
    setTableToModify(null);
    setSchemaVersion(v => v + 1); // Invalidate query results
  };

  const handleQueryView = (viewName: string, query: string) => {
    // Set the query to be populated in QueryEditor
    const selectQuery = query || `SELECT * FROM ${viewName}`;
    setInitialQuery(selectQuery);
    // Switch to Query Editor tab
    setActiveTab(2);
  };

  const handleDeleteView = (viewName: string) => {
    setTableToModify(viewName);
    setIsDeleteTableDialogOpen(true); // Reuse delete dialog for views
  };

  const handleCreateView = () => {
    setIsCreateViewDialogOpen(true);
  };

  const handleViewCreated = () => {
    setSchemaVersion(v => v + 1); // Refresh schema to show new view
    toastService.success('View created successfully');
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
            <ContentTitle>
              {activeTab === 0 && 'Dashboard Overview'}
              {activeTab === 1 && 'Schema Explorer'}
              {activeTab === 2 && 'Query Editor'}
            </ContentTitle>
            <QuickActionsBar>
              {activeTab === 0 && (
                <>
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
                </>
              )}
              {activeTab === 1 && connectedDatabase && (
                <QuickActionButton
                  variant="primary"
                  onClick={handleCreateTable}
                >
                  <TableViewIcon sx={{ fontSize: "1rem" }} />
                  Create Table
                </QuickActionButton>
              )}
            </QuickActionsBar>
          </ContentHeader>

          <TabsContainer>
            <StyledTabs
              value={activeTab}
              onChange={(_e, newValue) => setActiveTab(newValue)}
            >
              <StyledTab label="Overview" />
              <StyledTab label="Schema" disabled={!connectedDatabase} />
              <StyledTab label="Query" disabled={!connectedDatabase} />
            </StyledTabs>
          </TabsContainer>

          {/* Overview Tab */}
          {activeTab === 0 && (
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
                selectedDatabaseId={selectedDatabase?.status === 'connected' ? selectedDatabaseId : ''}
              />

              <DashboardGrid>
                <UsageCharts selectedDatabaseId={selectedDatabaseId} />
              </DashboardGrid>
            </TabPanel>
          )}

          {/* Schema Explorer Tab */}
          {activeTab === 1 && connectedDatabase && (
            <TabPanel sx={{ display: 'flex', gap: '1.5rem', flexDirection: 'row', flex: 1 }}>
              <SchemaExplorer
                databaseId={connectedDatabase.id}
                onSelectObject={handleSelectObject}
                onCreateTable={handleCreateTable}
                onCreateView={handleCreateView}
              />
              {selectedObjectName && (
                <ObjectDetailsPanel
                  databaseId={connectedDatabase.id}
                  objectName={selectedObjectName}
                  objectType={selectedObjectType}
                  engine={connectedDatabase.engine}
                  onClose={handleCloseObjectDetails}
                  onAddColumn={handleAddColumn}
                  onEditTable={handleEditTable}
                  onDeleteTable={handleDeleteTable}
                  onNavigateToTable={(tableName) => handleSelectObject(tableName, 'table')}
                  onQueryView={handleQueryView}
                  onDeleteView={handleDeleteView}
                />
              )}
            </TabPanel>
          )}

          {/* Query Editor Tab */}
          {activeTab === 2 && connectedDatabase && (
            <TabPanel>
              <QueryEditor
                key={`query-editor-${connectedDatabase.id}-${schemaVersion}`}
                databaseId={connectedDatabase.id}
                engine={connectedDatabase.engine}
                initialQuery={initialQuery}
              />
            </TabPanel>
          )}
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
      
      {/* Table Management Dialogs */}
      {connectedDatabase && (
        <>
          <CreateTableDialog
            open={isCreateTableDialogOpen}
            onClose={() => setIsCreateTableDialogOpen(false)}
            databaseId={connectedDatabase.id}
            engine={connectedDatabase.engine}
            onSuccess={handleTableCreated}
          />
          <CreateViewDialog
            open={isCreateViewDialogOpen}
            onClose={() => setIsCreateViewDialogOpen(false)}
            databaseId={connectedDatabase.id}
            engine={connectedDatabase.engine}
            onSuccess={handleViewCreated}
          />
          {tableToModify && (
            <>
              <AddColumnDialog
                open={isAddColumnDialogOpen}
                onClose={() => {
                  setIsAddColumnDialogOpen(false);
                  setTableToModify(null);
                }}
                databaseId={connectedDatabase.id}
                tableName={tableToModify}
                engine={connectedDatabase.engine}
                onSuccess={handleColumnAdded}
              />
              <DeleteTableDialog
                open={isDeleteTableDialogOpen}
                onClose={() => {
                  setIsDeleteTableDialogOpen(false);
                  setTableToModify(null);
                }}
                databaseId={connectedDatabase.id}
                tableName={tableToModify}
                onSuccess={handleTableDeleted}
              />
              <TableEditor
                open={isTableEditorOpen}
                onClose={() => {
                  setIsTableEditorOpen(false);
                  setTableToModify(null);
                }}
                databaseId={connectedDatabase.id}
                tableName={tableToModify || ''}
                engine={connectedDatabase.engine}
                onDataChanged={handleTableDataChanged}
              />
            </>
          )}
        </>
      )}
    </DashboardWrapper>
  );
}
