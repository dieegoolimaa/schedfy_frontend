/**
 * Clients Service - Frontend
 */

import { apiClient } from '../lib/api-client';
import type {
    Client,
    CreateClientDto,
    UpdateClientDto,
    ClientFilters,
} from '../interfaces/clients.interface';

export const clientsService = {
    getAll: async (params?: ClientFilters) => {
        return apiClient.get<Client[]>('/api/clients', { params });
    },

    getByEntity: async (entityId: string, params?: Record<string, any>) => {
        return apiClient.get<Client[]>(`/api/clients/entity/${entityId}`, { params });
    },

    search: async (entityId: string, query: string) => {
        return apiClient.get<Client[]>(`/api/clients/entity/${entityId}/search`, {
            q: query,
        });
    },

    getById: async (id: string) => {
        return apiClient.get<Client>(`/api/clients/${id}`);
    },

    getWithBookings: async (id: string) => {
        return apiClient.get<Client & { bookings: any[] }>(`/api/clients/${id}/bookings`);
    },

    create: async (data: CreateClientDto) => {
        return apiClient.post<Client>('/api/clients', data);
    },

    update: async (id: string, data: UpdateClientDto) => {
        return apiClient.patch<Client>(`/api/clients/${id}`, data);
    },

    delete: async (id: string) => {
        return apiClient.delete<void>(`/api/clients/${id}`);
    },

    addTags: async (id: string, tags: string[]) => {
        return apiClient.post<Client>(`/api/clients/${id}/tags`, { tags });
    },

    removeTags: async (id: string, tags: string[]) => {
        return apiClient.patch<Client>(`/api/clients/${id}/tags/remove`, { tags });
    },

    getStats: async (id: string) => {
        return apiClient.get<{
            totalBookings: number;
            totalSpent: number;
            averageSpent: number;
            lastVisit: string;
            favoriteServices: Array<{ serviceId: string; serviceName: string; count: number }>;
        }>(`/api/clients/${id}/stats`);
    },
};
