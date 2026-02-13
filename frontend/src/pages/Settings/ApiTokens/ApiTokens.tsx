import { useState } from 'react';
import { Link } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import KeyIcon from '@mui/icons-material/Key';
import { CircularProgress, Box, Alert } from '@mui/material';
import { useApiTokens, useCreateApiToken, useRevokeApiToken, useRevealApiToken, useVersionLimits } from '../../../api/entities/auth';
import { ApiTokensSkeleton } from '../../../components/Skeletons';
import { toastService } from '../../../services/toastService';
import { ROUTES } from '../../../constants';
import CreateTokenModal from './CreateTokenModal';
import {
  TokensContainer,
  TokensHeader,
  HeaderText,
  CreateButton,
  TokenList,
  TokenItem,
  TokenInfo,
  TokenName,
  TokenMeta,
  TokenPrefix,
  RevokeButton,
  EmptyState,
  CopyButton,
} from './ApiTokens.styles';

const ApiTokens = () => {
  const [revoking, setRevoking] = useState<number | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [revealedTokens, setRevealedTokens] = useState<Record<number, string>>({});
  const [revealingId, setRevealingId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const { data: tokensData, isLoading: loading } = useApiTokens();
  const tokens = tokensData?.data?.tokens ?? [];
  
  const { data: versionData } = useVersionLimits();
  const limits = versionData?.data?.limits;
  const usage = versionData?.data?.usage;
  const isTokenLimitReached = limits?.maxApiTokens && limits.maxApiTokens > 0 && usage && usage.apiTokens >= limits.maxApiTokens;

  const { createTokenAsync } = useCreateApiToken({
    onSuccess: (data) => {
      // Store the revealed token immediately after creation
      setRevealedTokens(prev => ({ ...prev, [data.data.token.id]: data.data.plainToken }));
      setCreateModalOpen(false);
      toastService.success('API token created successfully');
      if (data.warning) {
        toastService.warning(data.warning);
      }
    },
    onError: (error) => {
      const message = error.body?.message || 'Failed to create API token';
      toastService.error(message);
    },
  });

  const { revokeToken } = useRevokeApiToken({
    onSuccess: () => {
      setRevoking(null);
      toastService.success('API token revoked successfully');
    },
    onError: (error) => {
      setRevoking(null);
      const message = error.body?.message || 'Failed to revoke API token';
      toastService.error(message);
    },
  });

  const { revealTokenAsync } = useRevealApiToken({
    onError: (error) => {
      setRevealingId(null);
      const message = error.body?.message || 'Failed to reveal token';
      toastService.error(message);
    },
  });

  const handleCreateToken = async (name: string, expiresInDays?: number) => {
    await createTokenAsync({ name, expiresInDays });
  };

  const handleRevokeToken = (tokenId: number) => {
    setRevoking(tokenId);
    revokeToken(tokenId);
  };

  const handleToggleReveal = async (tokenId: number) => {
    if (revealedTokens[tokenId]) {
      // Hide the token
      setRevealedTokens(prev => {
        const next = { ...prev };
        delete next[tokenId];
        return next;
      });
    } else {
      // Reveal the token
      setRevealingId(tokenId);
      try {
        const result = await revealTokenAsync(tokenId);
        setRevealedTokens(prev => ({ ...prev, [tokenId]: result.data.plainToken }));
      } finally {
        setRevealingId(null);
      }
    }
  };

  const handleCopyToken = async (tokenId: number, token: string) => {
    try {
      await navigator.clipboard.writeText(token);
      setCopiedId(tokenId);
      setTimeout(() => setCopiedId(null), 2000);
      toastService.success('Token copied to clipboard');
    } catch (error) {
      toastService.error('Failed to copy token');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const getMaskedToken = (prefix: string) => {
    return prefix + '••••••••••••••••••••••••••••••••••••••••••••••••••••';
  };

  if (loading) {
    return <ApiTokensSkeleton />;
  }

  return (
    <TokensContainer>
      {isTokenLimitReached && (
        <Alert 
          severity="warning" 
          sx={{ 
            marginBottom: '1rem',
            '& .MuiAlert-message': { width: '100%' }
          }}
        >
          You've reached your API token limit ({usage?.apiTokens}/{limits?.maxApiTokens}). 
          <Link to={ROUTES.LIMITS} style={{ marginLeft: 4, color: 'inherit', fontWeight: 600 }}>
            View Limits
          </Link>
        </Alert>
      )}
      <TokensHeader>
        <HeaderText>
          API tokens allow external applications to authenticate with your auto-generated APIs.
          <br />
          Use them as an alternative to JWT tokens when calling your CRUD endpoints.
        </HeaderText>
      </TokensHeader>

      <Box sx={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '0.5rem' }}>
        <CreateButton onClick={() => setCreateModalOpen(true)}>
          <AddIcon sx={{ fontSize: 16 }} />
          Create Token
        </CreateButton>
      </Box>

      {tokens.length === 0 ? (
        <EmptyState>
          <KeyIcon sx={{ fontSize: 40, opacity: 0.4, marginBottom: '0.5rem' }} />
          <div>No API tokens yet</div>
          <div style={{ opacity: 0.7, marginTop: '0.25rem' }}>
            Create a token to authenticate external API calls
          </div>
        </EmptyState>
      ) : (
        <TokenList>
          {tokens.map(token => {
            const isRevealed = !!revealedTokens[token.id];
            const displayToken = isRevealed ? revealedTokens[token.id] : getMaskedToken(token.tokenPrefix);
            
            return (
              <TokenItem key={token.id}>
                <TokenInfo>
                  <TokenName>{token.name}</TokenName>
                  <TokenMeta>
                    <TokenPrefix style={{ fontFamily: 'monospace', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {displayToken}
                    </TokenPrefix>
                    <CopyButton
                      onClick={() => isRevealed && handleCopyToken(token.id, revealedTokens[token.id])}
                      style={{ opacity: isRevealed ? 1 : 0.4, cursor: isRevealed ? 'pointer' : 'not-allowed' }}
                      title={isRevealed ? 'Copy token' : 'Reveal token first to copy'}
                    >
                      {copiedId === token.id ? (
                        <CheckIcon sx={{ fontSize: 14 }} />
                      ) : (
                        <ContentCopyIcon sx={{ fontSize: 14 }} />
                      )}
                    </CopyButton>
                    <CopyButton
                      onClick={() => handleToggleReveal(token.id)}
                      title={isRevealed ? 'Hide token' : 'Show token'}
                    >
                      {revealingId === token.id ? (
                        <CircularProgress size={14} sx={{ color: 'inherit' }} />
                      ) : isRevealed ? (
                        <VisibilityOffIcon sx={{ fontSize: 14 }} />
                      ) : (
                        <VisibilityIcon sx={{ fontSize: 14 }} />
                      )}
                    </CopyButton>
                  </TokenMeta>
                  <TokenMeta>
                    <span>Created {formatDate(token.createdAt)}</span>
                    {token.lastUsedAt && <span>Last used {formatDate(token.lastUsedAt)}</span>}
                    {token.expiresAt && (
                      <span style={{ color: isExpired(token.expiresAt) ? '#f44336' : undefined }}>
                        {isExpired(token.expiresAt) ? 'Expired' : `Expires ${formatDate(token.expiresAt)}`}
                      </span>
                    )}
                  </TokenMeta>
                </TokenInfo>
                <RevokeButton
                  onClick={() => handleRevokeToken(token.id)}
                  sx={{ opacity: revoking === token.id ? 0.5 : 1, pointerEvents: revoking === token.id ? 'none' : 'auto' }}
                >
                  {revoking === token.id ? (
                    <CircularProgress size={14} sx={{ color: 'inherit' }} />
                  ) : (
                    <>
                      <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                      Revoke
                    </>
                  )}
                </RevokeButton>
              </TokenItem>
            );
          })}
        </TokenList>
      )}

      <CreateTokenModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateToken}
      />
    </TokensContainer>
  );
};

export default ApiTokens;
