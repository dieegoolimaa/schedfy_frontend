import { useState, useEffect, useCallback } from 'react';
import { entitySubscriptionsService, UsageLimits, BookingCheckResult } from '../services/entity-subscriptions.service';

interface UseUsageLimitsReturn {
    usage: UsageLimits | null;
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    canCreateBooking: () => Promise<BookingCheckResult>;
    isNearLimit: (type: 'bookings' | 'professionals' | 'clients') => boolean;
}

/**
 * Hook to track and display usage limits for the current entity
 * 
 * @example
 * ```tsx
 * const { usage, loading, isNearLimit } = useUsageLimits();
 * 
 * // Show warning when approaching limit
 * {isNearLimit('bookings') && (
 *   <UpgradePrompt message="You're running low on bookings!" />
 * )}
 * 
 * // Display usage bar
 * <ProgressBar 
 *   value={usage?.bookings.percentage || 0} 
 *   label={`${usage?.bookings.used}/${usage?.bookings.limit || '∞'} bookings`}
 * />
 * ```
 */
export function useUsageLimits(): UseUsageLimitsReturn {
    const [usage, setUsage] = useState<UsageLimits | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsage = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await entitySubscriptionsService.getUsageLimits();
            setUsage(response.data);
        } catch (err: any) {
            console.error('[useUsageLimits] Error fetching usage:', err);
            setError(err.message || 'Failed to fetch usage limits');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsage();
    }, [fetchUsage]);

    const checkCanCreateBooking = useCallback(async (): Promise<BookingCheckResult> => {
        try {
            const response = await entitySubscriptionsService.canCreateBooking();
            return response.data;
        } catch (err: any) {
            return {
                canCreate: false,
                currentUsage: 0,
                limit: 0,
                remaining: 0,
                percentage: 0,
                message: err.message || 'Failed to check booking limit',
            };
        }
    }, []);

    /**
     * Check if usage is at or above 80% (near limit warning threshold)
     */
    const isNearLimit = useCallback((type: 'bookings' | 'professionals' | 'clients'): boolean => {
        if (!usage) return false;
        const item = usage[type];
        if (!item || item.unlimited) return false;
        return item.percentage >= 80;
    }, [usage]);

    return {
        usage,
        loading,
        error,
        refresh: fetchUsage,
        canCreateBooking: checkCanCreateBooking,
        isNearLimit,
    };
}
