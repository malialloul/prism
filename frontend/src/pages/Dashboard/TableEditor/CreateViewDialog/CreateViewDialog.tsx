import { useState, ChangeEvent } from 'react';
import { ButtonLoadingSkeleton } from '../../../../components';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useCreateView, useExecuteQuery } from '../../../../api/entities/schema';
import { toastService } from '../../../../services';
import {
  StyledDialog,
  DialogHeader,
  DialogTitle,
  DialogSubtitle,
  DialogContent,
  DialogFooter,
  FormGroup,
  FormLabel,
  StyledTextField,
  CancelButton,
  SubmitButton,
} from '../shared.styles';
import {
  SqlEditorWrapper,
  SqlTextArea,
  PreviewSection,
  PreviewHeader,
  PreviewButton,
  PreviewResult,
  PreviewError,
  PreviewColumns,
  PreviewColumnTag,
} from './CreateViewDialog.styles';

interface CreateViewDialogProps {
  open: boolean;
  onClose: () => void;
  databaseId: number;
  engine: 'postgres' | 'mysql';
  onSuccess?: () => void;
}

export default function CreateViewDialog({
  open,
  onClose,
  databaseId,
  engine,
  onSuccess,
}: CreateViewDialogProps) {
  const [viewName, setViewName] = useState('');
  const [selectQuery, setSelectQuery] = useState('SELECT * FROM ');
  const [previewResult, setPreviewResult] = useState<{ columns: string[]; rowCount: number } | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const { mutate: executeQuery, isPending: isPreviewing } = useExecuteQuery(databaseId, {
    onSuccess: (result) => {
      if (result.columns) {
        setPreviewResult({
          columns: result.columns,
          rowCount: result.columns.length,
        });
      } else {
        setPreviewError('Invalid query - no columns returned');
      }
    },
    onError: (error) => {
      setPreviewError(error.message || 'Failed to preview query. Please check your SQL syntax.');
    },
  });

  const { mutate: createView, isPending } = useCreateView(databaseId, {
    onSuccess: (message) => {
      toastService.success(message);
      onClose();
      resetForm();
      onSuccess?.();
    },
    onError: (error) => {
      toastService.error(error.message || 'Failed to create view');
    },
  });

  const resetForm = () => {
    setViewName('');
    setSelectQuery('SELECT * FROM ');
    setPreviewResult(null);
    setPreviewError(null);
  };

  const handlePreview = () => {
    if (!selectQuery.trim()) {
      setPreviewError('Please enter a SELECT query');
      return;
    }

    setPreviewError(null);
    setPreviewResult(null);
    executeQuery(`${selectQuery} LIMIT 0`);
  };

  const handleSubmit = () => {
    if (!viewName.trim()) {
      toastService.error('Please enter a view name');
      return;
    }

    if (!selectQuery.trim()) {
      toastService.error('Please enter a SELECT query');
      return;
    }

    createView({
      name: viewName.trim(),
      definition: selectQuery.trim(),
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isValid = viewName.trim() && selectQuery.trim();

  return (
    <StyledDialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogHeader>
        <div>
          <DialogTitle>Create View</DialogTitle>
          <DialogSubtitle>
            Create a virtual table based on a SELECT query
          </DialogSubtitle>
        </div>
      </DialogHeader>

      <DialogContent>
        <FormGroup>
          <FormLabel>View Name *</FormLabel>
          <StyledTextField
            fullWidth
            placeholder={engine === 'postgres' ? 'my_view' : 'my_view'}
            value={viewName}
            onChange={(e) => setViewName(e.target.value)}
            size="small"
          />
        </FormGroup>

        <FormGroup>
          <FormLabel>SELECT Query *</FormLabel>
          <SqlEditorWrapper>
            <SqlTextArea
              placeholder="SELECT column1, column2 FROM table_name WHERE condition..."
              value={selectQuery}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                setSelectQuery(e.target.value);
                setPreviewResult(null);
                setPreviewError(null);
              }}
              rows={8}
            />
          </SqlEditorWrapper>
        </FormGroup>

        <PreviewSection>
          <PreviewHeader>
            <span>Query Preview</span>
            <PreviewButton
              onClick={handlePreview}
              disabled={isPreviewing || !selectQuery.trim()}
            >
              {isPreviewing ? (
                <ButtonLoadingSkeleton size="small" />
              ) : (
                <PlayArrowIcon sx={{ fontSize: '1rem' }} />
              )}
              {isPreviewing ? 'Validating...' : 'Validate Query'}
            </PreviewButton>
          </PreviewHeader>

          {previewError && (
            <PreviewError>
              <VisibilityIcon sx={{ fontSize: '1rem' }} />
              {previewError}
            </PreviewError>
          )}

          {previewResult && (
            <PreviewResult>
              <span>✓ Query is valid. {previewResult.columns.length} columns will be available:</span>
              <PreviewColumns>
                {previewResult.columns.map((col) => (
                  <PreviewColumnTag key={col}>{col}</PreviewColumnTag>
                ))}
              </PreviewColumns>
            </PreviewResult>
          )}
        </PreviewSection>
      </DialogContent>

      <DialogFooter>
        <CancelButton onClick={handleClose}>Cancel</CancelButton>
        <SubmitButton
          onClick={handleSubmit}
          disabled={isPending || !isValid}
          startIcon={
            isPending ? (
              <ButtonLoadingSkeleton size="small" />
            ) : (
              <VisibilityIcon />
            )
          }
        >
          {isPending ? 'Creating...' : 'Create View'}
        </SubmitButton>
      </DialogFooter>
    </StyledDialog>
  );
}
