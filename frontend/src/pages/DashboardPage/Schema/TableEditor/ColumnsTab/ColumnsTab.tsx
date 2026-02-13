import { IconButton, Menu, MenuItem } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { toastService } from '../../../../../services';
import type { ColumnDetailsDto } from '../../../../../api/models/SchemaDto';
import type { ColumnMenuAnchor } from '../TableEditor.types';
import { ColumnsTabContent, ColumnsTable } from './ColumnsTab.styles';

interface ColumnsTabProps {
  columns: ColumnDetailsDto[] | undefined;
  columnMenuAnchor: ColumnMenuAnchor | null;
  onColumnMenuOpen: (event: React.MouseEvent<HTMLElement>, column: ColumnDetailsDto) => void;
  onColumnMenuClose: () => void;
  onEditColumn: (column: ColumnDetailsDto) => void;
  onDeleteColumn: (column: ColumnDetailsDto) => void;
}

export default function ColumnsTab({
  columns,
  columnMenuAnchor,
  onColumnMenuOpen,
  onColumnMenuClose,
  onEditColumn,
  onDeleteColumn,
}: ColumnsTabProps) {
  return (
    <ColumnsTabContent>
      <ColumnsTable>
        <thead>
          <tr>
            <th>Column Name</th>
            <th>Type</th>
            <th>Nullable</th>
            <th>Default</th>
            <th>Primary Key</th>
            <th style={{ width: '60px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {columns?.map((col) => (
            <tr key={col.name}>
              <td style={{ fontWeight: 500 }}>{col.name}</td>
              <td
                style={{
                  color: '#6b7280',
                  fontFamily: 'monospace',
                  fontSize: '0.8125rem',
                }}
              >
                {col.type}
              </td>
              <td>{col.nullable ? 'Yes' : 'No'}</td>
              <td
                style={{
                  color: '#6b7280',
                  fontFamily: 'monospace',
                  fontSize: '0.8125rem',
                }}
              >
                {col.defaultValue || '-'}
              </td>
              <td>
                {col.isPrimaryKey && (
                  <span style={{ color: '#f59e0b', fontWeight: 500 }}>Yes</span>
                )}
                {!col.isPrimaryKey && '-'}
              </td>
              <td>
                <IconButton
                  size="small"
                  onClick={(e) => onColumnMenuOpen(e, col)}
                  disabled={col.isPrimaryKey}
                >
                  <MoreVertIcon sx={{ fontSize: '1rem' }} />
                </IconButton>
              </td>
            </tr>
          ))}
        </tbody>
      </ColumnsTable>

      <Menu
        anchorEl={columnMenuAnchor?.el}
        open={Boolean(columnMenuAnchor)}
        onClose={onColumnMenuClose}
      >
        <MenuItem
          onClick={() => { onColumnMenuClose(); toastService.info('Coming Soon'); }}
        >
          <EditIcon sx={{ fontSize: '1rem', mr: 1 }} />
          Edit Column
        </MenuItem>
        <MenuItem
          onClick={() => { onColumnMenuClose(); toastService.info('Coming Soon'); }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ fontSize: '1rem', mr: 1 }} />
          Delete Column
        </MenuItem>
      </Menu>
    </ColumnsTabContent>
  );
}
