import { apiClient } from './client';
import { QueryParams, PaginatedResponse } from '../../types/api';

export interface Booking {
    id: string;
    entityId: string;
    serviceId: string;
    clientId: string;
    professionalId?: string;
    startTime: string;
    endTime: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
    notes?: string;
    createdAt: string;
    updatedAt: string;
    // Populated fields (from backend)
    service?: {
        id: string;
        name: string;
        duration: number;
        price: number;
    };
    client?: {
        id: string;
        name: string;
        email: string;
        phone?: string;
    };
    professional?: {
        id: string;
        name: string;
    };
}

export interface CreateBookingDto {
    serviceId: string;
    clientId: string;
    professionalId?: string;
    startTime: string;
    endTime: string;
    notes?: string;
    status?: 'pending' | 'confirmed';
}

export interface UpdateBookingDto {
    serviceId?: string;
    clientId?: string;
    professionalId?: string;
    startTime?: string;
    endTime?: string;
    notes?: string;
    status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
}

export interface BookingFilters extends QueryParams {
    entityId?: string;
    serviceId?: string;
    clientId?: string;
    professionalId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
}

export const bookingsApi = {
    /**
     * Get all bookings (paginated)
     */
    async getAll(params?: BookingFilters) {
        return apiClient.get<PaginatedResponse<Booking>>('/api/bookings', { params });
    },

    /**
     * Get bookings by entity
     */
    async getByEntity(entityId: string, params?: QueryParams) {
        return apiClient.get<Booking[]>(`/api/bookings/entity/${entityId}`, { params });
    },

    /**
     * Get bookings by service
     */
    async getByService(serviceId: string) {
        return apiClient.get<Booking[]>(`/api/bookings/service/${serviceId}`);
    },

    /**
     * Get bookings by client
     */
    async getByClient(clientId: string) {
        return apiClient.get<Booking[]>(`/api/bookings/client/${clientId}`);
    },

    /**
     * Get bookings by professional
     */
    async getByProfessional(professionalId: string) {
        return apiClient.get<Booking[]>(`/api/bookings/professional/${professionalId}`);
    },

    /**
     * Get bookings by date range
     */
    async getByDateRange(entityId: string, startDate: string, endDate: string) {
        return apiClient.get<Booking[]>(`/api/bookings/entity/${entityId}/range`, {
            params: { startDate, endDate }
        });
    },

    /**
     * Get single booking
     */
    async getById(id: string) {
        return apiClient.get<Booking>(`/api/bookings/${id}`);
    },

    /**
     * Create a new booking
     */
    async create(data: CreateBookingDto) {
        return apiClient.post<Booking>('/api/bookings', data);
    },

    /**
     * Update a booking
     */
    async update(id: string, data: UpdateBookingDto) {
        return apiClient.patch<Booking>(`/api/bookings/${id}`, data);
    },

    /**
     * Cancel a booking
     */
    async cancel(id: string, reason?: string) {
        return apiClient.patch<Booking>(`/api/bookings/${id}/cancel`, { reason });
    },

    /**
     * Confirm a booking
     */
    async confirm(id: string) {
        return apiClient.patch<Booking>(`/api/bookings/${id}/confirm`, {});
    },

    /**
     * Complete a booking
     */
    async complete(id: string) {
        return apiClient.patch<Booking>(`/api/bookings/${id}/complete`, {});
    },

    /**
     * Mark booking as no-show
     */
    async markNoShow(id: string) {
        return apiClient.patch<Booking>(`/api/bookings/${id}/no-show`, {});
    },

    /**
     * Delete a booking
     */
    async delete(id: string) {
        return apiClient.delete<void>(`/api/bookings/${id}`);
    },

    /**
     * Check availability for a time slot
     */
    async checkAvailability(data: {
        serviceId: string;
        professionalId?: string;
        startTime: string;
        endTime: string;
    }) {
        return apiClient.post<{ available: boolean; conflicts?: Booking[] }>(
            '/api/bookings/check-availability',
            data
        );
    },
};
