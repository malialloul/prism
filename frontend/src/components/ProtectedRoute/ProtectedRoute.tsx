import { Navigate } from 'react-router-dom';
import { isSharedAccessSession } from '../../api/httpClient';
import { toastService } from '../../services';

interface ProtectedRouteProps {
    children: React.ReactNode;
    blockSharedAccess?: boolean;
}

/**
 * Protected route wrapper that can block shared access users
 */
export default function ProtectedRoute({ children, blockSharedAccess = false }: ProtectedRouteProps) {
    if (blockSharedAccess && isSharedAccessSession()) {
        toastService.warning('Settings are not available for shared access accounts');
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}
