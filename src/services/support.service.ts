import { apiClient } from '../lib/api-client';

export interface SupportTicket {
    _id: string; // Backend uses _id
    id?: string; // Frontend compatibility
    subject: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
    category: 'technical' | 'billing' | 'feature_request' | 'bug_report' | 'account';
    createdAt: string;
    assignedToName?: string;
    userId: string;
    history?: {
        senderId: string;
        senderName: string;
        content: string;
        type: 'message' | 'status_change';
        createdAt: string;
    }[];
}

export interface CreateTicketDTO {
    subject: string;
    description: string;
    priority: string;
    category: string;
    entityId?: string;
}

export interface KnowledgeBaseArticle {
    _id: string;
    title: string;
    content: string;
    category: string;
    language: string;
    views: number;
    rating: number;
    published: boolean;
    createdAt: string;
}

export const supportService = {
    getTickets: async () => {
        const response = await apiClient.get<SupportTicket[]>('/api/support/tickets');
        return Array.isArray(response.data) ? response.data : [];
    },

    createTicket: async (data: CreateTicketDTO) => {
        const response = await apiClient.post<SupportTicket>('/api/support/tickets', data);
        return response.data;
    },

    addMessage: async (id: string, content: string, newStatus?: string) => {
        const response = await apiClient.post<SupportTicket>(`/api/support/tickets/${id}/messages`, { content, newStatus });
        return response.data;
    },

    getArticles: async () => {
        const response = await apiClient.get<KnowledgeBaseArticle[]>('/api/support/articles');
        return Array.isArray(response.data) ? response.data : [];
    },

    // Admin only - but good to have type definition here if reused
    getStats: async () => {
        const response = await apiClient.get('/api/support/tickets/stats');
        return response.data;
    }
};
