/**
 * Entities Service - Frontend
 */

import { apiClient } from '../lib/api-client';
import type {
    Entity,
    EntityProfile,
    CompleteOnboardingDto,
} from '../types/models/entities.interface';

// Re-export types
export type { Entity, EntityProfile, CompleteOnboardingDto } from '../types/models/entities.interface';

export const entitiesService = {
    getProfile: async () => {
        return apiClient.get<EntityProfile>('/api/entities/profile');
    },

    // Alias for backward compatibility
    getById: async (id: string) => {
        return apiClient.get<Entity>(`/api/entities/${id}`);
    },

    // Alias for backward compatibility  
    findByUsername: async (username: string) => {
        return apiClient.get<Entity>(`/api/entities/username/${username}`);
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

    // Alias for uploadLogo
    uploadImage: async (file: File, type: 'logo' | 'banner') => {
        if (type === 'logo') {
            return entitiesService.uploadLogo(file);
        }
        return entitiesService.uploadCover(file);
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

    updateWorkingHours: async (workingHours: CompleteOnboardingDto['workingHours']) => {
        return apiClient.patch<EntityProfile>('/api/entities/profile/working-hours', {
            workingHours,
        });
    },

    // Deprecated: Use updateWorkingHours instead
    updateBusinessHours: async (businessHours: any) => {
        console.warn('updateBusinessHours is deprecated. Use updateWorkingHours instead.');
        return entitiesService.updateWorkingHours(businessHours);
    },

    updateAddress: async (address: CompleteOnboardingDto['address']) => {
        return apiClient.patch<EntityProfile>('/api/entities/profile/address', { address });
    },

    updateNotificationSettings: async (notificationSettings: {
        smsEnabled?: boolean;
        whatsappEnabled?: boolean;
        notifyOwner?: {
            newBooking?: boolean;
            cancelledBooking?: boolean;
            newPayment?: boolean;
            newReview?: boolean;
        };
        notifyClient?: {
            bookingConfirmation?: boolean;
            bookingReminder?: boolean;
            bookingCancellation?: boolean;
            paymentReceipt?: boolean;
        };
        notifyProfessional?: {
            newAssignment?: boolean;
            bookingCancellation?: boolean;
            scheduleChange?: boolean;
        };
        reminderTimings?: {
            enabled24h?: boolean;
            enabled2h?: boolean;
            enabled30min?: boolean;
        };
    }) => {
        return apiClient.patch<Entity>('/api/entities/notification-settings', notificationSettings);
    },
};
