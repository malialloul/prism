import { useState, useMemo, useRef } from 'react';
import { Tooltip, Box, Skeleton, Menu, MenuItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import RefreshIcon from '@mui/icons-material/Refresh';
import StorageIcon from '@mui/icons-material/Storage';
import AddIcon from '@mui/icons-material/Add';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import CodeIcon from '@mui/icons-material/Code';
import TableRowsIcon from '@mui/icons-material/TableRows';
import DescriptionIcon from '@mui/icons-material/Description';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useSchemaObjects } from '../../../api/entities/schema';
import { SchemaService } from '../../../api/services/SchemaService';
import { toastService } from '../../../services';
import type { SchemaObjectDto, SchemaObjectType } from '../../../api/models/SchemaDto';
import {
  ExplorerWrapper,
  ExplorerHeader,
  ExplorerTitle,
  ExplorerContent,
  TreeSection,
  TreeSectionHeader,
  SectionIcon,
  SectionName,
  SectionCount,
  TreeItemList,
  TreeItem,
  ItemName,
  ExpandIcon,
  ActionButton,
  EmptyState,
  SectionActions,
} from './SchemaExplorer.styles';

interface SchemaExplorerProps {
  databaseId: number | undefined;
  selectedObject?: { name: string; type: SchemaObjectType } | null;
  onSelectObject: (name: string, type: SchemaObjectType) => void;
  onCreateTable?: () => void;
}

const sectionConfig: {
  type: SchemaObjectType;
  label: string;
  icon: string;
}[] = [
    { type: 'table', label: 'Tables', icon: 'T' },
  ];

export default function SchemaExplorer({
  databaseId,
  selectedObject,
  onSelectObject,
  onCreateTable,
}: SchemaExplorerProps) {
  const { data, isLoading, refetch } = useSchemaObjects(databaseId);
  const [expandedSections, setExpandedSections] = useState<Record<SchemaObjectType, boolean>>({
    table: true,
  });
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerateDoc = async () => {
    if (!databaseId) return;
    setMenuAnchor(null);
    setIsGeneratingDoc(true);

    try {
      const blob = await SchemaService.generateSchemaDoc(databaseId);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `schema_documentation.docx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toastService.success('Schema documentation generated successfully');
    } catch (error: any) {
      toastService.error(error?.body?.message || 'Failed to generate documentation');
    } finally {
      setIsGeneratingDoc(false);
    }
  };

  const handleExport = async (includeData: boolean) => {
    if (!databaseId) return;
    setMenuAnchor(null);
    setIsExporting(true);

    try {
      const blob = await SchemaService.exportSchema(databaseId, includeData);

      // Create download link
      const url = window.URL.createObjectURL(new Blob([blob as any]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `database_${includeData ? 'full' : 'schema'}_export.sql`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toastService.success(`${includeData ? 'Full database' : 'Schema'} exported successfully`);
    } catch (error: any) {
      toastService.error(error?.body?.message || 'Failed to export');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    setMenuAnchor(null);
    fileInputRef.current?.click();
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !databaseId) return;

    setIsImporting(true);

    try {
      const sql = await file.text();
      const result = await SchemaService.importSql(databaseId, sql);

      if (result.success) {
        toastService.success(result.message);
      } else {
        toastService.warning(`${result.message}. Check console for details.`);
        console.warn('Import errors:', result.errors);
      }

      // Refresh schema
      refetch();
    } catch (error: any) {
      toastService.error(error?.body?.message || 'Failed to import SQL');
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const groupedObjects = useMemo(() => {
    const objects = data?.objects || [];
    const groups: Record<SchemaObjectType, SchemaObjectDto[]> = {
      table: [],
    };

    objects.forEach((obj) => {
      if (groups[obj.type]) {
        groups[obj.type].push(obj);
      }
    });

    return groups;
  }, [data]);

  const toggleSection = (type: SchemaObjectType) => {
    setExpandedSections((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  if (!databaseId) {
    return (
      <ExplorerWrapper>
        <ExplorerHeader>
          <ExplorerTitle>Schema Explorer</ExplorerTitle>
        </ExplorerHeader>
        <EmptyState>
          <StorageIcon />
          <span>Connect to a database to explore its schema</span>
        </EmptyState>
      </ExplorerWrapper>
    );
  }

  return (
    <ExplorerWrapper>
      <ExplorerHeader>
        <ExplorerTitle>Schema Explorer</ExplorerTitle>
        <Box sx={{ display: 'flex', gap: '0.25rem' }}>
          <Tooltip title="Import/Export">
            <ActionButton
              onClick={(e) => setMenuAnchor(e.currentTarget)}
              size="small"
              disabled={isExporting || isImporting || isGeneratingDoc}
            >
              <MoreVertIcon sx={{ fontSize: '1rem' }} />
            </ActionButton>
          </Tooltip>
          <Tooltip title="Refresh">
            <ActionButton onClick={() => refetch()} size="small">
              <RefreshIcon sx={{ fontSize: '1rem' }} />
            </ActionButton>
          </Tooltip>
        </Box>

        {/* Import/Export Menu */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={() => handleExport(false)} disabled={isExporting}>
            <ListItemIcon>
              <CodeIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Export Schema Only</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleExport(true)} disabled={isExporting}>
            <ListItemIcon>
              <TableRowsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Export Schema + Data</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleGenerateDoc} disabled={isGeneratingDoc}>
            <ListItemIcon>
              <DescriptionIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Generate Word Document</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleImportClick} disabled={isImporting}>
            <ListItemIcon>
              <FileUploadIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Import SQL File</ListItemText>
          </MenuItem>
        </Menu>

        {/* Hidden file input for import */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileImport}
          accept=".sql,.txt"
          style={{ display: 'none' }}
        />
      </ExplorerHeader>
      <ExplorerContent>
        {isLoading ? (
          <EmptyState>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <Skeleton variant="circular" width={32} height={32} sx={{ animation: 'pulse 1.5s ease-in-out infinite' }} />
              <Skeleton variant="text" width={100} height={20} sx={{ animation: 'pulse 1.5s ease-in-out infinite' }} />
            </Box>
          </EmptyState>
        ) : (
          <>
            {sectionConfig.map(({ type, label, icon }) => {
              const items = groupedObjects[type];
              const isExpanded = expandedSections[type];

              return (
                <TreeSection key={type}>
                  <TreeSectionHeader
                    expanded={isExpanded}
                    onClick={() => toggleSection(type)}
                  >
                    <ExpandIcon expanded={isExpanded}>
                      <ChevronRightIcon sx={{ fontSize: 'inherit' }} />
                    </ExpandIcon>
                    <SectionIcon type={type}>{icon}</SectionIcon>
                    <SectionName>{label}</SectionName>
                    <SectionCount>{items.length}</SectionCount>
                    {onCreateTable && (
                      <SectionActions>
                        <Tooltip title="Create Table" arrow>
                          <ActionButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onCreateTable();
                            }}
                          >
                            <AddIcon sx={{ fontSize: '0.875rem' }} />
                          </ActionButton>
                        </Tooltip>
                      </SectionActions>
                    )}
                  </TreeSectionHeader>
                  <TreeItemList in={isExpanded}>
                    <div>
                      {items.map((item) => (
                        <TreeItem
                          key={item.name}
                          selected={
                            selectedObject?.name === item.name &&
                            selectedObject?.type === item.type
                          }
                          onClick={() => onSelectObject(item.name, item.type)}
                        >
                          <ItemName
                            selected={
                              selectedObject?.name === item.name &&
                              selectedObject?.type === item.type
                            }
                          >
                            {item.name}
                          </ItemName>
                        </TreeItem>
                      ))}
                      {items.length === 0 && (
                        <TreeItem>
                          <ItemName style={{ fontStyle: 'italic', opacity: 0.5 }}>
                            No {label.toLowerCase()} found
                          </ItemName>
                        </TreeItem>
                      )}
                    </div>
                  </TreeItemList>
                </TreeSection>
              );
            })}
          </>
        )}
      </ExplorerContent>
    </ExplorerWrapper>
  );
}