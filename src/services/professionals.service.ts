/**
 * Professionals Service - Frontend
 */

import { apiClient } from '../lib/api-client';
import type {
    Professional,
    AvailabilityCheckRequest,
    AvailabilityCheckResponse,
} from '../interfaces/professionals.interface';

// Re-export types
export type { Professional, AvailabilityCheckRequest, AvailabilityCheckResponse } from '../interfaces/professionals.interface';

export const professionalsService = {
    getAll: async (params?: { entityId?: string; active?: boolean }) => {
        return apiClient.get<Professional[]>('/api/users', {
            ...params,
            role: 'professional',
        });
    },

    // Alias for backward compatibility
    getProfessionals: async (params?: { entityId?: string; active?: boolean }) => {
        return professionalsService.getAll(params);
    },

    getByEntity: async (entityId: string) => {
        return apiClient.get<Professional[]>('/api/users', {
            entityId,
            role: 'professional',
        });
    },

    getById: async (id: string) => {
        return apiClient.get<Professional>(`/api/users/${id}`);
    },

    create: async (data: {
        name: string;
        email: string;
        phone?: string;
        entityId: string;
        services?: string[];
        workingHours?: Professional['workingHours'];
        color?: string;
    }) => {
        return apiClient.post<Professional>('/api/users', {
            ...data,
            role: 'professional',
            password: Math.random().toString(36).slice(-8), // temporary password
        });
    },

    // Alias for backward compatibility
    createProfessional: async (data: {
        name: string;
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

    assignService: async (professionalId: string, serviceId: string) => {
        return apiClient.post(`/api/users/${professionalId}/services`, { serviceId });
    },

    unassignService: async (professionalId: string, serviceId: string) => {
        return apiClient.delete(`/api/users/${professionalId}/services/${serviceId}`);
    },

    checkAvailability: async (data: AvailabilityCheckRequest) => {
        return apiClient.post<AvailabilityCheckResponse>(
            '/api/bookings/check-professional-availability',
            data
        );
    },

    getAvailableSlots: async (professionalId: string, date: string, serviceId?: string) => {
        return apiClient.get(`/api/users/${professionalId}/available-slots`, {
            date,
            serviceId,
        });
    },

    updateWorkingHours: async (id: string, workingHours: Professional['workingHours']) => {
        return apiClient.patch<Professional>(`/api/users/${id}`, { workingHours });
    },
};
