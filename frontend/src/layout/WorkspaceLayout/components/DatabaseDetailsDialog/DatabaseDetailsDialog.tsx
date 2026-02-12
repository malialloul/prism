import { useState } from 'react';
import { Dialog, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import StorageIcon from '@mui/icons-material/Storage';
import DnsIcon from '@mui/icons-material/Dns';
import NumbersIcon from '@mui/icons-material/Numbers';
import TableChartIcon from '@mui/icons-material/TableChart';
import ApiIcon from '@mui/icons-material/Api';
import SecurityIcon from '@mui/icons-material/Security';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CloudIcon from '@mui/icons-material/Cloud';
import type { DatabaseDto } from '../../../../api/models/DatabaseDto';
import {
    DialogContainer,
    DialogHeader,
    DialogTitle,
    CloseButton,
    DetailsSection,
    DetailRow,
    DetailIcon,
    DetailContent,
    DetailLabel,
    DetailValue,
    ConnectionStringBox,
    ConnectionStringLabel,
    ConnectionStringTitle,
    ConnectionStringValue,
    CopyButton,
    StatusBadge,
    DetailsGrid,
} from './DatabaseDetailsDialog.styles';

interface DatabaseDetailsDialogProps {
    open: boolean;
    onClose: () => void;
    database: DatabaseDto | null;
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function DatabaseDetailsDialog({ open, onClose, database }: DatabaseDetailsDialogProps) {
    const [copied, setCopied] = useState(false);

    if (!database) return null;

    const connectionString = database.engine === 'postgres'
        ? `postgresql://${database.username}:<password>@${database.host}:${database.port}/${database.database}${database.ssl ? '?sslmode=require' : ''}`
        : `mysql://${database.username}:<password>@${database.host}:${database.port}/${database.database}`;

    const handleCopy = async () => {
        await navigator.clipboard.writeText(connectionString);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'connected': return 'Connected';
            case 'disconnected': return 'Disconnected';
            case 'error': return 'Error';
            default: return status;
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            PaperProps={{
                sx: {
                    backgroundColor: 'transparent',
                    backgroundImage: 'none',
                    boxShadow: 24,
                    borderRadius: '12px',
                    overflow: 'hidden',
                },
            }}
        >
            <DialogContainer>
                <DialogHeader>
                    <DialogTitle>{database.name}</DialogTitle>
                    <CloseButton onClick={onClose}>
                        <CloseIcon />
                    </CloseButton>
                </DialogHeader>

                <DetailsSection>
                    {/* Status Row */}
                    <DetailRow>
                        <DetailIcon>
                            <StorageIcon />
                        </DetailIcon>
                        <DetailContent>
                            <DetailLabel>Status</DetailLabel>
                            <StatusBadge status={database.status}>
                                {getStatusLabel(database.status)}
                            </StatusBadge>
                        </DetailContent>
                    </DetailRow>

                    {/* Grid of details */}
                    <DetailsGrid>
                        <DetailRow>
                            <DetailIcon>
                                <DnsIcon />
                            </DetailIcon>
                            <DetailContent>
                                <DetailLabel>Host</DetailLabel>
                                <DetailValue>{database.host}</DetailValue>
                            </DetailContent>
                        </DetailRow>

                        <DetailRow>
                            <DetailIcon>
                                <NumbersIcon />
                            </DetailIcon>
                            <DetailContent>
                                <DetailLabel>Port</DetailLabel>
                                <DetailValue>{database.port}</DetailValue>
                            </DetailContent>
                        </DetailRow>

                        <DetailRow>
                            <DetailIcon>
                                <StorageIcon />
                            </DetailIcon>
                            <DetailContent>
                                <DetailLabel>Database Name</DetailLabel>
                                <DetailValue>{database.database}</DetailValue>
                            </DetailContent>
                        </DetailRow>

                        <DetailRow>
                            <DetailIcon>
                                <SecurityIcon />
                            </DetailIcon>
                            <DetailContent>
                                <DetailLabel>Username</DetailLabel>
                                <DetailValue>{database.username}</DetailValue>
                            </DetailContent>
                        </DetailRow>

                        <DetailRow>
                            <DetailIcon>
                                <StorageIcon />
                            </DetailIcon>
                            <DetailContent>
                                <DetailLabel>Engine</DetailLabel>
                                <DetailValue>{database.engine === 'postgres' ? 'PostgreSQL' : 'MySQL'}</DetailValue>
                            </DetailContent>
                        </DetailRow>

                        <DetailRow>
                            <DetailIcon>
                                <TableChartIcon />
                            </DetailIcon>
                            <DetailContent>
                                <DetailLabel>Tables</DetailLabel>
                                <DetailValue>{database.tables}</DetailValue>
                            </DetailContent>
                        </DetailRow>

                        <DetailRow>
                            <DetailIcon>
                                <ApiIcon />
                            </DetailIcon>
                            <DetailContent>
                                <DetailLabel>Custom APIs</DetailLabel>
                                <DetailValue>{database.apis}</DetailValue>
                            </DetailContent>
                        </DetailRow>

                        <DetailRow>
                            <DetailIcon>
                                <CloudIcon />
                            </DetailIcon>
                            <DetailContent>
                                <DetailLabel>Storage Used</DetailLabel>
                                <DetailValue>{formatBytes(database.storageBytes)}</DetailValue>
                            </DetailContent>
                        </DetailRow>

                        <DetailRow>
                            <DetailIcon>
                                <SecurityIcon />
                            </DetailIcon>
                            <DetailContent>
                                <DetailLabel>SSL</DetailLabel>
                                <DetailValue>{database.ssl ? 'Enabled' : 'Disabled'}</DetailValue>
                            </DetailContent>
                        </DetailRow>
                    </DetailsGrid>

                    {/* Timestamps */}
                    <DetailsGrid>
                        <DetailRow>
                            <DetailIcon>
                                <AccessTimeIcon />
                            </DetailIcon>
                            <DetailContent>
                                <DetailLabel>Created</DetailLabel>
                                <DetailValue>{formatDate(database.createdAt)}</DetailValue>
                            </DetailContent>
                        </DetailRow>

                        {database.lastConnectedAt && (
                            <DetailRow>
                                <DetailIcon>
                                    <AccessTimeIcon />
                                </DetailIcon>
                                <DetailContent>
                                    <DetailLabel>Last Connected</DetailLabel>
                                    <DetailValue>{formatDate(database.lastConnectedAt)}</DetailValue>
                                </DetailContent>
                            </DetailRow>
                        )}
                    </DetailsGrid>

                    {/* Connection String */}
                    <ConnectionStringBox>
                        <ConnectionStringLabel>
                            <ConnectionStringTitle>Connection String</ConnectionStringTitle>
                            <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
                                <CopyButton onClick={handleCopy}>
                                    {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                                </CopyButton>
                            </Tooltip>
                        </ConnectionStringLabel>
                        <ConnectionStringValue>{connectionString}</ConnectionStringValue>
                    </ConnectionStringBox>
                </DetailsSection>
            </DialogContainer>
        </Dialog>
    );
}
