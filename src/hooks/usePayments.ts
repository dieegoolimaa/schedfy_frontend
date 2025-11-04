import { paymentsService } from "../services/payments.service";
import { toast } from 'sonner';
import type { CreateCheckoutSessionRequest } from "../types/models/payments.interface";

export function usePayments() {
    const createCheckoutSession = async (data: CreateCheckoutSessionRequest) => {
        try {
            const res = await paymentsService.createCheckoutSession(data);
            return res.data;
        } catch (err: any) {
            const msg = err?.message || 'Failed to create checkout session';
            toast.error(msg);
            throw err;
        }
    };

    const createPaymentIntent = async (data: {
        amount: number;
        currency?: string;
        bookingId?: string;
        clientId?: string;
        entityId: string;
        description?: string;
    }) => {
        try {
            const res = await paymentsService.createPaymentIntent(data);
            return res.data;
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
