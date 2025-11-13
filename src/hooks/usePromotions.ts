import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import type {
    Commission,
    Voucher,
    Discount,
    CommissionType,
    CommissionAppliesTo,
    DiscountType,
    DiscountAppliesTo,
    VoucherStatus
} from '../types/models/promotions.interface';
import type {
    CreateCommissionDto,
    UpdateCommissionDto,
    CreateVoucherDto,
    UpdateVoucherDto,
    ValidateVoucherDto,
    ValidateVoucherResponse,
    CreateDiscountDto,
    UpdateDiscountDto
} from '../types/dto/promotions.dto';

export function usePromotions() {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    // ================== COMMISSIONS ==================

    const createCommission = async (data: CreateCommissionDto): Promise<Commission | null> => {
        setLoading(true);
        try {
            const response = await apiClient.post<Commission>('/api/promotions/commissions', data);
            toast({
                title: 'Success',
                description: 'Commission created successfully',
            });
            return response.data;
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to create commission',
                variant: 'destructive',
            });
            return null;
        } finally {
            setLoading(false);
        }
    };

    const getCommissions = async (entityId: string): Promise<Commission[]> => {
        setLoading(true);
        try {
            const response = await apiClient.get<Commission[]>('/api/promotions/commissions', { entityId });
            return Array.isArray(response.data) ? response.data : [];
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to fetch commissions',
                variant: 'destructive',
            });
            return [];
        } finally {
            setLoading(false);
        }
    };

    const getActiveCommissions = async (entityId: string): Promise<Commission[]> => {
        setLoading(true);
        try {
            const response = await apiClient.get<Commission[]>('/api/promotions/commissions/active', { entityId });
            return Array.isArray(response.data) ? response.data : [];
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to fetch active commissions',
                variant: 'destructive',
            });
            return [];
        } finally {
            setLoading(false);
        }
    };

    const getCommissionById = async (id: string): Promise<Commission | null> => {
        setLoading(true);
        try {
            const response = await apiClient.get<Commission>(`/api/promotions/commissions/${id}`);
            return response.data;
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to fetch commission',
                variant: 'destructive',
            });
            return null;
        } finally {
            setLoading(false);
        }
    };

    const updateCommission = async (
        id: string,
        data: UpdateCommissionDto
    ): Promise<Commission | null> => {
        setLoading(true);
        try {
            const response = await apiClient.patch<Commission>(`/api/promotions/commissions/${id}`, data);
            toast({
                title: 'Success',
                description: 'Commission updated successfully',
            });
            return response.data;
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to update commission',
                variant: 'destructive',
            });
            return null;
        } finally {
            setLoading(false);
        }
    };

    const deleteCommission = async (id: string): Promise<boolean> => {
        setLoading(true);
        try {
            await apiClient.delete<void>(`/api/promotions/commissions/${id}`);
            toast({
                title: 'Success',
                description: 'Commission deleted successfully',
            });
            return true;
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to delete commission',
                variant: 'destructive',
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    const toggleCommissionStatus = async (id: string): Promise<Commission | null> => {
        setLoading(true);
        try {
            const response = await apiClient.patch<Commission>(`/api/promotions/commissions/${id}/toggle-status`);
            toast({
                title: 'Success',
                description: 'Commission status updated successfully',
            });
            return response.data;
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to toggle commission status',
                variant: 'destructive',
            });
            return null;
        } finally {
            setLoading(false);
        }
    };

    // ================== VOUCHERS ==================

    const createVoucher = async (data: CreateVoucherDto): Promise<Voucher | null> => {
        setLoading(true);
        try {
            const response = await apiClient.post<Voucher>('/api/promotions/vouchers', data);
            toast({
                title: 'Success',
                description: 'Voucher created successfully',
            });
            return response.data;
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to create voucher',
                variant: 'destructive',
            });
            return null;
        } finally {
            setLoading(false);
        }
    };

    const getVouchers = async (entityId: string): Promise<Voucher[]> => {
        setLoading(true);
        try {
            const response = await apiClient.get<Voucher[]>('/api/promotions/vouchers', { entityId });
            return Array.isArray(response.data) ? response.data : [];
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to fetch vouchers',
                variant: 'destructive',
            });
            return [];
        } finally {
            setLoading(false);
        }
    };

    const getVoucherById = async (voucherId: string): Promise<Voucher | null> => {
        setLoading(true);
        try {
            const response = await apiClient.get<Voucher>(`/api/promotions/vouchers/${voucherId}`);
            return response.data;
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to fetch voucher',
                variant: 'destructive',
            });
            return null;
        } finally {
            setLoading(false);
        }
    };

    const updateVoucher = async (voucherId: string, data: Partial<CreateVoucherDto>): Promise<Voucher | null> => {
        setLoading(true);
        try {
            const response = await apiClient.patch<Voucher>(`/api/promotions/vouchers/${voucherId}`, data);
            toast({
                title: 'Success',
                description: 'Voucher updated successfully',
            });
            return response.data;
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to update voucher',
                variant: 'destructive',
            });
            return null;
        } finally {
            setLoading(false);
        }
    };

    const deleteVoucher = async (voucherId: string): Promise<boolean> => {
        setLoading(true);
        try {
            await apiClient.delete(`/api/promotions/vouchers/${voucherId}`);
            toast({
                title: 'Success',
                description: 'Voucher deleted successfully',
            });
            return true;
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to delete voucher',
                variant: 'destructive',
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    const incrementVoucherUsage = async (voucherId: string): Promise<Voucher | null> => {
        setLoading(true);
        try {
            const response = await apiClient.post<Voucher>(`/api/promotions/vouchers/${voucherId}/increment-usage`);
            return response.data;
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to increment voucher usage',
                variant: 'destructive',
            });
            return null;
        } finally {
            setLoading(false);
        }
    };

    const validateVoucher = async (code: string, entityId: string): Promise<Voucher | null> => {
        setLoading(true);
        try {
            const response = await apiClient.post<Voucher>('/api/promotions/vouchers/validate', { code, entityId });
            return response.data;
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Invalid voucher code',
                variant: 'destructive',
            });
            return null;
        } finally {
            setLoading(false);
        }
    };

    const applyVoucher = async (voucherId: string, clientId?: string): Promise<Voucher | null> => {
        setLoading(true);
        try {
            const response = await apiClient.post<Voucher>(`/api/promotions/vouchers/${voucherId}/apply`, { clientId });
            toast({
                title: 'Success',
                description: 'Voucher applied successfully',
            });
            return response.data;
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to apply voucher',
                variant: 'destructive',
            });
            return null;
        } finally {
            setLoading(false);
        }
    };

    // ============ DISCOUNTS ============
    const createDiscount = async (data: CreateDiscountDto): Promise<Discount | null> => {
        setLoading(true);
        try {
            const response = await apiClient.post<Discount>('/api/promotions/discounts', data);
            toast({
                title: 'Success',
                description: 'Discount created successfully',
            });
            return response.data;
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to create discount',
                variant: 'destructive',
            });
            return null;
        } finally {
            setLoading(false);
        }
    };

    const getDiscounts = async (entityId: string): Promise<Discount[]> => {
        setLoading(true);
        try {
            const response = await apiClient.get<Discount[]>('/api/promotions/discounts', { entityId });
            return Array.isArray(response.data) ? response.data : [];
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to fetch discounts',
                variant: 'destructive',
            });
            return [];
        } finally {
            setLoading(false);
        }
    };

    const getApplicableDiscounts = async (
        entityId: string,
        serviceId?: string,
        clientId?: string
    ): Promise<Discount[]> => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({ entityId });
            if (serviceId) queryParams.append('serviceId', serviceId);
            if (clientId) queryParams.append('clientId', clientId);

            const response = await apiClient.get<Discount[]>(
                `/api/promotions/discounts/applicable?${queryParams.toString()}`
            );
            return Array.isArray(response.data) ? response.data : [];
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to fetch applicable discounts',
                variant: 'destructive',
            });
            return [];
        } finally {
            setLoading(false);
        }
    };

    const getAutoApplyDiscounts = async (entityId: string): Promise<Discount[]> => {
        setLoading(true);
        try {
            const response = await apiClient.get<Discount[]>('/api/promotions/discounts/auto-apply', { entityId });
            return Array.isArray(response.data) ? response.data : [];
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to fetch auto-apply discounts',
                variant: 'destructive',
            });
            return [];
        } finally {
            setLoading(false);
        }
    };

    const getDiscountById = async (id: string): Promise<Discount | null> => {
        setLoading(true);
        try {
            const response = await apiClient.get<Discount>(`/api/promotions/discounts/${id}`);
            return response.data;
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to fetch discount',
                variant: 'destructive',
            });
            return null;
        } finally {
            setLoading(false);
        }
    };

    const updateDiscount = async (id: string, data: UpdateDiscountDto): Promise<Discount | null> => {
        setLoading(true);
        try {
            const response = await apiClient.patch<Discount>(`/api/promotions/discounts/${id}`, data);
            toast({
                title: 'Success',
                description: 'Discount updated successfully',
            });
            return response.data;
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to update discount',
                variant: 'destructive',
            });
            return null;
        } finally {
            setLoading(false);
        }
    };

    const deleteDiscount = async (id: string): Promise<boolean> => {
        setLoading(true);
        try {
            await apiClient.delete<void>(`/api/promotions/discounts/${id}`);
            toast({
                title: 'Success',
                description: 'Discount deleted successfully',
            });
            return true;
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to delete discount',
                variant: 'destructive',
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    const toggleDiscountStatus = async (id: string): Promise<Discount | null> => {
        setLoading(true);
        try {
            const response = await apiClient.patch<Discount>(`/api/promotions/discounts/${id}/toggle-status`);
            toast({
                title: 'Success',
                description: 'Discount status updated successfully',
            });
            return response.data;
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to toggle discount status',
                variant: 'destructive',
            });
            return null;
        } finally {
            setLoading(false);
        }
    };

    const applyDiscount = async (discountId: string, amount: number): Promise<number> => {
        setLoading(true);
        try {
            const response = await apiClient.post<{ discountedAmount: number }>(
                `/api/promotions/discounts/${discountId}/apply`,
                { amount }
            );
            return response.data.discountedAmount;
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to apply discount',
                variant: 'destructive',
            });
            return amount;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        // Commissions
        createCommission,
        getCommissions,
        getActiveCommissions,
        getCommissionById,
        updateCommission,
        deleteCommission,
        toggleCommissionStatus,
        // Vouchers
        createVoucher,
        getVouchers,
        getVoucherById,
        updateVoucher,
        deleteVoucher,
        incrementVoucherUsage,
        validateVoucher,
        applyVoucher,
        // Discounts
        createDiscount,
        getDiscounts,
        getApplicableDiscounts,
        getAutoApplyDiscounts,
        getDiscountById,
        updateDiscount,
        deleteDiscount,
        toggleDiscountStatus,
        applyDiscount,
    };
}
