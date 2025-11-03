/**
 * Clients Module Interfaces - Frontend
 */

export interface Client {
    id: string;
    entityId: string;
    firstName: string;
    lastName: string;
    name: string;
    email: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    status?: 'active' | 'inactive' | 'blocked';
    isFirstTime?: boolean;
    preferences?: {
        preferredContactMethod?: 'email' | 'phone' | 'sms';
        allowMarketing?: boolean;
        allowReminders?: boolean;
        language?: string;
    };
    address?: {
        street?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
    };
    notes?: string;
    tags?: string[];
    source?: string;
    stats?: {
        totalBookings?: number;
        completedBookings?: number;
        cancelledBookings?: number;
        noShowBookings?: number;
        totalSpent?: number;
        averageBookingValue?: number;
        lastBookingDate?: string;
        firstBookingDate?: string;
    };
    totalBookings?: number;
    totalSpent?: number;
    averageSpent?: number;
    lastVisit?: string;
    avatar?: string;
    joinDate?: string;
    loyaltyPoints?: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateClientDto {
    entityId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    status?: 'active' | 'inactive' | 'blocked';
    preferences?: {
        preferredContactMethod?: 'email' | 'phone' | 'sms';
        allowMarketing?: boolean;
        allowReminders?: boolean;
        language?: string;
    };
    address?: {
        street?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
    };
    notes?: string;
    tags?: string[];
    source?: 'walk_in' | 'online_booking' | 'phone' | 'referral' | 'social_media' | 'google' | 'other';
    createdBy: string;
}

export interface UpdateClientDto {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    status?: 'active' | 'inactive' | 'blocked';
    preferences?: {
        preferredContactMethod?: 'email' | 'phone' | 'sms';
        allowMarketing?: boolean;
        allowReminders?: boolean;
        language?: string;
    };
    address?: {
        street?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
    };
    notes?: string;
    tags?: string[];
    source?: string;
    updatedBy?: string;
}

export interface ClientFilters {
    entityId?: string;
    search?: string;
    tags?: string;
    page?: number;
    limit?: number;
}
