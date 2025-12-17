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

export interface UsageLimitItem {
    used: number;
    limit: number | null;
    percentage: number;
    unlimited: boolean;
}

export interface UsageLimits {
    bookings: UsageLimitItem;
    professionals: UsageLimitItem;
    clients: UsageLimitItem;
    storage: UsageLimitItem;
}

export interface BookingCheckResult {
    canCreate: boolean;
    currentUsage: number;
    limit: number | null;
    remaining: number | null;
    percentage: number;
    message?: string;
}

export const entitySubscriptionsService = {
    getCurrentSubscription: async () => {
        return apiClient.get<Subscription>("/api/entity-subscriptions/current");
    },

    getAvailablePlans: async () => {
        return apiClient.get<SubscriptionPlan[]>("/api/entity-subscriptions/plans");
    },

    getUsageLimits: async () => {
        return apiClient.get<UsageLimits>("/api/entity-subscriptions/usage");
    },

    canCreateBooking: async () => {
        return apiClient.get<BookingCheckResult>("/api/entity-subscriptions/can-create-booking");
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

