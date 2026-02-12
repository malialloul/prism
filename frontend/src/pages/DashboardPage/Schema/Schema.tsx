import { useState } from "react";
import { Backdrop, Box, CircularProgress, Typography } from "@mui/material";
import { useWorkspace } from "../../../layout";
import {
  ContentHeader,
  ContentTitle,
  QuickActionsBar,
  QuickActionButton,
} from "./Schema.styles";
import { SchemaExplorer, ObjectDetailsPanel } from "./SchemaExplorer";
import { CreateTableDialog, AddColumnDialog, DeleteTableDialog, TableEditor } from "./TableEditor";

// Icons
import TableViewIcon from "@mui/icons-material/TableView";
import SchemaSkeleton from "../../../components/Skeletons/SchemaSkeleton";

type SelectedObjectType = 'table';

export default function Schema() {
  const workspace = useWorkspace();

  if (!workspace) {
    return <SchemaSkeleton />;
  }

  const { connectedDatabase, isLoading, setSchemaVersion } = workspace;

  // Schema Explorer state
  const [selectedObjectName, setSelectedObjectName] = useState<string | null>(null);
  const [selectedObjectType, setSelectedObjectType] = useState<SelectedObjectType>('table');

  // Table Management state
  const [isCreateTableDialogOpen, setIsCreateTableDialogOpen] = useState(false);
  const [isAddColumnDialogOpen, setIsAddColumnDialogOpen] = useState(false);
  const [isDeleteTableDialogOpen, setIsDeleteTableDialogOpen] = useState(false);
  const [isTableEditorOpen, setIsTableEditorOpen] = useState(false);
  const [tableToModify, setTableToModify] = useState<string | null>(null);

  // Import state (lifted from SchemaExplorer for full-page loading)
  const [isImporting, setIsImporting] = useState(false);

  // Show skeleton while loading
  if (isLoading) {
    return <SchemaSkeleton />;
  }

  // TypeScript safety - WorkspaceLayout handles redirect if no connected database
  if (!connectedDatabase) return null;

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
    setSchemaVersion?.(v => v + 1);
  };

  const handleTableCreated = () => {
    setSelectedObjectName(null);
    setSchemaVersion?.(v => v + 1);
  };

  const handleColumnAdded = () => {
    if (selectedObjectName) {
      handleSelectObject(selectedObjectName, selectedObjectType);
    }
    setSchemaVersion?.(v => v + 1);
  };

  const handleTableDeleted = () => {
    setSelectedObjectName(null);
    setTableToModify(null);
    setSchemaVersion?.(v => v + 1);
  };

  return (
    <>
      {/* Full-page Import Loading Overlay */}
      <Backdrop
        open={isImporting}
        sx={{
          position: 'fixed',
          zIndex: 1300,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <CircularProgress size={48} sx={{ color: 'white' }} />
        <Typography variant="h6" sx={{ color: 'white' }}>
          Importing SQL...
        </Typography>
      </Backdrop>

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

      <Box sx={{ display: 'flex', gap: '1.5rem', flexDirection: 'row', flex: 1 }} data-tour="schema-explorer-area">
        <SchemaExplorer
          databaseId={connectedDatabase.id}
          onSelectObject={handleSelectObject}
          onCreateTable={handleCreateTable}
          isImporting={isImporting}
          setIsImporting={setIsImporting}
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
      </Box>

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
