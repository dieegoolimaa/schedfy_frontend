import { apiClient } from './client';
import { QueryParams, PaginatedResponse } from '../../types/api';
import { ServiceBackend } from './services.api';

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
    // Additional computed/display properties
    date?: string;
    time?: string;
    paymentStatus?: 'pending' | 'partial' | 'paid' | 'refunded' | 'failed';
    // Populated fields (from backend)
    service?: ServiceBackend;
    client?: {
        id: string;
        name: string;
        email?: string;
        phone?: string;
        isFirstTime?: boolean;
    };
    professional?: {
        id: string;
        name: string;
    };
}

export interface CreateBookingDto {
    entityId: string;
    serviceId: string;
    professionalId?: string;
    clientId?: string;
    clientInfo?: {
        name: string;
        email?: string;
        phone?: string;
        notes?: string;
    };
    startDateTime: string; // ISO string
    endDateTime: string; // ISO string
    status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
    notes?: string;
    internalNotes?: string;
    pricing: {
        basePrice: number;
        discountAmount?: number;
        discountReason?: string;
        additionalCharges?: Array<{
            name: string;
            amount: number;
            description?: string;
        }>;
        totalPrice: number;
        currency: string;
    };
    payment?: {
        status?: 'pending' | 'partial' | 'paid' | 'refunded' | 'failed';
        method?: string;
        depositRequired?: boolean;
        depositAmount?: number;
        depositPaid?: boolean;
        paidAmount?: number;
    };
    createdBy: string;
}

export interface UpdateBookingDto {
    serviceId?: string;
    clientId?: string;
    professionalId?: string;
    clientInfo?: {
        name?: string;
        email?: string;
        phone?: string;
        notes?: string;
    };
    startDateTime?: string;
    endDateTime?: string;
    notes?: string;
    internalNotes?: string;
    observations?: string;
    status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
    pricing?: {
        basePrice?: number;
        discountAmount?: number;
        discountReason?: string;
        additionalCharges?: Array<{
            name: string;
            amount: number;
            description?: string;
        }>;
        totalPrice?: number;
        currency?: string;
    };
    payment?: {
        status?: 'pending' | 'partial' | 'paid' | 'refunded' | 'failed';
        method?: string;
        depositRequired?: boolean;
        depositAmount?: number;
        depositPaid?: boolean;
        paidAmount?: number;
    };
    updatedBy?: string;
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
     * Check if a slot is available for booking (entity-level, all plans)
     */
    async checkSlotAvailability(data: {
        entityId: string;
        serviceId?: string;
        professionalId?: string;
        startDateTime: string;
        endDateTime: string;
        plan: string;
        allowConcurrentBookings?: boolean;
    }) {
        return apiClient.post<{ available: boolean }>(`/api/bookings/check-slot`, data);
    },
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
        try {
            return await apiClient.post<Booking>('/api/bookings', data);
        } catch (error: any) {
            // Check if this is a booking conflict error
            if (error.statusCode === 409 && error.error === 'BOOKING_CONFLICT') {
                const conflictError = new Error(error.message || 'Booking conflict detected');
                (conflictError as any).conflicts = error.errors?.conflicts || [];
                (conflictError as any).statusCode = 409;
                throw conflictError;
            }
            throw error;
        }
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
