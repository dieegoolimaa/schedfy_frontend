import { useAuth } from "@/contexts/auth-context";
import { Entity } from "@/types/models/entities.interface";

export function useAIFeatures() {
    const { user, entity } = useAuth();
    const currentEntity = entity as unknown as Entity;

    // 1. Check if entity has access (Subscription level)
    // Business plan always has access, or if explicitly enabled via add-on
    const hasAccess = currentEntity?.plan === 'business' || currentEntity?.aiFeaturesEnabled === true;

    // 2. Check if feature is enabled by owner preference
    // Default to true if undefined to encourage usage
    const isEnabled = currentEntity?.aiInsightsEnabled !== false;

    // 3. Check user permissions
    // Owner always has permission
    // Professionals need specific permission 'canViewAIInsights'
    const isOwner = user?.role === 'owner';
    // Assuming permissions is an array of strings. Adjust if it's an object.
    const userPermissions = Array.isArray(user?.permissions) ? user.permissions : [];
    const hasPermission = isOwner || userPermissions.includes('canViewAIInsights');

    const canUse = hasAccess && isEnabled && hasPermission;

    return {
        hasAccess,
        isEnabled,
        hasPermission,
        canUse
    };
}
