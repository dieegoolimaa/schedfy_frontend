import { paymentsApi } from '../lib/api/payments.api';
import { toast } from 'sonner';

export function usePayments() {
    const createCheckoutSession = async (bookingId: string, successUrl?: string) => {
        try {
            const res = await paymentsApi.createCheckoutSession(bookingId, successUrl);
            return res.data; // { url }
        } catch (err: any) {
            const msg = err?.message || 'Failed to create checkout session';
            toast.error(msg);
            throw err;
        }
    };

    const createPaymentIntent = async (bookingId: string) => {
        try {
            const res = await paymentsApi.createPaymentIntent(bookingId);
            return res.data; // { clientSecret }
        } catch (err: any) {
            const msg = err?.message || 'Failed to create payment intent';
            toast.error(msg);
            throw err;
        }
    };

    return {
        createCheckoutSession,
        createPaymentIntent,
    };
}
