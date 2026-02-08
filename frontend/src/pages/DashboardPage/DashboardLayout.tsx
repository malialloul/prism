import { useState, useEffect, useRef, createContext, useContext } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  DashboardWrapper,
  DashboardHeader,
  DashboardBody,
  DashboardContent,
  SwitchingOverlay,
  SwitchingContent,
  SwitchingTitle,
  SwitchingSubtitle,
} from "./DashboardPage.styles";
import Navbar from "./_shared/Navbar/Navbar";
import Sidebar from "./_shared/Sidebar/Sidebar";
import DatabaseActionsPanel from "./_shared/DatabaseActionsPanel/DatabaseActionsPanel";
import DeleteDatabaseDialog from "./_shared/DeleteDatabaseDialog/DeleteDatabaseDialog";
import SwitchDatabaseDialog from "./_shared/SwitchDatabaseDialog/SwitchDatabaseDialog";
import EmptyState from "./_shared/EmptyState/EmptyState";
import PageSkeleton from "../../components/PageSkeleton/PageSkeleton";
import { AccessRestricted, usePermissions } from "../../components";
import { CircularProgress, Dialog, DialogContent, DialogActions, Button } from "@mui/material";
import { useDatabases, useRefreshDatabase, useDisconnectDatabase, useReconnectDatabase } from "../../api/entities/databases";
import { DatabaseDto } from "../../api/models/DatabaseDto";

// Context for sharing dashboard state with child routes
interface DashboardContextType {
  databases: DatabaseDto[];
  selectedDatabaseId: number | null;
  setSelectedDatabaseId: (id: number | null) => void;
  connectedDatabase: DatabaseDto | null;
  selectedDatabase: DatabaseDto | null;
  isSwitchingDatabase: boolean;
  handleRefresh: (id?: number) => void;
  handleDisconnect: (id: number) => void;
  handleCreateDatabase: (engine?: DatabaseDto['engine']) => void;
  handleConnectDatabase: () => void;
  schemaVersion: number;
  setSchemaVersion: React.Dispatch<React.SetStateAction<number>>;
  initialQuery: string;
  setInitialQuery: React.Dispatch<React.SetStateAction<string>>;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardLayout');
  }
  return context;
};

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active main tab from URL
  const getMainTabFromPath = () => {
    if (location.pathname.includes('/apis')) return 1;
    return 0; // Dashboard (overview, schema, query)
  };
  
  const mainTab = getMainTabFromPath();

  // Fetch databases from API
  const { data: databasesData, isLoading, refetch: refetchDatabases } = useDatabases();

  // Database mutations
  const { mutate: refreshDatabase } = useRefreshDatabase();
  const { mutate: disconnectDatabase } = useDisconnectDatabase();
  const { mutate: reconnectDatabase } = useReconnectDatabase();

  // Get databases from API
  const databases: DatabaseDto[] = databasesData?.databases || [];

  const [selectedDatabaseId, setSelectedDatabaseId] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [databaseToDelete, setDatabaseToDelete] = useState<DatabaseDto | null>(null);
  const [isSwitchDialogOpen, setIsSwitchDialogOpen] = useState(false);
  const [databaseToSwitchTo, setDatabaseToSwitchTo] = useState<DatabaseDto | null>(null);
  const [isSwitchingDatabase, setIsSwitchingDatabase] = useState(false);
  const [pendingSwitchDatabaseId, setPendingSwitchDatabaseId] = useState<number | null>(null);
  const [initialCreateEngine, setInitialCreateEngine] = useState<DatabaseDto['engine'] | undefined>(undefined);
  const [isAccessRestrictedDialogOpen, setIsAccessRestrictedDialogOpen] = useState(false);

  // Permission check
  const { canConnectDatabase } = usePermissions();

  // Schema version and initial query for child routes
  const [schemaVersion, setSchemaVersion] = useState(0);
  const [initialQuery, setInitialQuery] = useState<string>('');

  // Track if we've already auto-refreshed on mount
  const hasAutoRefreshed = useRef(false);
  

  // Get the currently connected database
  const connectedDatabase = databases.find((db) => db.status === 'connected') || null;

  // Redirect to overview if trying to access protected routes without a connected database
  useEffect(() => {
    if (!isLoading && !connectedDatabase) {
      const protectedPaths = ['/apis', '/schema', '/query', '/er-diagram'];
      const isProtectedRoute = protectedPaths.some(path => location.pathname.includes(path));
      if (isProtectedRoute) {
        navigate('/dashboard/overview', { replace: true });
      }
    }
  }, [isLoading, connectedDatabase, location.pathname, navigate]);

  // Watch for when the pending database becomes connected after switching
  useEffect(() => {
    if (pendingSwitchDatabaseId && isSwitchingDatabase) {
      const targetDb = databases.find((db) => db.id === pendingSwitchDatabaseId);
      if (targetDb && targetDb.status === 'connected') {
        setIsSwitchingDatabase(false);
        setPendingSwitchDatabaseId(null);
      }
    }
  }, [databases, pendingSwitchDatabaseId, isSwitchingDatabase]);

  // Auto-refresh connected databases on mount
  useEffect(() => {
    if (!hasAutoRefreshed.current && databases.length > 0) {
      hasAutoRefreshed.current = true;
      databases
        .filter((db) => db.status === 'connected')
        .forEach((db) => refreshDatabase(db.id));
    }
  }, [databases, refreshDatabase]);

  // Auto-select last connected database on initial load
  useEffect(() => {
    if (databases.length > 0 && selectedDatabaseId === null) {
      const lastConnected = databases.reduce((latest, db) => {
        if (!latest) return db;
        return db.lastConnectedAt > latest.lastConnectedAt ? db : latest;
      }, databases[0]);
      setSelectedDatabaseId(lastConnected.id);
    }
  }, [databases, selectedDatabaseId]);

  const selectedDatabase = databases.find((db) => db.id === selectedDatabaseId) || null;

  const handleMainTabChange = (tab: number) => {
    if (tab === 0) {
      navigate('/dashboard/overview');
    } else if (tab === 1) {
      navigate('/dashboard/apis');
    }
  };

  const handleRefresh = (id?: number) => {
    if (id) {
      refreshDatabase(id);
    } else {
      refetchDatabases();
      databases
        .filter((db) => db.status === 'connected')
        .forEach((db) => refreshDatabase(db.id));
    }
  };

  const handleDisconnect = (id: number) => {
    disconnectDatabase(id);
  };

  const handleSelectDatabase = (id: number) => {
    const targetDb = databases.find((db) => db.id === id);
    if (!targetDb) return;

    if (targetDb.status !== 'connected') {
      // Check permission before attempting to connect
      if (!canConnectDatabase) {
        setIsAccessRestrictedDialogOpen(true);
        return;
      }
      if (connectedDatabase && connectedDatabase.id !== id) {
        setDatabaseToSwitchTo(targetDb);
        setIsSwitchDialogOpen(true);
      } else {
        setSelectedDatabaseId(id);
        reconnectDatabase(id);
      }
    } else {
      setSelectedDatabaseId(id);
    }
  };

  const handleDeleteDatabase = (id: number) => {
    const db = databases.find((d) => d.id === id);
    if (db) {
      setDatabaseToDelete(db);
      setIsDeleteDialogOpen(true);
    }
  };

  const handleDatabaseDeleted = () => {
    setIsDeleteDialogOpen(false);
    setDatabaseToDelete(null);
    if (selectedDatabaseId === databaseToDelete?.id) {
      setSelectedDatabaseId(null);
    }
    refetchDatabases();
  };

  const handleCreateDatabase = (engine?: DatabaseDto['engine']) => {
    setInitialCreateEngine(engine);
    setIsCreateDialogOpen(true);
  };

  const handleConnectDatabase = () => {
    setIsConnectDialogOpen(true);
  };

  const handleDatabaseConnected = async (databaseId?: number) => {
    // Refetch databases and wait for it to complete
    await refetchDatabases();
    // If a database ID is provided, select it
    if (databaseId) {
      setSelectedDatabaseId(databaseId);
    }
  };

  const handleSwitchingStart = () => {
    setIsSwitchingDatabase(true);
  };

  const handleSwitched = () => {
    if (databaseToSwitchTo) {
      setSelectedDatabaseId(databaseToSwitchTo.id);
      // Track which database we're waiting for to become connected
      setPendingSwitchDatabaseId(databaseToSwitchTo.id);
    }
    setIsSwitchDialogOpen(false);
    setDatabaseToSwitchTo(null);
    // Keep isSwitchingDatabase true - it will be set to false by the useEffect
    // when the target database becomes connected
    refetchDatabases();
  };

  const handleSwitchCancelled = () => {
    setIsSwitchDialogOpen(false);
    setDatabaseToSwitchTo(null);
    setIsSwitchingDatabase(false);
    setPendingSwitchDatabaseId(null);
  };

  const hasNoDatabases = databases.length === 0;

  // Show skeleton while loading
  if (isLoading) {
    return <PageSkeleton variant="dashboard" count={3} />;
  }

  const contextValue: DashboardContextType = {
    databases,
    selectedDatabaseId,
    setSelectedDatabaseId,
    connectedDatabase,
    selectedDatabase,
    isSwitchingDatabase,
    handleRefresh,
    handleDisconnect,
    handleCreateDatabase,
    handleConnectDatabase,
    schemaVersion,
    setSchemaVersion,
    initialQuery,
    setInitialQuery,
  };

  // Show empty state when no databases exist
  if (hasNoDatabases) {
    return (
      <DashboardContext.Provider value={contextValue}>
        <DashboardWrapper>
          <DashboardHeader>
            <Navbar
              onRefresh={() => handleRefresh()}
              activeMainTab={mainTab}
              onMainTabChange={handleMainTabChange}
              hasConnectedDatabase={!!connectedDatabase}
            />
          </DashboardHeader>
          <DashboardBody>
            <Sidebar
              databases={databases}
              selectedId={selectedDatabaseId}
              onSelect={handleSelectDatabase}
              onDisconnect={handleDisconnect}
              onDelete={handleDeleteDatabase}
              onAddDatabase={handleCreateDatabase}
            />
            <DashboardContent>
              {mainTab === 0 ? (
                <EmptyState
                  onCreatePostgres={() => handleCreateDatabase("postgres")}
                  onCreateMySQL={() => handleCreateDatabase("mysql")}
                  onConnect={handleConnectDatabase}
                />
              ) : (
                <Outlet />
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
        </DashboardWrapper>
      </DashboardContext.Provider>
    );
  }

  return (
    <DashboardContext.Provider value={contextValue}>
      <DashboardWrapper>
        <DashboardHeader>
          <Navbar
            onRefresh={() => handleRefresh()}
            activeMainTab={mainTab}
            onMainTabChange={handleMainTabChange}
            hasConnectedDatabase={!!connectedDatabase}
          />
        </DashboardHeader>
        <DashboardBody>
          <Sidebar
            databases={databases}
            selectedId={selectedDatabaseId}
            onSelect={handleSelectDatabase}
            onDisconnect={handleDisconnect}
            onDelete={handleDeleteDatabase}
            onAddDatabase={handleCreateDatabase}
          />
          <DashboardContent>
            <Outlet />
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
          onClose={handleSwitchCancelled}
          onSwitchingStart={handleSwitchingStart}
          onSwitched={handleSwitched}
        />
        {/* Switching Database Overlay */}
        {isSwitchingDatabase && (
          <SwitchingOverlay>
            <SwitchingContent>
              <CircularProgress size={48} />
              <SwitchingTitle>Switching Database</SwitchingTitle>
              <SwitchingSubtitle>
                Connecting to {databaseToSwitchTo?.name || 'database'}...
              </SwitchingSubtitle>
            </SwitchingContent>
          </SwitchingOverlay>
        )}
        {/* Access Restricted Dialog */}
        <Dialog
          open={isAccessRestrictedDialogOpen}
          onClose={() => setIsAccessRestrictedDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogContent>
            <AccessRestricted
              message="Connect Database Restricted"
              description="You don't have permission to connect to databases. Please contact the account owner to request access."
              permission="connectDatabase"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsAccessRestrictedDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </DashboardWrapper>
    </DashboardContext.Provider>
  );
}
