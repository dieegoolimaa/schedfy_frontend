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

/**
 * Hook to check if current user has permission
 * Fetches permissions from backend API
 */
export function usePermissions() {
    const { user } = useAuth();
    const [permissions, setPermissions] = useState<Record<string, string[]>>({});

    // Fetch user's permissions from backend
    const { data: apiPermissions, isLoading } = useQuery({
        queryKey: ['user-permissions', user?.role, user?.plan],
        queryFn: async () => {
            try {
                const response = await apiClient.get<{ success: boolean; data: UserPermission[] }>('/api/role-permissions/me');
                return response.data?.data || [];
            } catch (error) {
                console.warn('Failed to fetch permissions from API, using fallback');
                return [];
            }
        },
        enabled: !!user,
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });

    // Convert API permissions to lookup map
    useEffect(() => {
        if (apiPermissions && apiPermissions.length > 0) {
            const permissionsMap: Record<string, string[]> = {};
            apiPermissions.forEach(perm => {
                permissionsMap[perm.page] = perm.actions;
            });
            setPermissions(permissionsMap);
        } else if (user) {
            // Fallback to client-side permissions
            setPermissions(getRolePermissions(user.role));
        }
    }, [apiPermissions, user]);

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
     * Check if user has a direct permission string (e.g. 'canManageSubscription')
     */
    const hasDirectPermission = (permission: string): boolean => {
        if (!user) return false;

        // Owner and Platform Admin always have full access
        if (user.role === 'owner' || user.role === 'platform_admin') return true;

        // Admin in Simple Plan has full access (same as Owner)
        // In Business Plan, Admin has specific permissions
        if (user.role === 'admin' && user.plan === 'simple') return true;

        return (user.permissions || []).includes(permission);
    };

    return {
        hasPermission,
        hasDirectPermission,
        canViewPage,
        canCreate,
        canUpdate,
        canDelete,
        hasAllPermissions,
        hasAnyPermission,
        isLoading,
        permissions: apiPermissions || [],
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
            // Note: In simple plan, this should be treated as 'manage' everywhere
        },
        professional: {
            bookings: ['view'], // Own bookings only
            clients: ['view'], // Clients they serve
            reports: ['view'], // Own metrics only
        },
    };

    return permissions[role] || {};
}
