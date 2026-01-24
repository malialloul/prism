import { useState } from 'react';
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
} from './Dashboard.styles';
import Navbar from './Navbar/Navbar';
import Sidebar from './Sidebar/Sidebar';
import DatabaseActionsPanel from './DatabaseActionsPanel/DatabaseActionsPanel';
import ActiveDatabaseSummary from './ActiveDatabaseSummary/ActiveDatabaseSummary';
import OverviewStatsCards from './OverviewStatsCards/OverviewStatsCards';
import UsageCharts from './UsageCharts/UsageCharts';
import EmptyState from './EmptyState/EmptyState';

// Icons
import AddIcon from '@mui/icons-material/Add';
import LinkIcon from '@mui/icons-material/Link';

// Mock data - replace with real API data
const mockDatabases = [
  {
    id: '1',
    name: 'production-db',
    engine: 'postgres' as const,
    host: 'prod-db.example.com',
    status: 'connected' as const,
    lastSync: new Date(Date.now() - 1000 * 60 * 5),
    lastUsed: new Date(Date.now() - 1000 * 60 * 2),
    tables: 24,
    apis: 18,
    storage: '2.4 GB',
  },
  {
    id: '2',
    name: 'staging-db',
    engine: 'postgres' as const,
    host: 'staging-db.example.com',
    status: 'connected' as const,
    lastSync: new Date(Date.now() - 1000 * 60 * 30),
    lastUsed: new Date(Date.now() - 1000 * 60 * 15),
    tables: 24,
    apis: 12,
    storage: '1.1 GB',
  },
  {
    id: '3',
    name: 'analytics-mysql',
    engine: 'mysql' as const,
    host: 'analytics.example.com',
    status: 'disconnected' as const,
    lastSync: new Date(Date.now() - 1000 * 60 * 60 * 24),
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 2),
    tables: 8,
    apis: 5,
    storage: '856 MB',
  },
];

export type DatabaseEngine = 'postgres' | 'mysql';
export type ConnectionStatus = 'connected' | 'disconnected' | 'provisioning';

export interface Database {
  id: string;
  name: string;
  engine: DatabaseEngine;
  host: string;
  status: ConnectionStatus;
  lastSync: Date;
  lastUsed: Date;
  tables: number;
  apis: number;
  storage: string;
}

export default function Dashboard() {
  const [databases, setDatabases] = useState<Database[]>(mockDatabases);
  const [selectedDatabaseId, setSelectedDatabaseId] = useState<string>(mockDatabases[0]?.id || '');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false);

  const selectedDatabase = databases.find(db => db.id === selectedDatabaseId) || null;

  const handleSelectDatabase = (id: string) => {
    setSelectedDatabaseId(id);
  };

  const handleDisconnect = (id: string) => {
    setDatabases(prev => 
      prev.map(db => db.id === id ? { ...db, status: 'disconnected' as const } : db)
    );
  };

  const handleConnect = (id: string) => {
    setDatabases(prev => 
      prev.map(db => db.id === id ? { ...db, status: 'connected' as const } : db)
    );
  };

  const handleCreateDatabase = () => {
    setIsCreateDialogOpen(true);
  };

  const handleConnectDatabase = () => {
    setIsConnectDialogOpen(true);
  };

  const handleRefresh = () => {
    // TODO: Refresh data
    console.log('Refreshing...');
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
            onAddDatabase={handleCreateDatabase}
          />
          <DashboardContent>
            <EmptyState
              onCreatePostgres={handleCreateDatabase}
              onCreateMySQL={handleCreateDatabase}
              onConnect={handleConnectDatabase}
            />
          </DashboardContent>
        </DashboardBody>
        <DatabaseActionsPanel
          isCreateDialogOpen={isCreateDialogOpen}
          isConnectDialogOpen={isConnectDialogOpen}
          onOpenCreateDialog={() => setIsCreateDialogOpen(true)}
          onCloseCreateDialog={() => setIsCreateDialogOpen(false)}
          onOpenConnectDialog={() => setIsConnectDialogOpen(true)}
          onCloseConnectDialog={() => setIsConnectDialogOpen(false)}
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
          onAddDatabase={handleCreateDatabase}
        />
        <DashboardContent>
          <ContentHeader>
            <ContentTitle>
              Dashboard Overview
            </ContentTitle>
            <QuickActionsBar>
              <QuickActionButton variant="primary" onClick={handleCreateDatabase}>
                <AddIcon sx={{ fontSize: '1rem' }} />
                Create Database
              </QuickActionButton>
              <QuickActionButton onClick={handleConnectDatabase}>
                <LinkIcon sx={{ fontSize: '1rem' }} />
                Connect Existing
              </QuickActionButton>
            </QuickActionsBar>
          </ContentHeader>
          
          {selectedDatabase && (
            <ActiveDatabaseSummary 
              database={selectedDatabase}
              onDisconnect={() => handleDisconnect(selectedDatabase.id)}
              onRefresh={handleRefresh}
            />
          )}
          
          <OverviewStatsCards 
            databases={databases}
            selectedDatabaseId={selectedDatabaseId}
          />
          
          <DashboardGrid>
            <UsageCharts 
              selectedDatabaseId={selectedDatabaseId}
            />
          </DashboardGrid>
        </DashboardContent>
      </DashboardBody>
      <DatabaseActionsPanel
        isCreateDialogOpen={isCreateDialogOpen}
        isConnectDialogOpen={isConnectDialogOpen}
        onOpenCreateDialog={() => setIsCreateDialogOpen(true)}
        onCloseCreateDialog={() => setIsCreateDialogOpen(false)}
        onOpenConnectDialog={() => setIsConnectDialogOpen(true)}
        onCloseConnectDialog={() => setIsConnectDialogOpen(false)}
      />
    </DashboardWrapper>
  );
}
