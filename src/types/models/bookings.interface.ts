/**
 * Bookings Module Interfaces - Frontend
 */

import { BookingStatus, PaymentStatus, PaymentMethod } from '../enums';

export interface Booking {
    id: string;
    entityId: string | { _id: string;[key: string]: any };
    serviceId: string | { _id: string;[key: string]: any };
    clientId: string | { _id: string;[key: string]: any };
    professionalId?: string | { _id: string;[key: string]: any };
    startTime: string;
    endTime: string;
    // Backend também pode retornar startDateTime/endDateTime
    startDateTime?: string;
    endDateTime?: string;
    status: BookingStatus;
    notes?: string;
    internalNotes?: string;
    createdAt: string;
    updatedAt: string;
    // Pricing information (from backend)
    pricing?: {
        basePrice: number;
        discountAmount?: number;
        discountReason?: string;
        additionalCharges?: Array<{
            name: string;
            amount: number;
            description?: string;
        }>;
        totalPrice: number;
        currency: string;
    };
    // Payment information (from backend)
    payment?: {
        status: PaymentStatus;
        method?: PaymentMethod;
        depositRequired?: boolean;
        depositAmount?: number;
        depositPaid?: boolean;
        paidAmount?: number;
        stripePaymentIntentId?: string;
        transactionIds?: string[];
    };
    // Additional computed/display properties
    date?: string;
    time?: string;
    paymentStatus?: PaymentStatus;
    // Populated fields (from backend)
    service?: ServiceInfo;
    client?: ClientInfo;
    professional?: ProfessionalInfo;
    clientInfo?: ClientInfo; // Backend também pode retornar clientInfo
}

export interface ServiceInfo {
    id: string;
    name: string;
    duration: number;
    price: number;
    pricing?: {
        basePrice: number;
        currency: string;
        discounts?: Array<{
            type: string;
            value: number;
        }>;
    };
    category?: string;
}

export interface ClientInfo {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    isFirstTime?: boolean;
}

export interface ProfessionalInfo {
    id: string;
    name: string;
}

export interface CreateBookingDto {
    entityId: string;
    serviceId?: string;
    professionalId?: string;
    clientId?: string;
    clientInfo?: {
        name: string;
        email?: string;
        phone?: string;
        notes?: string;
    };
    startDateTime: string;
    endDateTime: string;
    status?: BookingStatus;
    notes?: string;
    internalNotes?: string;
    pricing: {
        basePrice: number;
        discountAmount?: number;
        discountReason?: string;
        additionalCharges?: Array<{
            name: string;
            amount: number;
            description?: string;
        }>;
        totalPrice: number;
        currency: string;
    };
    payment?: {
        status?: PaymentStatus;
        method?: PaymentMethod;
        depositRequired?: boolean;
        depositAmount?: number;
        depositPaid?: boolean;
        paidAmount?: number;
    };
    createdBy: string;
    isOverbooking?: boolean; // Allow internal users to book even when fully booked
}

export interface UpdateBookingDto {
    serviceId?: string;
    clientId?: string;
    professionalId?: string;
    clientInfo?: {
        name?: string;
        email?: string;
        phone?: string;
        notes?: string;
    };
    startDateTime?: string;
    endDateTime?: string;
    notes?: string;
    internalNotes?: string;
    status?: BookingStatus;
    pricing?: {
        basePrice?: number;
        discountAmount?: number;
        discountReason?: string;
        additionalCharges?: Array<{
            name: string;
            amount: number;
            description?: string;
        }>;
        totalPrice?: number;
        currency?: string;
    };
    payment?: {
        status?: PaymentStatus;
        method?: PaymentMethod;
        depositRequired?: boolean;
        depositAmount?: number;
        depositPaid?: boolean;
        paidAmount?: number;
    };
    updatedBy?: string;
}

export interface BookingFilters {
    entityId?: string;
    serviceId?: string;
    clientId?: string;
    professionalId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}

export interface TimeSlot {
    time: string;
    startDateTime: string;
    endDateTime: string;
    professionalId?: string;
    professionalName?: string;
    duration: number;
    availableCount?: number; // Number of available professionals
    totalCount?: number; // Total number of professionals
    isOverbooking?: boolean; // Flag indicating this is an overbooking slot
}

export interface SlotAvailability {
    available: boolean;
    conflicts?: Booking[];
}
