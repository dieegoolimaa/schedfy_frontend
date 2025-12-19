/**
 * Payments Service - Frontend
 */

import { apiClient } from '../lib/api-client';
import type { Payment, CreateCheckoutSessionRequest } from '../types/models/payments.interface';

export const paymentsService = {
    getAll: async (params?: { entityId?: string; status?: string }) => {
        return apiClient.get<Payment[]>('/api/payments', params);
    },

    getByEntity: async (entityId: string) => {
        return apiClient.get<Payment[]>(`/api/payments/entity/${entityId}`);
    },

    getByBooking: async (bookingId: string) => {
        return apiClient.get<Payment[]>(`/api/payments/booking/${bookingId}`);
    },

    getById: async (id: string) => {
        return apiClient.get<Payment>(`/api/payments/${id}`);
    },

    createCheckoutSession: async (data: CreateCheckoutSessionRequest) => {
        return apiClient.post<{
            id: string;
            url: string;
            sessionId: string;
        }>('/api/payments/checkout-session', data);
    },

    createPaymentIntent: async (data: {
        bookingId: string;
        customerId?: string;
        description?: string;
        metadata?: Record<string, string>;
    }) => {
        return apiClient.post<{
            clientSecret: string;
            paymentIntentId: string;
        }>('/api/payments/create-intent', data);
    },

    confirmPayment: async (paymentIntentId: string) => {
        return apiClient.post<Payment>(`/api/payments/${paymentIntentId}/confirm`, {});
    },

    refund: async (paymentId: string, amount?: number, reason?: string) => {
        return apiClient.post<Payment>(`/api/payments/${paymentId}/refund`, {
            amount,
            reason,
        });
    },

    getPaymentMethods: async (customerId: string) => {
        return apiClient.get(`/api/payments/customer/${customerId}/payment-methods`);
    },

    attachPaymentMethod: async (customerId: string, paymentMethodId: string) => {
        return apiClient.post(`/api/payments/customer/${customerId}/attach-payment-method`, {
            paymentMethodId,
        });
    },

    setDefaultPaymentMethod: async (customerId: string, paymentMethodId: string) => {
        return apiClient.post(`/api/payments/customer/${customerId}/default-payment-method`, {
            paymentMethodId,
        });
    },

    // Individual plan payments
    getIndividualPayments: async (entityId: string, params?: Record<string, string>) => {
        return apiClient.get(`/api/payments/individual/${entityId}`, params);
    },

    getIndividualSummary: async (entityId: string, params?: Record<string, string>) => {
        return apiClient.get(`/api/payments/individual/${entityId}/summary`, params);
    },

    createIndividualPayment: async (data: {
        entityId: string;
        amount: number;
        currency: string;
        paymentMethod: string;
        description: string;
        notes?: string;
        paidAt: string;
        bookingId?: string;
    }) => {
        return apiClient.post('/api/payments/individual', data);
    },
    // Business plan payments
    getBusinessPayments: async (entityId: string, params?: Record<string, string>) => {
        return apiClient.get(`/api/payments/business/${entityId}`, params);
    },

    getBusinessSummary: async (entityId: string, params?: Record<string, string>) => {
        return apiClient.get(`/api/payments/business/${entityId}/summary`, params);
    },

    createBusinessPayment: async (data: {
        entityId: string;
        amount: number;
        currency: string;
        paymentMethod: string;
        description: string;
        notes?: string;
        paidAt: string;
        bookingId?: string;
    }) => {
        return apiClient.post('/api/payments/business', data);
    },

    update: async (id: string, data: Partial<Payment>) => {
        return apiClient.patch<Payment>(`/api/payments/${id}`, data);
    },

    // Stripe Connect
    getConnectStatus: async (entityId: string) => {
        return apiClient.get<{
            isConnected: boolean;
            detailsSubmitted: boolean;
            chargesEnabled: boolean;
            payoutsEnabled: boolean;
            requirements?: {
                currentlyDue: string[];
                pastDue: string[];
            };
        }>(`/api/payments/connect/${entityId}/status`);
    },

    createConnectAccount: async (entityId: string) => {
        return apiClient.post<{ url: string }>(`/api/payments/connect/${entityId}/onboarding`);
    },

    createAccountSession: async (entityId: string) => {
        return apiClient.post<{ clientSecret: string }>(`/api/payments/connect/${entityId}/account-session`);
    },

    getConnectLoginLink: async (entityId: string) => {
        return apiClient.get<{ url: string }>(`/api/payments/connect/${entityId}/login-link`);
    },
};
