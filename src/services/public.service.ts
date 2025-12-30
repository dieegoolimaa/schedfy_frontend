/**
 * Public Service - Frontend (Customer-facing booking page)
 */

import { apiClient } from '../lib/api-client';
import type {
    PublicEntity,
    PublicService,
    PublicTimeSlot,
    PublicProfessional,
    CreatePublicBookingRequest,
} from '../types/models/public.interface';

// Re-export types (including PublicProfessional for external use)
export type { PublicEntity, PublicService, PublicTimeSlot, PublicProfessional, CreatePublicBookingRequest } from '../types/models/public.interface';

export const publicService = {
    /**
     * Get entity by slug (public profile)
     * Uses: GET /api/entities/public/:slug
     */
    getEntityBySlug: async (slug: string) => {
        return apiClient.get<PublicEntity>(`/api/entities/public/${slug}`);
    },

    /**
     * Get public services for an entity
     * Uses: GET /api/services/entity/:entityId/public
     */
    getEntityServices: async (entityId: string, params?: { category?: string; active?: boolean }) => {
        return apiClient.get<PublicService[]>(`/api/services/entity/${entityId}/public`, params);
    },

    /**
     * Get service by slug (for entity)
     * Uses: GET /api/services/entity/:entityId/slug/:slug
     */
    getServiceBySlug: async (entityId: string, serviceSlug: string) => {
        return apiClient.get<PublicService>(
            `/api/services/entity/${entityId}/slug/${serviceSlug}`
        );
    },

    /**
     * Get available time slots for booking
     * Uses: GET /api/bookings/available-slots?entityId=...&serviceId=...&date=...&professionalId=...
     */
    getAvailableSlots: async (
        entityId: string,
        params: {
            serviceId: string;
            date: string;
            professionalId?: string;
        }
    ) => {
        return apiClient.get<PublicTimeSlot[]>(
            `/api/bookings/available-slots`,
            {
                entityId,
                ...params,
            }
        );
    },

    /**
     * Create a new booking (public)
     * Uses: POST /api/bookings
     */
    createBooking: async (data: CreatePublicBookingRequest) => {
        return apiClient.post(`/api/bookings`, data);
    },

    /**
     * Verify booking with code
     * NOTE: This endpoint does not exist in backend. Bookings are either:
     * - Auto-confirmed (Simple plan, or Individual/Business without requireManualConfirmation)
     * - Require manual confirmation via PATCH /api/bookings/:id/confirm (Individual/Business with requireManualConfirmation)
     * 
     * This method is deprecated and should not be used.
     * @deprecated Use confirmBooking endpoint directly from bookings service instead
     */
    verifyBooking: async (_entityId: string, _bookingId: string, _verificationCode: string) => {
        // No verification endpoint exists - bookings are confirmed automatically or manually
        throw new Error('Booking verification endpoint does not exist. Bookings are auto-confirmed or require manual confirmation.');
    },

    /**
     * Get booking by ID (public)
     * Uses: GET /api/bookings/:id
     */
    getBookingById: async (bookingId: string) => {
        return apiClient.get<any>(`/api/bookings/${bookingId}`);
    },

    /**
     * Cancel booking
     * Uses: PATCH /api/bookings/:id/cancel
     */
    cancelBooking: async (
        _entityId: string,
        bookingId: string,
        _verificationCode?: string,
        reason?: string
    ) => {
        return apiClient.patch(`/api/bookings/${bookingId}/cancel`, {
            reason,
            cancelledBy: 'client'
        });
    },

    /**
     * Update booking (public/client)
     * Uses: PATCH /api/bookings/:id?clientReschedule=true
     */
    updateBooking: async (bookingId: string, data: any) => {
        // Mark as client reschedule so backend can validate plan restrictions
        return apiClient.patch(`/api/bookings/${bookingId}?clientReschedule=true`, data);
    },

    /**
     * Get professionals for an entity (public)
     * Uses: GET /api/users?entityId=...&isProfessional=true&status=active
     */
    getEntityProfessionals: async (entityId: string, _serviceId?: string) => {
        const params: any = {
            entityId,
            isProfessional: true,
            status: 'active',
        };

        // If serviceId is provided, we need to filter professionals who have this service assigned
        // This might require backend support or client-side filtering
        return apiClient.get<PublicProfessional[]>(`/api/users`, params);
    },

    /**
     * Get active packages for an entity (public)
     * Uses: GET /api/packages/entity/:entityId
     */
    getEntityPackages: async (entityId: string) => {
        return apiClient.get<any[]>(`/api/packages/entity/${entityId}`, {
            status: 'active',
        });
    },

    /**
     * Validate voucher code
     * Uses: POST /api/promotions/validate-voucher
     */
    validateVoucher: async (data: {
        entityId: string;
        code: string;
        bookingValue: number;
        serviceId?: string;
        clientId?: string;
        bookingDate?: string;
    }) => {
        return apiClient.post<{
            valid: boolean;
            voucher?: any;
            discountAmount?: number;
            reason?: string;
        }>(`/api/promotions/validate-voucher`, data);
    },
};
