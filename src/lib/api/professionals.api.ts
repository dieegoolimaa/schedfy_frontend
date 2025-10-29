import { apiClient } from './client';
import { QueryParams } from '../../types/api';

export interface Professional {
    id: string;
    entityId: string;
    userId?: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    role: 'professional' | 'attendant' | 'manager' | 'admin' | 'owner';
    status: 'active' | 'inactive' | 'suspended' | 'pending';
    services?: string[]; // Array of service IDs this professional can perform
    avatar?: string;
    workingHours?: {
        [key: string]: { // day of week (0-6)
            start: string; // "09:00"
            end: string;   // "18:00"
            breaks?: Array<{ start: string; end: string }>;
        };
    };
    createdAt: string;
    updatedAt: string;
}

export interface CreateProfessionalDto {
    entityId: string;
    userId?: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    role?: 'professional' | 'attendant';
    password?: string;
    country?: 'PT' | 'BR' | 'US';
    timezone?: string;
    locale?: string;
}

export interface UpdateProfessionalDto {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    status?: 'active' | 'inactive' | 'suspended' | 'pending';
}

export interface AvailabilityCheckRequest {
    professionalId: string;
    date: string;
    startTime: string;
    endTime: string;
}

export interface AvailabilityCheckResponse {
    available: boolean;
    reason?: string;
    conflictingBookings?: string[];
}

export const professionalsApi = {
    /**
     * Get all professionals (users with role professional/attendant) for an entity
     */
    async getProfessionals(params: { entityId: string } & QueryParams) {
        // Use users endpoint with entity and role filter
        const { entityId, ...otherParams } = params;
        return apiClient.get<Professional[]>('/api/users', {
            entityId,
            role: 'professional', // Can be 'professional' or 'attendant'
            ...otherParams
        });
    },

    /**
     * Get a specific professional by ID
     */
    async getProfessional(id: string) {
        return apiClient.get<Professional>(`/api/users/${id}`);
    },

    /**
     * Create a new professional (create user with role professional/attendant)
     */
    async createProfessional(data: CreateProfessionalDto) {
        return apiClient.post<Professional>('/api/users', {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            role: data.role || 'professional',
            entityId: data.entityId,
            password: data.password || `Temp${Math.random().toString(36).slice(-8)}!`,
            country: data.country || 'PT',
            timezone: data.timezone || 'Europe/Lisbon',
            locale: data.locale || 'en',
            status: 'active',
        });
    },

    /**
     * Update a professional
     */
    async updateProfessional(id: string, data: UpdateProfessionalDto) {
        return apiClient.patch<Professional>(`/api/users/${id}`, {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            status: data.status,
        });
    },

    /**
     * Delete a professional
     */
    async deleteProfessional(id: string) {
        return apiClient.delete(`/api/users/${id}`);
    },

    /**
     * Check if a professional is available at a specific time
     * This requires bookings API integration
     */
    async checkAvailability(data: AvailabilityCheckRequest) {
        // This would check against bookings for conflicts
        return apiClient.post<AvailabilityCheckResponse>('/api/bookings/check-availability', {
            professionalId: data.professionalId,
            startTime: `${data.date}T${data.startTime}`,
            endTime: `${data.date}T${data.endTime}`,
        });
    },

    /**
     * Get professionals for a specific service
     * Note: Service assignment is stored in services.professionals array
     */
    async getProfessionalsForService(entityId: string, _serviceId: string) {
        // Get all professionals for entity, then filter by service on client side
        // In future, could add service filter to backend
        return apiClient.get<Professional[]>('/api/users', {
            entityId,
            role: 'professional',
            // TODO: Add serviceId filter when backend supports it
        });
    },
};
