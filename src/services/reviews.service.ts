import { apiClient } from '../lib/api-client';

export interface Review {
    _id: string;
    entityId: string;
    bookingId: string;
    clientId: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        avatar?: string;
    };
    professionalId?: {
        _id: string;
        firstName: string;
        lastName: string;
        avatar?: string;
    };
    serviceId?: {
        _id: string;
        name: string;
    };
    rating: number;
    comment?: string;
    response?: string;
    respondedBy?: {
        _id: string;
        firstName: string;
        lastName: string;
    };
    respondedAt?: string;
    isPublic: boolean;
    isVerified: boolean;
    isFeatured: boolean;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

export interface ReviewStats {
    total: number;
    averageRating: number;
    distribution: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
    };
    responseRate: number;
    recentReviews: Review[];
}

export interface CreateReviewDto {
    bookingId: string;
    rating: number;
    comment?: string;
    isPublic?: boolean;
    tags?: string[];
}

export interface RespondToReviewDto {
    response: string;
}

class ReviewsService {
    async create(data: CreateReviewDto): Promise<Review> {
        const response = await apiClient.post('/api/reviews', data);
        return (response.data as any).data;
    }

    async getAll(params: {
        entityId?: string;
        professionalId?: string;
        serviceId?: string;
        clientId?: string;
        minRating?: number;
        isPublic?: boolean;
        isVerified?: boolean;
        page?: number;
        limit?: number;
    } = {}) {
        const response = await apiClient.get('/api/reviews', { params });
        return {
            reviews: (response.data as any).reviews,
            pagination: (response.data as any).pagination,
        };
    }

    async getById(id: string): Promise<Review> {
        const response = await apiClient.get(`/api/reviews/${id}`);
        return (response.data as any).data;
    }

    async update(id: string, data: Partial<CreateReviewDto>): Promise<Review> {
        const response = await apiClient.patch(`/api/reviews/${id}`, data);
        return (response.data as any).data;
    }

    async respond(id: string, data: RespondToReviewDto): Promise<Review> {
        const response = await apiClient.post(`/api/reviews/${id}/respond`, data);
        return (response.data as any).data;
    }

    async toggleFeature(id: string): Promise<Review> {
        const response = await apiClient.patch(`/api/reviews/${id}/feature`);
        return (response.data as any).data;
    }

    async toggleVerified(id: string): Promise<Review> {
        const response = await apiClient.patch(`/api/reviews/${id}/verify`);
        return (response.data as any).data;
    }

    async delete(id: string): Promise<void> {
        await apiClient.delete(`/api/reviews/${id}`);
    }

    async getEntityStats(entityId: string): Promise<ReviewStats> {
        const response = await apiClient.get(`/api/reviews/stats/entity/${entityId}`);
        return (response.data as any).data;
    }

    async getProfessionalStats(professionalId: string): Promise<ReviewStats> {
        const response = await apiClient.get(`/api/reviews/stats/professional/${professionalId}`);
        return (response.data as any).data;
    }

    async getServiceStats(serviceId: string): Promise<ReviewStats> {
        const response = await apiClient.get(`/api/reviews/stats/service/${serviceId}`);
        return (response.data as any).data;
    }
}

export const reviewsService = new ReviewsService();
