/**
 * Public Service - Frontend (Customer-facing booking page)
 */

import { apiClient } from '../lib/api-client';
import type {
    PublicEntity,
    PublicService,
    PublicTimeSlot,
    CreatePublicBookingRequest,
} from '../interfaces/public.interface';

export const publicService = {
    getEntityBySlug: async (slug: string) => {
        return apiClient.get<PublicEntity>(`/api/public/entity/${slug}`);
    },

    getEntityServices: async (slug: string, params?: { category?: string; active?: boolean }) => {
        return apiClient.get<PublicService[]>(`/api/public/entity/${slug}/services`, params);
    },

    getServiceBySlug: async (entitySlug: string, serviceSlug: string) => {
        return apiClient.get<PublicService>(
            `/api/public/entity/${entitySlug}/service/${serviceSlug}`
        );
    },

    getAvailableSlots: async (
        entitySlug: string,
        params: {
            serviceId: string;
            date: string;
            professionalId?: string;
        }
    ) => {
        return apiClient.get<PublicTimeSlot[]>(
            `/api/public/entity/${entitySlug}/available-slots`,
            params
        );
    },

    createBooking: async (entitySlug: string, data: CreatePublicBookingRequest) => {
        return apiClient.post(`/api/public/entity/${entitySlug}/bookings`, data);
    },

    verifyBooking: async (entitySlug: string, bookingId: string, verificationCode: string) => {
        return apiClient.post(`/api/public/entity/${entitySlug}/bookings/${bookingId}/verify`, {
            code: verificationCode,
        });
    },

    cancelBooking: async (
        entitySlug: string,
        bookingId: string,
        verificationCode: string,
        reason?: string
    ) => {
        return apiClient.post(`/api/public/entity/${entitySlug}/bookings/${bookingId}/cancel`, {
            code: verificationCode,
            reason,
        });
    },

    getEntityProfessionals: async (entitySlug: string, serviceId?: string) => {
        return apiClient.get(`/api/public/entity/${entitySlug}/professionals`, {
            serviceId,
        });
    },
};
