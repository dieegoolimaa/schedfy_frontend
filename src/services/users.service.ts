/**
 * Users Service - Frontend
 */

import { apiClient } from '../lib/api-client';
import type { User, CreateUserData, UpdateUserData } from '../interfaces/users.interface';

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
        const response = await apiClient.put<User>(`/api/users/${id}`, userData);
        return response.data as User;
    },

    /**
     * Delete user
     */
    deleteUser: async (id: string): Promise<void> => {
        await apiClient.delete(`/api/users/${id}`);
    },
};
