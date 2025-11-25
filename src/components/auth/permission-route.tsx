import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { usePermissions } from "../../hooks/use-permissions";
import { useAuth } from "../../contexts/auth-context";

interface PermissionRouteProps {
    children: ReactNode;
    page: string;
    action?: 'view' | 'create' | 'update' | 'delete' | 'export' | 'import' | 'manage';
    fallbackPath?: string;
}

/**
 * Route guard that checks if user has required permission
 * 
 * @example
 * ```tsx
 * <PermissionRoute page="users" action="view">
 *   <UserManagementPage />
 * </PermissionRoute>
 * ```
 */
export function PermissionRoute({
    children,
    page,
    action = 'view',
    fallbackPath = '/unauthorized',
}: PermissionRouteProps) {
    const { user } = useAuth();
    const { hasPermission } = usePermissions();

    // If not authenticated, redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Check if user has required permission
    const hasAccess = hasPermission({ page, action });

    if (!hasAccess) {
        return <Navigate to={fallbackPath} replace />;
    }

    return <>{children}</>;
}

interface PlanRouteProps {
    children: ReactNode;
    requiredPlan: 'simple' | 'business' | 'individual';
    fallbackPath?: string;
}

/**
 * Route guard that checks if entity has required plan
 * 
 * @example
 * ```tsx
 * <PlanRoute requiredPlan="business">
 *   <FinancialReportsPage />
 * </PlanRoute>
 * ```
 */
export function PlanRoute({
    children,
    requiredPlan,
    fallbackPath = '/upgrade',
}: PlanRouteProps) {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const planHierarchy = ['individual', 'simple', 'business'];
    const currentPlan = (user as any).entity?.plan || user.plan;

    if (!currentPlan) {
        return <Navigate to={fallbackPath} replace />;
    }

    const currentIndex = planHierarchy.indexOf(currentPlan);
    const requiredIndex = planHierarchy.indexOf(requiredPlan);

    // Current plan must be >= required plan
    if (currentIndex < requiredIndex) {
        return <Navigate to={fallbackPath} replace />;
    }

    return <>{children}</>;
}
