/**
 * Packages Interfaces
 * Matches backend schema structure
 */

import { PackageStatus, PackageRecurrence } from '../enums';
import type { Service } from './services.interface';

export interface PackageService {
    serviceId: string | Service; // Can be populated
    quantity: number;
}

export interface ServicePackage {
    _id: string;
    entityId: string;
    name: string;
    description?: string;
    services: PackageService[];
    pricing: {
        originalPrice: number;
        packagePrice: number;
        discount: number;
        currency: string;
    };
    recurrence: PackageRecurrence;
    validity: number; // Days
    sessionsIncluded: number;
    status: PackageStatus;
    allowOnlineBooking: boolean;
    stripePriceId?: string;
    stripeProductId?: string;
    metadata?: Record<string, string>;
    createdBy: string;
    updatedBy?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PackageSubscription {
    _id: string;
    entityId: string;
    packageId: string | ServicePackage;
    clientId: string | {
        _id: string;
        name: string;
        email: string;
        phone?: string;
    };
    status: 'active' | 'expired' | 'cancelled' | 'paused' | 'completed';
    startDate: string;
    expiryDate: string;
    sessionsUsed: number;
    sessionsTotal: number;
    autoRenew: boolean;
    paymentStatus?: 'pending' | 'paid' | 'partial' | 'refunded';
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
