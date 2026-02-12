import { IconButton, Tooltip } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
  WizardSidebar,
  PreviewHeader,
  PreviewTitle,
  PreviewContent,
  SqlCode,
  ValidationList,
  ValidationItem,
} from '../QueryWizard.styles';
import type { ValidationMessage } from '../types';

interface SqlPreviewSidebarProps {
  sql: string;
  validation: ValidationMessage[];
  copied: boolean;
  onCopy: () => void;
}

export default function SqlPreviewSidebar({
  sql,
  validation,
  copied,
  onCopy,
}: SqlPreviewSidebarProps) {
  return (
    <WizardSidebar>
      <PreviewHeader>
        <PreviewTitle>SQL Preview</PreviewTitle>
        <Tooltip title={copied ? 'Copied!' : 'Copy SQL'}>
          <span>
            <IconButton
              size="small"
              onClick={onCopy}
              disabled={!sql}
              sx={{ color: copied ? '#22c55e' : '#71717a' }}
            >
              {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
            </IconButton>
          </span>
        </Tooltip>
      </PreviewHeader>
      <PreviewContent>
        <SqlCode>
          {sql || '-- Select a table to begin building your query'}
        </SqlCode>

        {validation.length > 0 && (
          <ValidationList>
            {validation.map((msg, idx) => (
              <ValidationItem key={idx} severity={msg.severity}>
                {msg.severity === 'error' ? (
                  <ErrorOutlineIcon fontSize="small" />
                ) : (
                  <WarningAmberIcon fontSize="small" />
                )}
                <span>{msg.message}</span>
              </ValidationItem>
            ))}
          </ValidationList>
        )}
      </PreviewContent>
    </WizardSidebar>
  );
}
