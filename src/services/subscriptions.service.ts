import { apiClient } from '../lib/api-client';

export interface Subscription {
    id: string;
    entityId: string;
    plan: 'simple' | 'individual' | 'business';
    status: 'active' | 'canceled' | 'past_due' | 'trialing';
    interval: 'month' | 'year';
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    nextBillingDate?: Date;
    cancelAtPeriodEnd: boolean;
    aiInsightsSubscribed: boolean;
    stripeSubscriptionId?: string;
    stripeCustomerId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface SubscriptionPlan {
    id: string;
    name: string;
    plan: 'simple' | 'individual' | 'business';
    interval: 'month' | 'year';
    price: number;
    currency: string;
    features: string[];
}

class SubscriptionsService {
    async getCurrentSubscription(): Promise<Subscription> {
        const response = await apiClient.get('/api/entity-subscriptions/current');
        return response.data as Subscription;
    }

    async getAvailablePlans(): Promise<SubscriptionPlan[]> {
        const response = await apiClient.get('/api/entity-subscriptions/plans');
        return response.data as SubscriptionPlan[];
    }

    async upgradePlan(planId: string, interval: 'month' | 'year'): Promise<{ url: string }> {
        const response = await apiClient.post('/api/entity-subscriptions/upgrade', { planId, interval });
        return response.data as { url: string };
    }

    async cancelSubscription(): Promise<void> {
        await apiClient.post('/api/entity-subscriptions/cancel');
    }

    async resumeSubscription(): Promise<void> {
        await apiClient.post('/api/entity-subscriptions/resume');
    }

    async subscribeToAiInsights(): Promise<void> {
        await apiClient.post('/api/entity-subscriptions/ai-insights/subscribe');
    }

    async unsubscribeFromAiInsights(): Promise<void> {
        await apiClient.post('/api/entity-subscriptions/ai-insights/unsubscribe');
    }

    async updatePaymentMethod(paymentMethodId: string): Promise<void> {
        await apiClient.post('/api/entity-subscriptions/payment-method', { paymentMethodId });
    }

    async getInvoices(): Promise<any[]> {
        const response = await apiClient.get('/api/entity-subscriptions/invoices');
        return response.data as any[];
    }

    async getPortalUrl(): Promise<{ url: string }> {
        const response = await apiClient.post('/api/entity-subscriptions/portal');
        return response.data as { url: string };
    }
}

export const subscriptionsService = new SubscriptionsService();
