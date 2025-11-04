/**
 * Bookings Module Interfaces - Frontend
 */

export interface Booking {
    id: string;
    entityId: string;
    serviceId: string;
    clientId: string;
    professionalId?: string;
    startTime: string;
    endTime: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
    notes?: string;
    createdAt: string;
    updatedAt: string;
    // Additional computed/display properties
    date?: string;
    time?: string;
    paymentStatus?: 'pending' | 'partial' | 'paid' | 'refunded' | 'failed';
    // Populated fields (from backend)
    service?: ServiceInfo;
    client?: ClientInfo;
    professional?: ProfessionalInfo;
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
    serviceId: string;
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
    status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
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
        status?: 'pending' | 'partial' | 'paid' | 'refunded' | 'failed';
        method?: string;
        depositRequired?: boolean;
        depositAmount?: number;
        depositPaid?: boolean;
        paidAmount?: number;
    };
    createdBy: string;
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
    status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
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
        status?: 'pending' | 'partial' | 'paid' | 'refunded' | 'failed';
        method?: string;
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
}

export interface SlotAvailability {
    available: boolean;
    conflicts?: Booking[];
}
