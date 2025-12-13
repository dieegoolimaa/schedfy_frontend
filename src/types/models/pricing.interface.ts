/**
 * Pricing Interfaces
 */

export interface PricingEntry {
    _id: string;
    entityId: string;
    planType: 'simple' | 'individual' | 'business';
    region: 'PT' | 'BR' | 'US';
    currency: string;
    price: {
        monthly: number;
        quarterly?: number;
        yearly: number;
    };
    features: {
        // maxUsers?: number; // Removed as it might be maxProfessionals
        // Keeping boolean flags here if they are not in root
        hasCalendar: boolean;
        hasReports: boolean;
        hasIntegrations: boolean;
        hasCustomBranding: boolean;
        hasPrioritySupport: boolean;
        customFeatures?: Record<string, any>;
    };
    trialDays?: number;
    isActive: boolean;
    isFeatured?: boolean;
    displayPrice?: string;
    maxBookings?: number;
    maxProfessionals?: number;
    maxClients?: number;
    createdAt: string;
    updatedAt: string;
}

export interface PricingMatrix {
    [region: string]: {
        [planType: string]: PricingEntry;
    };
}
