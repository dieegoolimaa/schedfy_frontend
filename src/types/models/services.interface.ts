/**
 * Services Module Interfaces - Frontend
 */

export interface Service {
    id: string;
    entityId: string;
    name: string;
    description: string;
    category: string;
    price: number;
    currency: string;
    duration: number; // in minutes
    isActive: boolean;
    isPublic: boolean;
    imageUrl?: string;
    slug: string;
    sortOrder: number;
    professionalIds: string[];
    assignedProfessionals?: string[];
    bookingCount: number;
    createdAt: string;
    updatedAt: string;
    status?: 'active' | 'inactive' | 'draft';
    bookings?: number;
    rating?: number;
    popularity?: number;
    image?: string;
}

export interface CreateServiceDto {
    entityId: string;
    name: string;
    description?: string;
    category?: string;
    duration: {
        durationType?: 'fixed' | 'variable';
        duration: number;
        minDuration?: number;
        maxDuration?: number;
        bufferBefore?: number;
        bufferAfter?: number;
    };
    pricing: {
        basePrice: number;
        currency: string;
        priceType?: 'fixed' | 'starting_from';
        discounts?: Array<{
            name: string;
            discountType: 'percentage' | 'fixed';
            value: number;
            conditions?: string;
            validFrom?: Date;
            validUntil?: Date;
            isActive: boolean;
        }>;
    };
    status?: 'active' | 'inactive' | 'draft';
    assignedProfessionals?: string[];
    bookingSettings?: {
        maxAdvanceBookingDays?: number;
        minAdvanceBookingHours?: number;
        maxBookingsPerDay?: number;
        allowOnlineBooking?: boolean;
        requireDeposit?: boolean;
        depositPercentage?: number;
        cancellationPolicy?: string;
        cancellationDeadlineHours?: number;
        requireManualConfirmation?: boolean; // For Individual/Business plans
    };
    images?: string[];
    coverImage?: string;
    tags?: string[];
    seo?: {
        isPublic?: boolean;
        slug?: string;
        metaDescription?: string;
        seoTitle?: string;
    };
    createdBy: string;
}

export interface UpdateServiceDto {
    name?: string;
    description?: string;
    category?: string;
    duration?: {
        durationType?: 'fixed' | 'variable';
        duration?: number;
        minDuration?: number;
        maxDuration?: number;
        bufferBefore?: number;
        bufferAfter?: number;
    };
    pricing?: {
        basePrice?: number;
        currency?: string;
        priceType?: 'fixed' | 'starting_from';
    };
    status?: 'active' | 'inactive' | 'draft';
    assignedProfessionals?: string[];
    seo?: {
        isPublic?: boolean;
        slug?: string;
        metaDescription?: string;
        seoTitle?: string;
    };
    sortOrder?: number;
    updatedBy?: string;
}

export interface ServiceFilters {
    entityId?: string;
    category?: string;
    status?: string;
    page?: number;
    limit?: number;
}
