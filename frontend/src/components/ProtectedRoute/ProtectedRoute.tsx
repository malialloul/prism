import { Navigate } from 'react-router-dom';
import { isSharedAccessSession, getAuthToken } from '../../api/httpClient';
import { isDemoModeActive } from '../../context/TourContext';
import { toastService } from '../../services';
import { ROUTES } from '../../constants';

interface ProtectedRouteProps {
    children: React.ReactNode;
    blockSharedAccess?: boolean;
}

/**
 * Protected route wrapper that checks for authentication and can block shared access users
 * Also allows demo mode access for unauthenticated users to view the tour
 */
export default function ProtectedRoute({ children, blockSharedAccess = false }: ProtectedRouteProps) {
    const isDemo = isDemoModeActive();
    
    // Allow access if in demo mode (for tour)
    if (isDemo) {
        return <>{children}</>;
    }
    
    // Check if user is logged in
    if (!getAuthToken()) {
        return <Navigate to={ROUTES.SIGN_IN} replace />;
    }

    if (blockSharedAccess && isSharedAccessSession()) {
        toastService.warning('Settings are not available for shared access accounts');
        return <Navigate to={ROUTES.DASHBOARD.ROOT} replace />;
    }

    return <>{children}</>;
}
