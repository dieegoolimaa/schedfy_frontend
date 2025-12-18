/**
 * Payments Module Interfaces - Frontend
 */

import { PaymentMethod, PaymentStatus } from '../enums';

export interface Payment {
    id: string;
    entityId: string;
    bookingId?: string;
    amount: number;
    status: PaymentStatus;
    method: PaymentMethod;
    description?: string;
    createdAt: string;
}

export interface CreateCheckoutSessionRequest {
    bookingId: string;
    successUrl?: string;
}

export interface CheckoutSessionResponse {
    url: string;
}

export interface CreatePaymentIntentRequest {
    bookingId: string;
}

export interface PaymentIntentResponse {
    clientSecret: string;
}
