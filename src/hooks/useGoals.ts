import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '../lib/api-client';

export interface Goal {
    _id: string;
    entityId: string;
    name: string;
    type: 'revenue' | 'bookings' | 'new_clients' | 'custom';
    targetValue: number;
    currentValue: number;
    period: 'monthly' | 'quarterly' | 'yearly';
    startDate: string;
    endDate: string;
    isActive: boolean;
    description?: string;
    metadata?: {
        unit?: string;
        currency?: string;
        icon?: string;
        color?: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface CreateGoalDto {
    entityId: string;
    name: string;
    type: 'revenue' | 'bookings' | 'new_clients' | 'custom';
    targetValue: number;
    period?: 'monthly' | 'quarterly' | 'yearly';
    startDate: Date;
    endDate: Date;
    description?: string;
    metadata?: {
        unit?: string;
        currency?: string;
        icon?: string;
        color?: string;
    };
}

export interface UpdateGoalDto extends Partial<CreateGoalDto> {
    currentValue?: number;
}

interface UseGoalsOptions {
    entityId?: string;
    autoFetch?: boolean;
}

export const useGoals = (options: UseGoalsOptions = {}) => {
    const { entityId, autoFetch = false } = options;
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchGoals = useCallback(async () => {
        if (!entityId) return [];

        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.get(`/api/goals/entity/${entityId}`);
            const data = response.data;
            const goalsArray = Array.isArray(data) ? data : [];
            setGoals(goalsArray);
            return goalsArray;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch goals');
            console.error('Error fetching goals:', err);
            setGoals([]);
            return [];
        } finally {
            setLoading(false);
        }
    }, [entityId]);

    const fetchActiveGoals = useCallback(async () => {
        if (!entityId) return [];

        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.get(`/api/goals/entity/${entityId}/active`);
            const data = response.data;
            const goalsArray = Array.isArray(data) ? data : [];
            setGoals(goalsArray);
            return goalsArray;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch active goals');
            console.error('Error fetching active goals:', err);
            setGoals([]);
            return [];
        } finally {
            setLoading(false);
        }
    }, [entityId]);

    const fetchCurrentMonthGoals = useCallback(async () => {
        if (!entityId) return [];

        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.get(`/api/goals/entity/${entityId}/current-month`);
            const data = response.data;
            // Ensure we always set an array
            const goalsArray = Array.isArray(data) ? data : [];
            setGoals(goalsArray);
            return goalsArray;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch monthly goals');
            console.error('Error fetching monthly goals:', err);
            setGoals([]); // Ensure goals is always an array
            return [];
        } finally {
            setLoading(false);
        }
    }, [entityId]);

    const createGoal = useCallback(async (goalData: CreateGoalDto): Promise<Goal | null> => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.post('/api/goals', goalData);
            await fetchGoals();
            return response.data as Goal;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create goal');
            console.error('Error creating goal:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, [fetchGoals]);

    const updateGoal = useCallback(async (id: string, goalData: UpdateGoalDto): Promise<Goal | null> => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.patch(`/api/goals/${id}`, goalData);
            await fetchGoals();
            return response.data as Goal;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update goal');
            console.error('Error updating goal:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, [fetchGoals]);

    const deleteGoal = useCallback(async (id: string): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            await apiClient.delete(`/api/goals/${id}`);
            await fetchGoals();
            return true;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete goal');
            console.error('Error deleting goal:', err);
            return false;
        } finally {
            setLoading(false);
        }
    }, [fetchGoals]);

    const createDefaultMonthlyGoals = useCallback(async (): Promise<Goal[]> => {
        if (!entityId) return [];

        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.post(`/api/goals/entity/${entityId}/default-monthly`);
            await fetchGoals();
            return response.data as Goal[];
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create default goals');
            console.error('Error creating default goals:', err);
            return [];
        } finally {
            setLoading(false);
        }
    }, [entityId, fetchGoals]);

    const recalculateProgress = useCallback(async (): Promise<void> => {
        if (!entityId) return;

        try {
            await apiClient.post(`/api/goals/entity/${entityId}/recalculate`);
            await fetchGoals();
        } catch (err: any) {
            console.error('Error recalculating progress:', err);
        }
    }, [entityId, fetchGoals]);

    useEffect(() => {
        if (autoFetch && entityId) {
            fetchGoals();
        }
    }, [autoFetch, entityId, fetchGoals]);

    return {
        goals,
        loading,
        error,
        fetchGoals,
        fetchActiveGoals,
        fetchCurrentMonthGoals,
        createGoal,
        updateGoal,
        deleteGoal,
        createDefaultMonthlyGoals,
        recalculateProgress,
    };
};
