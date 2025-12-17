import { apiClient } from '../lib/api-client';

export interface InAppNotification {
    _id: string;
    userId: string;
    entityId?: string;
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    category: 'booking' | 'system' | 'financial' | 'support' | 'alert';
    priority: 'low' | 'medium' | 'high';
    isRead: boolean;
    readAt?: string;
    action?: {
        type: 'navigate' | 'modal' | 'external';
        payload: string;
        label: string;
    };
    metadata?: Record<string, any>;
    createdAt: string;
    expiresAt?: string;
}

class InAppNotificationsService {
    async getAll(params: {
        page?: number;
        limit?: number;
        isRead?: boolean;
        category?: string;
    } = {}) {
        try {
            const response = await apiClient.get('/api/notifications', params);
            // Backend returns: { success: true, notifications: [], total: 0, unread: 0 }
            return {
                notifications: (response.data as any).notifications,
                total: (response.data as any).total,
                unread: (response.data as any).unread,
            };
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            // Return empty state on error
            return {
                notifications: [],
                total: 0,
                unread: 0,
            };
        }
    }

    async getUnreadCount(): Promise<number> {
        try {
            const response = await apiClient.get('/api/notifications/unread-count');
            return (response.data as any).count;
        } catch (error) {
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
