/**
 * Packages DTOs
 */

import { PackageRecurrence } from '../enums';

export interface CreatePackageDto {
    name: string;
    description?: string;
    services: {
        serviceId: string;
        quantity: number;
    }[];
    price: number;
    discountPercentage?: number;
    validity: {
        type: 'days' | 'months' | 'unlimited';
        value?: number;
    };
    recurrence?: PackageRecurrence;
    maxSubscriptions?: number;
}

export interface UpdatePackageDto {
    name?: string;
    description?: string;
    services?: {
        serviceId: string;
        quantity: number;
    }[];
    price?: number;
    discountPercentage?: number;
    validity?: {
        type: 'days' | 'months' | 'unlimited';
        value?: number;
    };
    recurrence?: PackageRecurrence;
    isActive?: boolean;
    maxSubscriptions?: number;
}

export interface CreateSubscriptionDto {
    packageId: string;
    clientId: string;
    autoRenew?: boolean;
    startDate?: string;
}
