/**
 * Promotions DTOs
 */

import {
    CommissionType,
    CommissionAppliesTo,
    DiscountType,
    DiscountAppliesTo
} from '../models/promotions.interface';

export interface CreateCommissionDto {
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
    isActive?: boolean;
    entityId: string;
    createdBy: string;
}

export interface UpdateCommissionDto {
    name?: string;
    description?: string;
    type?: CommissionType;
    value?: number;
    appliesTo?: CommissionAppliesTo;
    serviceIds?: string[];
    professionalIds?: string[];
    serviceCategoryIds?: string[];
    validFrom?: string;
    validUntil?: string;
    isActive?: boolean;
}

export interface CreateVoucherDto {
    code: string;
    name: string;
    description?: string;
    type: DiscountType;
    value: number;
    minimumPurchase?: number;
    maximumDiscount?: number;
    maxUsageCount?: number;
    maxUsagePerClient?: number;
    validFrom: string;
    validUntil: string;
    applicableServiceIds?: string[];
    applicableDays?: number[];
    createdBy?: string;
    entityId?: string;
}

export interface UpdateVoucherDto {
    name?: string;
    description?: string;
    value?: number;
    minimumPurchase?: number;
    maximumDiscount?: number;
    maxUsageCount?: number;
    maxUsagePerClient?: number;
    status?: 'active' | 'inactive' | 'expired' | 'depleted';
    validFrom?: string;
    validUntil?: string;
    applicableServiceIds?: string[];
    applicableDays?: number[];
}

export interface ValidateVoucherDto {
    code: string;
    bookingValue: number;
    clientId?: string;
    serviceId?: string;
    bookingDate?: string;
    entityId: string;
}

export interface ValidateVoucherResponse {
    valid: boolean;
    message?: string;
    discountAmount?: number;
    finalAmount?: number;
    voucher?: any;
}

export interface CreateDiscountDto {
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
    applicableDays?: number[];
    applicableTimeStart?: string;
    applicableTimeEnd?: string;
    autoApply?: boolean;
    priority?: number;
    createdBy?: string;
    entityId?: string;
}

export interface UpdateDiscountDto {
    name?: string;
    description?: string;
    type?: DiscountType;
    value?: number;
    appliesTo?: DiscountAppliesTo;
    serviceIds?: string[];
    serviceCategoryIds?: string[];
    minimumPurchase?: number;
    maximumDiscount?: number;
    status?: 'active' | 'inactive' | 'scheduled' | 'expired';
    validFrom?: string;
    validUntil?: string;
    applicableDays?: number[];
    applicableTimeStart?: string;
    applicableTimeEnd?: string;
    autoApply?: boolean;
    priority?: number;
}
