import { apiClient } from './client';

export interface Entity {
    id: string;
    name: string;
    email: string;
    plan: 'simple' | 'individual' | 'business';
    allowConcurrentBookings: boolean;
    // Add other entity fields as needed
}

export const entitiesApi = {
    /**
     * Get entity by ID
     */
    async getById(id: string) {
        return apiClient.get<Entity>(`/api/entities/${id}`);
    },

    /**
     * Get entities owned by user
     */
    async getByOwner(ownerId: string) {
        return apiClient.get<Entity[]>(`/api/entities/owner/${ownerId}`);
    },
};