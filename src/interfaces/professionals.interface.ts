/**
 * Professionals Module Interfaces - Frontend
 */

export interface Professional {
    id: string;
    entityId: string;
    userId?: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    role: 'professional' | 'attendant' | 'manager' | 'admin' | 'owner';
    status: 'active' | 'inactive' | 'suspended' | 'pending';
    services?: string[];
    avatar?: string;
    invitationToken?: string;
    invitationExpires?: string;
    invitationAccepted?: boolean;
    workingHours?: {
        [key: string]: {
            start: string;
            end: string;
            breaks?: Array<{ start: string; end: string }>;
        };
    };
    createdAt: string;
    updatedAt: string;
}

export interface CreateProfessionalDto {
    entityId: string;
    userId?: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    role?: 'professional' | 'attendant';
    password?: string;
    country?: 'PT' | 'BR' | 'US';
    timezone?: string;
    locale?: string;
}

export interface UpdateProfessionalDto {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    status?: 'active' | 'inactive' | 'suspended' | 'pending';
}

export interface AvailabilityCheckRequest {
    professionalId: string;
    date: string;
    startTime: string;
    endTime: string;
}

export interface AvailabilityCheckResponse {
    available: boolean;
    reason?: string;
    conflictingBookings?: string[];
}
