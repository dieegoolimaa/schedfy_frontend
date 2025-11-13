/**
 * Packages Interfaces
 */

import { PackageStatus, PackageRecurrence } from '../enums';

export interface PackageService {
    serviceId: string;
    serviceName?: string;
    quantity: number;
    usedQuantity?: number;
}

export interface ServicePackage {
    _id: string;
    entityId: string;
    name: string;
    description?: string;
    services: PackageService[];
    price: number;
    discountPercentage?: number;
    finalPrice: number;
    validity: {
        type: 'days' | 'months' | 'unlimited';
        value?: number;
    };
    recurrence?: PackageRecurrence;
    status: PackageStatus;
    isActive: boolean;
    maxSubscriptions?: number;
    currentSubscriptions?: number;
    createdAt: string;
    updatedAt: string;
}

export interface PackageSubscription {
    _id: string;
    entityId: string;
    packageId: string;
    package?: ServicePackage;
    clientId: string;
    clientName?: string;
    purchaseDate: string;
    expirationDate?: string;
    status: 'active' | 'expired' | 'cancelled' | 'completed';
    services: {
        serviceId: string;
        serviceName?: string;
        totalQuantity: number;
        usedQuantity: number;
        remainingQuantity: number;
    }[];
    totalValue: number;
    paidValue: number;
    paymentStatus: 'pending' | 'paid' | 'partial' | 'refunded';
    autoRenew: boolean;
    nextRenewalDate?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PackageFilters {
    status?: PackageStatus;
    isActive?: boolean;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
}
