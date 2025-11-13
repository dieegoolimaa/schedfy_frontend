import { apiClient } from '../lib/api-client';

export interface NotificationTemplate {
    _id: string;
    entityId: string;
    name: string;
    event: NotificationEvent;
    channels: NotificationChannel[];
    subject: string;
    message: string;
    timing: string;
    enabled: boolean;
    variables: string[];
    smartFeatures: {
        aiOptimizedTiming: boolean;
        sentimentAnalysis: boolean;
        personalization: boolean;
        autoTranslation: boolean;
    };
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
}

export type NotificationChannel = 'email' | 'sms' | 'whatsapp' | 'push' | 'in-app';

export type NotificationEvent =
    | 'booking_confirmed'
    | 'booking_reminder'
    | 'booking_cancelled'
    | 'booking_rescheduled'
    | 'payment_received'
    | 'review_request'
    | 'birthday'
    | 'loyalty_reward'
    | 'promotion'
    | 'no_show_followup';

export interface CreateNotificationTemplateDto {
    name: string;
    event: NotificationEvent;
    channels: NotificationChannel[];
    subject: string;
    message: string;
    timing: string;
    enabled?: boolean;
    variables?: string[];
    smartFeatures?: {
        aiOptimizedTiming?: boolean;
        sentimentAnalysis?: boolean;
        personalization?: boolean;
        autoTranslation?: boolean;
    };
}

export interface UpdateNotificationTemplateDto {
    name?: string;
    event?: NotificationEvent;
    channels?: NotificationChannel[];
    subject?: string;
    message?: string;
    timing?: string;
    enabled?: boolean;
    variables?: string[];
    smartFeatures?: {
        aiOptimizedTiming?: boolean;
        sentimentAnalysis?: boolean;
        personalization?: boolean;
        autoTranslation?: boolean;
    };
}

class NotificationTemplatesService {
    async getTemplatesByEntity(entityId: string): Promise<NotificationTemplate[]> {
        const response = await apiClient.get<{
            success: boolean;
            data: NotificationTemplate[];
        }>(`/api/notification-templates/entity/${entityId}`);
        return response.data.data;
    }

    async getTemplate(id: string): Promise<NotificationTemplate> {
        const response = await apiClient.get<{
            success: boolean;
            data: NotificationTemplate;
        }>(`/api/notification-templates/${id}`);
        return response.data.data;
    }

    async createTemplate(
        data: CreateNotificationTemplateDto,
    ): Promise<NotificationTemplate> {
        const response = await apiClient.post<{
            success: boolean;
            data: NotificationTemplate;
            message: string;
        }>('/api/notification-templates', data);
        return response.data.data;
    }

    async updateTemplate(
        id: string,
        data: UpdateNotificationTemplateDto,
    ): Promise<NotificationTemplate> {
        const response = await apiClient.put<{
            success: boolean;
            data: NotificationTemplate;
            message: string;
        }>(`/api/notification-templates/${id}`, data);
        return response.data.data;
    }

    async toggleTemplate(id: string): Promise<NotificationTemplate> {
        const response = await apiClient.put<{
            success: boolean;
            data: NotificationTemplate;
            message: string;
        }>(`/api/notification-templates/${id}/toggle`);
        return response.data.data;
    }

    async deleteTemplate(id: string): Promise<void> {
        await apiClient.delete(`/api/notification-templates/${id}`);
    }

    async duplicateTemplate(id: string): Promise<NotificationTemplate> {
        const response = await apiClient.post<{
            success: boolean;
            data: NotificationTemplate;
            message: string;
        }>(`/api/notification-templates/${id}/duplicate`);
        return response.data.data;
    }

    async seedDefaultTemplates(): Promise<NotificationTemplate[]> {
        const response = await apiClient.post<{
            success: boolean;
            data: NotificationTemplate[];
            message: string;
        }>('/api/notification-templates/seed');
        return response.data.data;
    }
}

export const notificationTemplatesService = new NotificationTemplatesService();
