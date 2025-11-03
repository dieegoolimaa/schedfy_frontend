/**
 * Entities Service - Frontend
 */

import { apiClient } from '../lib/api-client';
import type {
    Entity,
    EntityProfile,
    CompleteOnboardingDto,
} from '../interfaces/entities.interface';

export const entitiesService = {
    getProfile: async () => {
        return apiClient.get<EntityProfile>('/api/entities/profile');
    },

    updateProfile: async (data: Partial<EntityProfile>) => {
        return apiClient.patch<EntityProfile>('/api/entities/profile', data);
    },

    checkUsername: async (username: string) => {
        return apiClient.get<{ available: boolean; suggestions?: string[] }>(
            '/api/entities/check-username',
            { username }
        );
    },

    completeOnboarding: async (data: CompleteOnboardingDto) => {
        return apiClient.post<Entity>('/api/entities/complete-onboarding', data);
    },

    uploadLogo: async (file: File) => {
        return apiClient.uploadFile('/api/entities/profile/logo', file);
    },

    uploadCover: async (file: File) => {
        return apiClient.uploadFile('/api/entities/profile/cover', file);
    },

    getOnboardingStatus: async () => {
        return apiClient.get<{
            isComplete: boolean;
            currentStep: string;
            completedSteps: string[];
        }>('/api/entities/onboarding-status');
    },

    updateBusinessHours: async (businessHours: CompleteOnboardingDto['businessHours']) => {
        return apiClient.patch<EntityProfile>('/api/entities/profile/business-hours', {
            businessHours,
        });
    },

    updateAddress: async (address: CompleteOnboardingDto['address']) => {
        return apiClient.patch<EntityProfile>('/api/entities/profile/address', { address });
    },
};
