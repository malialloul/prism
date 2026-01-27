import { InputAdornment, MenuItem, Tooltip, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import {
  SearchContainer,
  SearchInput,
  SortContainer,
  SortSelect,
} from './SearchSortToolbar.styles';

interface SearchSortToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  sortColumn: string;
  onSortColumnChange: (column: string) => void;
  sortDirection: 'ASC' | 'DESC';
  onSortDirectionToggle: () => void;
  columns: string[];
  searchPlaceholder?: string;
}

export default function SearchSortToolbar({
  searchValue,
  onSearchChange,
  sortColumn,
  onSortColumnChange,
  sortDirection,
  onSortDirectionToggle,
  columns,
  searchPlaceholder = 'Search all columns...',
}: SearchSortToolbarProps) {
  return (
    <>
      <SearchContainer>
        <SearchInput
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />
      </SearchContainer>
      <SortContainer>
        <span>Sort:</span>
        <SortSelect
          value={sortColumn}
          onChange={(e) => onSortColumnChange(e.target.value as string)}
          displayEmpty
          size="small"
        >
          <MenuItem value="">None</MenuItem>
          {columns.map((col) => (
            <MenuItem key={col} value={col}>
              {col}
            </MenuItem>
          ))}
        </SortSelect>
        {sortColumn && (
          <Tooltip title={sortDirection === 'ASC' ? 'Ascending' : 'Descending'}>
            <IconButton size="small" onClick={onSortDirectionToggle}>
              {sortDirection === 'ASC' ? (
                <ArrowUpwardIcon sx={{ fontSize: '1rem' }} />
              ) : (
                <ArrowDownwardIcon sx={{ fontSize: '1rem' }} />
              )}
            </IconButton>
          </Tooltip>
        )}
      </SortContainer>
    </>
  );
}
