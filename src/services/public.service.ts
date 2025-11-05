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
    createBooking: async (entityId: string, data: CreatePublicBookingRequest) => {
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
    verifyBooking: async (entityId: string, bookingId: string, verificationCode: string) => {
        // No verification endpoint exists - bookings are confirmed automatically or manually
        throw new Error('Booking verification endpoint does not exist. Bookings are auto-confirmed or require manual confirmation.');
    },

    /**
     * Cancel booking with verification code
     * Uses: PATCH /api/bookings/:id/cancel
     */
    cancelBooking: async (
        entityId: string,
        bookingId: string,
        verificationCode: string,
        reason?: string
    ) => {
        return apiClient.patch(`/api/bookings/${bookingId}/cancel`, {
            verificationCode,
            reason,
        });
    },

    /**
     * Get professionals for an entity (public)
     * Uses: GET /api/users?entityId=...&role=professional&status=active
     */
    getEntityProfessionals: async (entityId: string, serviceId?: string) => {
        const params: any = {
            entityId,
            role: 'professional',
            status: 'active',
        };
        
        // If serviceId is provided, we need to filter professionals who have this service assigned
        // This might require backend support or client-side filtering
        return apiClient.get<PublicProfessional[]>(`/api/users`, params);
    },
};
