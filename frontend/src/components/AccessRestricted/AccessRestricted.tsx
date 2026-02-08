import { useState, useEffect } from "react";
import { Box, Typography, Button, TextField, CircularProgress, Alert } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import { styled } from "@mui/material/styles";
import { getSharedAccessInfo } from "../../api/httpClient";
import { usePermissionsContext } from "../../context/PermissionsContext";
import { useCreatePermissionRequest, useMyPermissionRequests } from "../../api/entities/auth";
import type { SharePermissions } from "../../api/models/SharedAccountDto";
import { toastService } from "../../services";

const RestrictedContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(6),
    textAlign: 'center',
    flex: 1,
    minHeight: '200px',
}));

const IconWrapper = styled(Box)(({ theme }) => ({
    width: 80,
    height: 80,
    borderRadius: '50%',
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing(3),
}));

const SuccessIconWrapper = styled(Box)(({ theme }) => ({
    width: 80,
    height: 80,
    borderRadius: '50%',
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(46, 125, 50, 0.15)' : 'rgba(46, 125, 50, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing(3),
}));

const RejectedIconWrapper = styled(Box)(({ theme }) => ({
    width: 80,
    height: 80,
    borderRadius: '50%',
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(211, 47, 47, 0.15)' : 'rgba(211, 47, 47, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing(3),
}));

interface AccessRestrictedProps {
    message?: string;
    description?: string;
    permission?: keyof SharePermissions;
    showRequestAccess?: boolean;
}

export function AccessRestricted({
    message = "Access Restricted",
    description = "You don't have permission to access this content. Please contact the account owner to request access.",
    permission,
    showRequestAccess = true,
}: AccessRestrictedProps) {
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [requestMessage, setRequestMessage] = useState("");
    const [requestSent, setRequestSent] = useState(false);

    const { isSharedAccess, hasPermission } = usePermissionsContext();
    const shareInfo = getSharedAccessInfo();

    // Check if user now has the permission (owner may have granted it)
    const nowHasPermission = permission ? hasPermission(permission) : false;

    const { data: myRequests, refetch: refetchRequests } = useMyPermissionRequests();

    const { createPermissionRequest, isLoading, error, reset } = useCreatePermissionRequest({
        onSuccess: () => {
            setRequestSent(true);
            setShowRequestForm(false);
            setRequestMessage("");
            toastService.success("Permission request sent successfully!");
            refetchRequests();
        },
        onError: (err) => {
            toastService.error(err.body?.message || "Failed to send request");
        },
    });

    // Check if there's already a pending request for this permission
    const pendingRequest = permission && myRequests?.data?.requests?.find(
        (r) => r.permission === permission && r.status === 'pending'
    );

    // Check if there's a rejected request for this permission
    const rejectedRequest = permission && myRequests?.data?.requests?.find(
        (r) => r.permission === permission && r.status === 'rejected'
    );

    // Reset requestSent when permission changes or when request is rejected/approved
    useEffect(() => {
        setRequestSent(false);
        setShowRequestForm(false);
    }, [permission]);

    // Reset requestSent when a rejection comes in (so we show rejected UI instead of "Request Sent")
    useEffect(() => {
        if (rejectedRequest) {
            setRequestSent(false);
        }
    }, [rejectedRequest]);

    const handleSubmitRequest = () => {
        if (!shareInfo || !permission) return;
        createPermissionRequest({
            shareId: shareInfo.shareId,
            permission,
            message: requestMessage || undefined,
        });
    };

    const canRequestAccess = isSharedAccess && shareInfo && permission && showRequestAccess;

    // If user now has the permission (owner granted it), show success message
    if (nowHasPermission) {
        return (
            <RestrictedContainer>
                <SuccessIconWrapper>
                    <CheckCircleOutlineIcon sx={{ fontSize: 40, color: 'success.main' }} />
                </SuccessIconWrapper>
                <Typography variant="h6" color="text.primary" gutterBottom>
                    Access Granted!
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
                    You now have permission to access this feature. Please close and reopen this dialog to continue.
                </Typography>
            </RestrictedContainer>
        );
    }

    // If request was already sent for this permission (pending)
    if (pendingRequest) {
        return (
            <RestrictedContainer>
                <SuccessIconWrapper>
                    <CheckCircleOutlineIcon sx={{ fontSize: 40, color: 'success.main' }} />
                </SuccessIconWrapper>
                <Typography variant="h6" color="text.primary" gutterBottom>
                    Request Pending
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
                    You've already requested access to this feature. The account owner will review your request soon.
                </Typography>
            </RestrictedContainer>
        );
    }

    // If request was just sent
    if (requestSent) {
        return (
            <RestrictedContainer>
                <SuccessIconWrapper>
                    <CheckCircleOutlineIcon sx={{ fontSize: 40, color: 'success.main' }} />
                </SuccessIconWrapper>
                <Typography variant="h6" color="text.primary" gutterBottom>
                    Request Sent!
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
                    The account owner has been notified of your request and will review it soon.
                </Typography>
            </RestrictedContainer>
        );
    }

    // If there's a rejected request and user hasn't clicked to re-request yet
    if (rejectedRequest && !showRequestForm && canRequestAccess) {
        const rejectionMessage = rejectedRequest.responseMessage;

        return (
            <RestrictedContainer>
                <RejectedIconWrapper>
                    <CancelOutlinedIcon sx={{ fontSize: 40, color: 'error.main' }} />
                </RejectedIconWrapper>
                <Typography variant="h6" color="text.primary" gutterBottom>
                    Request Rejected
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
                    Your previous request for this permission was rejected.
                    {rejectionMessage && (
                        <Box component="span" sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}>
                            Reason: "{rejectionMessage}"
                        </Box>
                    )}
                </Typography>
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<SendIcon />}
                    onClick={() => setShowRequestForm(true)}
                    sx={{ mt: 2 }}
                >
                    Request Again
                </Button>
            </RestrictedContainer>
        );
    }

    return (
        <RestrictedContainer>
            <IconWrapper>
                <LockOutlinedIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
            </IconWrapper>
            <Typography variant="h6" color="text.primary" gutterBottom>
                {message}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mb: canRequestAccess ? 3 : 0 }}>
                {description}
            </Typography>

            {canRequestAccess && !showRequestForm && (
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<SendIcon />}
                    onClick={() => setShowRequestForm(true)}
                    sx={{ mt: 2 }}
                >
                    Request Access
                </Button>
            )}

            {showRequestForm && (
                <Box sx={{ mt: 2, width: '100%', maxWidth: 400 }}>
                    {error && (
                        <Alert severity="error" onClose={reset} sx={{ mb: 2 }}>
                            {error.body?.message || 'Failed to send request'}
                        </Alert>
                    )}
                    <TextField
                        fullWidth
                        size="small"
                        multiline
                        rows={2}
                        placeholder="Add an optional message explaining why you need access..."
                        value={requestMessage}
                        onChange={(e) => setRequestMessage(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Button
                            variant="text"
                            size="small"
                            onClick={() => {
                                setShowRequestForm(false);
                                setRequestMessage("");
                                reset();
                            }}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            size="small"
                            onClick={handleSubmitRequest}
                            disabled={isLoading}
                            startIcon={isLoading ? <CircularProgress size={16} /> : <SendIcon />}
                        >
                            Send Request
                        </Button>
                    </Box>
                </Box>
            )}
        </RestrictedContainer>
    );
}
