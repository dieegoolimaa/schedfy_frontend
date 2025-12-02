/**
 * Professionals Service - Frontend
 */

import { apiClient } from '../lib/api-client';
import type {
    Professional,
    AvailabilityCheckRequest,
    AvailabilityCheckResponse,
} from '../types/models/professionals.interface';

// Re-export types
export type { Professional, AvailabilityCheckRequest, AvailabilityCheckResponse } from '../types/models/professionals.interface';

export const professionalsService = {
    getAll: async (params?: { entityId?: string; active?: boolean }) => {
        return apiClient.get<Professional[]>('/api/users', {
            ...params,
            isProfessional: true,
        });
    },

    // Alias for backward compatibility
    getProfessionals: async (params?: { entityId?: string; active?: boolean }) => {
        return professionalsService.getAll(params);
    },

    getByEntity: async (entityId: string) => {
        return apiClient.get<Professional[]>('/api/users', {
            entityId,
            isProfessional: true,
        });
    },

    getById: async (id: string) => {
        return apiClient.get<Professional>(`/api/users/${id}`);
    },

    create: async (data: {
        name?: string;
        firstName?: string;
        lastName?: string;
        email: string;
        phone?: string;
        entityId: string;
        services?: string[];
        workingHours?: Professional['workingHours'];
        color?: string;
    }) => {
        // Handle both name and firstName/lastName formats
        const requestData: any = {
            ...data,
            role: 'professional',
            // No password needed - backend will generate temporary password
            // User will set their own password when accepting invitation
        };

        // If name is provided but not firstName/lastName, split it
        if (data.name && !data.firstName && !data.lastName) {
            const nameParts = data.name.trim().split(' ');
            requestData.firstName = nameParts[0];
            requestData.lastName = nameParts.slice(1).join(' ') || nameParts[0];
            delete requestData.name;
        }

        return apiClient.post<Professional>('/api/users', requestData);
    },

    // Alias for backward compatibility
    createProfessional: async (data: {
        name?: string;
        firstName?: string;
        lastName?: string;
        email: string;
        phone?: string;
        entityId: string;
        services?: string[];
        workingHours?: Professional['workingHours'];
        color?: string;
    }) => {
        return professionalsService.create(data);
    },

    update: async (id: string, data: Partial<Professional>) => {
        return apiClient.patch<Professional>(`/api/users/${id}`, data);
    },

    // Alias for backward compatibility
    updateProfessional: async (id: string, data: Partial<Professional>) => {
        return professionalsService.update(id, data);
    },

    delete: async (id: string) => {
        return apiClient.delete<void>(`/api/users/${id}`);
    },

    // Alias for backward compatibility
    deleteProfessional: async (id: string) => {
        return professionalsService.delete(id);
    },

    /**
     * Assign a service to a professional
     * Uses: PATCH /api/services/:serviceId/assign/:professionalId
     */
    assignService: async (professionalId: string, serviceId: string) => {
        return apiClient.patch(`/api/services/${serviceId}/assign/${professionalId}`);
    },

    /**
     * Unassign a service from a professional
     * Uses: PATCH /api/services/:serviceId/unassign/:professionalId
     */
    unassignService: async (professionalId: string, serviceId: string) => {
        return apiClient.patch(`/api/services/${serviceId}/unassign/${professionalId}`);
    },

    checkAvailability: async (data: AvailabilityCheckRequest) => {
        return apiClient.post<AvailabilityCheckResponse>(
            '/api/bookings/check-professional-availability',
            data
        );
    },

    /**
     * Get available time slots for a professional
     * Uses: GET /api/bookings/available-slots?entityId=...&serviceId=...&date=...&professionalId=...
     */
    getAvailableSlots: async (professionalId: string, date: string, serviceId?: string, entityId?: string) => {
        if (!entityId) {
            throw new Error('entityId is required to get available slots');
        }
        return apiClient.get(`/api/bookings/available-slots`, {
            entityId,
            serviceId,
            date,
            professionalId,
        });
    },

    updateWorkingHours: async (id: string, workingHours: Professional['workingHours']) => {
        return apiClient.patch<Professional>(`/api/users/${id}`, { workingHours });
    },

    /**
     * Resend invitation to a professional
     * Uses: POST /api/users/:id/resend-invitation
     */
    resendInvitation: async (id: string) => {
        return apiClient.post<{ message: string; invitationToken: string }>(`/api/users/${id}/resend-invitation`);
    },
};
