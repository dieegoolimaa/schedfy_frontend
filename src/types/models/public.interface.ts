/**
 * Public Entity (Booking Page) Interfaces - Frontend
 */

export interface PublicEntity {
    id: string;
    name: string;
    slug: string;
    description?: string;
    address?: string;
    city?: string;
    country?: string;
    phone?: string;
    email?: string;
    website?: string;
    instagram?: string;
    publicSlug?: string;
    logo?: string;
    coverImage?: string;
    rating: number;
    totalReviews: number;
    workingHours: any;
    bookingSettings?: {
        defaultSlotDuration: number;
        slotBuffer: number;
        advanceBookingDays: number;
        cancellationPolicy: number;
        allowOnlineBooking: boolean;
        requireApproval: boolean;
    };
    plan?: 'simple' | 'individual' | 'business';
}

export interface PublicService {
    id: string;
    name: string;
    description?: string;
    duration: number;
    price: number;
    category?: string;
    isActive: boolean;
    professionalIds?: string[];
}

export interface PublicProfessional {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    specialties?: string[];
    avatar?: string;
    rating?: number;
    isAvailable?: boolean;
}

export interface PublicTimeSlot {
    time: string;
    available?: boolean;
    professionalId?: string;
}

export interface PublicServicePackage {
    _id: string;
    name: string;
    description?: string;
    services: PublicService[];
    pricing: {
        packagePrice: number;
        originalPrice: number;
        discount: number;
    };
    validity: number;
    sessionsIncluded: number;
    status: string;
}

export interface CreatePublicBookingRequest {
    entityId: string;
    serviceId: string;
    professionalId?: string | null;
    startDateTime?: string; // ISO datetime string
    endDateTime?: string; // ISO datetime string
    startTime?: string; // Legacy support
    endTime?: string; // Legacy support
    clientInfo?: {
        name: string;
        email: string;
        phone: string;
        notes?: string;
    };
    clientName?: string; // Legacy support
    clientEmail?: string; // Legacy support
    clientPhone?: string; // Legacy support
    notes?: string; // Legacy support
    status?: string;
    pricing?: {
        basePrice: number;
        totalPrice: number;
        currency: string;
    };
    voucherCode?: string;
    createdBy?: string;
    isPackageBooking?: boolean;
}
