import { apiClient } from './client';
import { QueryParams, PaginatedResponse } from '../../types/api';

export interface Client {
    id: string;
    entityId: string;
    firstName: string;
    lastName: string;
    name: string; // computed fullName from backend
    email: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    status?: 'active' | 'inactive' | 'blocked';
    preferences?: {
        preferredContactMethod?: 'email' | 'phone' | 'sms';
        allowMarketing?: boolean;
        allowReminders?: boolean;
        language?: string;
    };
    address?: {
        street?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
    };
    notes?: string;
    tags?: string[];
    source?: string;
    stats?: {
        totalBookings?: number;
        completedBookings?: number;
        cancelledBookings?: number;
        noShowBookings?: number;
        totalSpent?: number;
        averageBookingValue?: number;
        lastBookingDate?: string;
        firstBookingDate?: string;
    };
    // Legacy/UI fields for compatibility
    totalBookings?: number;
    totalSpent?: number;
    averageSpent?: number;
    lastVisit?: string;
    avatar?: string;
    joinDate?: string;
    loyaltyPoints?: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateClientDto {
    entityId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    status?: 'active' | 'inactive' | 'blocked';
    preferences?: {
        preferredContactMethod?: 'email' | 'phone' | 'sms';
        allowMarketing?: boolean;
        allowReminders?: boolean;
        language?: string;
    };
    address?: {
        street?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
    };
    notes?: string;
    tags?: string[];
    source?: 'walk_in' | 'online_booking' | 'phone' | 'referral' | 'social_media' | 'google' | 'other';
    createdBy: string;
}

export interface UpdateClientDto {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    status?: 'active' | 'inactive' | 'blocked';
    preferences?: {
        preferredContactMethod?: 'email' | 'phone' | 'sms';
        allowMarketing?: boolean;
        allowReminders?: boolean;
        language?: string;
    };
    address?: {
        street?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
    };
    notes?: string;
    tags?: string[];
    source?: 'walk_in' | 'online_booking' | 'phone' | 'referral' | 'social_media' | 'google' | 'other';
    updatedBy?: string;
}

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
