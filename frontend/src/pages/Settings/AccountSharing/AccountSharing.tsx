import { useState } from 'react';
import { TextField, Tooltip, CircularProgress, Alert } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useShareAccount, useSharedAccounts, useRevokeShare } from '../../../api/entities/auth';
import { toastService } from '../../../services';
import type { SharedAccountDto } from '../../../api/models/SharedAccountDto';
import {
  ShareForm,
  ShareFormRow,
  ShareButton,
  ShareList,
  ShareCard,
  ShareInfo,
  ShareEmail,
  ShareMeta,
  StatusBadge,
  RevokeButton,
  TempPasswordBox,
  TempPasswordLabel,
  TempPasswordValue,
  SectionDivider,
  SectionSubtitle,
  EmptyState,
} from './AccountSharing.styles';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getShareStatus(share: SharedAccountDto): 'pending' | 'accepted' | 'revoked' | 'expired' {
  if (share.status === 'revoked') return 'revoked';
  if (new Date(share.expiresAt) < new Date()) return 'expired';
  return share.status;
}

interface ShareAccountFormProps {
  onShareCreated: (share: SharedAccountDto, tempPassword: string) => void;
}

function ShareAccountForm({ onShareCreated }: ShareAccountFormProps) {
  const [email, setEmail] = useState('');
  const [expiresInDays, setExpiresInDays] = useState(7);

  const { shareAccount, isLoading, error, reset } = useShareAccount({
    onSuccess: (data) => {
      const share = data.data.share;
      if (share.tempPassword) {
        onShareCreated(share, share.tempPassword);
      }
      toastService.success('Account shared successfully!');
      setEmail('');
      reset();
    },
    onError: (err) => {
      toastService.error(err.body?.message || 'Failed to share account');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    shareAccount({ email: email.trim(), expiresInDays });
  };

  return (
    <ShareForm onSubmit={handleSubmit}>
      {error && (
        <Alert severity="error" onClose={reset}>
          {error.body?.message || 'Failed to share account'}
        </Alert>
      )}
      <ShareFormRow>
        <TextField
          label="User Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter the email of the user to share with"
          size="small"
          fullWidth
          required
          sx={{ flex: 2 }}
        />
        <TextField
          label="Expires In (Days)"
          type="number"
          value={expiresInDays}
          onChange={(e) => setExpiresInDays(Math.max(1, Math.min(30, parseInt(e.target.value) || 7)))}
          size="small"
          inputProps={{ min: 1, max: 30 }}
          sx={{ width: 140 }}
        />
        <ShareButton type="submit" disabled={isLoading || !email.trim()}>
          {isLoading ? <CircularProgress size={20} color="inherit" /> : <PersonAddIcon sx={{ mr: 0.5 }} />}
          Share
        </ShareButton>
      </ShareFormRow>
    </ShareForm>
  );
}

interface TempPasswordDisplayProps {
  share: SharedAccountDto;
  tempPassword: string;
  onClose: () => void;
}

function TempPasswordDisplay({ share, tempPassword, onClose }: TempPasswordDisplayProps) {
  const copyPassword = () => {
    navigator.clipboard.writeText(tempPassword);
    toastService.success('Password copied to clipboard');
  };

  return (
    <TempPasswordBox>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TempPasswordLabel>
          Temporary password for {share.sharedWithEmail}
        </TempPasswordLabel>
        <Tooltip title="Close">
          <RevokeButton onClick={onClose} size="small">
            <CloseIcon fontSize="small" />
          </RevokeButton>
        </Tooltip>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <TempPasswordValue>{tempPassword}</TempPasswordValue>
        <Tooltip title="Copy password">
          <ShareButton onClick={copyPassword} variant="outlined" size="small">
            <ContentCopyIcon fontSize="small" />
          </ShareButton>
        </Tooltip>
      </div>
      <ShareMeta>
        Share this password with {share.sharedWithEmail}. They will use it to access your account.
        Expires on {formatDate(share.expiresAt)}.
      </ShareMeta>
    </TempPasswordBox>
  );
}

interface ShareCardItemProps {
  share: SharedAccountDto;
  isOwner: boolean;
  onRevoke?: (shareId: number) => void;
  isRevoking?: boolean;
}

function ShareCardItem({ share, isOwner, onRevoke, isRevoking }: ShareCardItemProps) {
  const status = getShareStatus(share);
  const canRevoke = isOwner && (status === 'pending' || status === 'accepted');

  return (
    <ShareCard>
      <ShareInfo>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ShareEmail>
            {isOwner ? share.sharedWithEmail : share.ownerEmail}
          </ShareEmail>
          <StatusBadge status={status}>{status}</StatusBadge>
        </div>
        <ShareMeta>
          {isOwner ? 'Shared with' : 'Shared by'} • 
          {status === 'expired' 
            ? ` Expired on ${formatDate(share.expiresAt)}`
            : ` Expires ${formatDate(share.expiresAt)}`}
        </ShareMeta>
      </ShareInfo>
      {canRevoke && onRevoke && (
        <Tooltip title="Revoke access">
          <RevokeButton onClick={() => onRevoke(share.id)} disabled={isRevoking}>
            {isRevoking ? <CircularProgress size={16} /> : <CloseIcon />}
          </RevokeButton>
        </Tooltip>
      )}
    </ShareCard>
  );
}

export default function AccountSharing() {
  const { data: sharesData, isLoading: loadingShares } = useSharedAccounts();
  const { revokeShare, isLoading: revoking } = useRevokeShare({
    onSuccess: () => {
      toastService.success('Access revoked successfully');
    },
    onError: (err) => {
      toastService.error(err.body?.message || 'Failed to revoke access');
    },
  });

  const [newShare, setNewShare] = useState<{ share: SharedAccountDto; tempPassword: string } | null>(null);

  const sharedByMe = sharesData?.data?.sharedByMe || [];
  const sharedWithMe = sharesData?.data?.sharedWithMe || [];

  const handleShareCreated = (share: SharedAccountDto, tempPassword: string) => {
    setNewShare({ share, tempPassword });
  };

  return (
    <div>
      <ShareAccountForm onShareCreated={handleShareCreated} />

      {newShare && (
        <TempPasswordDisplay
          share={newShare.share}
          tempPassword={newShare.tempPassword}
          onClose={() => setNewShare(null)}
        />
      )}

      <SectionSubtitle>Accounts I've Shared</SectionSubtitle>
      {loadingShares ? (
        <EmptyState><CircularProgress size={24} /></EmptyState>
      ) : sharedByMe.length === 0 ? (
        <EmptyState>You haven't shared your account with anyone yet.</EmptyState>
      ) : (
        <ShareList>
          {sharedByMe.map((share) => (
            <ShareCardItem
              key={share.id}
              share={share}
              isOwner={true}
              onRevoke={revokeShare}
              isRevoking={revoking}
            />
          ))}
        </ShareList>
      )}

      <SectionDivider />

      <SectionSubtitle>Accounts Shared With Me</SectionSubtitle>
      {loadingShares ? (
        <EmptyState><CircularProgress size={24} /></EmptyState>
      ) : sharedWithMe.length === 0 ? (
        <EmptyState>No one has shared their account with you yet.</EmptyState>
      ) : (
        <ShareList>
          {sharedWithMe.map((share) => (
            <ShareCardItem
              key={share.id}
              share={share}
              isOwner={false}
            />
          ))}
        </ShareList>
      )}
    </div>
  );
}
