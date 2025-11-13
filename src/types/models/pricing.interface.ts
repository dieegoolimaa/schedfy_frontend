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
        maxUsers?: number;
        maxServices?: number;
        maxBookingsPerMonth?: number;
        maxClients?: number;
        hasCalendar: boolean;
        hasReports: boolean;
        hasIntegrations: boolean;
        hasCustomBranding: boolean;
        hasPrioritySupport: boolean;
        customFeatures?: Record<string, any>;
    };
    trialDays?: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface PricingMatrix {
    [region: string]: {
        [planType: string]: PricingEntry;
    };
}
