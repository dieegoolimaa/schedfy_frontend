/**
 * Promotions Interfaces
 */

export enum CommissionType {
    PERCENTAGE = 'percentage',
    FIXED = 'fixed'
}

export enum CommissionAppliesTo {
    SERVICE = 'service',
    PROFESSIONAL = 'professional',
    SERVICE_CATEGORY = 'service_category',
}

export enum DiscountType {
    PERCENTAGE = 'percentage',
    FIXED = 'fixed'
}

export enum DiscountAppliesTo {
    ALL_SERVICES = 'all_services',
    SPECIFIC_SERVICES = 'specific_services',
    SERVICE_CATEGORY = 'service_category',
    FIRST_TIME_CLIENTS = 'first_time_clients',
    RETURNING_CLIENTS = 'returning_clients'
}

export enum VoucherStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    EXPIRED = 'expired',
    DEPLETED = 'depleted'
}

export interface Commission {
    _id: string;
    entityId: string;
    name: string;
    description?: string;
    type: CommissionType;
    value: number;
    appliesTo: CommissionAppliesTo;
    serviceIds?: string[];
    professionalIds?: string[];
    serviceCategoryIds?: string[];
    validFrom?: string;
    validUntil?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Voucher {
    _id: string;
    entityId: string;
    code: string;
    name: string;
    description?: string;
    type: DiscountType;
    value: number;
    minimumPurchase?: number;
    maximumDiscount?: number;
    maxUsageCount?: number;
    maxUsagePerClient?: number;
    currentUsageCount: number;
    validFrom: string;
    validUntil: string;
    status: VoucherStatus;
    applicableServiceIds?: string[];
    applicableDays?: number[];
    createdAt: string;
    updatedAt: string;
}

export interface Discount {
    _id: string;
    entityId: string;
    name: string;
    description?: string;
    type: DiscountType;
    value: number;
    appliesTo: DiscountAppliesTo;
    serviceIds?: string[];
    serviceCategoryIds?: string[];
    minimumPurchase?: number;
    maximumDiscount?: number;
    validFrom: string;
    validUntil: string;
    status: string;
    autoApply: boolean;
    applicableDays?: number[];
    applicableTimeStart?: string;
    applicableTimeEnd?: string;
    priority?: number;
    createdAt: string;
    updatedAt: string;
}
