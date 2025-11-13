/**
 * Promotions Interfaces
 */

export enum CommissionType {
    PERCENTAGE = 'percentage',
    FIXED = 'fixed'
}

export enum CommissionAppliesTo {
    SERVICE = 'service',
    PACKAGE = 'package',
    ALL = 'all'
}

export enum DiscountType {
    PERCENTAGE = 'percentage',
    FIXED = 'fixed'
}

export enum DiscountAppliesTo {
    SERVICE = 'service',
    PACKAGE = 'package',
    ALL = 'all'
}

export enum VoucherStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    EXPIRED = 'expired',
    USED = 'used'
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
    packageIds?: string[];
    professionalIds?: string[];
    startDate?: string;
    endDate?: string;
    isActive: boolean;
    conditions?: Record<string, any>;
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
    appliesTo: DiscountAppliesTo;
    serviceIds?: string[];
    packageIds?: string[];
    usageLimit?: number;
    usageCount: number;
    usedBy?: string[];
    startDate: string;
    endDate: string;
    status: VoucherStatus;
    minPurchaseAmount?: number;
    maxDiscountAmount?: number;
    conditions?: Record<string, any>;
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
    packageIds?: string[];
    clientIds?: string[];
    startDate: string;
    endDate: string;
    isActive: boolean;
    isAutomated: boolean;
    conditions?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}
