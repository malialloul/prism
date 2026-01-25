import { useState, useMemo } from 'react';
import { CircularProgress, Tooltip } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import RefreshIcon from '@mui/icons-material/Refresh';
import StorageIcon from '@mui/icons-material/Storage';
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
} from './SchemaExplorer.styles';

interface SchemaExplorerProps {
  databaseId: string | undefined;
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
  { type: 'view', label: 'Views', icon: 'V' },
  { type: 'index', label: 'Indexes', icon: 'I' },
  { type: 'procedure', label: 'Procedures', icon: 'P' },
  { type: 'function', label: 'Functions', icon: 'F' },
];

export default function SchemaExplorer({
  databaseId,
  selectedObject,
  onSelectObject,
  onCreateTable: _onCreateTable,
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
            <CircularProgress size={32} />
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
