/**
 * Packages DTOs
 */



export interface CreatePackageDto {
    entityId: string;
    name: string;
    description?: string;
    services: { serviceId: string; quantity: number }[]; // Array of service objects with quantity
    pricing: {
        packagePrice: number;
        currency: string;
    };
    recurrence: 'monthly' | 'one_time';
    validity: number; // Number of days
    sessionsIncluded: number;
    allowOnlineBooking?: boolean;
    createdBy: string;
}

export interface UpdatePackageDto {
    name?: string;
    description?: string;
    services?: { serviceId: string; quantity: number }[];
    pricing?: {
        packagePrice: number;
        currency: string;
    };
    recurrence?: 'monthly' | 'one_time';
    validity?: number;
    sessionsIncluded?: number;
    allowOnlineBooking?: boolean;
    updatedBy?: string;
}

export interface CreateSubscriptionDto {
    packageId: string;
    clientId: string;
    autoRenew?: boolean;
    startDate?: string;
}
