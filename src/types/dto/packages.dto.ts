/**
 * Packages DTOs
 */

import { PackageRecurrence } from '../enums';

export interface CreatePackageDto {
    entityId: string;
    name: string;
    description?: string;
    services: string[]; // Array of service IDs
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
    services?: string[];
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
