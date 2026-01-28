import { useState, useMemo } from 'react';
import { Tooltip, Box, Skeleton } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import RefreshIcon from '@mui/icons-material/Refresh';
import StorageIcon from '@mui/icons-material/Storage';
import AddIcon from '@mui/icons-material/Add';
import { useSchemaObjects } from '../../../api/entities/schema';
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
  onCreateView?: () => void;
  onCreateFunction?: () => void;
  onCreateProcedure?: () => void;
}

const sectionConfig: {
  type: SchemaObjectType;
  label: string;
  icon: string;
}[] = [
    { type: 'table', label: 'Tables', icon: 'T' },
    { type: 'view', label: 'Views', icon: 'V' },
    { type: 'index', label: 'Indexes', icon: 'I' },
    { type: 'procedure', label: 'Procedures', icon: 'P' },
    { type: 'function', label: 'Functions', icon: 'F' },
  ];

export default function SchemaExplorer({
  databaseId,
  selectedObject,
  onSelectObject,
  onCreateTable,
  onCreateView,
  onCreateFunction,
  onCreateProcedure,
}: SchemaExplorerProps) {
  const { data, isLoading, refetch } = useSchemaObjects(databaseId);
  const [expandedSections, setExpandedSections] = useState<Record<SchemaObjectType, boolean>>({
    table: true,
    view: false,
    index: false,
    procedure: false,
    function: false,
  });

  const groupedObjects = useMemo(() => {
    const objects = data?.objects || [];
    const groups: Record<SchemaObjectType, SchemaObjectDto[]> = {
      table: [],
      view: [],
      index: [],
      procedure: [],
      function: [],
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
        <Tooltip title="Refresh">
          <ActionButton onClick={() => refetch()} size="small">
            <RefreshIcon sx={{ fontSize: '1rem' }} />
          </ActionButton>
        </Tooltip>
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
              const canCreate = type === 'table' || type === 'view' || type === 'function' || type === 'procedure';
              const handleCreate =
                type === 'table' ? onCreateTable :
                  type === 'view' ? onCreateView :
                    type === 'function' ? onCreateFunction :
                      type === 'procedure' ? onCreateProcedure :
                        undefined;
              const createLabel =
                type === 'table' ? 'Table' :
                  type === 'view' ? 'View' :
                    type === 'function' ? 'Function' :
                      type === 'procedure' ? 'Procedure' :
                        '';

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
                    {canCreate && handleCreate && (
                      <SectionActions>
                        <Tooltip title={`Create ${createLabel}`}>
                          <ActionButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCreate();
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
