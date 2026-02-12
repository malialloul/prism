import { createContext, useContext, useReducer, useCallback, useEffect, type ReactNode, type Dispatch } from 'react';
import type { SharePermissions } from '../api/models/SharedAccountDto';
import { DEFAULT_SHARE_PERMISSIONS } from '../api/models/SharedAccountDto';
import { getAuthToken, isSharedAccessSession } from '../api/httpClient';
import { httpClient } from '../api/httpClient';

// Action types
type PermissionsAction = 
    | { type: 'UPDATE_PERMISSIONS'; payload: SharePermissions }
    | { type: 'RESET_FROM_TOKEN' };

interface PermissionsState {
    permissions: SharePermissions;
    isSharedAccess: boolean;
    isLoading: boolean;
}

interface PermissionsContextType extends PermissionsState {
    dispatch: Dispatch<PermissionsAction>;
    hasPermission: (permission: keyof SharePermissions) => boolean;
}

const PermissionsContext = createContext<PermissionsContextType | null>(null);

// Export dispatch for use outside React (e.g., WebSocket service)
let globalDispatch: Dispatch<PermissionsAction> | null = null;

export const dispatchPermissionsUpdate = (permissions: SharePermissions) => {
    if (globalDispatch) {
        globalDispatch({ type: 'UPDATE_PERMISSIONS', payload: permissions });
    }
};

/**
 * Decode the JWT token and return permissions
 */
const getPermissionsFromToken = (): SharePermissions | null => {
    const token = getAuthToken();
    if (!token) return null;

    try {
        const base64Payload = token.split('.')[1];
        const payload = JSON.parse(atob(base64Payload));
        return payload.permissions || null;
    } catch {
        return null;
    }
};

const getInitialState = (): PermissionsState => ({
    permissions: getPermissionsFromToken() || DEFAULT_SHARE_PERMISSIONS,
    isSharedAccess: isSharedAccessSession(),
    isLoading: isSharedAccessSession(), // Only loading if shared access (need to fetch from DB)
});

function permissionsReducer(state: PermissionsState, action: PermissionsAction): PermissionsState {
    switch (action.type) {
        case 'UPDATE_PERMISSIONS':
            return {
                ...state,
                permissions: action.payload,
                isLoading: false,
            };
        case 'RESET_FROM_TOKEN':
            return getInitialState();
        default:
            return state;
    }
}

export function PermissionsProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(permissionsReducer, null, getInitialState);

    // Store dispatch globally so WebSocket can use it
    globalDispatch = dispatch;

    // Fetch current permissions from DB on mount for shared users
    useEffect(() => {
        const fetchPermissions = async () => {
            // Double-check if this is a shared access session (token might have changed)
            if (!isSharedAccessSession()) {
                // Not a shared user - no need to fetch, just ensure loading is false
                if (state.isLoading) {
                    dispatch({ type: 'UPDATE_PERMISSIONS', payload: DEFAULT_SHARE_PERMISSIONS });
                }
                return;
            }
            
            try {
                const response = await httpClient.get<{ data: { permissions: SharePermissions } }>('/auth/my-permissions');
                dispatch({ type: 'UPDATE_PERMISSIONS', payload: response.data.data.permissions });
            } catch (error: any) {
                // If 404, user is not actually a shared user (token may be stale)
                // Silently fall back to default permissions
                dispatch({ type: 'UPDATE_PERMISSIONS', payload: getPermissionsFromToken() || DEFAULT_SHARE_PERMISSIONS });
            }
        };

        fetchPermissions();
    }, []);

    const hasPermission = useCallback((permission: keyof SharePermissions): boolean => {
        // Account owners have full access
        if (!state.isSharedAccess) return true;
        return state.permissions[permission] ?? false;
    }, [state.isSharedAccess, state.permissions]);

    return (
        <PermissionsContext.Provider value={{ ...state, dispatch, hasPermission }}>
            {children}
        </PermissionsContext.Provider>
    );
}

export function usePermissionsContext() {
    const context = useContext(PermissionsContext);
    if (!context) {
        throw new Error('usePermissionsContext must be used within a PermissionsProvider');
    }
    return context;
}
