/**
 * Entities Module Interfaces - Frontend
 */

export interface Entity {
    id: string;
    name: string;
    email: string;
    plan: 'simple' | 'individual' | 'business';
    allowConcurrentBookings: boolean;
    defaultSlotDuration?: number;
    aiFeaturesEnabled?: boolean;
    aiInsightsEnabled?: boolean;
    isPremium?: boolean; // AI Insights subscription active
    hasCompletedFirstPayment?: boolean;
    hasPaymentIssue?: boolean;
    paymentIssueType?: string;
    username?: string;
    description?: string;
    address?: string;
    phone?: string;
    website?: string;
    logo?: string;
    banner?: string;
    region?: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
    notificationSettings?: {
        emailEnabled: boolean;
        smsEnabled: boolean;
        whatsappEnabled: boolean;
        notifications?: {
            [key: string]: {
                email?: boolean;
                sms?: boolean;
                whatsapp?: boolean;
            };
        };
    };
    publicProfile?: {
        enabled: boolean;
        slug?: string;
        description?: string;
        logo?: string;
        banner?: string;
        socialLinks?: {
            facebook?: string;
            instagram?: string;
            twitter?: string;
            linkedin?: string;
        };
        bookingSettings?: {
            allowOnlineBooking: boolean;
            requireApproval: boolean;
            cancellationPolicy?: string;
            bookingNoticeHours: number;
        };
        welcomeMessage?: string;
    };
}

export interface EntityProfile {
    name: string;
    username?: string;
    description?: string;
    address?: string;
    phone?: string;
    website?: string;
    logo?: string;
    banner?: string;
    workingHours?: WorkingHours;
    defaultSlotDuration?: number;
    aiFeaturesEnabled?: boolean;
    aiInsightsEnabled?: boolean;
    publicProfile?: {
        enabled: boolean;
        slug?: string;
        description?: string;
        logo?: string;
        banner?: string;
        socialLinks?: {
            facebook?: string;
            instagram?: string;
            twitter?: string;
            linkedin?: string;
        };
        bookingSettings?: {
            allowOnlineBooking: boolean;
            requireApproval: boolean;
            cancellationPolicy?: string;
            bookingNoticeHours: number;
        };
        welcomeMessage?: string;
    };
}

export interface UpdateEntityProfileDto {
    name?: string;
    username?: string;
    description?: string;
    address?: string;
    phone?: string;
    website?: string;
    logo?: string;
    banner?: string;
    workingHours?: WorkingHours;
    defaultSlotDuration?: number;
    aiFeaturesEnabled?: boolean;
    aiInsightsEnabled?: boolean;
}

export interface WorkingHoursDay {
    enabled: boolean;
    start: string;
    end: string;
    breakStart?: string;
    breakEnd?: string;
}

export interface WorkingHours {
    monday: WorkingHoursDay;
    tuesday: WorkingHoursDay;
    wednesday: WorkingHoursDay;
    thursday: WorkingHoursDay;
    friday: WorkingHoursDay;
    saturday: WorkingHoursDay;
    sunday: WorkingHoursDay;
}

export interface CompleteOnboardingDto {
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    phone: string;
    whatsapp?: string;
    workingHours: WorkingHours;
    defaultSlotDuration?: number;
    firstService?: {
        name: string;
        duration: number;
        price: number;
        description?: string;
    };
    paymentMethodId?: string;
}
