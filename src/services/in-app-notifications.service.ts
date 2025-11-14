import { apiClient } from '../lib/api-client';

export interface InAppNotification {
    _id: string;
    userId: string;
    entityId?: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    category?: 'booking' | 'payment' | 'review' | 'client' | 'system' | 'promotion' | 'subscription' | 'goal' | 'report';
    isRead: boolean;
    readAt?: string;
    actionUrl?: string;
    actionLabel?: string;
    createdAt: string;
    updatedAt: string;
}

class InAppNotificationsService {
    async getAll(params: {
        page?: number;
        limit?: number;
        isRead?: boolean;
        category?: string;
    } = {}) {
        try {
            const response = await apiClient.get('/api/notifications', { params });
            return {
                notifications: (response.data as any).notifications,
                pagination: (response.data as any).pagination,
            };
        } catch (error) {
            // Return empty array if endpoint not available yet
            console.warn('Notifications API not available yet');
            return {
                notifications: [],
                pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
            };
        }
    }

    async getUnreadCount(): Promise<number> {
        try {
            const response = await apiClient.get('/api/notifications/unread-count');
            return (response.data as any).count;
        } catch (error) {
            // Return 0 if endpoint not available yet
            console.warn('Notifications API not available yet');
            return 0;
        }
    }

    async markAsRead(id: string): Promise<InAppNotification> {
        const response = await apiClient.patch(`/api/notifications/${id}/read`);
        return (response.data as any).data;
    }

    async markAllAsRead(): Promise<number> {
        const response = await apiClient.patch('/api/notifications/read-all');
        return (response.data as any).count;
    }

    async delete(id: string): Promise<void> {
        await apiClient.delete(`/api/notifications/${id}`);
    }

    async deleteAll(): Promise<number> {
        const response = await apiClient.delete('/api/notifications');
        return (response.data as any).count;
    }
}

export const inAppNotificationsService = new InAppNotificationsService();
