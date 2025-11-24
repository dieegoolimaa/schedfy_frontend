import { apiClient } from '../lib/api-client';

export interface EntityStats {
    users: {
        total: number;
        active: number;
    };
    bookings: {
        total: number;
        completed: number;
        pending: number;
        thisMonth: number;
        lastMonth: number;
        change: number;
    };
    revenue: {
        total: number;
        thisMonth: number;
        lastMonth: number;
        change: number;
    };
    clients: {
        newThisMonth: number;
        newLastMonth: number;
        change: number;
    };
}

export const dashboardService = {
    /**
     * Get entity statistics with period comparison
     */
    getEntityStats: async (entityId: string): Promise<EntityStats> => {
        const response = await apiClient.get(`/api/dashboard/entity/${entityId}/stats`);
        return (response.data as any).data || response.data;
    },
};
