import { Tooltip, IconButton, MenuItem, SelectChangeEvent, Select, useTheme } from '@mui/material';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {
  PaginationContainer,
  PaginationInfo,
  PaginationButtons,
  PageInfo,
  PageSizeContainer,
  pageSizeSelectStyles,
} from './Pagination.styles';

export const PAGE_SIZES = [25, 50, 100, 250, 500];

export interface PaginationProps {
  /** Current page (0-indexed) */
  page: number;
  /** Number of rows per page */
  pageSize: number;
  /** Total number of rows */
  totalRows: number;
  /** Total number of pages */
  totalPages: number;
  /** First row number being displayed (1-indexed) */
  startRow: number;
  /** Last row number being displayed */
  endRow: number;
  /** Whether pagination controls should be disabled */
  isLoading?: boolean;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Callback when page size changes */
  onPageSizeChange: (size: number) => void;
}

export default function Pagination({
  page,
  pageSize,
  totalRows,
  totalPages,
  startRow,
  endRow,
  isLoading = false,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
    const newSize = Number(event.target.value);
    onPageSizeChange(newSize);
  };

  return (
    <PaginationContainer>
      <PaginationInfo>
        {totalRows > 0 ? (
          <>
            Showing <strong>{startRow.toLocaleString()}-{endRow.toLocaleString()}</strong>{' '}
            <span>of</span> <strong>{totalRows.toLocaleString()}</strong> <span>rows</span>
          </>
        ) : (
          <span>No rows</span>
        )}
      </PaginationInfo>
      <PaginationButtons>
        <Tooltip title="First Page">
          <span>
            <IconButton
              size="small"
              onClick={() => onPageChange(0)}
              disabled={page === 0 || isLoading}
            >
              <FirstPageIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Previous Page">
          <span>
            <IconButton
              size="small"
              onClick={() => onPageChange(Math.max(0, page - 1))}
              disabled={page === 0 || isLoading}
            >
              <ChevronLeftIcon />
            </IconButton>
          </span>
        </Tooltip>
        <PageInfo>
          <span>Page</span> {page + 1} / {Math.max(1, totalPages)}
        </PageInfo>
        <Tooltip title="Next Page">
          <span>
            <IconButton
              size="small"
              onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1 || isLoading}
            >
              <ChevronRightIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Last Page">
          <span>
            <IconButton
              size="small"
              onClick={() => onPageChange(totalPages - 1)}
              disabled={page >= totalPages - 1 || isLoading}
            >
              <LastPageIcon />
            </IconButton>
          </span>
        </Tooltip>
      </PaginationButtons>
      <PageSizeContainer>
        <span>Rows per page:</span>
        <Select<number>
          value={pageSize}
          onChange={handlePageSizeChange}
          size="small"
          sx={pageSizeSelectStyles(isDark)}
        >
          {PAGE_SIZES.map((size) => (
            <MenuItem key={size} value={size}>
              {size}
            </MenuItem>
          ))}
        </Select>
      </PageSizeContainer>
    </PaginationContainer>
  );
}
