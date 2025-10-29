import { apiClient } from './client';

export interface PublicEntity {
    id: string;
    name: string;
    description: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    publicSlug: string;
    logo?: string;
    coverImage?: string;
    rating: number;
    totalReviews: number;
    workingHours: {
        [key: string]: {
            enabled: boolean;
            start: string;
            end: string;
            breakStart?: string;
            breakEnd?: string;
        }
    };
    bookingSettings: {
        defaultSlotDuration: number;
        slotBuffer: number;
        advanceBookingDays: number;
        cancellationPolicy: number;
        allowOnlineBooking: boolean;
        requireApproval: boolean;
    };
}

export interface PublicService {
    id: string;
    name: string;
    description: string;
    duration: number;
    price: number;
    category: string;
    isActive: boolean;
}

export interface PublicProfessional {
    id: string;
    firstName: string;
    lastName: string;
    specialties: string[];
    avatar?: string;
    rating: number;
    isAvailable: boolean;
}

export interface TimeSlot {
    time: string;
    available: boolean;
    professionalId: string;
}

export interface CreateBookingRequest {
    entityId: string;
    serviceId: string;
    professionalId: string;
    date: string;
    time: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    notes?: string;
}

export const publicEntityApi = {
    /**
     * Get entity by public slug
     */
    async getEntityBySlug(slug: string) {
        return apiClient.get<PublicEntity>(`/api/public/entities/slug/${slug}`);
    },

    /**
     * Get services for an entity
     */
    async getEntityServices(entityId: string) {
        return apiClient.get<PublicService[]>(`/api/public/entities/${entityId}/services`);
    },

    /**
     * Get professionals for an entity
     */
    async getEntityProfessionals(entityId: string) {
        return apiClient.get<PublicProfessional[]>(`/api/public/entities/${entityId}/professionals`);
    },

    /**
     * Get available time slots
     */
    async getAvailableSlots(params: {
        entityId: string;
        serviceId: string;
        professionalId: string;
        date: string;
    }) {
        return apiClient.get<TimeSlot[]>('/api/public/availability/slots', {
            params
        });
    },

    /**
     * Create a public booking
     */
    async createBooking(data: CreateBookingRequest) {
        return apiClient.post('/api/public/bookings', data);
    }
};