/**
 * Services Module Interfaces - Frontend
 * Matches backend schema structure
 */

export interface Service {
    _id: string;
    id?: string; // Alias for _id
    entityId: string;
    name: string;
    description?: string;
    category?: string;
    status: 'active' | 'inactive' | 'draft';
    duration: {
        durationType: 'fixed' | 'variable';
        duration: number;
        minDuration?: number;
        maxDuration?: number;
        bufferBefore: number;
        bufferAfter: number;
    };
    pricing: {
        basePrice: number;
        currency: string;
        priceType: 'fixed' | 'starting_from';
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
    assignedProfessionals?: string[];
    professionals?: string[]; // Alias
    professionalIds?: string[]; // Alias
    bookingSettings?: {
        maxAdvanceBookingDays?: number;
        minAdvanceBookingHours?: number;
        maxBookingsPerDay?: number;
        allowOnlineBooking?: boolean;
        requireDeposit?: boolean;
        depositPercentage?: number;
        cancellationPolicy?: string;
        cancellationDeadlineHours?: number;
        requiresManualConfirmation?: boolean;
    };
    availability?: Array<{
        day: number;
        isAvailable: boolean;
        timeSlots: Array<{
            startTime: string;
            endTime: string;
        }>;
    }>;
    customFields?: Array<{
        id: string;
        label: string;
        fieldType: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox';
        isRequired: boolean;
        options?: string[];
        placeholder?: string;
        validation?: string;
    }>;
    images?: string[];
    coverImage?: string;
    tags?: string[];
    commission?: {
        enabled: boolean;
        type: 'percentage' | 'fixed';
        value: number;
    };
    seo?: {
        isPublic: boolean;
        slug?: string;
        metaDescription?: string;
        seoTitle?: string;
    };
    analytics?: {
        totalBookings: number;
        completedBookings: number;
        cancelledBookings: number;
        averageRating?: number;
        totalRevenue: number;
        lastBookingDate?: Date;
    };
    sortOrder: number;
    createdBy: string;
    updatedBy?: string;
    createdAt: string;
    updatedAt: string;
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
    professionals?: string[]; // Alias for assignedProfessionals
    bookingSettings?: {
        maxAdvanceBookingDays?: number;
        minAdvanceBookingHours?: number;
        maxBookingsPerDay?: number;
        allowOnlineBooking?: boolean;
        requireDeposit?: boolean;
        depositPercentage?: number;
        cancellationPolicy?: string;
        cancellationDeadlineHours?: number;
        requiresManualConfirmation?: boolean; // For Individual/Business plans
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
    professionals?: string[]; // Alias for assignedProfessionals
    bookingSettings?: {
        maxAdvanceBookingDays?: number;
        minAdvanceBookingHours?: number;
        maxBookingsPerDay?: number;
        allowOnlineBooking?: boolean;
        requireDeposit?: boolean;
        depositPercentage?: number;
        cancellationPolicy?: string;
        cancellationDeadlineHours?: number;
        requiresManualConfirmation?: boolean;
    };
    availability?: Array<{
        day: number;
        isAvailable: boolean;
        timeSlots: Array<{
            startTime: string;
            endTime: string;
        }>;
    }>;
    customFields?: Array<{
        id: string;
        label: string;
        fieldType: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox';
        isRequired: boolean;
        options?: string[];
        placeholder?: string;
        validation?: string;
    }>;
    images?: string[];
    coverImage?: string;
    tags?: string[];
    commission?: {
        enabled: boolean;
        type: 'percentage' | 'fixed';
        value: number;
    };
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
