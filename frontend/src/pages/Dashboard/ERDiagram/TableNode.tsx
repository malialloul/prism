import React from 'react';
import { Box, Typography, Tooltip, alpha } from '@mui/material';
import { Handle, Position, NodeProps } from 'reactflow';
import KeyIcon from '@mui/icons-material/Key';
import LinkIcon from '@mui/icons-material/Link';

interface Column {
  name: string;
  type: string;
}

interface ForeignKey {
  columnName: string;
  foreignTable: string;
  foreignColumn: string;
}

interface TableNodeData {
  tableName: string;
  columns: Column[];
  primaryKeys: string[];
  foreignKeys: ForeignKey[];
  showColumns?: boolean;
}

const TableNode: React.FC<NodeProps<TableNodeData>> = ({ data }) => {
  const { tableName, columns = [], primaryKeys = [], foreignKeys = [] } = data || {};
  const fkSet = new Set((foreignKeys || []).map((f) => f.columnName));
  const pkSet = new Set(primaryKeys || []);

  const pkCols = columns.filter((c) => pkSet.has(c.name));
  const nonPkCols = columns.filter((c) => !pkSet.has(c.name));

  const [hoveredHandle, setHoveredHandle] = React.useState<string | null>(null);

  const hoverKey = (col: string, type: string) => `${tableName}:${col}:${type}`;
  const isHovered = (col: string, type: string) => hoveredHandle === hoverKey(col, type);

  return (
    <Box sx={{
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 2,
      bgcolor: 'background.paper',
      minWidth: 240,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <Box sx={{
        background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
        px: 1.5,
        py: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'white' }}>
          {tableName}
        </Typography>
      </Box>

      {/* Columns */}
      <Box sx={{ p: 0 }}>
        {/* PK Section */}
        {pkCols.length > 0 && (
          <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
            {pkCols.map((c) => (
              <Box 
                key={c.name} 
                sx={{ 
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 1.5,
                  py: 0.75,
                  bgcolor: (theme) => alpha(theme.palette.success.main, 0.08),
                  '&:hover': { bgcolor: (theme) => alpha(theme.palette.success.main, 0.15) },
                }}
              >
                <KeyIcon sx={{ fontSize: 14, color: 'success.main' }} />
                <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600, flex: 1 }}>
                  {c.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.disabled', fontFamily: 'monospace', fontSize: 10 }}>
                  {c.type}
                </Typography>
                
                {/* Target handle for PK */}
                <Tooltip title={c.name} placement="left">
                  <span
                    onMouseEnter={() => setHoveredHandle(hoverKey(c.name, 'target'))}
                    onMouseLeave={() => setHoveredHandle(null)}
                  >
                    <Handle
                      type="target"
                      position={Position.Left}
                      id={`${tableName}:${c.name}`}
                      style={{
                        left: -5,
                        width: isHovered(c.name, 'target') ? 12 : 8,
                        height: isHovered(c.name, 'target') ? 12 : 8,
                        background: isHovered(c.name, 'target') ? '#10B981' : '#6b7280',
                        border: '2px solid #10B981',
                        transition: 'all 120ms ease',
                      }}
                    />
                  </span>
                </Tooltip>
                
                {/* Source handle if PK is also FK */}
                {fkSet.has(c.name) && (
                  <Tooltip title={c.name} placement="right">
                    <span
                      onMouseEnter={() => setHoveredHandle(hoverKey(c.name, 'source'))}
                      onMouseLeave={() => setHoveredHandle(null)}
                    >
                      <Handle
                        type="source"
                        position={Position.Right}
                        id={`${tableName}:${c.name}`}
                        style={{
                          right: -5,
                          width: isHovered(c.name, 'source') ? 12 : 8,
                          height: isHovered(c.name, 'source') ? 12 : 8,
                          background: isHovered(c.name, 'source') ? '#8B5CF6' : '#6b7280',
                          border: '2px solid #8B5CF6',
                          transition: 'all 120ms ease',
                        }}
                      />
                    </span>
                  </Tooltip>
                )}
              </Box>
            ))}
          </Box>
        )}

        {/* Non-PK columns */}
        {nonPkCols.map((c) => (
          <Box
            key={c.name}
            sx={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 0.75,
              borderBottom: '1px solid',
              borderColor: 'divider',
              bgcolor: fkSet.has(c.name) ? (theme) => alpha(theme.palette.primary.main, 0.05) : 'transparent',
              '&:hover': { bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1) },
              '&:last-child': { borderBottom: 'none' },
            }}
          >
            {fkSet.has(c.name) && <LinkIcon sx={{ fontSize: 14, color: 'primary.main' }} />}
            <Typography variant="caption" sx={{ 
              color: fkSet.has(c.name) ? 'primary.main' : 'text.secondary', 
              fontWeight: fkSet.has(c.name) ? 600 : 400,
              flex: 1,
            }}>
              {c.name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled', fontFamily: 'monospace', fontSize: 10 }}>
              {c.type}
            </Typography>
            
            {/* FK source handle */}
            {fkSet.has(c.name) && (
              <Tooltip title={c.name} placement="right">
                <span
                  onMouseEnter={() => setHoveredHandle(hoverKey(c.name, 'source'))}
                  onMouseLeave={() => setHoveredHandle(null)}
                >
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={`${tableName}:${c.name}`}
                    style={{
                      right: -5,
                      width: isHovered(c.name, 'source') ? 12 : 8,
                      height: isHovered(c.name, 'source') ? 12 : 8,
                      background: isHovered(c.name, 'source') ? '#8B5CF6' : '#6b7280',
                      border: '2px solid #8B5CF6',
                      transition: 'all 120ms ease',
                    }}
                  />
                </span>
              </Tooltip>
            )}
            
            {/* Target handle for non-FK columns (for potential relationships) */}
            <Handle
              type="target"
              position={Position.Left}
              id={`${tableName}:${c.name}`}
              style={{
                left: -5,
                width: 6,
                height: 6,
                background: '#6b7280',
                border: '1px solid #6b7280',
                opacity: 0.5,
              }}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default React.memo(TableNode);
