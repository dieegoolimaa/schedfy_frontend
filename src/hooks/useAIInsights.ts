import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api-client';
import { AIInsight } from '@/components/ai/ai-smart-banner';

export interface AIInsightsContext {
    // Operational context
    bookingsCount?: number;
    completedBookings?: number;
    cancelledBookings?: number;
    noShowCount?: number;
    newClientsCount?: number;

    // Financial context
    revenue?: number;
    revenueGrowth?: number;
    averageTicket?: number;

    // Time-based
    period?: 'day' | 'week' | 'month';

    // Page context
    pageType: 'dashboard' | 'financial' | 'operational' | 'bookings' | 'clients' | 'general';
}

interface AIInsightsResponse {
    insights: AIInsight[];
    generatedAt: string;
    expiresAt: string;
}

async function fetchAIInsights(
    entityId: string,
    context: AIInsightsContext
): Promise<AIInsightsResponse> {
    const response = await apiClient.post<AIInsightsResponse>(
        '/ai/insights',
        { entityId, context }
    );
    return response.data;
}

export function useAIInsights(context: AIInsightsContext) {
    const { user, entity } = useAuth();
    const entityId = user?.entityId || '';

    // Check if entity has AI subscription (isPremium)
    const hasAISubscription = (entity as any)?.isPremium === true;

    const query = useQuery({
        queryKey: ['ai-insights', entityId, context.pageType, context.period],
        queryFn: () => fetchAIInsights(entityId, context),
        enabled: Boolean(entityId) && hasAISubscription,
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
        refetchOnWindowFocus: false,
    });

    return {
        insights: query.data?.insights || [],
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
        hasAISubscription,
    };
}

// Hook for generating insights locally (fallback when API is not available)
export function useLocalAIInsights(context: AIInsightsContext): AIInsight[] {
    const { entity } = useAuth();
    const hasAISubscription = (entity as any)?.isPremium === true;

    if (!hasAISubscription) {
        return [];
    }

    const insights: AIInsight[] = [];

    // Generate contextual insights based on the data provided
    if (context.pageType === 'operational' || context.pageType === 'dashboard') {
        // Cancellation rate insight
        if (context.bookingsCount && context.cancelledBookings) {
            const cancelRate = (context.cancelledBookings / context.bookingsCount) * 100;
            if (cancelRate > 15) {
                insights.push({
                    id: 'high-cancellation',
                    type: 'warning',
                    title: 'High Cancellation Rate',
                    message: `Your cancellation rate is ${cancelRate.toFixed(1)}%. Consider implementing reminder messages or requiring deposits.`,
                    priority: 'high',
                });
            } else if (cancelRate < 5) {
                insights.push({
                    id: 'low-cancellation',
                    type: 'opportunity',
                    title: 'Excellent Retention',
                    message: `Your cancellation rate of ${cancelRate.toFixed(1)}% is below average. Your clients are highly engaged!`,
                    priority: 'low',
                });
            }
        }

        // No-show insight
        if (context.noShowCount && context.bookingsCount) {
            const noShowRate = (context.noShowCount / context.bookingsCount) * 100;
            if (noShowRate > 10) {
                insights.push({
                    id: 'no-show-alert',
                    type: 'warning',
                    title: 'No-Show Pattern Detected',
                    message: `${noShowRate.toFixed(1)}% of bookings resulted in no-shows. Consider sending SMS reminders 2 hours before appointments.`,
                    priority: 'medium',
                });
            }
        }
    }

    if (context.pageType === 'financial' || context.pageType === 'dashboard') {
        // Revenue growth insight
        if (context.revenueGrowth !== undefined) {
            if (context.revenueGrowth > 20) {
                insights.push({
                    id: 'revenue-growth',
                    type: 'trend',
                    title: 'Strong Revenue Growth',
                    message: `Revenue increased ${context.revenueGrowth.toFixed(1)}% this period. Keep up the great work!`,
                    priority: 'low',
                });
            } else if (context.revenueGrowth < -10) {
                insights.push({
                    id: 'revenue-decline',
                    type: 'warning',
                    title: 'Revenue Decline Alert',
                    message: `Revenue decreased ${Math.abs(context.revenueGrowth).toFixed(1)}%. Consider running a promotional campaign.`,
                    priority: 'high',
                });
            }
        }

        // Average ticket insight
        if (context.averageTicket) {
            insights.push({
                id: 'avg-ticket',
                type: 'tip',
                title: 'Optimize Average Ticket',
                message: `Your average ticket is €${context.averageTicket.toFixed(2)}. Consider offering add-on services to increase this value.`,
                priority: 'medium',
            });
        }
    }

    // Generic insights for any page
    if (insights.length === 0) {
        insights.push({
            id: 'welcome-ai',
            type: 'tip',
            title: 'AI is Analyzing Your Data',
            message: 'Continue using Schedfy normally. AI will generate personalized insights based on your business patterns.',
            priority: 'low',
        });
    }

    return insights;
}
