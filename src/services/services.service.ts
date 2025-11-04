/**
 * Services Service - Frontend
 */

import { apiClient } from '../lib/api-client';
import type {
    Service,
    CreateServiceDto,
    UpdateServiceDto,
    ServiceFilters,
} from '../types/models/services.interface';

// Re-export types
export type { Service, CreateServiceDto, UpdateServiceDto, ServiceFilters } from '../types/models/services.interface';

export const servicesService = {
    getAll: async (params?: ServiceFilters) => {
        return apiClient.get<Service[]>('/api/services', params);
    },

    getByEntity: async (entityId: string, params?: Record<string, any>) => {
        return apiClient.get<Service[]>(`/api/services/entity/${entityId}`, params);
    },

    getActiveByEntity: async (entityId: string) => {
        return apiClient.get<Service[]>(`/api/services/entity/${entityId}/active`);
    },

    getPublicByEntity: async (entityId: string) => {
        return apiClient.get<Service[]>(`/api/services/entity/${entityId}/public`);
    },

    getByCategory: async (entityId: string, category: string) => {
        return apiClient.get<Service[]>(`/api/services/entity/${entityId}/category/${category}`);
    },

    getBySlug: async (entityId: string, slug: string) => {
        return apiClient.get<Service>(`/api/services/entity/${entityId}/slug/${slug}`);
    },

    getByProfessional: async (professionalId: string) => {
        return apiClient.get<Service[]>(`/api/services/professional/${professionalId}`);
    },

    getById: async (id: string) => {
        return apiClient.get<Service>(`/api/services/${id}`);
    },

    create: async (data: CreateServiceDto) => {
        return apiClient.post<Service>('/api/services', data);
    },

    update: async (id: string, data: UpdateServiceDto) => {
        return apiClient.patch<Service>(`/api/services/${id}`, data);
    },

    delete: async (id: string) => {
        return apiClient.delete(`/api/services/${id}`);
    },

    assignProfessional: async (serviceId: string, professionalId: string) => {
        return apiClient.patch(`/api/services/${serviceId}/assign/${professionalId}`);
    },

    unassignProfessional: async (serviceId: string, professionalId: string) => {
        return apiClient.patch(`/api/services/${serviceId}/unassign/${professionalId}`);
    },

    reorder: async (entityId: string, serviceOrders: { id: string; sortOrder: number }[]) => {
        return apiClient.post(`/api/services/entity/${entityId}/reorder`, serviceOrders);
    },

    uploadImage: async (serviceId: string, file: File) => {
        return apiClient.uploadFile(`/api/services/${serviceId}/image`, file);
    },
};
