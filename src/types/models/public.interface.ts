/**
 * Public Entity (Booking Page) Interfaces - Frontend
 */

export interface PublicEntity {
    id: string;
    name: string;
    description: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    instagram?: string;
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
        };
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

export interface PublicTimeSlot {
    time: string;
    available: boolean;
    professionalId: string;
}

export interface CreatePublicBookingRequest {
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
