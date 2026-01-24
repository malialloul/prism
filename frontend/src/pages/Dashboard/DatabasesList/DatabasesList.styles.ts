import styled from '@emotion/styled';
import { dashboardColors as colors } from '../../../styles/theme';

export const ListContainer = styled.div`
  background: ${colors.cardBg};
  border: 1px solid ${colors.border};
  border-radius: 16px;
  padding: 24px;
  margin-top: 24px;
`;

export const ListHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

export const ListTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${colors.textPrimary};
  margin: 0;
`;

export const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const SearchInput = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${colors.bgLayer2};
  border: 1px solid ${colors.border};
  border-radius: 8px;
  padding: 8px 12px;
  min-width: 240px;

  input {
    background: transparent;
    border: none;
    outline: none;
    color: ${colors.textPrimary};
    font-size: 14px;
    width: 100%;

    &::placeholder {
      color: ${colors.textMuted};
    }
  }

  svg {
    color: ${colors.textMuted};
    font-size: 18px;
  }
`;

export const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: ${colors.bgLayer2};
  border: 1px solid ${colors.border};
  border-radius: 8px;
  padding: 8px 12px;
  color: ${colors.textSecondary};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${colors.bgLayer3};
    color: ${colors.textPrimary};
  }

  svg {
    font-size: 18px;
  }
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

export const TableHead = styled.thead`
  tr {
    border-bottom: 1px solid ${colors.border};
  }
`;

export const TableHeadCell = styled.th`
  padding: 12px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: ${colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &:last-child {
    text-align: right;
  }
`;

export const TableBody = styled.tbody`
  tr {
    border-bottom: 1px solid ${colors.borderSubtle};
    transition: background 0.2s ease;

    &:hover {
      background: ${colors.bgLayer1};
    }

    &:last-child {
      border-bottom: none;
    }
  }
`;

export const TableCell = styled.td`
  padding: 16px;
  font-size: 14px;
  color: ${colors.textPrimary};
  vertical-align: middle;

  &:last-child {
    text-align: right;
  }
`;

export const DatabaseInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const DatabaseIcon = styled.div<{ engine: 'postgres' | 'mysql' }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ engine }) =>
    engine === 'postgres'
      ? `${colors.postgres}15`
      : `${colors.mysql}15`};
  color: ${({ engine }) =>
    engine === 'postgres' ? colors.postgres : colors.mysql};

  svg {
    font-size: 20px;
  }
`;

export const DatabaseDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const DatabaseName = styled.span`
  font-weight: 500;
  color: ${colors.textPrimary};
`;

export const DatabaseHost = styled.span`
  font-size: 12px;
  color: ${colors.textMuted};
`;

export const EngineBadge = styled.span<{ engine: 'postgres' | 'mysql' }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  background: ${({ engine }) =>
    engine === 'postgres'
      ? `${colors.postgres}15`
      : `${colors.mysql}15`};
  color: ${({ engine }) =>
    engine === 'postgres' ? colors.postgres : colors.mysql};
`;

export const StatusBadge = styled.span<{ status: 'connected' | 'disconnected' | 'error' }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background: ${({ status }) => {
    switch (status) {
      case 'connected':
        return `${colors.success}15`;
      case 'disconnected':
        return `${colors.textMuted}15`;
      case 'error':
        return `${colors.error}15`;
      default:
        return `${colors.textMuted}15`;
    }
  }};
  color: ${({ status }) => {
    switch (status) {
      case 'connected':
        return colors.success;
      case 'disconnected':
        return colors.textMuted;
      case 'error':
        return colors.error;
      default:
        return colors.textMuted;
    }
  }};

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }
`;

export const LastUsedText = styled.span`
  color: ${colors.textSecondary};
  font-size: 13px;
`;

export const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-end;
`;

export const ActionButton = styled.button<{ variant?: 'primary' | 'danger' | 'default' }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;

  ${({ variant = 'default' }) => {
    switch (variant) {
      case 'primary':
        return `
          background: ${colors.primary};
          color: white;
          &:hover {
            background: ${colors.primaryHover};
          }
        `;
      case 'danger':
        return `
          background: transparent;
          color: ${colors.error};
          border-color: ${colors.error}40;
          &:hover {
            background: ${colors.error}15;
          }
        `;
      default:
        return `
          background: ${colors.bgLayer2};
          color: ${colors.textSecondary};
          border-color: ${colors.border};
          &:hover {
            background: ${colors.bgLayer3};
            color: ${colors.textPrimary};
          }
        `;
    }
  }}

  svg {
    font-size: 14px;
  }
`;

export const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid ${colors.border};
`;

export const PaginationInfo = styled.span`
  font-size: 13px;
  color: ${colors.textMuted};
`;

export const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const PageButton = styled.button<{ active?: boolean }>`
  min-width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;

  ${({ active }) =>
    active
      ? `
        background: ${colors.primary};
        color: white;
      `
      : `
        background: transparent;
        color: ${colors.textSecondary};
        &:hover {
          background: ${colors.bgLayer2};
          color: ${colors.textPrimary};
        }
      `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    font-size: 18px;
  }
`;

export const EmptyTableMessage = styled.div`
  padding: 48px 24px;
  text-align: center;
  color: ${colors.textMuted};
  font-size: 14px;
`;
