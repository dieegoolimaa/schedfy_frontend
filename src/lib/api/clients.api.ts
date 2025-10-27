import { apiClient } from './client';
import { QueryParams, PaginatedResponse } from '../../types/api';

export interface Client {
    id: string;
    entityId: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    notes?: string;
    tags?: string[];
    dateOfBirth?: string;
    preferences?: Record<string, any>;
    totalBookings?: number;
    totalSpent?: number;
    lastVisit?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateClientDto {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    notes?: string;
    tags?: string[];
    dateOfBirth?: string;
    preferences?: Record<string, any>;
}

export interface UpdateClientDto extends Partial<CreateClientDto> { }

export interface ClientFilters extends QueryParams {
    entityId?: string;
    search?: string;
    tags?: string;
}

export const clientsApi = {
    /**
     * Get all clients (paginated)
     */
    async getAll(params?: ClientFilters) {
        return apiClient.get<PaginatedResponse<Client>>('/api/clients', { params });
    },

    /**
     * Get clients by entity
     */
    async getByEntity(entityId: string, params?: QueryParams) {
        return apiClient.get<Client[]>(`/api/clients/entity/${entityId}`, { params });
    },

    /**
     * Search clients
     */
    async search(entityId: string, query: string) {
        return apiClient.get<Client[]>(`/api/clients/entity/${entityId}/search`, {
            params: { q: query }
        });
    },

    /**
     * Get single client
     */
    async getById(id: string) {
        return apiClient.get<Client>(`/api/clients/${id}`);
    },

    /**
     * Get client with booking history
     */
    async getWithBookings(id: string) {
        return apiClient.get<Client & { bookings: any[] }>(`/api/clients/${id}/bookings`);
    },

    /**
     * Create a new client
     */
    async create(data: CreateClientDto) {
        return apiClient.post<Client>('/api/clients', data);
    },

    /**
     * Update a client
     */
    async update(id: string, data: UpdateClientDto) {
        return apiClient.patch<Client>(`/api/clients/${id}`, data);
    },

    /**
     * Delete a client
     */
    async delete(id: string) {
        return apiClient.delete<void>(`/api/clients/${id}`);
    },

    /**
     * Add tags to a client
     */
    async addTags(id: string, tags: string[]) {
        return apiClient.post<Client>(`/api/clients/${id}/tags`, { tags });
    },

    /**
     * Remove tags from a client
     */
    async removeTags(id: string, tags: string[]) {
        return apiClient.patch<Client>(`/api/clients/${id}/tags/remove`, { tags });
    },

    /**
     * Get client statistics
     */
    async getStats(id: string) {
        return apiClient.get<{
            totalBookings: number;
            totalSpent: number;
            averageSpent: number;
            lastVisit: string;
            favoriteServices: Array<{ serviceId: string; serviceName: string; count: number }>;
        }>(`/api/clients/${id}/stats`);
    },
};
