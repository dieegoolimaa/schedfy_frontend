import { apiClient } from './client';
import { QueryParams, PaginatedResponse } from '../../types/api';

export interface Service {
    id: string;
    entityId: string;
    name: string;
    description: string;
    category: string;
    price: number;
    currency: string;
    duration: number; // in minutes
    isActive: boolean;
    isPublic: boolean;
    imageUrl?: string;
    slug: string;
    sortOrder: number;
    professionalIds: string[];
    bookingCount: number;
    createdAt: string;
    updatedAt: string;
    // UI-specific fields (optional - computed or default)
    status?: 'active' | 'inactive' | 'draft';
    bookings?: number; // Alias for bookingCount for UI compatibility
    rating?: number;
    popularity?: number;
    image?: string; // Alias for imageUrl for UI compatibility
}

export interface CreateServiceDto {
    name: string;
    description: string;
    category: string;
    price: number;
    currency?: string;
    duration: number;
    isActive?: boolean;
    isPublic?: boolean;
    imageUrl?: string;
    professionalIds?: string[];
}

export interface UpdateServiceDto extends Partial<CreateServiceDto> {
    sortOrder?: number;
}

export const servicesApi = {
    /**
     * Get all services
     */
    async getAll(params?: QueryParams) {
        return apiClient.get<PaginatedResponse<Service>>('/api/services', params);
    },

    /**
     * Get services by entity
     */
    async getByEntity(entityId: string, params?: QueryParams) {
        return apiClient.get<Service[]>(`/api/services/entity/${entityId}`, params);
    },

    /**
     * Get active services by entity
     */
    async getActiveByEntity(entityId: string) {
        return apiClient.get<Service[]>(`/api/services/entity/${entityId}/active`);
    },

    /**
     * Get public services by entity
     */
    async getPublicByEntity(entityId: string) {
        return apiClient.get<Service[]>(`/api/services/entity/${entityId}/public`);
    },

    /**
     * Get services by category
     */
    async getByCategory(entityId: string, category: string) {
        return apiClient.get<Service[]>(`/api/services/entity/${entityId}/category/${category}`);
    },

    /**
     * Get service by slug
     */
    async getBySlug(entityId: string, slug: string) {
        return apiClient.get<Service>(`/api/services/entity/${entityId}/slug/${slug}`);
    },

    /**
     * Get services by professional
     */
    async getByProfessional(professionalId: string) {
        return apiClient.get<Service[]>(`/api/services/professional/${professionalId}`);
    },

    /**
     * Get single service
     */
    async getById(id: string) {
        return apiClient.get<Service>(`/api/services/${id}`);
    },

    /**
     * Create a new service
     */
    async create(data: CreateServiceDto) {
        return apiClient.post<Service>('/api/services', data);
    },

    /**
     * Update a service
     */
    async update(id: string, data: UpdateServiceDto) {
        return apiClient.patch<Service>(`/api/services/${id}`, data);
    },

    /**
     * Delete a service
     */
    async delete(id: string) {
        return apiClient.delete(`/api/services/${id}`);
    },

    /**
     * Assign professional to service
     */
    async assignProfessional(serviceId: string, professionalId: string) {
        return apiClient.patch(`/api/services/${serviceId}/assign/${professionalId}`);
    },

    /**
     * Unassign professional from service
     */
    async unassignProfessional(serviceId: string, professionalId: string) {
        return apiClient.patch(`/api/services/${serviceId}/unassign/${professionalId}`);
    },

    /**
     * Reorder services
     */
    async reorder(entityId: string, serviceOrders: { id: string; sortOrder: number }[]) {
        return apiClient.post(`/api/services/entity/${entityId}/reorder`, serviceOrders);
    },

    /**
     * Upload service image
     */
    async uploadImage(serviceId: string, file: File) {
        return apiClient.uploadFile(`/api/services/${serviceId}/image`, file);
    },
};
