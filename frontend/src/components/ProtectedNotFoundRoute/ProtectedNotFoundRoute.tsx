import { Navigate } from 'react-router-dom';
import { getAuthToken } from '../../api/httpClient';
import NotFound from '../../pages/NotFound/NotFound';

interface ProtectedNotFoundRouteProps {
    children?: React.ReactNode;
}

/**
 * Protected 404 route that redirects unlogged-in users to signin
 * and shows NotFound page for logged-in users
 */
export default function ProtectedNotFoundRoute({ children }: ProtectedNotFoundRouteProps) {
    // Check if user is logged in
    if (!getAuthToken()) {
        return <Navigate to="/signin" replace />;
    }

    // Show NotFound page for logged-in users
    return children || <NotFound />;
}
