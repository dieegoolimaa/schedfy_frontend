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
    packageIds?: string[];
    professionalIds?: string[];
    startDate?: string;
    endDate?: string;
    conditions?: Record<string, any>;
}

export interface UpdateCommissionDto {
    name?: string;
    description?: string;
    type?: CommissionType;
    value?: number;
    appliesTo?: CommissionAppliesTo;
    serviceIds?: string[];
    packageIds?: string[];
    professionalIds?: string[];
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
    conditions?: Record<string, any>;
}

export interface CreateVoucherDto {
    code: string;
    name: string;
    description?: string;
    type: DiscountType;
    value: number;
    appliesTo: DiscountAppliesTo;
    serviceIds?: string[];
    packageIds?: string[];
    usageLimit?: number;
    startDate: string;
    endDate: string;
    minPurchaseAmount?: number;
    maxDiscountAmount?: number;
    conditions?: Record<string, any>;
}

export interface UpdateVoucherDto {
    code?: string;
    name?: string;
    description?: string;
    type?: DiscountType;
    value?: number;
    appliesTo?: DiscountAppliesTo;
    serviceIds?: string[];
    packageIds?: string[];
    usageLimit?: number;
    startDate?: string;
    endDate?: string;
    status?: 'active' | 'inactive';
    minPurchaseAmount?: number;
    maxDiscountAmount?: number;
    conditions?: Record<string, any>;
}

export interface ValidateVoucherDto {
    code: string;
    serviceIds?: string[];
    packageIds?: string[];
    amount: number;
    clientId?: string;
}

export interface ValidateVoucherResponse {
    valid: boolean;
    message?: string;
    discountAmount?: number;
    finalAmount?: number;
}

export interface CreateDiscountDto {
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
    isAutomated?: boolean;
    conditions?: Record<string, any>;
}

export interface UpdateDiscountDto {
    name?: string;
    description?: string;
    type?: DiscountType;
    value?: number;
    appliesTo?: DiscountAppliesTo;
    serviceIds?: string[];
    packageIds?: string[];
    clientIds?: string[];
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
    isAutomated?: boolean;
    conditions?: Record<string, any>;
}
