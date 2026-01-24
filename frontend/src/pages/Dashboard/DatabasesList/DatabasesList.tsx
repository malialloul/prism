import { useState, useMemo } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import StorageIcon from '@mui/icons-material/Storage';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {
  ListContainer,
  ListHeader,
  ListTitle,
  SearchContainer,
  SearchInput,
  FilterButton,
  Table,
  TableHead,
  TableHeadCell,
  TableBody,
  TableCell,
  DatabaseInfo,
  DatabaseIcon,
  DatabaseDetails,
  DatabaseName,
  DatabaseHost,
  EngineBadge,
  StatusBadge,
  LastUsedText,
  ActionButtons,
  ActionButton,
  Pagination,
  PaginationInfo,
  PaginationControls,
  PageButton,
  EmptyTableMessage,
} from './DatabasesList.styles';
import { Database } from '../Dashboard';

interface DatabasesListProps {
  databases: Database[];
  onViewDatabase: (id: string) => void;
  onConnectDatabase: (id: string) => void;
  onDisconnectDatabase: (id: string) => void;
}

type DisplayStatus = 'connected' | 'disconnected' | 'error';

const ITEMS_PER_PAGE = 5;

export default function DatabasesList({
  databases,
  onViewDatabase,
  onConnectDatabase,
  onDisconnectDatabase,
}: DatabasesListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter databases by search query
  const filteredDatabases = useMemo(() => {
    if (!searchQuery.trim()) return databases;
    const query = searchQuery.toLowerCase();
    return databases.filter(
      (db) =>
        db.name.toLowerCase().includes(query) ||
        db.host.toLowerCase().includes(query) ||
        db.engine.toLowerCase().includes(query)
    );
  }, [databases, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredDatabases.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedDatabases = filteredDatabases.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Reset to first page when search changes
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const formatLastUsed = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getDisplayStatus = (status: string): DisplayStatus => {
    if (status === 'connected') return 'connected';
    if (status === 'disconnected' || status === 'provisioning') return 'disconnected';
    return 'error';
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'disconnected':
        return 'Disconnected';
      case 'provisioning':
        return 'Provisioning';
      default:
        return 'Unknown';
    }
  };

  return (
    <ListContainer>
      <ListHeader>
        <ListTitle>All Databases</ListTitle>
        <SearchContainer>
          <SearchInput>
            <SearchIcon />
            <input
              type="text"
              placeholder="Search databases..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </SearchInput>
          <FilterButton>
            <FilterListIcon />
            Filter
          </FilterButton>
        </SearchContainer>
      </ListHeader>

      <Table>
        <TableHead>
          <tr>
            <TableHeadCell>Database</TableHeadCell>
            <TableHeadCell>Engine</TableHeadCell>
            <TableHeadCell>Status</TableHeadCell>
            <TableHeadCell>Last Used</TableHeadCell>
            <TableHeadCell>Actions</TableHeadCell>
          </tr>
        </TableHead>
        <TableBody>
          {paginatedDatabases.length === 0 ? (
            <tr>
              <TableCell colSpan={5}>
                <EmptyTableMessage>
                  {searchQuery
                    ? 'No databases found matching your search.'
                    : 'No databases yet. Create or connect a database to get started.'}
                </EmptyTableMessage>
              </TableCell>
            </tr>
          ) : (
            paginatedDatabases.map((db) => (
              <tr key={db.id}>
                <TableCell>
                  <DatabaseInfo>
                    <DatabaseIcon engine={db.engine}>
                      <StorageIcon />
                    </DatabaseIcon>
                    <DatabaseDetails>
                      <DatabaseName>{db.name}</DatabaseName>
                      <DatabaseHost>{db.host}</DatabaseHost>
                    </DatabaseDetails>
                  </DatabaseInfo>
                </TableCell>
                <TableCell>
                  <EngineBadge engine={db.engine}>
                    {db.engine === 'postgres' ? 'PostgreSQL' : 'MySQL'}
                  </EngineBadge>
                </TableCell>
                <TableCell>
                  <StatusBadge status={getDisplayStatus(db.status)}>
                    {getStatusLabel(db.status)}
                  </StatusBadge>
                </TableCell>
                <TableCell>
                  <LastUsedText>{formatLastUsed(db.lastUsed)}</LastUsedText>
                </TableCell>
                <TableCell>
                  <ActionButtons>
                    <ActionButton onClick={() => onViewDatabase(db.id)}>
                      <VisibilityIcon />
                      View
                    </ActionButton>
                    {db.status === 'connected' ? (
                      <ActionButton
                        variant="danger"
                        onClick={() => onDisconnectDatabase(db.id)}
                      >
                        <LinkOffIcon />
                        Disconnect
                      </ActionButton>
                    ) : (
                      <ActionButton
                        variant="primary"
                        onClick={() => onConnectDatabase(db.id)}
                      >
                        <LinkIcon />
                        Connect
                      </ActionButton>
                    )}
                  </ActionButtons>
                </TableCell>
              </tr>
            ))
          )}
        </TableBody>
      </Table>

      {filteredDatabases.length > ITEMS_PER_PAGE && (
        <Pagination>
          <PaginationInfo>
            Showing {startIndex + 1}-
            {Math.min(startIndex + ITEMS_PER_PAGE, filteredDatabases.length)} of{' '}
            {filteredDatabases.length} databases
          </PaginationInfo>
          <PaginationControls>
            <PageButton
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeftIcon />
            </PageButton>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PageButton
                key={page}
                active={page === currentPage}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </PageButton>
            ))}
            <PageButton
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <ChevronRightIcon />
            </PageButton>
          </PaginationControls>
        </Pagination>
      )}
    </ListContainer>
  );
}
