import { apiClient } from '../lib/api-client';

export interface SearchResult {
    clients: Array<{
        id: string;
        type: 'client';
        name: string;
        email: string;
        phone?: string;
        avatar?: string;
    }>;
    services: Array<{
        id: string;
        type: 'service';
        name: string;
        description?: string;
        price: number;
        duration: number;
        category?: string;
    }>;
    bookings: Array<{
        id: string;
        type: 'booking';
        date: string;
        startTime: string;
        endTime: string;
        status: string;
        client: { name: string; avatar?: string } | null;
        service: { name: string } | null;
        professional: { name: string; avatar?: string } | null;
    }>;
}

class SearchService {
    async search(query: string, limit: number = 10): Promise<SearchResult> {
        const response = await apiClient.get('/api/search', {
            params: { q: query, limit },
        });
        return response.data.results;
    }
}

export const searchService = new SearchService();
