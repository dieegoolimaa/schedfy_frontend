import { useAuth } from '../contexts/auth-context';
import { apiClient } from '../lib/api-client';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

interface PermissionCheck {
    page: string;
    action: 'view' | 'create' | 'update' | 'delete' | 'export' | 'import' | 'manage';
}

interface UserPermission {
    page: string;
    pageName: string;
    actions: string[];
    restrictions?: any;
    requiresPlan?: string;
}

interface PermissionsResponse {
    success: boolean;
    data: UserPermission[];
    flatPermissions: string[];
}

/**
 * Hook to check if current user has permission
 * Fetches EFFECTIVE permissions from backend API
 * Effective = Role Defaults + User Extras - User Denied
 */
export function usePermissions() {
    const { user } = useAuth();
    const [permissions, setPermissions] = useState<Record<string, string[]>>({});
    const [flatPermissions, setFlatPermissions] = useState<string[]>([]);

    // Fetch user's EFFECTIVE permissions from backend
    const { data: apiResponse, isLoading, refetch } = useQuery({
        queryKey: ['user-permissions', user?.id, user?.role, user?.plan],
        queryFn: async () => {
            try {
                const response = await apiClient.get<PermissionsResponse>('/api/role-permissions/me');
                return response.data;
            } catch (error) {
                console.warn('Failed to fetch permissions from API, using fallback');
                return null;
            }
        },
        enabled: !!user,
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });

    // Convert API permissions to lookup map
    useEffect(() => {
        if (apiResponse?.data && apiResponse.data.length > 0) {
            const permissionsMap: Record<string, string[]> = {};
            apiResponse.data.forEach(perm => {
                permissionsMap[perm.page] = perm.actions;
            });
            setPermissions(permissionsMap);
            setFlatPermissions(apiResponse.flatPermissions || []);
        } else if (user) {
            // Fallback to client-side permissions
            setPermissions(getRolePermissions(user.role));
            setFlatPermissions([]);
        }
    }, [apiResponse, user]);

    /**
     * Check if user has specific permission
     */
    const hasPermission = (check: PermissionCheck): boolean => {
        if (!user) return false;

        // Platform admins have all permissions
        if (user.role === 'platform_admin') {
            return true;
        }

        // Owner has all permissions
        if (user.role === 'owner') {
            return true;
        }

        // Admin in Simple Plan has all permissions
        if (user.role === 'admin' && user.plan === 'simple') {
            return true;
        }

        // Restrict specific pages for Professional on Simple Plan
        if (user.role === 'professional' && user.plan === 'simple') {
            // Professionals on Simple plan cannot access Clients or Financial/Earnings pages
            const restrictedPages = ['clients', 'reports', 'earnings', 'financial-reports'];
            if (restrictedPages.includes(check.page)) {
                return false;
            }
        }

        const pagePermissions = permissions[check.page] || [];

        // Check if role has 'manage' (grants all permissions)
        if (pagePermissions.includes('manage')) {
            return true;
        }

        // Check if role has specific action
        return pagePermissions.includes(check.action);
    };

    /**
     * Check if user can access a page
     */
    const canViewPage = (page: string): boolean => {
        return hasPermission({ page, action: 'view' });
    };

    /**
     * Check if user can create on a page
     */
    const canCreate = (page: string): boolean => {
        return hasPermission({ page, action: 'create' });
    };

    /**
     * Check if user can update on a page
     */
    const canUpdate = (page: string): boolean => {
        return hasPermission({ page, action: 'update' });
    };

    /**
     * Check if user can delete on a page
     */
    const canDelete = (page: string): boolean => {
        return hasPermission({ page, action: 'delete' });
    };

    /**
     * Check multiple permissions (all must pass)
     */
    const hasAllPermissions = (checks: PermissionCheck[]): boolean => {
        return checks.every((check) => hasPermission(check));
    };

    /**
     * Check multiple permissions (at least one must pass)
     */
    const hasAnyPermission = (checks: PermissionCheck[]): boolean => {
        return checks.some((check) => hasPermission(check));
    };

    /**
     * Check if user has a direct permission string (e.g. 'bookings:view')
     * Uses the flat permissions list from API
     */
    const hasDirectPermission = (permission: string): boolean => {
        if (!user) return false;

        // Owner and Platform Admin always have full access
        if (user.role === 'owner' || user.role === 'platform_admin') return true;

        // Admin in Simple Plan has full access (same as Owner)
        if (user.role === 'admin' && user.plan === 'simple') return true;

        // Check in flatPermissions from API first
        if (flatPermissions.includes(permission)) return true;

        // Fallback to user.permissions (legacy)
        return (user.permissions || []).includes(permission);
    };

    /**
     * Check if a permission is in the flat list (page:action format)
     */
    const hasFlatPermission = (page: string, action: string): boolean => {
        return flatPermissions.includes(`${page}:${action}`);
    };

    return {
        hasPermission,
        hasDirectPermission,
        hasFlatPermission,
        canViewPage,
        canCreate,
        canUpdate,
        canDelete,
        hasAllPermissions,
        hasAnyPermission,
        isLoading,
        permissions: apiResponse?.data || [],
        flatPermissions,
        refetch,
    };
}

/**
 * Client-side role permission definitions (fallback)
 * Used when API is unavailable
 */
function getRolePermissions(role: string): Record<string, string[]> {
    const permissions: Record<string, Record<string, string[]>> = {
        owner: {
            bookings: ['manage'],
            clients: ['manage'],
            services: ['manage'],
            users: ['manage'],
            reports: ['manage'],
            settings: ['manage'],
        },
        admin: {
            bookings: ['manage'],
            clients: ['manage'],
            services: ['manage'],
            users: ['view', 'create', 'update'],
            reports: ['view', 'export'],
            settings: ['view', 'update'],
        },
        professional: {
            bookings: ['view'],
            clients: ['view'],
            reports: ['view'],
        },
    };

    return permissions[role] || {};
}
