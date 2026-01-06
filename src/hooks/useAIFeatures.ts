import { useAuth } from "@/contexts/auth-context";
import { usePermissions } from "@/hooks/use-permissions";
import { Entity } from "@/types/models/entities.interface";

/**
 * AI Features Access Rules:
 * 
 * 1. User must subscribe to AI Insights add-on (isPremium = true)
 * 2. User can toggle visibility of AI components (aiInsightsEnabled)
 * 
 * Feature Access by Plan:
 * - Simple: Operational insights only (booking stats, efficiency, capacity)
 * - Individual/Business: Full insights (financial, management, demand, tips + operational)
 */

export type AIInsightType = 'operational' | 'financial' | 'management' | 'demand' | 'tips';

export function useAIFeatures() {
    const { user, entity } = useAuth();
    const { hasPermission: checkPermission } = usePermissions();
    const currentEntity = entity as unknown as Entity;

    // 1. Check if user has AI features enabled
    // Now included for all plans, so we default to true
    const hasSubscription = true; // AI Features are now included for all plans

    // 2. Check if toggle is enabled (user preference to show/hide AI components)
    // Default to true if they have subscription
    const isToggleEnabled = currentEntity?.aiInsightsEnabled !== false;

    // 3. Check user permissions (using effective permissions)
    const isOwner = user?.role === 'owner';
    const hasPermission = isOwner || checkPermission('canViewAIInsights' as any);

    // 4. Calculate what they can access based on plan
    const plan = currentEntity?.plan || 'simple';

    // Operational insights available for all plans (if subscribed)
    const canUseOperational = hasSubscription && isToggleEnabled && hasPermission;

    // Financial & full insights only for Individual and Business plans
    const canUseFullInsights = canUseOperational && (plan === 'individual' || plan === 'business');

    // Helper function to check if specific insight type is available
    const canUseInsightType = (type: AIInsightType): boolean => {
        if (!hasSubscription || !isToggleEnabled || !hasPermission) return false;

        switch (type) {
            case 'operational':
                return true; // Available for all plans if subscribed
            case 'financial':
            case 'management':
            case 'demand':
            case 'tips':
                return plan === 'individual' || plan === 'business';
            default:
                return false;
        }
    };

    return {
        // Subscription status
        hasSubscription,
        isToggleEnabled,
        hasPermission,

        // Combined access check (any AI feature)
        canUse: hasSubscription && isToggleEnabled && hasPermission,

        // Plan-specific access
        canUseOperational,
        canUseFullInsights,

        // Type checker
        canUseInsightType,

        // Current plan
        plan,
    };
}

