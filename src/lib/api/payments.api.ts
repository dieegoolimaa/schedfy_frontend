import { apiClient } from './client';

export const paymentsApi = {
    /**
     * Create a Stripe Checkout session for a booking.
     * Backend should return { url: string }
     */
    async createCheckoutSession(bookingId: string, successUrl?: string) {
        return apiClient.post<{ url: string }>(`/api/payments/checkout-session`, {
            bookingId,
            successUrl,
        });
    },

    /**
     * Create a payment intent (optional backend flow)
     * Backend should return { clientSecret: string }
     */
    async createPaymentIntent(bookingId: string) {
        return apiClient.post<{ clientSecret: string }>(`/api/payments/create-intent`, {
            bookingId,
        });
    },
};
