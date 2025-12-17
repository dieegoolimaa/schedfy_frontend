import { useState, useEffect, useCallback, useRef } from 'react';
import { inAppNotificationsService, InAppNotification } from '@/services/in-app-notifications.service';
import { useToast } from './use-toast';

export function useNotifications() {
    const [notifications, setNotifications] = useState<InAppNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const intervalRef = useRef<NodeJS.Timeout>();

    const fetchNotifications = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const { notifications: data, total: totalCount, unread } = await inAppNotificationsService.getAll({
                page,
                limit: 10,
            });
            setNotifications(data);
            setTotal(totalCount);
            setUnreadCount(unread);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchUnreadCount = useCallback(async () => {
        try {
            const count = await inAppNotificationsService.getUnreadCount();
            setUnreadCount(count);
        } catch (error) {
            console.error('Failed to fetch unread count', error);
        }
    }, []);

    const markAsRead = async (id: string, event?: React.MouseEvent) => {
        if (event) event.stopPropagation();
        try {
            await inAppNotificationsService.markAsRead(id);
            // Optimistic update
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to mark notification as read"
            });
        }
    };

    const markAllAsRead = async () => {
        try {
            await inAppNotificationsService.markAllAsRead();
            // Optimistic update
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
            toast({
                title: "Success",
                description: "All notifications marked as read"
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to mark all as read"
            });
        }
    };

    const deleteNotification = async (id: string, event?: React.MouseEvent) => {
        if (event) event.stopPropagation();
        try {
            await inAppNotificationsService.delete(id);
            // Optimistic update
            setNotifications(prev => prev.filter(n => n._id !== id));
            setTotal(prev => Math.max(0, prev - 1));
            // Re-fetch unread count to be safe or calculate if we knew if it was read
            fetchUnreadCount();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete notification"
            });
        }
    };

    // Polling logic
    useEffect(() => {
        fetchUnreadCount();
        fetchNotifications();

        intervalRef.current = setInterval(() => {
            fetchUnreadCount();
        }, 30000); // Poll unread count every 30s

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [fetchNotifications, fetchUnreadCount]);

    return {
        notifications,
        unreadCount,
        total,
        loading,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification
    };
}
