/**
 * Users Service - Frontend
 */

import { apiClient } from '../lib/api-client';
import type { User, CreateUserData, UpdateUserData } from '../types/models/users.interface';

export const usersService = {
    /**
     * Get all users
     */
    getUsers: async (): Promise<User[]> => {
        const response = await apiClient.get<User[]>('/api/users');
        return response.data || [];
    },

    /**
     * Create new user
     */
    createUser: async (userData: CreateUserData): Promise<User> => {
        const response = await apiClient.post<User>('/api/users', userData);
        return response.data as User;
    },

    /**
     * Update user
     */
    updateUser: async (id: string, userData: UpdateUserData): Promise<User> => {
        const response = await apiClient.patch<User>(`/api/users/${id}`, userData);
        return response.data as User;
    },

    /**
     * Delete user
     */
    deleteUser: async (id: string): Promise<void> => {
        await apiClient.delete(`/api/users/${id}`);
    },

    /**
     * Accept invitation
     */
    acceptInvitation: async (data: {
        token: string;
        password: string;
        firstName: string;
        lastName: string;
        professionalInfo?: { jobFunction?: string };
    }) => {
        return await apiClient.post('/api/users/accept-invitation', data);
    },

    /**
     * Validate invitation token
     */
    validateInvitation: async (token: string): Promise<User & { entityId: { plan: string } }> => {
        const response = await apiClient.get(`/api/users/validate-invitation/${token}`);
        return response.data as User & { entityId: { plan: string } };
    },

    /**
     * Get all team members for an entity
     */
    getTeamMembers: async (entityId: string): Promise<User[]> => {
        const response = await apiClient.get<User[]>(`/api/users/entity/${entityId}/team`);
        return response.data || [];
    },

    /**
     * Get all professionals (users with isProfessional = true)
     */
    getProfessionals: async (entityId: string): Promise<User[]> => {
        const response = await apiClient.get<User[]>(`/api/users/entity/${entityId}/professionals`);
        return response.data || [];
    },

    /**
     * Invite a new user
     */
    inviteUser: async (data: CreateUserData): Promise<User> => {
        const response = await apiClient.post<User>('/api/users', data);
        return response.data as User;
    },

    /**
     * Update user role
     */
    updateUserRole: async (userId: string, role: string): Promise<User> => {
        const response = await apiClient.patch<User>(`/api/users/${userId}/role`, { role });
        return response.data as User;
    },

    /**
     * Update isProfessional status
     */
    updateProfessionalStatus: async (userId: string, isProfessional: boolean): Promise<User> => {
        const response = await apiClient.patch<User>(
            `/api/users/${userId}/professional-status`,
            { isProfessional }
        );
        return response.data as User;
    },

    /**
     * Update user status (active, inactive, suspended)
     */
    updateUserStatus: async (userId: string, status: string): Promise<User> => {
        const response = await apiClient.patch<User>(`/api/users/${userId}/status`, { status });
        return response.data as User;
    },

    /**
     * Update user permissions (extras and denied)
     */
    updateUserPermissions: async (
        userId: string,
        permissions: string[],
        deniedPermissions?: string[]
    ): Promise<User> => {
        const response = await apiClient.patch<User>(`/api/users/${userId}/permissions`, {
            permissions,
            deniedPermissions,
        });
        return response.data as User;
    },

    /**
     * Resend invitation to a user
     */
    resendInvitation: async (userId: string): Promise<{ message: string }> => {
        const response = await apiClient.post<{ message: string }>(
            `/api/users/${userId}/resend-invitation`
        );
        return response.data as { message: string };
    },

    /**
     * Get user performance metrics
     */
    getUserMetrics: async (
        userId: string,
        startDate?: Date,
        endDate?: Date
    ): Promise<{
        userId: string;
        isProfessional: boolean;
        role: string;
        totalBookings: number;
        completedBookings: number;
        cancelledBookings: number;
        revenue: number;
        averageRating?: number;
    }> => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate.toISOString());
        if (endDate) params.append('endDate', endDate.toISOString());

        const response = await apiClient.get<{
            userId: string;
            isProfessional: boolean;
            role: string;
            totalBookings: number;
            completedBookings: number;
            cancelledBookings: number;
            revenue: number;
            averageRating?: number;
        }>(`/api/users/${userId}/metrics?${params.toString()}`);
        return response.data;
    },
};
