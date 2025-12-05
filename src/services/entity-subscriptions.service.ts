import { apiClient } from "@/lib/api-client";

export interface Subscription {
    id: string;
    entityId: string;
    plan: 'simple' | 'individual' | 'business';
    status: 'active' | 'canceled' | 'past_due' | 'trialing';
    interval: 'month' | 'year';
    currentPeriodStart: string;
    currentPeriodEnd: string;
    nextBillingDate?: string;
    cancelAtPeriodEnd: boolean;
    aiInsightsSubscribed: boolean;
    stripeSubscriptionId?: string;
    stripeCustomerId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface SubscriptionPlan {
    id: string;
    name: string;
    plan: 'simple' | 'individual' | 'business';
    interval: 'month' | 'year';
    price: number;
    currency: string;
    features: string[];
    stripePriceId?: string;
}

export const entitySubscriptionsService = {
    getCurrentSubscription: async () => {
        return apiClient.get<Subscription>("/api/entity-subscriptions/current");
    },

    getAvailablePlans: async () => {
        return apiClient.get<SubscriptionPlan[]>("/api/entity-subscriptions/plans");
    },

    upgradePlan: async (planId: string, interval: 'month' | 'year') => {
        return apiClient.post<{ url: string }>("/api/entity-subscriptions/upgrade", { planId, interval });
    },

    cancelSubscription: async () => {
        return apiClient.post("/api/entity-subscriptions/cancel");
    },

    resumeSubscription: async () => {
        return apiClient.post("/api/entity-subscriptions/resume");
    },

    subscribeToAiInsights: async () => {
        return apiClient.post("/api/entity-subscriptions/ai-insights/subscribe");
    },

    unsubscribeFromAiInsights: async () => {
        return apiClient.post("/api/entity-subscriptions/ai-insights/unsubscribe");
    },

    updatePaymentMethod: async (paymentMethodId: string) => {
        return apiClient.post("/api/entity-subscriptions/payment-method", { paymentMethodId });
    },

    getInvoices: async () => {
        return apiClient.get<any[]>("/api/entity-subscriptions/invoices");
    },

    getCustomerPortalUrl: async () => {
        return apiClient.post<{ url: string }>("/api/entity-subscriptions/portal");
    },


};
