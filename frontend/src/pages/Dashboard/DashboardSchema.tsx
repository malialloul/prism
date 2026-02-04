import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "./DashboardLayout";
import {
  ContentHeader,
  ContentTitle,
  QuickActionsBar,
  QuickActionButton,
  StyledTabs,
  StyledTab,
  TabPanel,
  TabsContainer,
} from "./Dashboard.styles";
import { SchemaExplorer, ObjectDetailsPanel } from "./SchemaExplorer";
import { CreateTableDialog, AddColumnDialog, DeleteTableDialog, TableEditor } from "./TableEditor";

// Icons
import TableViewIcon from "@mui/icons-material/TableView";

type SelectedObjectType = 'table';

export default function DashboardSchema() {
  const navigate = useNavigate();
  const {
    connectedDatabase,
    setSchemaVersion,
  } = useDashboard();

  // Schema Explorer state
  const [selectedObjectName, setSelectedObjectName] = useState<string | null>(null);
  const [selectedObjectType, setSelectedObjectType] = useState<SelectedObjectType>('table');

  // Table Management state
  const [isCreateTableDialogOpen, setIsCreateTableDialogOpen] = useState(false);
  const [isAddColumnDialogOpen, setIsAddColumnDialogOpen] = useState(false);
  const [isDeleteTableDialogOpen, setIsDeleteTableDialogOpen] = useState(false);
  const [isTableEditorOpen, setIsTableEditorOpen] = useState(false);
  const [tableToModify, setTableToModify] = useState<string | null>(null);

  // Redirect if no database connected
  if (!connectedDatabase) {
    return (
      <>
        <ContentHeader>
          <ContentTitle>Schema Explorer</ContentTitle>
        </ContentHeader>
        <TabsContainer>
          <StyledTabs value={1} onChange={(_e, newValue) => {
            if (newValue === 0) navigate('/dashboard/overview');
            if (newValue === 2) navigate('/dashboard/query');
            if (newValue === 3) navigate('/dashboard/er-diagram');
          }}>
            <StyledTab label="Overview" />
            <StyledTab label="Schema" />
            <StyledTab label="Query" disabled />
            <StyledTab label="ER Diagram" disabled />
          </StyledTabs>
        </TabsContainer>
        <TabPanel>
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            Please connect to a database to explore its schema.
          </div>
        </TabPanel>
      </>
    );
  }

  const handleSelectObject = (name: string, type: SelectedObjectType) => {
    setSelectedObjectName(name);
    setSelectedObjectType(type);
  };

  const handleCloseObjectDetails = () => {
    setSelectedObjectName(null);
  };

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
    setSchemaVersion(v => v + 1);
  };

  const handleTableCreated = () => {
    setSelectedObjectName(null);
    setSchemaVersion(v => v + 1);
  };

  const handleColumnAdded = () => {
    if (selectedObjectName) {
      handleSelectObject(selectedObjectName, selectedObjectType);
    }
    setSchemaVersion(v => v + 1);
  };

  const handleTableDeleted = () => {
    setSelectedObjectName(null);
    setTableToModify(null);
    setSchemaVersion(v => v + 1);
  };

  return (
    <>
      <ContentHeader>
        <ContentTitle>Schema Explorer</ContentTitle>
        <QuickActionsBar>
          <QuickActionButton
            variant="primary"
            onClick={handleCreateTable}
          >
            <TableViewIcon sx={{ fontSize: "1rem" }} />
            Create Table
          </QuickActionButton>
        </QuickActionsBar>
      </ContentHeader>

      <TabsContainer>
        <StyledTabs value={1} onChange={(_e, newValue) => {
          if (newValue === 0) navigate('/dashboard/overview');
          if (newValue === 2) navigate('/dashboard/query');
          if (newValue === 3) navigate('/dashboard/er-diagram');
        }}>
          <StyledTab label="Overview" />
          <StyledTab label="Schema" />
          <StyledTab label="Query" />
          <StyledTab label="ER Diagram" />
        </StyledTabs>
      </TabsContainer>

      <TabPanel sx={{ display: 'flex', gap: '1.5rem', flexDirection: 'row', flex: 1 }}>
        <SchemaExplorer
          databaseId={connectedDatabase.id}
          onSelectObject={handleSelectObject}
          onCreateTable={handleCreateTable}
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
          />
        )}
      </TabPanel>

      {/* Table Management Dialogs */}
      <CreateTableDialog
        open={isCreateTableDialogOpen}
        onClose={() => setIsCreateTableDialogOpen(false)}
        databaseId={connectedDatabase.id}
        engine={connectedDatabase.engine}
        onSuccess={handleTableCreated}
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
  );
}
