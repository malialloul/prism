import { CircularProgress, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import StorageIcon from '@mui/icons-material/Storage';
import LinkIcon from '@mui/icons-material/Link';
import { useTableDetails } from '../../../../api/entities/schema';
import type { SchemaObjectType, TableDetailsDto } from '../../../../api/models/SchemaDto';
import { DatabaseDto } from '../../../../api/models/DatabaseDto';
import {
  DetailsPanel,
  DetailsPanelHeader,
  DetailsTitle,
  DetailsTitleText,
  TypeBadge,
  DetailsPanelContent,
  DetailsSection,
  DetailsSectionTitle,
  ColumnsTable,
  ColumnBadge,
  ActionButton,
  TableActionsBar,
  TableActionButton,
  EmptyState,
  StatRow,
  StatItem,
  ForeignKeyLink,
} from './ObjectDetailsPanel.styles';

interface ObjectDetailsPanelProps {
  databaseId: string | undefined;
  objectName: string | undefined;
  objectType: SchemaObjectType | undefined;
  engine?: DatabaseDto['engine'];
  onClose?: () => void;
  onEditTable?: (tableName: string) => void;
  onDeleteTable?: (tableName: string) => void;
  onAddColumn?: (tableName: string) => void;
  onNavigateToTable?: (tableName: string) => void;
}

export default function ObjectDetailsPanel({
  databaseId,
  objectName,
  objectType,
  engine: _engine,
  onClose,
  onEditTable,
  onDeleteTable,
  onAddColumn,
  onNavigateToTable,
}: ObjectDetailsPanelProps) {
  const { data: tableData, isLoading: tableLoading } = useTableDetails(
    objectType === 'table' ? databaseId : undefined,
    objectType === 'table' ? objectName : undefined
  );

  const table = tableData?.table;

  if (!databaseId || !objectName || !objectType) {
    return (
      <DetailsPanel>
        <DetailsPanelHeader>
          <DetailsTitle>
            <DetailsTitleText>Object Details</DetailsTitleText>
          </DetailsTitle>
        </DetailsPanelHeader>
        <EmptyState>
          <StorageIcon />
          <span>Select an object from the schema explorer</span>
        </EmptyState>
      </DetailsPanel>
    );
  }

  const isLoading = objectType === 'table' && tableLoading;

  return (
    <DetailsPanel>
      <DetailsPanelHeader>
        <DetailsTitle>
          <DetailsTitleText>{objectName}</DetailsTitleText>
          <TypeBadge type={objectType}>{objectType}</TypeBadge>
        </DetailsTitle>
        {onClose && (
          <Tooltip title="Close">
            <ActionButton onClick={onClose} size="small">
              <CloseIcon sx={{ fontSize: '1rem' }} />
            </ActionButton>
          </Tooltip>
        )}
      </DetailsPanelHeader>
      
      {objectType === 'table' && (
        <TableActionsBar>
          <Tooltip title="Add a new column to this table">
            <TableActionButton onClick={() => onAddColumn?.(objectName)}>
              <AddIcon />
              Add Column
            </TableActionButton>
          </Tooltip>
          <Tooltip title="Edit table data and structure">
            <TableActionButton onClick={() => onEditTable?.(objectName)}>
              <EditIcon />
              Edit Table
            </TableActionButton>
          </Tooltip>
          <Tooltip title="Permanently delete this table">
            <TableActionButton variant="danger" onClick={() => onDeleteTable?.(objectName)}>
              <DeleteIcon />
              Delete Table
            </TableActionButton>
          </Tooltip>
        </TableActionsBar>
      )}
      
      <DetailsPanelContent>
        {isLoading ? (
          <EmptyState>
            <CircularProgress size={32} />
          </EmptyState>
        ) : objectType === 'table' && table ? (
          <TableDetails table={table} onNavigateToTable={onNavigateToTable} />
        ) : (
          <EmptyState>
            <span>Details not available for this object type</span>
          </EmptyState>
        )}
      </DetailsPanelContent>
    </DetailsPanel>
  );
}

function TableDetails({ table, onNavigateToTable }: { table: TableDetailsDto; onNavigateToTable?: (tableName: string) => void }) {
  return (
    <>
      <StatRow>
        <StatItem>
          <span>Rows:</span>
          <span>{table.rowCount.toLocaleString()}</span>
        </StatItem>
        <StatItem>
          <span>Columns:</span>
          <span>{table.columns.length}</span>
        </StatItem>
        <StatItem>
          <span>Indexes:</span>
          <span>{table.indexes.length}</span>
        </StatItem>
      </StatRow>

      <DetailsSection>
        <DetailsSectionTitle>Columns ({table.columns.length})</DetailsSectionTitle>
        <ColumnsTable>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Nullable</th>
              <th>Default</th>
              <th>Keys</th>
              <th>References</th>
            </tr>
          </thead>
          <tbody>
            {table.columns.map((col) => (
              <tr key={col.name}>
                <td style={{ fontWeight: 500 }}>{col.name}</td>
                <td>
                  <ColumnBadge variant="type">{col.type}</ColumnBadge>
                </td>
                <td>
                  {col.nullable ? (
                    <ColumnBadge variant="nullable">NULL</ColumnBadge>
                  ) : (
                    'NOT NULL'
                  )}
                </td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                  {col.defaultValue || '—'}
                </td>
                <td>
                  {col.isPrimaryKey && <ColumnBadge variant="primary">PK</ColumnBadge>}
                  {col.isForeignKey && (
                    <ColumnBadge variant="foreign" style={{ marginLeft: col.isPrimaryKey ? '0.25rem' : 0 }}>
                      FK
                    </ColumnBadge>
                  )}
                </td>
                <td>
                  {col.isForeignKey && col.foreignKeyRef && (
                    <ForeignKeyLink 
                      onClick={() => onNavigateToTable?.(col.foreignKeyRef!.table)}
                      title={`Go to ${col.foreignKeyRef.table}`}
                    >
                      <LinkIcon sx={{ fontSize: '0.875rem' }} />
                      {col.foreignKeyRef.table}.{col.foreignKeyRef.column}
                    </ForeignKeyLink>
                  )}
                  {!col.isForeignKey && '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </ColumnsTable>
      </DetailsSection>

      {table.indexes.length > 0 && (
        <DetailsSection>
          <DetailsSectionTitle>Indexes ({table.indexes.length})</DetailsSectionTitle>
          <ColumnsTable>
            <thead>
              <tr>
                <th>Name</th>
                <th>Columns</th>
                <th>Type</th>
                <th>Unique</th>
              </tr>
            </thead>
            <tbody>
              {table.indexes.map((idx) => (
                <tr key={idx.name}>
                  <td style={{ fontWeight: 500 }}>{idx.name}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    {idx.columns.join(', ')}
                  </td>
                  <td>{idx.type}</td>
                  <td>{idx.isUnique ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </ColumnsTable>
        </DetailsSection>
      )}
    </>
  );
}
