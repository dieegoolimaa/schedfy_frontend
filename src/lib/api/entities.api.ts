import { apiClient } from './client';

export interface Entity {
    id: string;
    name: string;
    email: string;
    plan: 'simple' | 'individual' | 'business';
    allowConcurrentBookings: boolean;
    username?: string;
    description?: string;
    address?: string;
    phone?: string;
    website?: string;
    logo?: string;
    banner?: string;
    // Add other entity fields as needed
}

export interface EntityProfile {
    name: string;
    username?: string;
    description?: string;
    address?: string;
    phone?: string;
    website?: string;
    logo?: string;
    banner?: string;
}

export const entitiesApi = {
    /**
     * Get entity by ID
     */
    async getById(id: string) {
        return apiClient.get<Entity>(`/api/entities/${id}`);
    },

    /**
     * Get entities owned by user
     */
    async getByOwner(ownerId: string) {
        return apiClient.get<Entity[]>(`/api/entities/owner/${ownerId}`);
    },

    /**
     * Check if username is available
     */
    async checkUsername(username: string): Promise<{ username: string; available: boolean }> {
        const response = await apiClient.get<{ username: string; available: boolean }>(`/api/entities/check-username/${username}`);
        return response.data!;
    },

    /**
     * Find entity by username
     */
    async findByUsername(username: string) {
        const response = await apiClient.get<Entity>(`/api/entities/username/${username}`);
        return response.data;
    },

    /**
     * Update entity profile
     */
    async updateProfile(entityId: string, profileData: Partial<EntityProfile>) {
        const response = await apiClient.patch<Entity>(`/api/entities/${entityId}/profile`, profileData);
        return response.data;
    },

    /**
     * Upload image (mock - will be replaced with actual upload endpoint)
     */
    async uploadImage(file: File, _type: 'logo' | 'banner'): Promise<string> {
        // TODO: Implement actual file upload to storage service
        // For now, return a mock URL using FileReader
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve(reader.result as string);
            };
            reader.readAsDataURL(file);
        });
    },

    /**
     * Complete entity onboarding
     */
    async completeOnboarding(entityId: string, onboardingData: {
        address: {
            street: string;
            city: string;
            state: string;
            zipCode: string;
            country: string;
        };
        phone: string;
        whatsapp?: string;
        businessHours: {
            monday: { open: string; close: string; closed: boolean };
            tuesday: { open: string; close: string; closed: boolean };
            wednesday: { open: string; close: string; closed: boolean };
            thursday: { open: string; close: string; closed: boolean };
            friday: { open: string; close: string; closed: boolean };
            saturday: { open: string; close: string; closed: boolean };
            sunday: { open: string; close: string; closed: boolean };
        };
        firstService?: {
            name: string;
            duration: number;
            price: number;
            description?: string;
        };
    }) {
        return apiClient.patch(`/api/entities/${entityId}/complete-onboarding`, onboardingData);
    },
};
