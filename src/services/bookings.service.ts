/**
 * Bookings Service - Frontend
 */

import { apiClient } from '../lib/api-client';
import type {
    Booking,
    CreateBookingDto,
    UpdateBookingDto,
    BookingFilters,
    TimeSlot,
    SlotAvailability,
} from '../types/models/bookings.interface';

// Re-export types
export type { Booking, CreateBookingDto, UpdateBookingDto, BookingFilters, TimeSlot, SlotAvailability } from '../types/models/bookings.interface';

export const bookingsService = {
    getAvailableSlots: async (params: {
        entityId: string;
        serviceId?: string;
        date: string;
        professionalId?: string;
        includeOverbooking?: boolean; // Only for internal/authenticated users
        duration?: number;
    }) => {
        return apiClient.get<TimeSlot[]>('/api/bookings/available-slots', params);
    },

    checkSlotAvailability: async (data: {
        entityId: string;
        serviceId?: string;
        professionalId?: string;
        startDateTime: string;
        endDateTime: string;
        plan: string;
        allowConcurrentBookings?: boolean;
    }) => {
        return apiClient.post<{ available: boolean }>('/api/bookings/check-slot', data);
    },

    getAll: async (params?: BookingFilters) => {
        return apiClient.get<Booking[]>('/api/bookings', params);
    },

    getByEntity: async (entityId: string, params?: Record<string, any>) => {
        return apiClient.get<Booking[]>(`/api/bookings/entity/${entityId}`, params);
    },

    getByService: async (serviceId: string) => {
        return apiClient.get<Booking[]>(`/api/bookings/service/${serviceId}`);
    },

    getByClient: async (clientId: string) => {
        return apiClient.get<Booking[]>(`/api/bookings/client/${clientId}`);
    },

    getByProfessional: async (professionalId: string) => {
        return apiClient.get<Booking[]>(`/api/bookings/professional/${professionalId}`);
    },

    getByDateRange: async (entityId: string, startDate: string, endDate: string) => {
        return apiClient.get<Booking[]>(`/api/bookings/entity/${entityId}/range`, {
            startDate,
            endDate,
        });
    },

    getById: async (id: string) => {
        return apiClient.get<Booking>(`/api/bookings/${id}`);
    },

    create: async (data: CreateBookingDto) => {
        try {
            return await apiClient.post<Booking>('/api/bookings', data);
        } catch (error: any) {
            if (error.statusCode === 409 && error.error === 'BOOKING_CONFLICT') {
                const conflictError = new Error(error.message || 'Booking conflict detected');
                (conflictError as any).conflicts = error.errors?.conflicts || [];
                (conflictError as any).statusCode = 409;
                throw conflictError;
            }
            throw error;
        }
    },

    update: async (id: string, data: UpdateBookingDto) => {
        return apiClient.patch<Booking>(`/api/bookings/${id}`, data);
    },

    cancel: async (id: string, reason?: string) => {
        return apiClient.patch<Booking>(`/api/bookings/${id}/cancel`, { reason });
    },

    confirm: async (id: string) => {
        return apiClient.patch<Booking>(`/api/bookings/${id}/confirm`, {});
    },

    complete: async (id: string, data?: { taxId?: string; paymentMethod?: string }) => {
        return apiClient.patch<Booking>(`/api/bookings/${id}/complete`, data || {});
    },

    markNoShow: async (id: string) => {
        return apiClient.patch<Booking>(`/api/bookings/${id}/no-show`, {});
    },

    delete: async (id: string) => {
        return apiClient.delete<void>(`/api/bookings/${id}`);
    },

    checkAvailability: async (data: {
        serviceId: string;
        professionalId?: string;
        startTime: string;
        endTime: string;
    }) => {
        return apiClient.post<SlotAvailability>('/api/bookings/check-availability', data);
    },
};
